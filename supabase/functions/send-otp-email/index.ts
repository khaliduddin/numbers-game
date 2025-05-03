import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { SendgridClient } from "https://deno.land/x/sendgrid@0.0.3/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  email: string;
  otp: string;
  username: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase credentials:", {
        urlExists: !!supabaseUrl,
        keyExists: !!supabaseServiceRoleKey,
      });
      return new Response(
        JSON.stringify({
          error: "Supabase credentials not found",
          details: {
            urlExists: !!supabaseUrl,
            keyExists: !!supabaseServiceRoleKey,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { email, otp, username } = (await req.json()) as RequestBody;

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: "Email and OTP are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Prepare email content
    const emailContent = `
      <h1>Your Verification Code</h1>
      <p>Hello ${username},</p>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `;

    // Get environment
    const environment = Deno.env.get("ENVIRONMENT") || "development";

    // Always log the OTP in development mode for testing
    if (environment === "development") {
      console.log(`[DEV MODE] Sending OTP email to ${email} with code ${otp}`);
      console.log(`Email content: ${emailContent}`);
    }

    // Send email if SendGrid API key is available
    if (Deno.env.get("SENDGRID_API_KEY")) {
      // Send actual email in preprod or production environments
      try {
        const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
        const fromEmail =
          Deno.env.get("SENDGRID_FROM_EMAIL") || "noreply@numbergame.com";

        if (!sendgridApiKey) {
          throw new Error("SendGrid API key not found");
        }

        const client = new SendgridClient(sendgridApiKey);

        await client.send({
          to: email,
          from: fromEmail,
          subject: "Your Verification Code",
          html: emailContent,
        });

        console.log(`Email sent to ${email} successfully`);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't throw here - we still want to store the OTP even if email fails
      }
    } else if (environment !== "development") {
      // Log a warning if SendGrid API key is missing in non-development environments
      console.error(
        "SendGrid API key not found in " + environment + " environment",
      );
    }

    // Store the OTP in a temporary table with expiration
    const { error } = await supabaseClient.from("verification_codes").upsert({
      email,
      code: otp,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes expiration
    });

    if (error) {
      console.error("Error storing OTP:", error);
      return new Response(
        JSON.stringify({ error: "Failed to store verification code" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

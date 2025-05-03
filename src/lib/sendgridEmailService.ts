import { env } from "../env";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendgridEmailService = {
  /**
   * Send an email using SendGrid API
   */
  async sendEmail(
    options: SendEmailOptions,
  ): Promise<{ success: boolean; error: any }> {
    const { to, subject, html, from } = options;

    try {
      // Get environment
      const environment = import.meta.env.MODE || "development";
      const isDevelopment = environment === "development";

      // Always log the email in development mode for testing
      if (isDevelopment) {
        console.log(`[DEV MODE] Sending email to ${to}`);
        console.log(`Email subject: ${subject}`);
        console.log(`Email content: ${html}`);
        console.log(
          `From: ${from || import.meta.env.VITE_SENDGRID_FROM_EMAIL || "noreply@numbergame.com"}`,
        );

        // In development, just return success without actually sending
        return { success: true, error: null };
      }

      // In production, use SendGrid API
      const apiKey = import.meta.env.VITE_SENDGRID_API_KEY;
      if (!apiKey) {
        console.error("SendGrid API key not found");
        return { success: false, error: "SendGrid API key not found" };
      }

      const fromEmail =
        from ||
        import.meta.env.VITE_SENDGRID_FROM_EMAIL ||
        "noreply@numbergame.com";

      // Make API request to SendGrid
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
            },
          ],
          from: { email: fromEmail },
          subject,
          content: [
            {
              type: "text/html",
              value: html,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("SendGrid API error:", errorData);
        return { success: false, error: errorData };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }
  },

  /**
   * Send OTP email
   */
  async sendOtpEmail(
    email: string,
    otp: string,
    username?: string,
  ): Promise<{ success: boolean; error: any }> {
    // Create email template
    const displayName = username || email.split("@")[0];
    const emailContent = `
      <h1>Your Verification Code</h1>
      <p>Hello ${displayName},</p>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: "Your Verification Code",
      html: emailContent,
    });
  },
};

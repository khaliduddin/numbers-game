import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, User, Lock, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authService } from "@/services/authService";
import { supabase } from "@/lib/supabase";

const signupSchema = z
  .object({
    username: z.string().min(3, {
      message: "Username must be at least 3 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSubmit?: (values: SignupFormValues) => void;
  onLoginClick?: () => void;
}

const SignupForm = ({
  onSubmit = () => {},
  onLoginClick = () => {},
}: SignupFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    setVerificationSent(false);

    try {
      // Register the user with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.username}`,
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!data.user) {
        throw new Error("Failed to create user");
      }

      // Generate a 6-digit OTP
      const generatedOtp = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      // Send OTP via edge function
      const { error: otpError } = await supabase.functions.invoke(
        "supabase-functions-send-otp-email",
        {
          body: {
            email: values.email,
            otp: generatedOtp,
            username: values.username,
          },
        },
      );

      if (otpError) {
        throw new Error(
          "Failed to send verification code: " + otpError.message,
        );
      }

      // Show OTP verification screen
      setOtpSent(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : "Failed to create account");
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setVerifyingOtp(true);
    setError(null);

    try {
      // Verify OTP with Supabase
      const { data, error } = await supabase
        .from("verification_codes")
        .select("*")
        .eq("email", form.getValues().email)
        .eq("code", otp)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (!isValid) {
        throw new Error("Invalid or expired verification code");
      }

      // Clear OTP from localStorage
      localStorage.removeItem(`otp_${form.getValues().email}`);

      // OTP is valid, get the user session
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        // If no session, sign in the user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.getValues().email,
          password: form.getValues().password,
        });

        if (signInError) {
          throw new Error("Failed to sign in after verification");
        }
      }

      // Get user data
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error("Failed to get user data");
      }

      // Store the user profile in localStorage
      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          id: userData.user.id,
          username: userData.user.user_metadata.username,
          email: userData.user.email,
          avatarUrl: userData.user.user_metadata.avatar_url,
          joinDate: new Date().toISOString(),
          isGuest: false,
        }),
      );

      // Show verification success message
      setVerificationSent(true);

      // Clear any showAuth flag to prevent login loop
      localStorage.removeItem("showAuth");
      // Set hasVisitedWelcome to true
      localStorage.setItem("hasVisitedWelcome", "true");

      // Force currentView to main in Home component
      setTimeout(() => {
        const mainViewEvent = new CustomEvent("changeView", {
          detail: { view: "main" },
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(mainViewEvent);
      }, 0);

      // Call the onSubmit prop with the form values
      onSubmit(form.getValues());
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : "Failed to verify account");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

      {otpSent ? (
        <div className="space-y-4">
          <div className="text-sm text-blue-600 mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="font-medium">Verification code sent!</p>
            <p>
              We've sent a 6-digit verification code to your email. Please enter
              it below to complete your registration.
            </p>
          </div>

          <div className="space-y-2">
            <FormLabel>Verification Code</FormLabel>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                className="pl-10"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                }
                maxLength={6}
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-500 mb-4">{error}</div>}
          {verificationSent && (
            <div className="text-sm text-green-500 mb-4 p-3 bg-green-50 rounded-md border border-green-200">
              <p className="font-medium">Account verified successfully!</p>
              <p>Your account has been verified and you are now signed in.</p>
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            onClick={handleVerifyOtp}
            disabled={verifyingOtp || verificationSent || otp.length !== 6}
          >
            {verifyingOtp ? "Verifying..." : "Verify Account"}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <Button
                variant="link"
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setError(null);
                }}
                className="p-0"
                disabled={verifyingOtp}
              >
                Try again
              </Button>
            </p>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <div className="text-sm text-red-500 mb-4">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Button
                  variant="link"
                  type="button"
                  onClick={onLoginClick}
                  className="p-0"
                >
                  Log In
                </Button>
              </p>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default SignupForm;

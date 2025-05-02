import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, KeyRound } from "lucide-react";
import { authService } from "@/services/authService";
import { unifiedProfileService } from "@/lib/unifiedProfileService";

// Helper function to generate a referral code
function generateReferralCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

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

// Email form schema
const emailFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

// OTP form schema
const otpFormSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits" }),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;
type OtpFormValues = z.infer<typeof otpFormSchema>;

interface LoginFormProps {
  onSubmit?: (values: any) => void;
  onForgotPassword?: () => void;
  onSignUpClick?: () => void;
}

const LoginForm = ({
  onSubmit = () => {},
  onForgotPassword = async () => {
    // Not needed with OTP-based auth
  },
  onSignUpClick = () => {},
}: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpResendCountdown, setOtpResendCountdown] = useState(0);

  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // OTP form
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Handle email form submission
  const handleEmailSubmit = async (values: EmailFormValues) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      // Send OTP to user's email
      const { success, error } = await authService.sendOtp(values.email);

      if (success) {
        setEmail(values.email);
        setShowOtpForm(true);
        setOtpSent(true);
        startResendCountdown();
      } else {
        setLoginError(error || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setLoginError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP form submission
  const handleOtpSubmit = async (values: OtpFormValues) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      // Verify OTP
      const { success, user, error } = await authService.verifyOtp(
        email,
        values.otp,
      );

      if (success && user) {
        // Get or create user profile
        const { profile } = await unifiedProfileService.getProfile(
          user.id,
          false,
        );

        if (profile) {
          // Store the complete user profile in localStorage
          // Make sure to preserve the existing referral code
          localStorage.setItem(
            "userProfile",
            JSON.stringify({
              id: profile.id,
              username: profile.username,
              email: profile.email,
              telegramId: profile.telegramId,
              walletAddress: profile.walletAddress,
              phoneNumber: profile.phoneNumber,
              avatarUrl: profile.avatarUrl,
              joinDate: profile.joinDate,
              referralCode: profile.referralCode, // Use existing referral code
              isGuest: false,
            }),
          );
        } else {
          // If no profile exists, create a basic one
          const username = email.split("@")[0];
          const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

          // Create profile in unified_profiles
          const { profile: newProfile } =
            await unifiedProfileService.saveProfile({
              id: user.id,
              username,
              email,
              avatarUrl,
              isGuest: false,
              joinDate: new Date().toISOString(),
              telegramId: null,
              walletAddress: null,
              phoneNumber: null,
              referralCode: generateReferralCode(), // Always generate a referral code
            });

          if (newProfile) {
            // Store the complete user profile in localStorage
            localStorage.setItem(
              "userProfile",
              JSON.stringify({
                id: newProfile.id,
                username: newProfile.username,
                email: newProfile.email,
                telegramId: newProfile.telegramId,
                walletAddress: newProfile.walletAddress,
                phoneNumber: newProfile.phoneNumber,
                avatarUrl: newProfile.avatarUrl,
                joinDate: newProfile.joinDate,
                referralCode: newProfile.referralCode,
                isGuest: false,
              }),
            );
          }
        }

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
        await onSubmit({ email });
      } else {
        setLoginError(error || "Invalid verification code");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setLoginError(
        error instanceof Error ? error.message : "Failed to verify code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Start countdown for OTP resend
  const startResendCountdown = () => {
    setOtpResendCountdown(60); // 60 seconds countdown
    const interval = setInterval(() => {
      setOtpResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (otpResendCountdown > 0) return;

    setIsLoading(true);
    setLoginError(null);
    try {
      const { success, error } = await authService.sendOtp(email);

      if (success) {
        setOtpSent(true);
        startResendCountdown();
      } else {
        setLoginError(error || "Failed to resend verification code");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setLoginError(
        error instanceof Error
          ? error.message
          : "Failed to resend verification code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to email form
  const handleBackToEmail = () => {
    setShowOtpForm(false);
    setOtpSent(false);
    setLoginError(null);
    otpForm.reset();
  };

  return (
    <div className="w-full max-w-md p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {showOtpForm ? "Verify Your Email" : "Welcome Back"}
        </h2>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
          {showOtpForm
            ? `Enter the verification code sent to ${email}`
            : "Sign in to your account to continue"}
        </p>
      </div>

      {showOtpForm ? (
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
            className="space-y-3 sm:space-y-4"
          >
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Verification Code</FormLabel>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit code"
                        className="pl-10 text-sm h-9 sm:h-10 text-center font-mono tracking-widest"
                        maxLength={6}
                        {...field}
                        onChange={(e) => {
                          // Only allow digits
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {loginError && (
              <div className="text-sm text-red-500 p-3 bg-red-50 rounded-md border border-red-200 mt-3">
                {loginError}
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full h-9 sm:h-10 text-sm"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs sm:text-sm text-blue-600 h-auto"
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                >
                  Change Email
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs sm:text-sm text-blue-600 h-auto"
                  onClick={handleResendOtp}
                  disabled={isLoading || otpResendCountdown > 0}
                >
                  {otpResendCountdown > 0
                    ? `Resend in ${otpResendCountdown}s`
                    : "Resend Code"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
            className="space-y-3 sm:space-y-4"
          >
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        className="pl-10 text-sm h-9 sm:h-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {loginError && (
              <div className="text-sm text-red-500 p-3 bg-red-50 rounded-md border border-red-200 mt-3">
                {loginError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-9 sm:h-10 text-sm"
              disabled={isLoading}
            >
              {isLoading ? "Sending Code..." : "Send Verification Code"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default LoginForm;

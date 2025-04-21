import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { unifiedProfileService } from "@/lib/unifiedProfileService";

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

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSubmit?: (values: FormValues) => void;
  onForgotPassword?: () => void;
  onSignUpClick?: () => void;
}

const LoginForm = ({
  onSubmit = () => {},
  onForgotPassword = async () => {
    const email = prompt(
      "Please enter your email address to reset your password",
    );
    if (email) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}`,
        });
        if (error) throw error;
        alert("Password reset email sent! Please check your inbox.");
      } catch (error) {
        console.error("Error sending reset email:", error);
        alert("Failed to send reset email. Please try again.");
      }
    }
  },
  onSignUpClick = () => {},
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      // Use Supabase authentication directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      // If login successful, get the user profile
      if (!error && data.user) {
        // Get the user profile from unified_profiles
        const { profile } = await unifiedProfileService.getProfile(
          data.user.id,
          false, // Explicitly set isGuest to false for auth users
        );

        // If profile exists, update local values
        if (profile) {
          values.username = profile.username;
          values.avatarUrl = profile.avatarUrl;

          // Store the complete user profile in localStorage
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
              referralCode: profile.referralCode,
              isGuest: false,
            }),
          );
        } else {
          // If no profile exists, create a basic one
          const username = values.email.split("@")[0];
          const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

          // Create profile in unified_profiles
          const { profile: newProfile } =
            await unifiedProfileService.saveProfile({
              id: data.user.id,
              username,
              email: values.email,
              avatarUrl,
              isGuest: false,
              joinDate: new Date().toISOString(),
            });

          if (newProfile) {
            values.username = newProfile.username;
            values.avatarUrl = newProfile.avatarUrl;

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
      }

      if (error) {
        // Handle specific error cases
        if (error.message.includes("Email not confirmed")) {
          setLoginError("Please verify your email before signing in.");
        } else if (error.message.includes("Invalid login credentials")) {
          setLoginError("Invalid email or password. Please try again.");
        } else {
          setLoginError(error.message);
        }
        throw new Error(error.message);
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
      await onSubmit(values);
    } catch (error) {
      console.error("Login error:", error);
      // Error is already handled above
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome Back
        </h2>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-3 sm:space-y-4"
        >
          <FormField
            control={form.control}
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Password</FormLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 text-sm h-9 sm:h-10"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-6 sm:h-7 w-6 sm:w-7"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="link"
              className="px-0 text-xs sm:text-sm text-blue-600 h-auto"
              onClick={onForgotPassword}
            >
              Forgot password?
            </Button>
          </div>

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
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Don't have an account?{" "}
              <Button
                type="button"
                variant="link"
                className="p-0 text-xs sm:text-sm text-blue-600 h-auto"
                onClick={onSignUpClick}
              >
                Sign up
              </Button>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;

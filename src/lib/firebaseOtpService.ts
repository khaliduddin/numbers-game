import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  getAuth,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "./firebase";
import { firebaseProfileService } from "./firebaseServices";
import { AuthUser } from "@/services/authService";

export const firebaseOtpService = {
  /**
   * Send OTP email to user
   */
  async sendOtp(email: string): Promise<{ success: boolean; error: any }> {
    try {
      // Store the email in localStorage for later use
      localStorage.setItem("emailForSignIn", email);

      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP in localStorage with expiration time (5 minutes)
      const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes
      localStorage.setItem(
        `otp_${email}`,
        JSON.stringify({
          code: otp,
          expires: expirationTime,
        }),
      );

      // In a real app, you would send this OTP via email using Firebase Cloud Functions
      // For now, we'll just log it to the console
      console.log(`OTP for ${email}: ${otp}`);

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return { success: true, error: null };
    } catch (error) {
      console.error("Error sending OTP:", error);
      return { success: false, error };
    }
  },

  /**
   * Verify OTP entered by user
   */
  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<{ success: boolean; user: AuthUser | null; error: any }> {
    try {
      // Get stored OTP from localStorage
      const storedOtpData = localStorage.getItem(`otp_${email}`);

      if (!storedOtpData) {
        return {
          success: false,
          user: null,
          error: "OTP not found or expired",
        };
      }

      const { code, expires } = JSON.parse(storedOtpData);

      // Check if OTP has expired
      if (Date.now() > expires) {
        localStorage.removeItem(`otp_${email}`);
        return { success: false, user: null, error: "OTP has expired" };
      }

      // Verify OTP
      if (otp !== code) {
        return { success: false, user: null, error: "Invalid OTP" };
      }

      // OTP is valid, check if user exists
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        const isNewUser = methods.length === 0;

        // Create user data
        const username = email.split("@")[0];
        // Use email as the user ID to prevent duplicate accounts
        const userId = `email_${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
        const userData: AuthUser = {
          id: userId,
          email,
          username,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          joinDate: new Date().toISOString(),
        };

        // Check if user already has a profile with a referral code
        const { profile: existingProfile } =
          await firebaseProfileService.getProfile(userId, false);

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem(
          "userProfile",
          JSON.stringify({
            ...userData,
            isGuest: false,
            telegramId: null,
            walletAddress: null,
            phoneNumber: null,
            referralCode: existingProfile?.referralCode || null, // Use existing referral code if available
          }),
        );

        // Clear OTP
        localStorage.removeItem(`otp_${email}`);

        return { success: true, user: userData, error: null };
      } catch (error) {
        console.error("Error checking user existence:", error);
        return { success: false, user: null, error: "Failed to verify user" };
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { success: false, user: null, error };
    }
  },

  /**
   * Sign out the current user
   */
  async logout(): Promise<void> {
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("emailForSignIn");
    } catch (error) {
      console.error("Firebase logout error:", error);
      throw error;
    }
  },
};

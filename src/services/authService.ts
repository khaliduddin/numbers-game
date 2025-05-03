import { firebaseOtpService } from "@/lib/firebaseOtpService";
import { sendgridEmailService } from "@/lib/sendgridEmailService";

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  walletAddress?: string;
  joinDate?: string;
}

export const authService = {
  /**
   * Send OTP to user's email
   */
  async sendOtp(email: string): Promise<{ success: boolean; error: any }> {
    try {
      return await firebaseOtpService.sendOtp(email);
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
      return await firebaseOtpService.verifyOtp(email, otp);
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
      await firebaseOtpService.logout();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    // Get user from localStorage
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (e) {
      return null;
    }
  },
};

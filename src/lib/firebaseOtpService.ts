// No longer using fetchSignInMethodsForEmail to avoid network errors
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth } from "./firebase";
import { db } from "./firebase";
import { firebaseProfileService } from "./firebaseServices";
import { AuthUser } from "@/services/authService";
import { sendgridEmailService } from "./sendgridEmailService";

export const firebaseOtpService = {
  /**
   * Send OTP to user's email
   */
  async sendOtp(email: string): Promise<{ success: boolean; error: any }> {
    try {
      // Store the email in localStorage for later use
      localStorage.setItem("emailForSignIn", email);

      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP in localStorage with expiration time (5 minutes) for development fallback
      const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes
      localStorage.setItem(
        `otp_${email}`,
        JSON.stringify({
          code: otp,
          expires: expirationTime,
        }),
      );

      // Get username from email (for email template)
      const username = email.split("@")[0];

      // Check if we're in development mode
      const isDevelopment = import.meta.env.MODE === "development";

      // Skip Firestore storage in development mode to avoid connection errors
      if (!isDevelopment) {
        try {
          await setDoc(doc(db, "verification_codes", email), {
            email,
            code: otp,
            created_at: serverTimestamp(),
            expires_at: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
          });
        } catch (firestoreError) {
          console.error("Error storing OTP in Firestore:", firestoreError);
          // Continue even if Firestore storage fails
        }
      }

      // Send OTP email using SendGrid
      try {
        // For development, just log the OTP to the console
        if (isDevelopment) {
          console.log(`OTP for ${email}: ${otp}`);
          console.log(`Email would be sent to: ${email}`);
          console.log(`Email content: Your verification code is ${otp}`);
        } else {
          // Only try to send via SendGrid in non-development environments
          const emailResult = await sendgridEmailService.sendOtpEmail(
            email,
            otp,
            username,
          );

          if (!emailResult.success) {
            console.error(
              "Error sending OTP email via SendGrid:",
              emailResult.error,
            );
          }
        }
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // We'll continue with the OTP flow since we're storing the OTP locally as a fallback
      }

      // OTP is already logged in the email sending section above

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
      let isValidOtp = false;

      // First try to verify with localStorage (works in all environments)
      const storedOtpData = localStorage.getItem(`otp_${email}`);
      if (storedOtpData) {
        const { code, expires } = JSON.parse(storedOtpData);

        // Check if OTP has expired
        if (Date.now() > expires) {
          localStorage.removeItem(`otp_${email}`);
        } else if (otp === code) {
          isValidOtp = true;
          localStorage.removeItem(`otp_${email}`);
        }
      }

      // If not verified with localStorage and not in development mode, try Firestore as fallback
      const isDevelopment = import.meta.env.MODE === "development";
      if (!isValidOtp && !isDevelopment) {
        try {
          // Check Firestore directly
          const otpDoc = await getDoc(doc(db, "verification_codes", email));

          if (otpDoc.exists()) {
            const otpData = otpDoc.data();

            // Check if OTP has expired
            const expiresAt = otpData.expires_at;
            const expiryTime =
              expiresAt && expiresAt.toMillis
                ? expiresAt.toMillis()
                : otpData.expires_at
                  ? new Date(otpData.expires_at).getTime()
                  : 0;

            if (expiryTime < Date.now()) {
              // Delete expired OTP
              await deleteDoc(doc(db, "verification_codes", email));
              if (!isValidOtp) {
                // Only return error if not already validated
                return { success: false, user: null, error: "OTP has expired" };
              }
            }

            // Verify OTP
            if (otp === otpData.code) {
              isValidOtp = true;
              // Delete the OTP to prevent reuse
              await deleteDoc(doc(db, "verification_codes", email));
            }
          }
        } catch (firestoreError) {
          console.error("Error verifying OTP with Firestore:", firestoreError);
          // Continue with the flow if localStorage validation succeeded
          if (!isValidOtp) {
            return {
              success: false,
              user: null,
              error: "Failed to verify OTP",
            };
          }
        }
      }

      // If OTP is still not valid after all checks
      if (!isValidOtp) {
        return { success: false, user: null, error: "Invalid OTP" };
      }

      // If OTP is not valid after all checks
      if (!isValidOtp) {
        return { success: false, user: null, error: "Invalid OTP" };
      }

      // OTP is valid, create user data without Firebase auth check
      try {
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

        // Create complete user profile
        const userProfile = {
          ...userData,
          isGuest: false,
          telegramId: null,
          walletAddress: null,
          phoneNumber: null,
          // Don't generate referral code here - it will be handled by the profile service
          stats: {
            wins: 0,
            losses: 0,
            totalGames: 0,
            averageScore: 0,
            bestScore: 0,
            accuracy: 0,
          },
          xp: {
            solo: 0,
            duel: 0,
            tournament: 0,
          },
        };

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("userProfile", JSON.stringify(userProfile));

        // Set hasVisitedWelcome to true
        localStorage.setItem("hasVisitedWelcome", "true");

        // Clear OTP
        localStorage.removeItem(`otp_${email}`);

        return { success: true, user: userData, error: null };
      } catch (error) {
        console.error("Error creating user data:", error);
        return {
          success: false,
          user: null,
          error: "Failed to create user data",
        };
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

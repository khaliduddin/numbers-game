import { fetchSignInMethodsForEmail } from "firebase/auth";
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

      // Store in Firestore for verification purposes (both dev and prod)
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

      // Send OTP email using SendGrid
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
        // We'll continue with the OTP flow since we're storing the OTP locally as a fallback
      }

      // For development, also log the OTP to the console
      if (isDevelopment) {
        console.log(`OTP for ${email}: ${otp}`);
      }

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
      // Check if we're in development mode
      const isDevelopment = import.meta.env.MODE === "development";
      let isValidOtp = false;

      // First try to verify with Firestore
      try {
        if (isDevelopment) {
          // In development, check Firestore directly
          const otpDoc = await getDoc(doc(db, "verification_codes", email));

          if (otpDoc.exists()) {
            const otpData = otpDoc.data();

            // Check if OTP has expired
            if (otpData.expires_at.toMillis() < Date.now()) {
              // Delete expired OTP
              await deleteDoc(doc(db, "verification_codes", email));
              return { success: false, user: null, error: "OTP has expired" };
            }

            // Verify OTP
            if (otp === otpData.code) {
              isValidOtp = true;
              // Delete the OTP to prevent reuse
              await deleteDoc(doc(db, "verification_codes", email));
            }
          }
        } else {
          // In production, use Firebase Cloud Function
          const functions = getFunctions();
          const verifyOtpFunction = httpsCallable(functions, "verifyOtp");
          const result = await verifyOtpFunction({ email, otp });
          const data = result.data as { success: boolean; message: string };
          isValidOtp = data.success;
        }
      } catch (firestoreError) {
        console.error("Error verifying OTP with Firestore:", firestoreError);
        // Fall back to localStorage if Firestore verification fails
      }

      // If not verified with Firestore, try localStorage as fallback
      if (!isValidOtp) {
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

        isValidOtp = true;
        localStorage.removeItem(`otp_${email}`);
      }

      // If OTP is not valid after all checks
      if (!isValidOtp) {
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

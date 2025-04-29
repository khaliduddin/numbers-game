import { firebaseReferralService } from "./firebaseServices";

export interface ReferralData {
  referralCode: string;
  referredUserId?: string;
  referrerUserId?: string;
  status: "pending" | "completed";
  createdAt?: string;
  completedAt?: string;
}

export const referralService = {
  /**
   * Save a referral when a user clicks a referral link
   */
  async saveReferralClick(referralCode: string): Promise<void> {
    try {
      // Store the referral code in localStorage for later use during signup
      localStorage.setItem("pendingReferralCode", referralCode);
    } catch (error) {
      console.error("Error saving referral click:", error);
    }
  },

  /**
   * Get profile by referral code
   */
  async getProfileByReferralCode(
    referralCode: string,
  ): Promise<{ profile: any | null; error: any }> {
    if (!referralCode) {
      return { profile: null, error: "No referral code provided" };
    }

    try {
      // In a real app, we would query the database
      // For now, just return null to indicate no profile found
      return { profile: null, error: null };
    } catch (error) {
      console.error("Error finding profile with referral code:", error);
      return { profile: null, error };
    }
  },

  /**
   * Complete a referral after successful signup
   */
  async completeReferral(
    newUserId: string,
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Get the pending referral code from localStorage
      const referralCode = localStorage.getItem("pendingReferralCode");
      if (!referralCode) {
        return { success: false, error: "No pending referral" };
      }

      // In a real app, we would create a record in the database
      // For now, just clear the pending referral code
      localStorage.removeItem("pendingReferralCode");

      return { success: true, error: null };
    } catch (error) {
      console.error("Error completing referral:", error);
      return { success: false, error };
    }
  },

  /**
   * Get referral code from URL parameters
   */
  getReferralCodeFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("ref");
  },

  /**
   * Debug referral code - checks all tables for a referral code
   */
  async debugReferralCode(referralCode: string): Promise<any> {
    // This function is no longer needed with Firebase
    console.log("Checking referral code:", referralCode);
    return { data: null, error: null };
  },
};

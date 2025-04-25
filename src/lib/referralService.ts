import { supabase } from "./supabase";

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

      // We could also track the click in the database here if needed
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

    console.log("Looking up profile with referral code:", referralCode);

    const { data, error } = await supabase
      .from("unified_profiles")
      .select("*")
      .eq("referral_code", referralCode)
      .maybeSingle();

    console.log("Lookup results:", { data, error });

    if (error) {
      console.error("Error finding profile with referral code:", error);
      return { profile: null, error };
    }

    return { profile: data, error: null };
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

      // Debug the referral code first
      await this.debugReferralCode(referralCode);

      // Find the user who owns this referral code
      console.log("Looking for referrer with code:", referralCode);
      const { profile: referrerData, error: referrerError } =
        await this.getProfileByReferralCode(referralCode);

      // Log the query results for debugging
      console.log("Referrer query results:", { referrerData, referrerError });

      if (referrerError) {
        console.error("Error finding referrer:", referrerError);
        return { success: false, error: referrerError };
      }

      if (!referrerData) {
        console.error("No referrer found with code:", referralCode);
        return { success: false, error: "Referrer not found" };
      }

      console.log("Found referrer:", referrerData);

      const referrerId = referrerData.id;

      // Create a record in the referrals table
      console.log("Creating referral record with:", {
        referral_code: referralCode,
        referrer_id: referrerId,
        referred_id: newUserId,
      });

      const timestamp = new Date().toISOString();
      const referralData = {
        referral_code: referralCode,
        referrer_id: referrerId,
        referred_id: newUserId,
        status: "completed",
        created_at: timestamp,
        completed_at: timestamp,
      };

      console.log("Inserting referral data:", referralData);

      const { data: insertData, error } = await supabase
        .from("referrals")
        .insert(referralData)
        .select();

      if (error) {
        console.error("Error saving referral:", error);
        return { success: false, error };
      }

      console.log("Referral record created successfully:", insertData);

      // Clear the pending referral code
      localStorage.removeItem("pendingReferralCode");

      // Optionally, update XP or rewards for the referrer
      // This could be done here or via a database trigger

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
    try {
      const { data, error } = await supabase.rpc("find_referral_code", {
        code: referralCode,
      });

      console.log("Debug referral code results:", { data, error });
      return { data, error };
    } catch (error) {
      console.error("Error debugging referral code:", error);
      return { data: null, error };
    }
  },
};

// This file provides Supabase client for guest mode
// The app is running in guest mode without authentication

import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate a unique referral code
const generateReferralCode = () => {
  // Generate a random string of 12 characters (alphanumeric)
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Add guest profile methods
export const guestProfileService = {
  // Save guest profile to Supabase
  async saveGuestProfile(profile: any) {
    // Check if profile already exists
    const { data, error: fetchError } = await supabase
      .from("guest_profiles")
      .select("*")
      .eq("guest_id", profile.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching guest profile:", fetchError);
      return { error: fetchError };
    }

    // Check if user is eligible for a referral code
    const isEligibleForReferralCode = profile.email || profile.telegramId;
    let referralCode = profile.referralCode;

    // Generate a referral code if eligible and doesn't already have one
    if (isEligibleForReferralCode && !referralCode) {
      referralCode = generateReferralCode();
      // Check if this referral code already exists
      const { data: existingCode } = await supabase
        .from("guest_profiles")
        .select("referral_code")
        .eq("referral_code", referralCode)
        .single();

      // If code exists, generate a new one (unlikely but possible)
      if (existingCode) {
        referralCode = generateReferralCode();
      }
    }

    // If profile exists, update it
    if (data) {
      // Track login history
      const lastLogin = new Date().toISOString();
      const loginCount = (data.login_count || 0) + 1;

      const { error } = await supabase
        .from("guest_profiles")
        .update({
          username: profile.username,
          email: profile.email,
          telegram_id: profile.telegramId,
          wallet_address: profile.walletAddress,
          phone_number: profile.phoneNumber,
          avatar_url: profile.avatarUrl,
          updated_at: lastLogin,
          last_login: lastLogin,
          login_count: loginCount,
          referral_code: referralCode,
        })
        .eq("guest_id", profile.id);

      return { error, referralCode, isReturningUser: true, loginCount };
    }

    // If profile doesn't exist, insert it
    const currentTime = new Date().toISOString();
    const { error } = await supabase.from("guest_profiles").insert({
      guest_id: profile.id,
      username: profile.username,
      email: profile.email,
      telegram_id: profile.telegramId,
      wallet_address: profile.walletAddress,
      phone_number: profile.phoneNumber,
      avatar_url:
        profile.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
      join_date: profile.joinDate || currentTime,
      updated_at: currentTime,
      last_login: currentTime,
      login_count: 1,
      referral_code: referralCode,
    });

    return { error, referralCode, isReturningUser: false, loginCount: 1 };
  },

  // Check if username is unique
  async isUsernameUnique(username: string, currentUserId: string) {
    const { data, error } = await supabase
      .from("guest_profiles")
      .select("guest_id")
      .eq("username", username);

    if (error) {
      console.error("Error checking username uniqueness:", error);
      return true; // Assume unique if there's an error to prevent blocking the user
    }

    // Username is unique if no results or the only result is the current user
    return (
      !data ||
      data.length === 0 ||
      (data.length === 1 && data[0].guest_id === currentUserId)
    );
  },

  // Get guest profile by ID
  async getGuestProfile(userId: string) {
    const { data, error } = await supabase
      .from("guest_profiles")
      .select("*")
      .eq("guest_id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile with referral code:", error);
      return { profile: null, error };
    }

    return {
      profile: data
        ? {
            ...data,
            telegramId: data.telegram_id,
            walletAddress: data.wallet_address,
            phoneNumber: data.phone_number,
            avatarUrl: data.avatar_url,
            joinDate: data.join_date,
            referralCode: data.referral_code,
          }
        : null,
      error: null,
    };
  },
};

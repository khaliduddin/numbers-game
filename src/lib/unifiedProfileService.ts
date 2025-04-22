import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

// Check if a string is a valid UUID
const isValidUUID = (uuid: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

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

export interface UnifiedProfile {
  id: string;
  username: string;
  email?: string;
  telegramId?: string;
  walletAddress?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  joinDate?: string;
  lastLogin?: string;
  loginCount?: number;
  referralCode?: string;
  isGuest: boolean;
  guestId?: string;
  stats?: {
    wins: number;
    losses: number;
    totalGames: number;
    averageScore: number;
    bestScore: number;
    accuracy: number;
  };
}

export const unifiedProfileService = {
  // Get profile by ID (works for both auth users and guests)
  async getProfile(
    id: string,
    isGuest: boolean = false,
  ): Promise<{ profile: UnifiedProfile | null; error: any }> {
    // Create the query without headers (headers method is not available)
    let query = supabase.from("unified_profiles").select("*");

    if (isGuest) {
      query = query.eq("guest_id", id);
    } else {
      query = query.eq("id", id);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error("Error fetching profile:", error);
      return { profile: null, error };
    }

    if (!data) {
      return { profile: null, error: null };
    }

    return {
      profile: {
        id: data.id,
        username: data.username,
        email: data.email,
        telegramId: data.telegram_id,
        walletAddress: data.wallet_address,
        phoneNumber: data.phone_number,
        avatarUrl: data.avatar_url,
        joinDate: data.join_date,
        lastLogin: data.last_login,
        loginCount: data.login_count,
        referralCode: data.referral_code,
        isGuest: data.is_guest,
        guestId: data.guest_id,
        stats: data.stats,
      },
      error: null,
    };
  },

  // Save or update profile
  async saveProfile(
    profile: Partial<UnifiedProfile>,
  ): Promise<{ profile: UnifiedProfile | null; error: any }> {
    const isGuest = profile.isGuest || false;
    let profileId = profile.id;

    // For guest users without an ID, generate one
    if (isGuest && !profileId && !profile.guestId) {
      return {
        profile: null,
        error: "Guest profile must have either id or guestId",
      };
    }

    // Ensure profileId is a valid UUID
    if (profileId && !isValidUUID(profileId)) {
      // Generate a new UUID if the current one is invalid
      profileId = uuidv4();
    }

    // Check if profile exists
    let existingProfile = null;

    if (isGuest && profile.guestId) {
      const { data } = await supabase
        .from("unified_profiles")
        .select("*")
        .eq("guest_id", profile.guestId)
        .single();
      existingProfile = data;
    } else if (profileId) {
      const { data } = await supabase
        .from("unified_profiles")
        .select("*")
        .eq("id", profileId)
        .single();
      existingProfile = data;
    }

    // Check if user is eligible for a referral code
    const isEligibleForReferralCode = profile.email || profile.telegramId;
    let referralCode = profile.referralCode;

    // Only generate a referral code if eligible AND doesn't already have one AND existing profile doesn't have one
    if (
      isEligibleForReferralCode &&
      !referralCode &&
      (!existingProfile || !existingProfile.referral_code)
    ) {
      referralCode = generateReferralCode();
      // Check if this referral code already exists - without using select() or single()
      const { data: existingCodes, error: codeCheckError } = await supabase
        .from("unified_profiles")
        .select("id")
        .eq("referral_code", referralCode);

      // If code exists (has any results), generate a new one
      if (!codeCheckError && existingCodes && existingCodes.length > 0) {
        referralCode = generateReferralCode();
      }
    } else if (existingProfile && existingProfile.referral_code) {
      // Preserve existing referral code if it exists
      referralCode = existingProfile.referral_code;
    }

    const currentTime = new Date().toISOString();

    // If profile exists, update it
    if (existingProfile) {
      const loginCount = (existingProfile.login_count || 0) + 1;

      // First update the profile without trying to return data
      const { error: updateError } = await supabase
        .from("unified_profiles")
        .update({
          username: profile.username || existingProfile.username,
          email: profile.email || existingProfile.email,
          telegram_id: profile.telegramId || existingProfile.telegram_id,
          wallet_address:
            profile.walletAddress || existingProfile.wallet_address,
          phone_number: profile.phoneNumber || existingProfile.phone_number,
          avatar_url: profile.avatarUrl || existingProfile.avatar_url,
          updated_at: currentTime,
          last_login: currentTime,
          login_count: loginCount,
          referral_code: referralCode || existingProfile.referral_code,
          stats: profile.stats || existingProfile.stats,
        })
        .eq("id", existingProfile.id);

      if (updateError) {
        return { profile: null, error: updateError };
      }

      // Then fetch the updated profile in a separate query
      const { data, error } = await supabase
        .from("unified_profiles")
        .select("*")
        .eq("id", existingProfile.id)
        .single();

      if (error) {
        return { profile: null, error };
      }

      return {
        profile: {
          id: data.id,
          username: data.username,
          email: data.email,
          telegramId: data.telegram_id,
          walletAddress: data.wallet_address,
          phoneNumber: data.phone_number,
          avatarUrl: data.avatar_url,
          joinDate: data.join_date,
          lastLogin: data.last_login,
          loginCount: data.login_count,
          referralCode: data.referral_code,
          isGuest: data.is_guest,
          guestId: data.guest_id,
          stats: data.stats,
        },
        error: null,
      };
    }

    // If profile doesn't exist, create a new one
    if (!profileId) {
      profileId = uuidv4();
    }

    // First insert the profile without trying to return data
    const { error: insertError } = await supabase
      .from("unified_profiles")
      .insert({
        id: profileId,
        username: profile.username || "User",
        email: profile.email,
        telegram_id: profile.telegramId,
        wallet_address: profile.walletAddress,
        phone_number: profile.phoneNumber,
        avatar_url:
          profile.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || "User"}`,
        join_date: profile.joinDate || currentTime,
        updated_at: currentTime,
        last_login: currentTime,
        login_count: 1,
        referral_code: referralCode,
        is_guest: isGuest,
        guest_id: profile.guestId,
        stats: profile.stats || {
          wins: 0,
          losses: 0,
          totalGames: 0,
          averageScore: 0,
          bestScore: 0,
          accuracy: 0,
        },
        xp: profile.xp || {
          solo: 0,
          duel: 0,
          tournament: 0,
        },
        level: profile.level || 0,
      });

    if (insertError) {
      return { profile: null, error: insertError };
    }

    // Then fetch the inserted profile in a separate query
    const { data, error } = await supabase
      .from("unified_profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (error) {
      return { profile: null, error };
    }

    return {
      profile: {
        id: data.id,
        username: data.username,
        email: data.email,
        telegramId: data.telegram_id,
        walletAddress: data.wallet_address,
        phoneNumber: data.phone_number,
        avatarUrl: data.avatar_url,
        joinDate: data.join_date,
        lastLogin: data.last_login,
        loginCount: data.login_count,
        referralCode: data.referral_code,
        isGuest: data.is_guest,
        guestId: data.guest_id,
        stats: data.stats,
      },
      error: null,
    };
  },

  // Check if username is unique
  async isUsernameUnique(
    username: string,
    currentUserId?: string,
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("unified_profiles")
      .select("id")
      .eq("username", username);

    if (error) {
      console.error("Error checking username uniqueness:", error);
      return true; // Assume unique if there's an error to prevent blocking the user
    }

    // Username is unique if no results or the only result is the current user
    return (
      !data ||
      data.length === 0 ||
      (data.length === 1 && currentUserId && data[0].id === currentUserId)
    );
  },

  // Get profile by email
  async getProfileByEmail(
    email: string,
  ): Promise<{ profile: UnifiedProfile | null; error: any }> {
    const { data, error } = await supabase
      .from("unified_profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      return { profile: null, error };
    }

    return {
      profile: data
        ? {
            id: data.id,
            username: data.username,
            email: data.email,
            telegramId: data.telegram_id,
            walletAddress: data.wallet_address,
            phoneNumber: data.phone_number,
            avatarUrl: data.avatar_url,
            joinDate: data.join_date,
            lastLogin: data.last_login,
            loginCount: data.login_count,
            referralCode: data.referral_code,
            isGuest: data.is_guest,
            guestId: data.guest_id,
            stats: data.stats,
          }
        : null,
      error: null,
    };
  },

  // Update user stats
  async updateStats(
    userId: string,
    stats: Partial<UnifiedProfile["stats"]>,
  ): Promise<{ success: boolean; error: any }> {
    // First get current stats
    const { data: currentData, error: fetchError } = await supabase
      .from("unified_profiles")
      .select("stats")
      .eq("id", userId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError };
    }

    const currentStats = currentData?.stats || {
      wins: 0,
      losses: 0,
      totalGames: 0,
      averageScore: 0,
      bestScore: 0,
      accuracy: 0,
    };

    // Merge current stats with new stats
    const updatedStats = { ...currentStats, ...stats };

    // Update the stats
    const { error } = await supabase
      .from("unified_profiles")
      .update({ stats: updatedStats })
      .eq("id", userId);

    return { success: !error, error };
  },
};

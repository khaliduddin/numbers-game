import { firebaseProfileService } from "./firebaseServices";

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
  referredByCode?: string;
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
  level?: number;
  xp?: {
    solo: number;
    duel: number;
    tournament: number;
  };
}

// Helper function to generate a referral code
function generateReferralCode() {
  // Generate a random string of 12 characters (alphanumeric)
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export const unifiedProfileService = {
  // Get profile by ID (works for both auth users and guests)
  async getProfile(
    id: string,
    isGuest: boolean = false,
  ): Promise<{ profile: UnifiedProfile | null; error: any }> {
    try {
      // First try to get from localStorage
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        if (profile.id === id || (isGuest && profile.isGuest)) {
          return { profile, error: null };
        }
      }

      // Only try Firebase if we're online
      if (navigator.onLine) {
        return firebaseProfileService.getProfile(id, isGuest);
      } else {
        console.warn("Device is offline, using local profile data only");
        return { profile: null, error: "Device is offline" };
      }
    } catch (error) {
      console.error("Error in getProfile:", error);
      return { profile: null, error };
    }
  },

  // Save or update profile
  async saveProfile(
    profile: Partial<UnifiedProfile> & { isForceUpdate?: boolean },
  ): Promise<{ profile: UnifiedProfile | null; error: any }> {
    try {
      // Extract isForceUpdate flag and remove it from profile object
      const isForceUpdate = profile.isForceUpdate;
      delete profile.isForceUpdate;

      // Ensure no undefined values are sent to Firestore
      Object.keys(profile).forEach((key) => {
        if (profile[key as keyof Partial<UnifiedProfile>] === undefined) {
          profile[key as keyof Partial<UnifiedProfile>] = null;
        }
      });

      // Always update localStorage
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        const currentProfile = JSON.parse(storedProfile);
        // Make sure to preserve nested objects properly and referral code
        const updatedProfile = {
          ...currentProfile,
          ...profile,
          // Always keep existing referral code unless explicitly provided
          referralCode: profile.referralCode || currentProfile.referralCode,
          // Keep existing referredByCode unless explicitly provided
          referredByCode:
            profile.referredByCode || currentProfile.referredByCode,
          // Preserve nested objects if they exist in current profile but not in the update
          stats: profile.stats || currentProfile.stats,
          xp: profile.xp || currentProfile.xp,
        };
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      }

      // Always try Firebase if isForceUpdate is true, otherwise only if online
      if (isForceUpdate || navigator.onLine) {
        console.log("Saving profile to Firebase database");
        return firebaseProfileService.saveProfile(profile);
      } else {
        console.warn("Device is offline, profile saved locally only");
        return {
          profile: profile as UnifiedProfile,
          error: "Device is offline, profile saved locally only",
        };
      }
    } catch (error) {
      console.error("Error in saveProfile:", error);
      return { profile: null, error };
    }
  },

  // Check if username is unique
  async isUsernameUnique(
    username: string,
    currentUserId?: string,
  ): Promise<boolean> {
    // This would need to be implemented with Firebase
    // For now, we'll assume all usernames are unique
    return true;
  },

  // Get profile by email
  async getProfileByEmail(
    email: string,
  ): Promise<{ profile: UnifiedProfile | null; error: any }> {
    // This would need to be implemented with Firebase
    // For now, we'll return null
    return { profile: null, error: null };
  },

  // Get profile by referral code
  async getProfileByReferralCode(
    referralCode: string,
  ): Promise<{ profile: UnifiedProfile | null; error: any }> {
    try {
      // Only try Firebase if we're online
      if (navigator.onLine) {
        return firebaseProfileService.getProfileByReferralCode(referralCode);
      } else {
        console.warn("Device is offline, using local profile data only");
        return { profile: null, error: "Device is offline" };
      }
    } catch (error) {
      console.error("Error in getProfileByReferralCode:", error);
      return { profile: null, error };
    }
  },

  // Get profile by Telegram ID
  async getProfileByTelegramId(
    telegramId: string,
  ): Promise<{ profile: UnifiedProfile | null; error: any }> {
    try {
      // Only try Firebase if we're online
      if (navigator.onLine) {
        return firebaseProfileService.getProfileByTelegramId(telegramId);
      } else {
        console.warn("Device is offline, using local profile data only");
        return { profile: null, error: "Device is offline" };
      }
    } catch (error) {
      console.error("Error in getProfileByTelegramId:", error);
      return { profile: null, error };
    }
  },

  // Update user stats
  async updateStats(
    userId: string,
    stats: Partial<UnifiedProfile["stats"]>,
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Get current profile
      const { profile, error } = await this.getProfile(userId);

      if (error || !profile) {
        return { success: false, error: error || "Profile not found" };
      }

      // Merge current stats with new stats
      const currentStats = profile.stats || {
        wins: 0,
        losses: 0,
        totalGames: 0,
        averageScore: 0,
        bestScore: 0,
        accuracy: 0,
      };

      const updatedStats = { ...currentStats, ...stats };

      // Update the profile with new stats
      const result = await this.saveProfile({
        id: userId,
        stats: updatedStats,
      });

      return { success: !!result.profile, error: result.error };
    } catch (error) {
      console.error("Error updating stats:", error);
      return { success: false, error };
    }
  },
};

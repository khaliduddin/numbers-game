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
    return firebaseProfileService.getProfile(id, isGuest);
  },

  // Save or update profile
  async saveProfile(
    profile: Partial<UnifiedProfile>,
  ): Promise<{ profile: UnifiedProfile | null; error: any }> {
    return firebaseProfileService.saveProfile(profile);
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

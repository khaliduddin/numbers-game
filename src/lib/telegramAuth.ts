import WebApp from "@twa-dev/sdk";
import { unifiedProfileService } from "./unifiedProfileService";
import { v4 as uuidv4 } from "uuid";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export const telegramAuth = {
  /**
   * Check if the app is running inside Telegram
   */
  isRunningInTelegram(): boolean {
    try {
      // console.log('test1', WebApp.initDataUnsafe)
      return WebApp.initDataUnsafe.user !== undefined;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get Telegram user data
   */
  getTelegramUser(): TelegramUser | null {
    try {
      if (!this.isRunningInTelegram()) {
        return null;
      }

      return WebApp.initDataUnsafe.user || null;
    } catch (e) {
      console.error("Error getting Telegram user:", e);
      return null;
    }
  },

  /**
   * Initialize user profile based on Telegram data
   */
  async initializeUserProfile(): Promise<{ profile: any; isNewUser: boolean }> {
    try {
      const telegramUser = this.getTelegramUser();

      if (!telegramUser) {
        // Create a guest profile if not running in Telegram
        return this.createGuestProfile();
      }

      // Check if user profile already exists
      const telegramId = telegramUser.id.toString();
      console.log("Looking for profile with Telegram ID:", telegramId);
      const { profile: existingProfile } =
        await unifiedProfileService.getProfileByTelegramId(telegramId);

      if (existingProfile) {
        // User exists, return existing profile
        console.log("Found existing Telegram user profile:", existingProfile);
        localStorage.setItem("userProfile", JSON.stringify(existingProfile));
        return { profile: existingProfile, isNewUser: false };
      } else {
        console.log("No existing profile found for Telegram ID:", telegramId);
      }

      // Create new profile for Telegram user
      const username =
        telegramUser.username ||
        `${telegramUser.first_name}${telegramUser.last_name ? ` ${telegramUser.last_name}` : ""}`.trim();

      // Use consistent ID format for Telegram users
      const userId = `telegram_${telegramId}`;
      const avatarUrl =
        telegramUser.photo_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

      console.log(
        "Creating new Telegram user profile with ID:",
        userId,
        "and username:",
        username,
      );

      const newProfile = {
        id: userId,
        username,
        telegramId,
        avatarUrl,
        joinDate: new Date().toISOString(),
        isGuest: false,
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

      // Save profile to database
      const { profile } = await unifiedProfileService.saveProfile(newProfile);

      if (profile) {
        localStorage.setItem("userProfile", JSON.stringify(profile));
        return { profile, isNewUser: true };
      }

      // Fallback to local profile if save fails
      localStorage.setItem("userProfile", JSON.stringify(newProfile));
      return { profile: newProfile, isNewUser: true };
    } catch (error) {
      console.error("Error initializing user profile:", error);
      return this.createGuestProfile();
    }
  },

  /**
   * Create a guest profile for non-Telegram users
   */
  async createGuestProfile(): Promise<{ profile: any; isNewUser: boolean }> {
    try {
      // Check if guest profile already exists in localStorage
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        if (profile.isGuest) {
          console.log(
            "Using existing guest profile from localStorage:",
            profile,
          );
          return { profile, isNewUser: false };
        }
      }

      // Check if we're running in Telegram - if so, don't create a guest profile
      if (this.isRunningInTelegram()) {
        console.log(
          "Running in Telegram but no profile found - this shouldn't happen",
        );
        // Try to get Telegram user data again
        const telegramUser = this.getTelegramUser();
        if (telegramUser) {
          console.log("Retrying with Telegram user data:", telegramUser);
          return this.initializeUserProfile();
        }
      }

      // Check if we already have a guest ID in localStorage to prevent creating multiple guest profiles
      const existingGuestId = localStorage.getItem("guestId");
      const guestId = existingGuestId || `guest_${uuidv4()}`;

      // If we're creating a new guest ID, save it
      if (!existingGuestId) {
        localStorage.setItem("guestId", guestId);
      }

      console.log("Creating guest profile with ID:", guestId);

      const guestProfile = {
        id: guestId,
        guestId,
        username: "Guest Player",
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=GuestPlayer`,
        joinDate: new Date().toISOString(),
        isGuest: true,
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

      // Save guest profile to database
      const { profile } = await unifiedProfileService.saveProfile(guestProfile);

      if (profile) {
        localStorage.setItem("userProfile", JSON.stringify(profile));
        return { profile, isNewUser: true };
      }

      // Fallback to local profile if save fails
      localStorage.setItem("userProfile", JSON.stringify(guestProfile));
      return { profile: guestProfile, isNewUser: true };
    } catch (error) {
      console.error("Error creating guest profile:", error);

      // Check if we already have a guest ID in localStorage
      const existingGuestId = localStorage.getItem("guestId");
      const guestId = existingGuestId || `guest_${uuidv4()}`;

      // If we're creating a new guest ID, save it
      if (!existingGuestId) {
        localStorage.setItem("guestId", guestId);
      }

      // Create minimal guest profile as fallback
      const fallbackProfile = {
        id: guestId,
        guestId,
        username: "Guest Player",
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=GuestPlayer`,
        joinDate: new Date().toISOString(),
        isGuest: true,
      };

      localStorage.setItem("userProfile", JSON.stringify(fallbackProfile));
      return { profile: fallbackProfile, isNewUser: true };
    }
  },
};

import { firebaseGameStatsService } from "./firebaseServices";
import { v4 as uuidv4 } from "uuid";

export interface GameStats {
  id?: string;
  userId?: string;
  guestId?: string;
  mode: "Solo" | "1v1" | "Tournament";
  score: number;
  accuracy: number;
  timePerRound: number;
  outcome: "Win" | "Loss" | "Draw" | "Completed";
  opponent?: string;
  createdAt?: string;
  roundDetails?: any[];
}

export interface GameRecord {
  id: string;
  date: string;
  mode: "Solo" | "1v1" | "Tournament";
  score: number;
  outcome: "Win" | "Loss" | "Draw" | "Completed";
  opponent?: string;
  accuracy?: number;
  timePerRound?: number;
}

// Calculate level based on XP points
const calculateLevel = (xpPoints: number): number => {
  // Level 1 requires 100 XP
  // Each subsequent level requires previous level + 50 XP
  // Level 0 is default (0-99 XP)
  if (xpPoints < 100) return 0;

  // For levels 1 and above
  let level = 1;
  let requiredXP = 100;

  while (xpPoints >= requiredXP) {
    level++;
    requiredXP += 50 + (level - 1) * 50;
  }

  return level - 1; // Adjust because we incremented before checking
};

// Calculate XP progress percentage for the current level
const calculateXPProgress = (xpPoints: number, level: number): number => {
  if (level === 0) {
    // Level 0: 0-99 XP, need 100 to reach level 1
    return Math.floor((xpPoints / 100) * 100);
  }

  // Calculate XP needed for current level
  let xpForCurrentLevel = 100; // XP needed for level 1
  for (let i = 1; i < level; i++) {
    xpForCurrentLevel += 50 + (i - 1) * 50;
  }

  // Calculate XP needed for next level
  const xpForNextLevel = xpForCurrentLevel + 50 + (level - 1) * 50;

  // Calculate progress percentage
  const xpInCurrentLevel = xpPoints - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;

  return Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100);
};

export const gameStatsService = {
  /**
   * Save game stats to the database
   */
  async saveGameStats(
    stats: GameStats,
  ): Promise<{ id: string | null; error: any }> {
    try {
      // Generate a unique ID for the game stats
      const id = uuidv4();

      // Get existing game history from localStorage
      const existingHistoryJson = localStorage.getItem("gameHistory") || "[]";
      const existingHistory = JSON.parse(existingHistoryJson);

      // Add new game stats
      const newGameStats = {
        id,
        userId: stats.userId,
        guestId: stats.guestId,
        date: new Date().toISOString(),
        mode: stats.mode,
        score: stats.score,
        accuracy: stats.accuracy,
        timePerRound: stats.timePerRound,
        outcome: stats.outcome,
        opponent: stats.opponent,
        roundDetails: stats.roundDetails,
      };

      // Add to history
      existingHistory.unshift(newGameStats);

      // Save back to localStorage
      localStorage.setItem("gameHistory", JSON.stringify(existingHistory));

      // Only save to Firebase database if online
      if (navigator.onLine) {
        try {
          const result = await firebaseGameStatsService.saveGameStats(stats);
          return result;
        } catch (firebaseError) {
          console.error(
            "Error saving to Firebase, using local storage only:",
            firebaseError,
          );
          return { id, error: null }; // Return local ID and no error to continue flow
        }
      } else {
        console.warn("Device is offline, game stats saved locally only");
        return { id, error: null };
      }
    } catch (err) {
      console.error("Error saving game stats:", err);
      return { id: null, error: err };
    }
  },

  /**
   * Get game history for a user
   */
  async getGameHistory(
    userId?: string,
    guestId?: string,
    limit: number = 20,
  ): Promise<{ games: GameRecord[]; error: any }> {
    try {
      // Get game history from localStorage
      const historyJson = localStorage.getItem("gameHistory") || "[]";
      const allGames = JSON.parse(historyJson);

      // Filter by userId or guestId
      let filteredGames = allGames;
      if (userId) {
        filteredGames = allGames.filter((game: any) => game.userId === userId);
      } else if (guestId) {
        filteredGames = allGames.filter(
          (game: any) => game.guestId === guestId,
        );
      }

      // Limit results
      const limitedGames = filteredGames.slice(0, limit);

      // Only try Firebase if online
      if (navigator.onLine) {
        try {
          // Get game history from Firebase database
          const result = await firebaseGameStatsService.getGameHistory(
            userId,
            guestId,
            limit ? Number(limit) : 20, // Ensure limit is a number
          );
          return result;
        } catch (firebaseError) {
          console.error(
            "Error getting game history from Firebase:",
            firebaseError,
          );
          // Fall back to local storage
          return { games: filteredGames.slice(0, limit), error: null };
        }
      } else {
        console.warn("Device is offline, using local game history only");
        return { games: filteredGames.slice(0, limit), error: null };
      }
    } catch (err) {
      console.error("Error getting game history:", err);
      return { games: [], error: err };
    }
  },
};

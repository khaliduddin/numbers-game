import { supabase } from "./supabase";

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
      // First, save the game stats
      const { data, error } = await supabase
        .from("game_stats")
        .insert({
          user_id: stats.userId,
          guest_id: stats.guestId,
          mode: stats.mode,
          score: stats.score,
          accuracy: stats.accuracy,
          time_per_round: stats.timePerRound,
          outcome: stats.outcome,
          opponent: stats.opponent,
          round_details: stats.roundDetails,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error saving game stats:", error);
        return { id: null, error };
      }

      // Then, update the user's XP in the unified_profiles table
      // Only if we have a valid user ID or guest ID
      if (stats.userId || stats.guestId) {
        try {
          // First, get the current XP values
          const { data: profileData, error: profileError } = await supabase
            .from("unified_profiles")
            .select("xp, level")
            .or(`id.eq.${stats.userId},guest_id.eq.${stats.guestId}`)
            .single();

          if (profileError) {
            console.error(
              "Error fetching user profile for XP update:",
              profileError,
            );
          } else if (profileData) {
            // Calculate XP to add based on game score (1 XP per 1 point)
            const xpToAdd = Math.max(0, stats.score); // Ensure we don't add negative XP

            // Get current XP values or initialize if not present
            const currentXp = profileData.xp || {
              solo: 0,
              duel: 0,
              tournament: 0,
            };

            // Update the appropriate mode's XP
            let updatedXp = { ...currentXp };
            if (stats.mode === "Solo") {
              updatedXp.solo += xpToAdd;
            } else if (stats.mode === "1v1") {
              updatedXp.duel += xpToAdd;
            } else if (stats.mode === "Tournament") {
              updatedXp.tournament += xpToAdd;
            }

            // Calculate total XP and new level
            const totalXp =
              updatedXp.solo + updatedXp.duel + updatedXp.tournament;
            const newLevel = calculateLevel(totalXp);

            // Update the profile with new XP and level
            const { error: updateError } = await supabase
              .from("unified_profiles")
              .update({
                xp: updatedXp,
                level: newLevel,
              })
              .or(`id.eq.${stats.userId},guest_id.eq.${stats.guestId}`);

            if (updateError) {
              console.error("Error updating user XP:", updateError);
            }
          }
        } catch (xpErr) {
          console.error("Exception updating XP:", xpErr);
          // Continue execution - XP update failure shouldn't prevent game stats from being saved
        }
      }

      return { id: data?.id || null, error: null };
    } catch (err) {
      console.error("Exception saving game stats:", err);
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
      let query = supabase.from("game_stats").select("*");

      // Filter by either user_id or guest_id
      if (userId) {
        query = query.eq("user_id", userId);
      } else if (guestId) {
        query = query.eq("guest_id", guestId);
      } else {
        return { games: [], error: "No user ID or guest ID provided" };
      }

      // Order by created_at and limit results
      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching game history:", error);
        return { games: [], error };
      }

      // Transform the data to match the GameRecord interface
      const games: GameRecord[] = data.map((game) => ({
        id: game.id,
        date: game.created_at,
        mode: game.mode,
        score: game.score,
        outcome: game.outcome,
        opponent: game.opponent,
        accuracy: game.accuracy,
        timePerRound: game.time_per_round,
      }));

      return { games, error: null };
    } catch (err) {
      console.error("Exception fetching game history:", err);
      return { games: [], error: err };
    }
  },
};

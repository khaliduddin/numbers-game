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

export const gameStatsService = {
  /**
   * Save game stats to the database
   */
  async saveGameStats(
    stats: GameStats,
  ): Promise<{ id: string | null; error: any }> {
    try {
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

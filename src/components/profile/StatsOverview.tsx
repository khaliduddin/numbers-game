import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import {
  Trophy,
  Target,
  Clock,
  Zap,
  Award,
  BarChart2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { gameStatsService, GameRecord } from "@/lib/gameStatsService";
import { supabase } from "@/lib/supabase";
import { unifiedProfileService } from "@/lib/unifiedProfileService";

interface StatsOverviewProps {
  stats?: {
    wins: number;
    losses: number;
    totalGames: number;
    averageScore: number;
    bestScore: number;
    fastestTime: string;
    accuracy: number;
    level: number;
    xpProgress: number;
  };
  gameMode?: "Solo" | "1v1" | "Tournament" | "All";
  userId?: string;
  guestId?: string;
}

interface GameStats {
  averageScore: number;
  bestScore: number;
  fastestTime: string;
  accuracy: number;
  totalGames: number;
  wins: number;
  losses: number;
}

const StatsOverview = ({
  stats = {
    wins: 42,
    losses: 18,
    totalGames: 60,
    averageScore: 85,
    bestScore: 98,
    fastestTime: "1.2s",
    accuracy: 92,
    level: 0,
    xpProgress: 68,
  },
  gameMode = "All",
  userId,
  guestId,
}: StatsOverviewProps) => {
  const [recentGames, setRecentGames] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [dataAvailable, setDataAvailable] = useState<boolean>(true);

  const winRate =
    stats.totalGames > 0
      ? Math.round((stats.wins / stats.totalGames) * 100)
      : 0;

  useEffect(() => {
    // Reset data availability when game mode changes
    setDataAvailable(true);
    setLoading(true);

    // Always try to fetch game stats
    fetchGameStats();

    // Only fetch recent games for Solo mode
    if (gameMode === "Solo") {
      fetchRecentGames();
    }

    // Fetch user profile to get level and XP data
    if (userId || guestId) {
      fetchUserProfile();
    }
  }, [gameMode, userId, guestId]);

  const fetchUserProfile = async () => {
    if (!userId && !guestId) return;

    try {
      const { profile, error } = await unifiedProfileService.getProfile(
        userId || guestId || "",
        !!guestId,
      );

      if (error || !profile) {
        console.error("Error fetching user profile:", error);
        return;
      }

      // Calculate XP progress based on the current game mode
      let xpProgress = 0;
      let level = profile.level || 0;

      if (profile.xp) {
        const gameModeKey =
          gameMode.toLowerCase() === "1v1"
            ? "duel"
            : (gameMode.toLowerCase() as "solo" | "duel" | "tournament");

        // Get total XP across all modes
        const totalXp =
          profile.xp.solo + profile.xp.duel + profile.xp.tournament;

        // Calculate progress to next level
        if (level === 0) {
          xpProgress = Math.min(100, Math.floor((totalXp / 100) * 100));
        } else {
          // Calculate XP needed for current level
          let xpForCurrentLevel = 100; // XP needed for level 1
          for (let i = 1; i < level; i++) {
            xpForCurrentLevel += 50 + (i - 1) * 50;
          }

          // Calculate XP needed for next level
          const xpForNextLevel = xpForCurrentLevel + 50 + (level - 1) * 50;

          // Calculate progress percentage
          const xpInCurrentLevel = totalXp - xpForCurrentLevel;
          const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;

          xpProgress = Math.min(
            100,
            Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100),
          );
        }
      }

      // Update game stats with level and XP data
      setGameStats((prev) => ({
        ...prev,
        level,
        xpProgress,
      }));
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const fetchGameStats = async () => {
    if (!userId && !guestId) {
      // If no user ID, just use default stats
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch game history from the database
      const { games, error } = await gameStatsService.getGameHistory(
        userId,
        guestId,
        50, // Get more games to calculate stats
      );

      if (error) {
        console.error("Error fetching game stats:", error);
        setDataAvailable(false);
        return;
      }

      // Filter games by mode
      const filteredGames = games.filter((game) => {
        // Convert game.mode to match our expected format (Solo, 1v1, Tournament)
        const normalizedMode =
          game.mode.charAt(0).toUpperCase() + game.mode.slice(1).toLowerCase();
        return normalizedMode === gameMode;
      });

      if (filteredGames.length === 0) {
        setDataAvailable(false);
        setLoading(false);
        return;
      }

      // Calculate stats from the filtered games
      const calculatedStats = calculateStatsFromGames(filteredGames);
      setGameStats(calculatedStats);
      setDataAvailable(true);
    } catch (error) {
      console.error("Error processing game stats:", error);
      setDataAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatsFromGames = (games: GameRecord[]): GameStats => {
    // Initialize stats
    let totalScore = 0;
    let bestScore = 0;
    let totalAccuracy = 0;
    let fastestTimeValue = Number.MAX_VALUE;
    let wins = 0;
    let losses = 0;

    games.forEach((game) => {
      // Update total and best score
      totalScore += game.score;
      bestScore = Math.max(bestScore, game.score);

      // Update accuracy if available
      if (game.accuracy) {
        totalAccuracy += game.accuracy;
      }

      // Update fastest time if available
      if (game.timePerRound && game.timePerRound < fastestTimeValue) {
        fastestTimeValue = game.timePerRound;
      }

      // Count wins and losses
      if (game.outcome === "Win") wins++;
      if (game.outcome === "Loss") losses++;
    });

    // Calculate averages and format values
    const averageScore = Math.round(totalScore / games.length);
    const accuracy = Math.round(totalAccuracy / games.length);
    const fastestTime =
      fastestTimeValue < Number.MAX_VALUE
        ? `${fastestTimeValue.toFixed(1)}s`
        : "N/A";

    return {
      averageScore,
      bestScore,
      fastestTime,
      accuracy,
      totalGames: games.length,
      wins,
      losses,
    };
  };

  const fetchRecentGames = async () => {
    if (!userId && !guestId) return;

    setLoading(true);
    try {
      // Get current date and date 3 days ago
      const now = new Date();
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(now.getDate() - 3);

      // Fetch game history from the database
      const { games, error } = await gameStatsService.getGameHistory(
        userId,
        guestId,
      );

      if (error) {
        console.error("Error fetching recent games:", error);
        setRecentGames(0);
        return;
      }

      // Filter games by date (within last 3 days) and mode
      const recentGamesList = games.filter((game) => {
        const gameDate = new Date(game.date);
        return gameDate >= threeDaysAgo && game.mode === "Solo";
      });

      setRecentGames(recentGamesList.length);
    } catch (error) {
      console.error("Error fetching recent games:", error);
      setRecentGames(0);
    } finally {
      setLoading(false);
    }
  };

  const renderStatCards = () => {
    // If no data is available for the selected game mode
    if (!dataAvailable) {
      return {
        firstRow: [
          <StatCard
            key="noData"
            icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
            title="No Data Available"
            value="-"
            description={`No game data for ${gameMode} mode`}
          />,
        ],
        secondRow: [],
      };
    }

    // Use fetched game stats if available, otherwise use default stats
    const displayStats = gameStats ? gameStats : stats;

    const commonCards = [
      <StatCard
        key="accuracy"
        icon={<Target className="h-5 w-5 text-blue-500" />}
        title="Accuracy"
        value={`${displayStats.accuracy}%`}
        description="Average calculation accuracy"
      />,
      <StatCard
        key="fastestTime"
        icon={<Clock className="h-5 w-5 text-green-500" />}
        title="Fastest Time"
        value={displayStats.fastestTime}
        description="Best response time"
      />,
    ];

    const secondRowCards = [
      <StatCard
        key="averageScore"
        icon={<Zap className="h-5 w-5 text-purple-500" />}
        title="Average Score"
        value={(displayStats.averageScore || 0).toString()}
        description="Points per game"
      />,
      <StatCard
        key="bestScore"
        icon={<Award className="h-5 w-5 text-red-500" />}
        title="Best Score"
        value={(displayStats.bestScore || 0).toString()}
        description="Personal record"
      />,
      <StatCard
        key="totalGames"
        icon={<BarChart2 className="h-5 w-5 text-indigo-500" />}
        title="Total Games"
        value={(displayStats.totalGames || 0).toString()}
        description="Games played"
      />,
    ];

    // First row cards depend on game mode
    if (gameMode === "Solo") {
      return {
        firstRow: [
          <StatCard
            key="recentGames"
            icon={<Calendar className="h-5 w-5 text-orange-500" />}
            title="Recent Games"
            value={loading ? "Loading..." : recentGames.toString()}
            description="Games played in last 3 days"
          />,
          ...commonCards,
        ],
        secondRow: secondRowCards,
      };
    } else {
      // Calculate win rate from the current stats
      const currentWinRate =
        displayStats.totalGames > 0
          ? Math.round((displayStats.wins / displayStats.totalGames) * 100)
          : 0;

      return {
        firstRow: [
          <StatCard
            key="winRate"
            icon={<Trophy className="h-5 w-5 text-yellow-500" />}
            title="Win Rate"
            value={`${currentWinRate}%`}
            description={`${safeStats.wins} wins, ${safeStats.losses} losses`}
          />,
          ...commonCards,
        ],
        secondRow: secondRowCards,
      };
    }
  };

  const { firstRow, secondRow } = renderStatCards();

  return (
    <div className="w-full bg-background p-6 rounded-xl border">
      <h2 className="text-2xl font-bold mb-6">
        {`${gameMode} Mode Statistics`}
      </h2>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {firstRow}
          </div>

          {secondRow && secondRow.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {secondRow}
            </div>
          )}

          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-medium">
                  Level {gameStats?.level || stats.level}
                </h3>
                <p className="text-sm text-muted-foreground">XP Progress</p>
              </div>
              <span className="text-sm font-medium">
                {gameStats?.xpProgress || stats.xpProgress}%
              </span>
            </div>
            <Progress
              value={gameStats?.xpProgress || stats.xpProgress}
              className="h-2"
            />
          </div>
        </>
      )}
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}

const StatCard = ({ icon, title, value, description }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default StatsOverview;

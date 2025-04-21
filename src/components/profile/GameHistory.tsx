import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { gameStatsService, GameRecord } from "@/lib/gameStatsService";

interface GameHistoryProps {
  games?: GameRecord[];
}

interface GameRecord {
  id: string;
  date: string;
  mode: "Solo" | "1v1" | "Tournament";
  score: number;
  outcome: "Win" | "Loss" | "Draw" | "Completed";
  opponent?: string;
  accuracy?: number;
  timePerRound?: number;
}

const GameHistory = ({ games = [] }: GameHistoryProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);

  useEffect(() => {
    // If games are provided as props, use them instead of fetching
    if (games.length > 0) {
      setGameHistory(games);
      return;
    }

    // Otherwise, fetch game history from the database
    const fetchGameHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user info from localStorage
        const savedProfile = localStorage.getItem("userProfile");
        let userId = undefined;
        let guestId = undefined;

        if (savedProfile) {
          const userData = JSON.parse(savedProfile);
          // Check if it's a guest user or authenticated user
          if (
            userData.id === "00000000-0000-0000-0000-000000000000" ||
            userData.id.startsWith("guest_")
          ) {
            guestId = userData.id;
          } else {
            userId = userData.id;
          }

          // Fetch game history
          const { games, error } = await gameStatsService.getGameHistory(
            userId,
            guestId,
          );

          if (error) {
            console.error("Error fetching game history:", error);
            setError("Failed to load game history");
          } else {
            setGameHistory(games);
          }
        }
      } catch (err) {
        console.error("Exception in fetchGameHistory:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchGameHistory();
  }, [games]);

  // Default mock data if no games are provided and none are fetched
  const defaultGames: GameRecord[] = [
    {
      id: "1",
      date: "2023-06-15",
      mode: "Solo",
      score: 85,
      outcome: "Completed",
      accuracy: 92,
      timePerRound: 3.2,
    },
    {
      id: "2",
      date: "2023-06-14",
      mode: "1v1",
      score: 78,
      outcome: "Win",
      opponent: "Player123",
      accuracy: 88,
      timePerRound: 2.8,
    },
    {
      id: "3",
      date: "2023-06-12",
      mode: "Tournament",
      score: 92,
      outcome: "Win",
      accuracy: 95,
      timePerRound: 2.5,
    },
    {
      id: "4",
      date: "2023-06-10",
      mode: "1v1",
      score: 65,
      outcome: "Loss",
      opponent: "NumberMaster",
      accuracy: 80,
      timePerRound: 3.5,
    },
    {
      id: "5",
      date: "2023-06-08",
      mode: "Tournament",
      score: 88,
      outcome: "Loss",
      accuracy: 90,
      timePerRound: 2.9,
    },
  ];

  // Use fetched games if available, otherwise use provided games or default games
  const displayGames =
    gameHistory.length > 0
      ? gameHistory
      : games.length > 0
        ? games
        : defaultGames;

  // Function to get badge variant based on outcome
  const getOutcomeBadgeVariant = (outcome: string) => {
    switch (outcome) {
      case "Win":
        return "default";
      case "Loss":
        return "destructive";
      case "Draw":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Game History</h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading game history...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Opponent</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Avg. Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayGames.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>{formatDate(game.date)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{game.mode}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{game.score}</TableCell>
                  <TableCell>
                    <Badge variant={getOutcomeBadgeVariant(game.outcome)}>
                      {game.outcome}
                    </Badge>
                  </TableCell>
                  <TableCell>{game.opponent || "-"}</TableCell>
                  <TableCell>
                    {game.accuracy ? `${game.accuracy}%` : "-"}
                  </TableCell>
                  <TableCell>
                    {game.timePerRound ? `${game.timePerRound}s` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && !error && displayGames.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No game history available
        </div>
      )}
    </div>
  );
};

export default GameHistory;

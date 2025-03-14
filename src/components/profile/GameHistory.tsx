import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/table";
import { Badge } from "../ui/badge";

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
  // Default mock data if no games are provided
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

  const displayGames = games.length > 0 ? games : defaultGames;

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

      {displayGames.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No game history available
        </div>
      )}
    </div>
  );
};

export default GameHistory;

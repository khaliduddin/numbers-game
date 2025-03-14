import React, { useState } from "react";
import { Trophy, Medal, Award, Star, Search, ChevronDown } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Player {
  id: string;
  rank: number;
  name: string;
  score: number;
  gamesPlayed: number;
  winRate: number;
  avatar: string;
}

interface RankingsTableProps {
  players?: Player[];
  title?: string;
  showFilters?: boolean;
  filterOptions?: string[];
}

const RankingsTable = ({
  players = [
    {
      id: "1",
      rank: 1,
      name: "Alex Johnson",
      score: 9850,
      gamesPlayed: 124,
      winRate: 78,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
    {
      id: "2",
      rank: 2,
      name: "Maria Garcia",
      score: 9720,
      gamesPlayed: 118,
      winRate: 75,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    },
    {
      id: "3",
      rank: 3,
      name: "Wei Zhang",
      score: 9650,
      gamesPlayed: 132,
      winRate: 72,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wei",
    },
    {
      id: "4",
      rank: 4,
      name: "James Wilson",
      score: 9540,
      gamesPlayed: 110,
      winRate: 70,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    },
    {
      id: "5",
      rank: 5,
      name: "Sophia Lee",
      score: 9480,
      gamesPlayed: 105,
      winRate: 68,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
    },
  ],
  title = "Global Rankings",
  showFilters = true,
  filterOptions = ["All Time", "This Month", "This Week", "Today"],
}: RankingsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);

  // Filter players based on search query
  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Function to render rank icon based on position
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="text-gray-500">{rank}</span>;
    }
  };

  return (
    <div className="w-full rounded-lg border bg-card p-3 sm:p-4 shadow-sm">
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
        {showFilters && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-2 sm:top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                className="pl-7 sm:pl-8 h-8 sm:h-10 text-xs sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-1 h-8 sm:h-10 text-xs sm:text-sm w-full sm:w-auto"
                >
                  {selectedFilter}
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => setSelectedFilter(option)}
                    className="text-xs sm:text-sm"
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableCaption className="text-xs sm:text-sm">
            Updated in real-time
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 sm:w-16 text-xs sm:text-sm">
                Rank
              </TableHead>
              <TableHead className="text-xs sm:text-sm">Player</TableHead>
              <TableHead className="text-right text-xs sm:text-sm">
                Score
              </TableHead>
              <TableHead className="text-right text-xs sm:text-sm hidden sm:table-cell">
                Games
              </TableHead>
              <TableHead className="text-right text-xs sm:text-sm">
                Win Rate
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium text-xs sm:text-sm py-2 sm:py-4">
                    <div className="flex items-center justify-center">
                      {getRankIcon(player.rank)}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm py-2 sm:py-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <img
                        src={player.avatar}
                        alt={`${player.name}'s avatar`}
                        className="h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                      />
                      <span className="truncate max-w-[80px] sm:max-w-none">
                        {player.name}
                      </span>
                      {player.rank <= 10 && (
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-xs sm:text-sm py-2 sm:py-4">
                    {player.score.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm py-2 sm:py-4 hidden sm:table-cell">
                    {player.gamesPlayed}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm py-2 sm:py-4">
                    {player.winRate}%
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-16 sm:h-24 text-center text-xs sm:text-sm"
                >
                  No players found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="text-xs sm:text-sm">
                Total Players
              </TableCell>
              <TableCell className="text-right text-xs sm:text-sm">
                {filteredPlayers.length}
              </TableCell>
              <TableCell
                colSpan={2}
                className="hidden sm:table-cell"
              ></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default RankingsTable;

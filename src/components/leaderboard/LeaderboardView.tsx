import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Users, Trophy, History, ArrowLeft } from "lucide-react";
import RankingsTable from "./RankingsTable";

interface LeaderboardViewProps {
  onBack?: () => void;
}

const LeaderboardView = ({ onBack = () => {} }: LeaderboardViewProps) => {
  const [activeTab, setActiveTab] = useState("global");

  // Mock data for different leaderboard types
  const globalPlayers = [
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
  ];

  const friendsPlayers = [
    {
      id: "1",
      rank: 1,
      name: "Emma Thompson",
      score: 8950,
      gamesPlayed: 98,
      winRate: 72,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    },
    {
      id: "2",
      rank: 2,
      name: "Michael Brown",
      score: 8720,
      gamesPlayed: 105,
      winRate: 68,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    },
    {
      id: "3",
      rank: 3,
      name: "Sarah Davis",
      score: 8450,
      gamesPlayed: 92,
      winRate: 65,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  ];

  const tournamentHistory = [
    {
      id: "1",
      rank: 1,
      name: "Weekend Challenge #42",
      score: 10000,
      gamesPlayed: 15,
      winRate: 100,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tournament1",
    },
    {
      id: "2",
      rank: 2,
      name: "Pro Series #18",
      score: 9500,
      gamesPlayed: 15,
      winRate: 93,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tournament2",
    },
    {
      id: "3",
      rank: 3,
      name: "Monthly Championship",
      score: 9200,
      gamesPlayed: 15,
      winRate: 87,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tournament3",
    },
    {
      id: "4",
      rank: 4,
      name: "Beginner Friendly #7",
      score: 8800,
      gamesPlayed: 15,
      winRate: 80,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tournament4",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 bg-background">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Leaderboard
          </h1>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <Card className="mb-4 sm:mb-6">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Player Rankings</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            View global rankings, friends' performance, and tournament history
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <Tabs
            defaultValue="global"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
              <TabsTrigger
                value="global"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
              >
                <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Global Rankings</span>
                <span className="xs:hidden">Global</span>
              </TabsTrigger>
              <TabsTrigger
                value="friends"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Friends</span>
                <span className="xs:hidden">Friends</span>
              </TabsTrigger>
              <TabsTrigger
                value="tournaments"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
              >
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Tournaments</span>
                <span className="xs:hidden">Tourneys</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="global">
              <RankingsTable
                players={globalPlayers}
                title="Global Rankings"
                showFilters={true}
                filterOptions={["All Time", "This Month", "This Week", "Today"]}
              />
            </TabsContent>

            <TabsContent value="friends">
              <RankingsTable
                players={friendsPlayers}
                title="Friends Rankings"
                showFilters={true}
                filterOptions={["All Time", "This Month", "This Week", "Today"]}
              />
            </TabsContent>

            <TabsContent value="tournaments">
              <RankingsTable
                players={tournamentHistory}
                title="Tournament History"
                showFilters={true}
                filterOptions={["All Tournaments", "Completed", "Upcoming"]}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-1 sm:gap-2 text-lg sm:text-xl">
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
            Your Recent Performance
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Track your progress and see how you compare to others
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border bg-card">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                78%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Win Rate
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border bg-card">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                124
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Games Played
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border bg-card">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                9,850
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Total Score
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardView;

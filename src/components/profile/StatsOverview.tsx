import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { Trophy, Target, Clock, Zap, Award, BarChart2 } from "lucide-react";

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
    level: 7,
    xpProgress: 68,
  },
}: StatsOverviewProps) => {
  const winRate =
    stats.totalGames > 0
      ? Math.round((stats.wins / stats.totalGames) * 100)
      : 0;

  return (
    <div className="w-full bg-background p-6 rounded-xl border">
      <h2 className="text-2xl font-bold mb-6">Player Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Trophy className="h-5 w-5 text-yellow-500" />}
          title="Win Rate"
          value={`${winRate}%`}
          description={`${stats.wins} wins, ${stats.losses} losses`}
        />

        <StatCard
          icon={<Target className="h-5 w-5 text-blue-500" />}
          title="Accuracy"
          value={`${stats.accuracy}%`}
          description="Average calculation accuracy"
        />

        <StatCard
          icon={<Clock className="h-5 w-5 text-green-500" />}
          title="Fastest Time"
          value={stats.fastestTime}
          description="Best response time"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Zap className="h-5 w-5 text-purple-500" />}
          title="Average Score"
          value={stats.averageScore.toString()}
          description="Points per game"
        />

        <StatCard
          icon={<Award className="h-5 w-5 text-red-500" />}
          title="Best Score"
          value={stats.bestScore.toString()}
          description="Personal record"
        />

        <StatCard
          icon={<BarChart2 className="h-5 w-5 text-indigo-500" />}
          title="Total Games"
          value={stats.totalGames.toString()}
          description="Games played"
        />
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-medium">Level {stats.level}</h3>
            <p className="text-sm text-muted-foreground">XP Progress</p>
          </div>
          <span className="text-sm font-medium">{stats.xpProgress}%</span>
        </div>
        <Progress value={stats.xpProgress} className="h-2" />
      </div>
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

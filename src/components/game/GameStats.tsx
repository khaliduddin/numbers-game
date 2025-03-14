import React from "react";
import { Progress } from "../ui/progress";
import { Clock, Award, User, Users } from "lucide-react";

interface GameStatsProps {
  roundNumber?: number;
  totalRounds?: number;
  timeRemaining?: number;
  maxTime?: number;
  currentScore?: number;
  opponentScore?: number;
  isMultiplayer?: boolean;
}

const GameStats: React.FC<GameStatsProps> = ({
  roundNumber = 1,
  totalRounds = 10,
  timeRemaining = 10,
  maxTime = 10,
  currentScore = 0,
  opponentScore = 0,
  isMultiplayer = false,
}) => {
  // Calculate time progress percentage
  const timeProgress = (timeRemaining / maxTime) * 100;

  return (
    <div className="w-full p-3 sm:p-4 bg-slate-800 rounded-lg shadow-md">
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:justify-between md:items-center">
        {/* Round counter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs sm:text-sm font-medium text-slate-300">
            Round:
          </span>
          <span className="text-base sm:text-lg font-bold text-white">
            {roundNumber}/{totalRounds}
          </span>
        </div>

        {/* Timer */}
        <div className="flex flex-col space-y-1 w-full md:w-1/3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-slate-300" />
              <span className="text-xs sm:text-sm font-medium text-slate-300">
                Time:
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-white">
              {timeRemaining}s
            </span>
          </div>
          <Progress value={timeProgress} className="h-1.5 sm:h-2" />
        </div>

        {/* Score display */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
            <span className="text-xs sm:text-sm font-medium text-slate-300">
              Score:
            </span>
            <span className="text-base sm:text-lg font-bold text-white">
              {currentScore}
            </span>
          </div>

          {isMultiplayer && (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
              <span className="text-xs sm:text-sm font-medium text-slate-300">
                Opponent:
              </span>
              <span className="text-base sm:text-lg font-bold text-white">
                {opponentScore}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameStats;

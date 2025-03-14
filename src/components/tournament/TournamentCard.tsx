import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Clock, Trophy, Users, Wallet } from "lucide-react";

interface TournamentCardProps {
  id?: string;
  name?: string;
  entryFee?: number;
  prizePool?: number;
  startTime?: Date;
  participantCount?: number;
  maxParticipants?: number;
  onJoin?: (id: string) => void;
}

const TournamentCard = ({
  id = "t-123",
  name = "Weekend Challenge",
  entryFee = 5,
  prizePool = 250,
  startTime = new Date(Date.now() + 3600000), // 1 hour from now
  participantCount = 18,
  maxParticipants = 32,
  onJoin = () => {},
}: TournamentCardProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <Card className="w-full max-w-[450px] h-[220px] sm:h-[250px] bg-white overflow-hidden flex flex-col">
      <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
          <CardTitle className="text-lg sm:text-xl font-bold">{name}</CardTitle>
          <div className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium w-full sm:w-auto text-center sm:text-left">
            {formatDate(startTime)} at {formatTime(startTime)}
          </div>
        </div>
        <CardDescription className="mt-1 text-xs sm:text-sm">
          Test your number reduction skills against other players
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            <div>
              <p className="text-xs sm:text-sm font-medium">Entry Fee</p>
              <p className="text-base sm:text-lg font-bold">${entryFee} USDC</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            <div>
              <p className="text-xs sm:text-sm font-medium">Prize Pool</p>
              <p className="text-base sm:text-lg font-bold">
                ${prizePool} USDC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            <div>
              <p className="text-xs sm:text-sm font-medium">Duration</p>
              <p className="text-sm sm:text-base">15 Rounds</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            <div>
              <p className="text-xs sm:text-sm font-medium">Participants</p>
              <p className="text-sm sm:text-base">
                {participantCount}/{maxParticipants}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-2 sm:pt-3 p-3 sm:p-6">
        <Button
          onClick={() => onJoin(id)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-8 sm:h-10 text-xs sm:text-sm"
        >
          Join Tournament
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TournamentCard;

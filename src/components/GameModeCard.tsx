import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { ArrowRight, Trophy, Users, User } from "lucide-react";

interface GameModeCardProps {
  title: string;
  description: string;
  icon: "solo" | "duel" | "tournament";
  onSelect: () => void;
}

const GameModeCard = ({
  title = "Solo Practice",
  description = "Practice your number reduction skills in a single-player mode.",
  icon = "solo",
  onSelect = () => console.log("Game mode selected"),
}: GameModeCardProps) => {
  const renderIcon = () => {
    switch (icon) {
      case "solo":
        return <User className="h-12 w-12 text-primary" />;
      case "duel":
        return <Users className="h-12 w-12 text-primary" />;
      case "tournament":
        return <Trophy className="h-12 w-12 text-primary" />;
      default:
        return <User className="h-12 w-12 text-primary" />;
    }
  };

  return (
    <Card className="w-full sm:w-[350px] h-[350px] md:h-[400px] flex flex-col bg-white hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-center mb-4">{renderIcon()}</div>
        <CardTitle className="text-xl md:text-2xl text-center">
          {title}
        </CardTitle>
        <CardDescription className="text-center text-sm md:text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center p-4 md:p-6">
        <div className="text-center space-y-3 md:space-y-4">
          <p className="text-xs md:text-sm text-muted-foreground">
            {icon === "solo" &&
              "Improve your skills with unlimited practice rounds"}
            {icon === "duel" &&
              "Challenge friends or random opponents in head-to-head matches"}
            {icon === "tournament" &&
              "Compete for crypto rewards in 15-round tournaments"}
          </p>
          <div className="flex justify-center mt-2 md:mt-4">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs md:text-sm">
              {icon === "solo" && "Free to play"}
              {icon === "duel" && "Free to play"}
              {icon === "tournament" && "Entry fee required"}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button className="w-full" onClick={onSelect}>
          Play Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameModeCard;

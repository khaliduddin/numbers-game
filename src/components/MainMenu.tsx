import React from "react";
import { useNavigate } from "react-router-dom";
import GameModeCard from "./GameModeCard";
import { Button } from "./ui/button";
import { User, Trophy, BarChart } from "lucide-react";

interface MainMenuProps {
  username?: string;
  isWalletConnected?: boolean;
}

const MainMenu = ({
  username = "Player",
  isWalletConnected = false,
}: MainMenuProps) => {
  const navigate = useNavigate();

  const handleGameModeSelect = (mode: string) => {
    // Instead of navigating to routes, we'll update the state in the parent component
    switch (mode) {
      case "solo":
        // Use custom event to communicate with parent component
        const soloEvent = new CustomEvent("changeView", {
          detail: { view: "game", mode: "solo" },
        });
        window.dispatchEvent(soloEvent);
        break;
      case "duel":
        const duelEvent = new CustomEvent("changeView", {
          detail: { view: "game", mode: "1v1" },
        });
        window.dispatchEvent(duelEvent);
        break;
      case "tournament":
        const tournamentEvent = new CustomEvent("changeView", {
          detail: { view: "tournament" },
        });
        window.dispatchEvent(tournamentEvent);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary text-center sm:text-left">
              Number Master
            </h1>
            <p className="text-muted-foreground text-center sm:text-left">
              Welcome back, {username}!
            </p>
          </div>
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                const event = new CustomEvent("changeView", {
                  detail: { view: "profile" },
                });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-1 sm:gap-2"
              size="sm"
            >
              <User size={18} className="hidden sm:inline" />
              <User size={16} className="sm:hidden" />
              Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const event = new CustomEvent("changeView", {
                  detail: { view: "leaderboard" },
                });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-1 sm:gap-2"
              size="sm"
            >
              <Trophy size={18} className="hidden sm:inline" />
              <Trophy size={16} className="sm:hidden" />
              Leaderboard
            </Button>
          </div>
        </header>

        {/* Game Modes */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8 text-center">
            Choose a Game Mode
          </h2>
          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 md:gap-8">
            <GameModeCard
              title="Solo Practice"
              description="Practice your number reduction skills in a single-player mode."
              icon="solo"
              onSelect={() => handleGameModeSelect("solo")}
            />
            <GameModeCard
              title="1v1 Duel"
              description="Challenge friends or random opponents in head-to-head matches."
              icon="duel"
              onSelect={() => handleGameModeSelect("duel")}
            />
            <GameModeCard
              title="Tournament"
              description="Compete for crypto rewards in 15-round tournaments."
              icon="tournament"
              onSelect={() => handleGameModeSelect("tournament")}
            />
          </div>
        </section>

        {/* Stats Overview */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Stats</h2>
            <Button
              variant="ghost"
              onClick={() => {
                const event = new CustomEvent("changeView", {
                  detail: { view: "profile" },
                });
                window.dispatchEvent(event);
              }}
              size="sm"
            >
              View Details
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Games Played</p>
              <p className="text-3xl font-bold text-primary">24</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
              <p className="text-3xl font-bold text-green-600">68%</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Best Score</p>
              <p className="text-3xl font-bold text-purple-600">950</p>
            </div>
          </div>
        </section>

        {/* Upcoming Tournaments */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upcoming Tournaments</h2>
            <Button
              variant="ghost"
              onClick={() => {
                const event = new CustomEvent("changeView", {
                  detail: { view: "tournament" },
                });
                window.dispatchEvent(event);
              }}
              size="sm"
            >
              View All
            </Button>
          </div>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">Weekly Championship</h3>
                <p className="text-sm text-muted-foreground">
                  Starts in 2 hours • 32 players
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium">Prize: 500 USDC</div>
                <Button size="sm" disabled={!isWalletConnected}>
                  {isWalletConnected ? "Join" : "Connect Wallet to Join"}
                </Button>
              </div>
            </div>
            <div className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">Weekend Challenge</h3>
                <p className="text-sm text-muted-foreground">
                  Starts in 1 day • 64 players
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium">Prize: 1000 USDC</div>
                <Button size="sm" disabled={!isWalletConnected}>
                  {isWalletConnected ? "Join" : "Connect Wallet to Join"}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MainMenu;

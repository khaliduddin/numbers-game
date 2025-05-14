import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Wallet, Trophy, Filter, Search } from "lucide-react";
import TournamentCard from "./TournamentCard";
import PaymentModal from "./PaymentModal";

interface TournamentLobbyProps {
  walletConnected?: boolean;
  tournaments?: Array<{
    id: string;
    name: string;
    entryFee: number;
    prizePool: number;
    startTime: Date;
    participantCount: number;
    maxParticipants: number;
  }>;
}

const TournamentLobby = ({
  walletConnected = false,
  tournaments = [
    {
      id: "t-123",
      name: "Weekend Challenge",
      entryFee: 5,
      prizePool: 250,
      startTime: new Date(Date.now() + 3600000), // 1 hour from now
      participantCount: 18,
      maxParticipants: 32,
    },
    {
      id: "t-124",
      name: "Pro Tournament",
      entryFee: 10,
      prizePool: 500,
      startTime: new Date(Date.now() + 7200000), // 2 hours from now
      participantCount: 24,
      maxParticipants: 32,
    },
    {
      id: "t-125",
      name: "Daily Sprint",
      entryFee: 2,
      prizePool: 100,
      startTime: new Date(Date.now() + 1800000), // 30 minutes from now
      participantCount: 12,
      maxParticipants: 16,
    },
    {
      id: "t-126",
      name: "Weekly Championship",
      entryFee: 15,
      prizePool: 750,
      startTime: new Date(Date.now() + 86400000), // 24 hours from now
      participantCount: 8,
      maxParticipants: 64,
    },
  ],
}: TournamentLobbyProps) => {
  const [selectedTournament, setSelectedTournament] = useState<string | null>(
    null,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const handleJoinTournament = (id: string) => {
    if (!walletConnected) {
      // Prompt to connect wallet
      alert("Please connect your wallet to join tournaments");
      return;
    }

    setSelectedTournament(id);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    // Handle successful payment
    setShowPaymentModal(false);
    setSelectedTournament(null);
    // Additional logic like updating UI or redirecting
  };

  const filteredTournaments = tournaments.filter((tournament) =>
    tournament.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedTournamentData = tournaments.find(
    (t) => t.id === selectedTournament,
  );

  return (
    <div className="w-full max-w-[1000px] mx-auto p-3 sm:p-6 bg-white">
      <div className="flex flex-col space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold">Tournament Lobby</h1>
          {!walletConnected ? (
            <Button
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto"
              variant="outline"
              onClick={() => alert("Wallet connection would be triggered here")}
              size="sm" disabled
            >
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
              Connect Wallet
              <span className="text-xs">coming soon</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 bg-blue-50 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="font-medium">25.75 USDC</span>
            </div>
          )}
        </div>

        <Tabs
          defaultValue="upcoming"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 max-w-md">
                <TabsTrigger
                  value="upcoming"
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  Completed
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="h-3 w-3 sm:h-4 sm:w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search tournaments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 sm:pl-9 w-full sm:w-[200px] h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="upcoming" className="mt-4 sm:mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    id={tournament.id}
                    name={tournament.name}
                    entryFee={tournament.entryFee}
                    prizePool={tournament.prizePool}
                    startTime={tournament.startTime}
                    participantCount={tournament.participantCount}
                    maxParticipants={tournament.maxParticipants}
                    onJoin={handleJoinTournament}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active" className="mt-4 sm:mt-6">
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-700">
                  No Active Tournaments
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 max-w-md">
                  There are no tournaments currently in progress. Check back
                  soon or join an upcoming tournament.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-4 sm:mt-6">
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-700">
                  No Completed Tournaments
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 max-w-md">
                  Your completed tournament history will appear here. Join a
                  tournament to get started!
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {showPaymentModal && selectedTournamentData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          tournamentName={selectedTournamentData.name}
          entryFee={selectedTournamentData.entryFee}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default TournamentLobby;

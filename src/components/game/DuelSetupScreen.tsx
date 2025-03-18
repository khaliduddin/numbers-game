import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import {
  Users,
  Clock,
  Plus,
  ListFilter,
  UserPlus,
  Globe,
  Lock,
} from "lucide-react";

interface DuelSetupScreenProps {
  onJoinGame: () => void;
  onCreateGame: (
    rounds: number,
    isPrivate: boolean,
    friendAddress?: string,
  ) => void;
  onCancel: () => void;
}

const DuelSetupScreen: React.FC<DuelSetupScreenProps> = ({
  onJoinGame = () => {},
  onCreateGame = () => {},
  onCancel = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<string>("join");
  const [selectedRounds, setSelectedRounds] = useState<number>(5);
  const [isPrivateGame, setIsPrivateGame] = useState<boolean>(false);
  const [friendAddress, setFriendAddress] = useState<string>("");

  const handleCreateGame = () => {
    onCreateGame(
      selectedRounds,
      isPrivateGame,
      isPrivateGame ? friendAddress : undefined,
    );
  };

  return (
    <div className="flex items-center justify-center w-full max-w-4xl mx-auto p-4 bg-gray-50 min-h-[600px] rounded-xl shadow-lg">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">1v1 Duel Mode</CardTitle>
          <CardDescription className="text-center">
            Challenge opponents in head-to-head matches
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="join"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="join" className="flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
                Join Game
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Game
              </TabsTrigger>
            </TabsList>

            <TabsContent value="join" className="space-y-4">
              <div className="text-center p-6 border rounded-lg">
                <p className="text-muted-foreground mb-4">
                  Join an existing game from the waiting queue
                </p>
                <Button onClick={onJoinGame} className="w-full">
                  Find Opponent
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Number of Rounds</h3>
                </div>

                <RadioGroup
                  value={selectedRounds.toString()}
                  onValueChange={(value) => setSelectedRounds(parseInt(value))}
                  className="grid grid-cols-3 gap-4 mb-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="r3" />
                    <Label htmlFor="r3">3 Rounds</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="r5" />
                    <Label htmlFor="r5">5 Rounds</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10" id="r10" />
                    <Label htmlFor="r10">10 Rounds</Label>
                  </div>
                </RadioGroup>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    {isPrivateGame ? (
                      <Lock className="h-5 w-5 text-primary" />
                    ) : (
                      <Globe className="h-5 w-5 text-primary" />
                    )}
                    <h3 className="font-medium">Game Privacy</h3>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="private-game"
                      checked={isPrivateGame}
                      onCheckedChange={(checked) => {
                        setIsPrivateGame(checked === true);
                      }}
                    />
                    <Label
                      htmlFor="private-game"
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Invite a friend (Private Game)
                    </Label>
                  </div>

                  {isPrivateGame && (
                    <div className="mb-4">
                      <Label
                        htmlFor="friend-address"
                        className="block mb-2 text-sm"
                      >
                        Friend's Username or Wallet Address
                      </Label>
                      <Input
                        id="friend-address"
                        placeholder="Enter username or wallet address"
                        value={friendAddress}
                        onChange={(e) => setFriendAddress(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <Button onClick={handleCreateGame} className="w-full">
                  {isPrivateGame
                    ? "Create & Invite Friend"
                    : "Create Public Game"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={onCancel}>
            Return to Menu
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DuelSetupScreen;

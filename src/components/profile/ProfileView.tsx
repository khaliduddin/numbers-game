import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Settings, Share2, Trophy, History, Medal } from "lucide-react";
import { toast } from "../ui/use-toast";
import StatsOverview from "./StatsOverview";
import GameHistory from "./GameHistory";
import ProfileForm from "./ProfileForm";
import { Progress } from "../ui/progress";
import { unifiedProfileService } from "@/lib/unifiedProfileService";
import { gameStatsService, GameRecord } from "@/lib/gameStatsService";
import { AuthUser } from "@/services/authService";

interface ProfileViewProps {
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
    joinDate: string;
    email?: string;
    telegramId?: string;
    walletAddress?: string;
    phoneNumber?: string;
    achievements?: Achievement[];
    referralCode?: string;
    referredByCode?: string;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

const ProfileView = ({ user: propUser }: ProfileViewProps) => {
  const [activeTab, setActiveTab] = useState("stats");
  const [activeGameMode, setActiveGameMode] = useState<
    "Solo" | "1v1" | "Tournament"
  >("Solo");
  const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);
  const [gameHistoryLoading, setGameHistoryLoading] = useState(false);
  const [gameHistoryError, setGameHistoryError] = useState<string | null>(null);

  const [user, setUser] = useState<ProfileViewProps["user"]>({
    id: "00000000-0000-0000-0000-000000000000", // Using a valid UUID format for guest users
    username: "Guest Player",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=GuestPlayer",
    joinDate: new Date().toISOString(),
    email: "",
    telegramId: "",
    walletAddress: "",
    phoneNumber: "",
    achievements: [
      {
        id: "ach1",
        title: "First Victory",
        description: "Won your first 1v1 match",
        date: "2023-02-01",
        icon: "trophy",
      },
      {
        id: "ach2",
        title: "Speed Demon",
        description: "Completed a round in under 2 seconds",
        date: "2023-03-10",
        icon: "zap",
      },
      {
        id: "ach3",
        title: "Tournament Champion",
        description: "Won a tournament with 15 players or more",
        date: "2023-04-22",
        icon: "award",
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is passed as prop, use it instead of fetching
    if (propUser) {
      setUser(propUser);
      setLoading(false);
      return;
    }

    // Use default guest profile data
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load from localStorage first
        const savedProfile = localStorage.getItem("userProfile");
        let userData;

        if (savedProfile) {
          userData = JSON.parse(savedProfile);

          // Always sync with database to ensure we have the latest data
          if (userData.id) {
            const isGuest =
              userData.id === "00000000-0000-0000-0000-000000000000" ||
              (userData.id && userData.id.startsWith("guest_"));

            console.log(
              "Fetching profile from database for ID:",
              userData.id,
              "isGuest:",
              isGuest,
            );

            const { profile, error } = await unifiedProfileService.getProfile(
              userData.id,
              isGuest,
            );

            if (profile && !error) {
              console.log("Profile fetched from database:", profile);
              console.log("Database referral code:", profile.referralCode);

              // Update local storage with database values
              const syncedData = {
                ...userData,
                referralCode: profile.referralCode, // Always use database version
                referredByCode: profile.referredByCode,
                stats: profile.stats || userData.stats,
                xp: profile.xp || userData.xp,
              };

              console.log(
                "Synced user data with referral code:",
                syncedData.referralCode,
              );

              localStorage.setItem("userProfile", JSON.stringify(syncedData));
              userData = syncedData;
            } else {
              console.warn("Failed to fetch profile from database:", error);
            }
          }
        } else {
          // Create default guest user data
          userData = {
            id: "00000000-0000-0000-0000-000000000000", // Using a valid UUID format for guest users
            username: "Guest Player",
            joinDate: new Date().toISOString(),
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=GuestPlayer`,
            email: "",
            telegramId: "",
            walletAddress: "",
            phoneNumber: "",
            achievements: [], // We'll implement achievements later
          };
        }

        setUser(userData);
      } catch (err) {
        console.error("Error in fetchUserProfile:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [propUser]);

  // Fetch game history when user changes
  useEffect(() => {
    if (!user || loading) return;

    const fetchGameHistory = async () => {
      try {
        setGameHistoryLoading(true);
        setGameHistoryError(null);

        // Check if it's a guest user or authenticated user
        const isGuest =
          user.id === "00000000-0000-0000-0000-000000000000" ||
          (user.id && user.id.startsWith("guest_"));

        // Fetch game history using the appropriate ID
        const { games, error } = await gameStatsService.getGameHistory(
          isGuest ? undefined : user.id,
          isGuest ? user.id : undefined,
        );

        if (error) {
          console.error("Error fetching game history:", error);
          setGameHistoryError("Failed to load game history");
        } else {
          setGameHistory(games);
        }
      } catch (err) {
        console.error("Exception in fetchGameHistory:", err);
        setGameHistoryError("An unexpected error occurred");
      } finally {
        setGameHistoryLoading(false);
      }
    };

    fetchGameHistory();
  }, [user, loading]);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get icon component based on achievement icon name
  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "trophy":
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case "zap":
        return <History className="h-5 w-5 text-blue-500" />;
      case "award":
        return <Medal className="h-5 w-5 text-purple-500" />;
      default:
        return <Trophy className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 md:p-6 bg-background flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 md:p-6 bg-background flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
            <p>{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Handle saving profile updates
  const handleSaveProfile = async (updatedUser: any) => {
    // Save to Firebase using unified profile service first
    try {
      // Determine if this is a guest user
      const isGuest =
        updatedUser.id === "00000000-0000-0000-0000-000000000000" ||
        updatedUser.id.startsWith("guest_");

      // Force a database save by setting isForceUpdate to true
      const { profile, error } = await unifiedProfileService.saveProfile({
        id: updatedUser.id,
        guestId: isGuest ? updatedUser.id : undefined,
        username: updatedUser.username,
        email: updatedUser.email,
        telegramId: updatedUser.telegramId,
        walletAddress: updatedUser.walletAddress,
        phoneNumber: updatedUser.phoneNumber,
        avatarUrl: updatedUser.avatarUrl,
        referralCode: updatedUser.referralCode, // Preserve existing referral code
        referredByCode: updatedUser.referredByCode, // Include referredByCode when saving
        referredByCode: updatedUser.referredByCode,
        isGuest: isGuest,
        isForceUpdate: true, // Force update to database
      });

      if (error) {
        console.error("Error saving profile to Firebase:", error);
        toast({
          title: "Error",
          description: "Failed to save profile to database",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully",
          duration: 3000,
        });
      }

      // If profile was returned, update the user object with the database values
      if (profile) {
        // Update with values from database to ensure sync
        const syncedUser = {
          ...updatedUser,
          referralCode: profile.referralCode, // Always use database version
          joinDate: profile.joinDate || updatedUser.joinDate,
          stats: profile.stats || updatedUser.stats,
          xp: profile.xp || updatedUser.xp,
        };

        console.log(
          "Profile saved to database with referral code:",
          profile.referralCode,
        );

        // Save the synced profile to localStorage
        localStorage.setItem("userProfile", JSON.stringify(syncedUser));
        setUser(syncedUser);
      } else {
        // If no profile returned, just save the local version
        localStorage.setItem("userProfile", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      console.error("Error using unifiedProfileService:", err);
      // Continue without Firebase integration if there's an error
      localStorage.setItem("userProfile", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 md:p-6 bg-background">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-6 bg-card rounded-xl border">
        <Avatar className="h-16 w-16 sm:h-20 md:h-24 sm:w-20 md:w-24 border-4 border-primary/10">
          <AvatarImage src={user.avatarUrl} alt={user.username} />
          <AvatarFallback>
            {user.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <ProfileForm user={user} onSaveProfile={handleSaveProfile} />
        <div className="flex-1 text-center md:text-left">
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Member since {formatDate(user.joinDate)}
          </p>

          {/* Referral Code Section */}
          {user.referralCode && (
            <div className="mt-2 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-md">
                <span className="text-xs font-medium">Referral Code:</span>
                <span className="text-xs font-bold" data-testid="referral-code">
                  {user.referralCode}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(user.referralCode || "");
                  toast({
                    title: "Success",
                    description: "Referral code copied to clipboard",
                    duration: 3000,
                  });
                }}
              >
                Copy Code
              </Button>
            </div>
          )}
          {/* <div className="flex gap-2 mt-2 md:mt-2 w-full md:w-auto justify-center md:justify-start">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 w-full md:w-auto"
            >
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 w-full md:w-auto"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Settings
            </Button>
          </div> */}
        </div>
      </div>

      {/* Profile Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-8">
          <TabsTrigger
            value="stats"
            className="text-xs sm:text-sm py-1.5 sm:py-2"
          >
            Statistics
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-xs sm:text-sm py-1.5 sm:py-2"
          >
            Game History
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="text-xs sm:text-sm py-1.5 sm:py-2"
          >
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-3 sm:space-y-4">
          <div className="mb-4">
            <div className="flex space-x-2">
              <Button
                variant={activeGameMode === "Solo" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGameMode("Solo")}
              >
                Solo
              </Button>
              <Button
                variant={activeGameMode === "1v1" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGameMode("1v1")}
              >
                1v1
              </Button>
              <Button
                variant={
                  activeGameMode === "Tournament" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setActiveGameMode("Tournament")}
              >
                Tournament
              </Button>
            </div>
          </div>
          <StatsOverview
            gameMode={activeGameMode}
            userId={
              user.id !== "00000000-0000-0000-0000-000000000000" &&
              !user.id?.startsWith("guest_")
                ? user.id
                : undefined
            }
            guestId={
              user.id === "00000000-0000-0000-0000-000000000000" ||
              user.id?.startsWith("guest_")
                ? user.id
                : undefined
            }
          />
        </TabsContent>

        <TabsContent value="history">
          <GameHistory
            games={gameHistory}
            loading={gameHistoryLoading}
            error={gameHistoryError}
          />
        </TabsContent>

        <TabsContent value="achievements">
          <div className="bg-white p-4 sm:p-6 rounded-xl border">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Achievements
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {user.achievements?.map((achievement) => (
                <Card key={achievement.id}>
                  <CardHeader className="flex flex-row items-center gap-2 sm:gap-3 pb-1 sm:pb-2 p-3 sm:p-6">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    <CardTitle className="text-sm sm:text-base font-medium">
                      {achievement.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                      Unlocked on {formatDate(achievement.date)}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {(!user.achievements || user.achievements.length === 0) && (
                <div className="col-span-full text-center py-6 sm:py-8 text-muted-foreground text-sm">
                  No achievements unlocked yet
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileView;

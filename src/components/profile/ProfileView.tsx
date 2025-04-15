import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Wallet,
  Settings,
  Share2,
  Trophy,
  History,
  Medal,
  Edit,
  Check,
  X,
} from "lucide-react";
import { Input } from "../ui/input";
import StatsOverview from "./StatsOverview";
import GameHistory from "./GameHistory";
import { supabase } from "@/lib/supabase";
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
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingTelegramId, setIsEditingTelegramId] = useState(false);
  const [isEditingWalletAddress, setIsEditingWalletAddress] = useState(false);
  const [isEditingPhoneNumber, setIsEditingPhoneNumber] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedTelegramId, setEditedTelegramId] = useState("");
  const [editedWalletAddress, setEditedWalletAddress] = useState("");
  const [editedPhoneNumber, setEditedPhoneNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [user, setUser] = useState<ProfileViewProps["user"]>({
    id: "guest-user",
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
      setEditedUsername(propUser.username || "");
      setEditedEmail(propUser.email || "");
      setEditedTelegramId(propUser.telegramId || "");
      setEditedWalletAddress(propUser.walletAddress || "");
      setEditedPhoneNumber(propUser.phoneNumber || "");
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
        } else {
          // Create default guest user data
          userData = {
            id: "guest-user",
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
        setEditedUsername(userData.username || "");
        setEditedEmail(userData.email || "");
        setEditedTelegramId(userData.telegramId || "");
        setEditedWalletAddress(userData.walletAddress || "");
        setEditedPhoneNumber(userData.phoneNumber || "");
      } catch (err) {
        console.error("Error in fetchUserProfile:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [propUser]);

  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

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

  // Function to handle saving the username
  const handleSaveUsername = async () => {
    if (!editedUsername.trim()) {
      setSaveError("Username cannot be empty");
      return;
    }

    if (editedUsername === user.username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      // Just update the local state for guest mode
      const updatedUser = {
        ...user,
        username: editedUsername,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${editedUsername}`,
      };

      setUser(updatedUser);
      // Save to localStorage
      localStorage.setItem("userProfile", JSON.stringify(updatedUser));

      setIsEditingUsername(false);
    } catch (err) {
      console.error("Error in handleSaveUsername:", err);
      setSaveError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle saving the email
  const handleSaveEmail = async () => {
    if (editedEmail === user.email) {
      setIsEditingEmail(false);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      // Update the local state for guest mode
      const updatedUser = {
        ...user,
        email: editedEmail,
      };

      setUser(updatedUser);
      // Save to localStorage
      localStorage.setItem("userProfile", JSON.stringify(updatedUser));

      setIsEditingEmail(false);
    } catch (err) {
      console.error("Error in handleSaveEmail:", err);
      setSaveError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle saving the telegram ID
  const handleSaveTelegramId = async () => {
    if (editedTelegramId === user.telegramId) {
      setIsEditingTelegramId(false);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      // Update the local state for guest mode
      const updatedUser = {
        ...user,
        telegramId: editedTelegramId,
      };

      setUser(updatedUser);
      // Save to localStorage
      localStorage.setItem("userProfile", JSON.stringify(updatedUser));

      setIsEditingTelegramId(false);
    } catch (err) {
      console.error("Error in handleSaveTelegramId:", err);
      setSaveError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle saving the wallet address
  const handleSaveWalletAddress = async () => {
    if (editedWalletAddress === user.walletAddress) {
      setIsEditingWalletAddress(false);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      // Update the local state for guest mode
      const updatedUser = {
        ...user,
        walletAddress: editedWalletAddress,
      };

      setUser(updatedUser);
      // Save to localStorage
      localStorage.setItem("userProfile", JSON.stringify(updatedUser));

      setIsEditingWalletAddress(false);
    } catch (err) {
      console.error("Error in handleSaveWalletAddress:", err);
      setSaveError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle saving the phone number
  const handleSavePhoneNumber = async () => {
    if (editedPhoneNumber === user.phoneNumber) {
      setIsEditingPhoneNumber(false);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      // Update the local state for guest mode
      const updatedUser = {
        ...user,
        phoneNumber: editedPhoneNumber,
      };

      setUser(updatedUser);
      // Save to localStorage
      localStorage.setItem("userProfile", JSON.stringify(updatedUser));

      setIsEditingPhoneNumber(false);
    } catch (err) {
      console.error("Error in handleSavePhoneNumber:", err);
      setSaveError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
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

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-1 sm:gap-2 md:gap-4 justify-center md:justify-start">
            {isEditingUsername ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  className="h-8 text-lg font-bold max-w-[200px]"
                  placeholder="Username"
                  disabled={isSaving}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleSaveUsername()}
                  disabled={isSaving}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => {
                    setIsEditingUsername(false);
                    setEditedUsername(user.username || "");
                    setSaveError(null);
                  }}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                  {user.username}
                </h1>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setIsEditingUsername(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Badge variant="outline" className="w-fit mx-auto md:mx-0">
              Level 0
            </Badge>
          </div>
          {saveError && (
            <div className="text-red-500 text-sm mt-1">{saveError}</div>
          )}

          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Member since {formatDate(user.joinDate)}
          </p>

          {/* Email Field */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-medium w-24">Email:</span>
            {isEditingEmail ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="h-8 text-sm max-w-[250px]"
                  placeholder="Email address"
                  type="email"
                  disabled={isSaving}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleSaveEmail()}
                  disabled={isSaving}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => {
                    setIsEditingEmail(false);
                    setEditedEmail(user.email || "");
                    setSaveError(null);
                  }}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-muted-foreground">
                  {user.email || "Not set"}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setIsEditingEmail(true)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Telegram ID Field */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium w-24">Telegram ID:</span>
            {isEditingTelegramId ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedTelegramId}
                  onChange={(e) => setEditedTelegramId(e.target.value)}
                  className="h-8 text-sm max-w-[250px]"
                  placeholder="Telegram username"
                  disabled={isSaving}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleSaveTelegramId()}
                  disabled={isSaving}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => {
                    setIsEditingTelegramId(false);
                    setEditedTelegramId(user.telegramId || "");
                    setSaveError(null);
                  }}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-muted-foreground">
                  {user.telegramId || "Not set"}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setIsEditingTelegramId(true)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Wallet Address Field */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium w-24">Wallet:</span>
            {isEditingWalletAddress ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedWalletAddress}
                  onChange={(e) => setEditedWalletAddress(e.target.value)}
                  className="h-8 text-sm max-w-[250px]"
                  placeholder="Wallet address"
                  disabled={isSaving}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleSaveWalletAddress()}
                  disabled={isSaving}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => {
                    setIsEditingWalletAddress(false);
                    setEditedWalletAddress(user.walletAddress || "");
                    setSaveError(null);
                  }}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-muted-foreground">
                  {user.walletAddress
                    ? formatWalletAddress(user.walletAddress)
                    : "Not set"}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setIsEditingWalletAddress(true)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium w-24">Phone:</span>
            {isEditingPhoneNumber ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedPhoneNumber}
                  onChange={(e) => setEditedPhoneNumber(e.target.value)}
                  className="h-8 text-sm max-w-[250px]"
                  placeholder="Phone number"
                  type="tel"
                  disabled={isSaving}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleSavePhoneNumber()}
                  disabled={isSaving}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => {
                    setIsEditingPhoneNumber(false);
                    setEditedPhoneNumber(user.phoneNumber || "");
                    setSaveError(null);
                  }}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-muted-foreground">
                  {user.phoneNumber || "Not set"}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setIsEditingPhoneNumber(true)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-2 md:mt-0 w-full md:w-auto justify-center md:justify-end">
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
          <StatsOverview />
        </TabsContent>

        <TabsContent value="history">
          <GameHistory />
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

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MainMenu from "./MainMenu";
import GameContainer from "./game/GameContainer";
import DuelSetupScreen from "./game/DuelSetupScreen";
import ProfileView from "./profile/ProfileView";
import LeaderboardView from "./leaderboard/LeaderboardView";
import TournamentLobby from "./tournament/TournamentLobby";
import AuthContainer from "./auth/AuthContainer";
import { supabase } from "@/lib/supabase";
import { unifiedProfileService } from "@/lib/unifiedProfileService";

const Home = () => {
  const navigate = useNavigate();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [currentView, setCurrentView] = useState("main"); // main, game, profile, leaderboard, tournament, auth
  const [gameMode, setGameMode] = useState<"solo" | "1v1" | "tournament">(
    "solo",
  );

  // Check if we should show auth screen from localStorage
  useEffect(() => {
    const showAuth = localStorage.getItem("showAuth");
    if (showAuth === "true") {
      setCurrentView("auth");
      localStorage.removeItem("showAuth"); // Clear the flag
    }

    // Check if user exists in localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUsername(user.username || "Guest");

      // Update or create profile in Supabase for any user
      updateUserProfile(user);
    }

    // Check if userProfile exists in localStorage (this takes precedence)
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUsername(profile.username || "Guest");
        // No need to update Supabase here as this is already a saved profile
      } catch (err) {
        console.error("Error parsing userProfile:", err);
      }
    }
  }, []);

  // Update or create profile in Supabase (works for both guest and auth users)
  const updateUserProfile = async (user: any) => {
    // Generate a unique ID for guest if not exists
    if (user.isGuest && !user.guestId) {
      user.guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("user", JSON.stringify(user));
    }

    // Update last login time
    user.lastLogin = new Date().toISOString();
    localStorage.setItem("user", JSON.stringify(user));

    // Save to Supabase
    try {
      const { profile, error } = await unifiedProfileService.saveProfile({
        id: user.id, // Will be undefined for guests
        guestId: user.guestId,
        username: user.username || "Guest",
        email: user.email,
        joinDate: user.joinDate || new Date().toISOString(),
        avatarUrl:
          user.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || "Guest"}`,
        isGuest: user.isGuest || false,
        walletAddress: user.walletAddress,
      });

      if (error) {
        console.error("Error updating profile:", error);
        return;
      }

      if (profile) {
        // Update local storage with profile info
        user.id = profile.id;
        user.username = profile.username;
        user.referralCode = profile.referralCode;
        user.loginCount = profile.loginCount;
        user.avatarUrl = profile.avatarUrl;
        localStorage.setItem("user", JSON.stringify(user));

        // You could show a welcome back message for returning users
        if (profile.loginCount && profile.loginCount > 1) {
          console.log(
            `Welcome back! This is your visit #${profile.loginCount}`,
          );
          // Could trigger a toast notification here
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Handle view changes from custom events
  const handleViewChange = useCallback((event: CustomEvent) => {
    const { view, mode } = event.detail;
    console.log("View change event received:", view, mode);
    setCurrentView(view);
    if (mode) {
      setGameMode(mode as "solo" | "1v1" | "tournament");
      // Set duelSetupActive to true when 1v1 mode is selected
      if (mode === "1v1") {
        setDuelSetupActive(true);
      } else {
        setDuelSetupActive(false);
      }
    }
  }, []);

  // Set up event listeners for view changes
  useEffect(() => {
    // Add event listener for view changes
    const eventListener = handleViewChange as EventListener;
    document.addEventListener("changeView", eventListener);

    // Add event listener for logout
    const logoutListener = () => handleLogout();
    document.addEventListener("logout", logoutListener);

    console.log("Event listeners for changeView and logout added");

    // For debugging
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.textContent?.includes("Play Now")) {
        console.log("Play Now button clicked");
      }
    });

    return () => {
      document.removeEventListener("changeView", eventListener);
      document.removeEventListener("logout", logoutListener);
      console.log("Event listeners for changeView and logout removed");
    };
  }, [handleViewChange]);

  const handleWalletConnect = (walletAddress: string) => {
    // Simulate wallet connection
    console.log("Wallet connected:", walletAddress);

    if (walletAddress) {
      setIsWalletConnected(true);

      // If user is on auth screen, take them to main menu after wallet connection
      if (currentView === "auth") {
        setCurrentView("main");
      }

      // Update localStorage
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        user.walletAddress = walletAddress;
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        // Create a new user entry if none exists
        const newUser = {
          username: "Wallet User",
          walletAddress: walletAddress,
        };
        localStorage.setItem("user", JSON.stringify(newUser));
        setUsername("Wallet User");
      }
    } else {
      setIsWalletConnected(false);
    }
  };

  const handleLogout = () => {
    // In guest mode, just reset wallet connection
    setIsWalletConnected(false);
    setUsername("Guest");
    setCurrentView("main");
    localStorage.removeItem("user");
  };

  const [duelSetupActive, setDuelSetupActive] = useState(false);
  const [customRounds, setCustomRounds] = useState(10);

  const handleGameModeSelect = (mode: "solo" | "1v1" | "tournament") => {
    setGameMode(mode);
    if (mode === "tournament") {
      setCurrentView("tournament");
    } else if (mode === "1v1") {
      setDuelSetupActive(true);
      setCurrentView("game");
    } else {
      setDuelSetupActive(false);
      setCurrentView("game");
    }
  };

  const handleGameComplete = (
    score: number,
    accuracy: number,
    avgTime: number,
  ) => {
    console.log(
      "Game completed with score:",
      score,
      "accuracy:",
      accuracy,
      "avg time:",
      avgTime,
    );
    // Could save stats or show a special screen here
  };

  const handleAuthSuccess = (userData: any) => {
    // Save user data and navigate to main menu
    localStorage.setItem("user", JSON.stringify(userData));
    setUsername(userData.username || "User");
    setCurrentView("main");
  };

  const renderView = () => {
    switch (currentView) {
      case "auth":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center"
          >
            <AuthContainer
              onLogin={(values) => {
                // The login form now handles storing the profile in localStorage
                // We just need to update our local state
                const savedProfile = localStorage.getItem("userProfile");
                if (savedProfile) {
                  try {
                    const profile = JSON.parse(savedProfile);
                    handleAuthSuccess({
                      id: profile.id,
                      username: profile.username || values.email.split("@")[0],
                      email: profile.email || values.email,
                      avatarUrl: profile.avatarUrl,
                      isGuest: false,
                      lastLogin: new Date().toISOString(),
                    });
                  } catch (err) {
                    console.error("Error parsing userProfile:", err);
                    // Fallback to basic info
                    handleAuthSuccess({
                      username: values.email.split("@")[0],
                      email: values.email,
                      isGuest: false,
                      lastLogin: new Date().toISOString(),
                    });
                  }
                } else {
                  // Fallback to basic info
                  handleAuthSuccess({
                    username: values.email.split("@")[0],
                    email: values.email,
                    isGuest: false,
                    lastLogin: new Date().toISOString(),
                  });
                }
              }}
              onSignup={(values) => {
                // The signup form now handles storing the profile in localStorage
                // We just need to update our local state
                const savedProfile = localStorage.getItem("userProfile");
                if (savedProfile) {
                  try {
                    const profile = JSON.parse(savedProfile);
                    handleAuthSuccess({
                      id: profile.id,
                      username: profile.username || values.username,
                      email: profile.email || values.email,
                      avatarUrl: profile.avatarUrl,
                      isGuest: false,
                      lastLogin: new Date().toISOString(),
                      joinDate: profile.joinDate || new Date().toISOString(),
                    });
                  } catch (err) {
                    console.error("Error parsing userProfile:", err);
                    // Fallback to basic info
                    handleAuthSuccess({
                      username: values.username,
                      email: values.email,
                      isGuest: false,
                      lastLogin: new Date().toISOString(),
                      joinDate: new Date().toISOString(),
                    });
                  }
                } else {
                  // Fallback to basic info
                  handleAuthSuccess({
                    username: values.username,
                    email: values.email,
                    isGuest: false,
                    lastLogin: new Date().toISOString(),
                    joinDate: new Date().toISOString(),
                  });
                }
              }}
              onWalletConnect={handleWalletConnect}
              onBackToWelcome={() => setCurrentView("main")}
            />
          </motion.div>
        );
      case "main":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <MainMenu
              username={username}
              isWalletConnected={isWalletConnected}
            />
          </motion.div>
        );
      case "game":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4"
          >
            <div className="w-full max-w-4xl">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary">
                  {gameMode === "solo" ? "Solo Practice" : "1v1 Duel"}
                </h1>
                <button
                  onClick={() => setCurrentView("main")}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Return to Menu
                </button>
              </div>
              {gameMode === "1v1" && duelSetupActive ? (
                <div className="w-full">
                  <DuelSetupScreen
                    onJoinGame={() => {
                      setDuelSetupActive(false);
                      // Here we would normally connect to a matchmaking service
                      console.log("Joining existing game");
                    }}
                    onCreateGame={(rounds, isPrivate, friendAddress) => {
                      setDuelSetupActive(false);
                      setCustomRounds(rounds);
                      console.log(
                        `Creating new ${isPrivate ? "private" : "public"} game with ${rounds} rounds${friendAddress ? ` and inviting ${friendAddress}` : ""}`,
                      );
                    }}
                    onCancel={() => setCurrentView("main")}
                  />
                </div>
              ) : (
                <GameContainer
                  gameMode={gameMode}
                  totalRounds={gameMode === "1v1" ? customRounds : 10}
                  onGameComplete={handleGameComplete}
                  onExit={() => setCurrentView("main")}
                />
              )}
            </div>
          </motion.div>
        );
      case "profile":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4"
          >
            <div className="w-full max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary">
                  Your Profile
                </h1>
                <button
                  onClick={() => setCurrentView("main")}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Return to Menu
                </button>
              </div>
              <ProfileView />
            </div>
          </motion.div>
        );
      case "leaderboard":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4"
          >
            <div className="w-full max-w-6xl mx-auto">
              <LeaderboardView onBack={() => setCurrentView("main")} />
            </div>
          </motion.div>
        );
      case "tournament":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4"
          >
            <div className="w-full max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary">Tournaments</h1>
                <button
                  onClick={() => setCurrentView("main")}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Return to Menu
                </button>
              </div>
              <TournamentLobby walletConnected={isWalletConnected} />
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return <div className="min-h-screen bg-background">{renderView()}</div>;
};

export default Home;

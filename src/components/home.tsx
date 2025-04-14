import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import AuthContainer from "./auth/AuthContainer";
import MainMenu from "./MainMenu";
import GameContainer from "./game/GameContainer";
import DuelSetupScreen from "./game/DuelSetupScreen";
import ProfileView from "./profile/ProfileView";
import LeaderboardView from "./leaderboard/LeaderboardView";
import TournamentLobby from "./tournament/TournamentLobby";

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [currentView, setCurrentView] = useState("auth"); // auth, main, game, profile, leaderboard, tournament
  const [gameMode, setGameMode] = useState<"solo" | "1v1" | "tournament">(
    "solo",
  );

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

  // Check if user is already logged in with Supabase
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error checking auth status:", error);
        return;
      }

      if (data.session) {
        // User is authenticated
        const { data: userData } = await supabase.auth.getUser();

        if (userData.user) {
          // Get profile data
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userData.user.id)
            .single();

          setIsAuthenticated(true);
          setUsername(
            profileData?.username || userData.user.email?.split("@")[0] || "",
          );
          setCurrentView("main");

          if (profileData?.wallet_address) {
            setIsWalletConnected(true);
          }
        }
      } else {
        // Check localStorage as fallback
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setIsAuthenticated(true);
          setUsername(user.username);
          setCurrentView("main");
          if (user.walletAddress) {
            setIsWalletConnected(true);
          }
        }
      }
    };

    checkAuthStatus();

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

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      // Get user data from Supabase
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting user:", error);
        return;
      }

      if (!data.user) {
        console.error("No user found");
        return;
      }

      // Get profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      setIsAuthenticated(true);
      setUsername(profileData?.username || values.email.split("@")[0]);
      setCurrentView("main");

      // Save minimal data to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: profileData?.username || values.email.split("@")[0],
          email: values.email,
          id: data.user.id,
        }),
      );
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSignup = (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    // Don't automatically authenticate after signup - require email verification
    setCurrentView("auth");
    // Don't log sensitive information
  };

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
        setIsAuthenticated(true);
      }
    } else {
      setIsWalletConnected(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }

      setIsAuthenticated(false);
      setIsWalletConnected(false);
      setUsername("");
      setCurrentView("auth");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout error:", error);
    }
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

  const renderView = () => {
    switch (currentView) {
      case "auth":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100"
          >
            <AuthContainer
              onLogin={handleLogin}
              onSignup={handleSignup}
              onWalletConnect={handleWalletConnect}
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

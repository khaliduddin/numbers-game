import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthContainer from "./auth/AuthContainer";
import MainMenu from "./MainMenu";
import GameContainer from "./game/GameContainer";
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
      setGameMode(mode);
    }
  }, []);

  // Simulate checking if user is already logged in
  useEffect(() => {
    // For demo purposes, we'll just check localStorage
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

    // Add event listener for view changes
    const eventListener = handleViewChange as EventListener;
    window.addEventListener("changeView", eventListener);

    console.log("Event listener for changeView added");

    return () => {
      window.removeEventListener("changeView", eventListener);
      console.log("Event listener for changeView removed");
    };
  }, [handleViewChange]);

  const handleLogin = (values: { email: string; password: string }) => {
    // Simulate login
    console.log("Login with:", values);
    setIsAuthenticated(true);
    setUsername(values.email.split("@")[0]); // Use part of email as username for demo
    setCurrentView("main");

    // Save to localStorage for demo persistence
    localStorage.setItem(
      "user",
      JSON.stringify({
        username: values.email.split("@")[0],
        email: values.email,
      }),
    );
  };

  const handleSignup = (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    // Simulate signup
    console.log("Signup with:", values);
    setIsAuthenticated(true);
    setUsername(values.username);
    setCurrentView("main");

    // Save to localStorage for demo persistence
    localStorage.setItem(
      "user",
      JSON.stringify({
        username: values.username,
        email: values.email,
      }),
    );
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsWalletConnected(false);
    setUsername("");
    setCurrentView("auth");
    localStorage.removeItem("user");
  };

  const handleGameModeSelect = (mode: "solo" | "1v1" | "tournament") => {
    setGameMode(mode);
    if (mode === "tournament") {
      setCurrentView("tournament");
    } else {
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
              <GameContainer
                gameMode={gameMode}
                onGameComplete={handleGameComplete}
                onExit={() => setCurrentView("main")}
              />
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

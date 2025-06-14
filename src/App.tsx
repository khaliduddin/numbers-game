import React, { Suspense, useState, useEffect, useContext } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import { telegramAuth } from "./lib/telegramAuth";
import { toast } from "./components/ui/use-toast";

// Create an empty routes array as fallback when tempo-routes is not available
let routes = [];

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Always call useContext to maintain hook order consistency
  // This ensures the hook order remains the same across all renders
  useContext(React.createContext(null));

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if running in Telegram first
        const isTelegram = telegramAuth.isRunningInTelegram();
        console.log("Is running in Telegram:", isTelegram);

        if (isTelegram) {
          const telegramUser = telegramAuth.getTelegramUser();
          console.log("Telegram user data:", telegramUser);
        }

        // Initialize user profile (either Telegram or guest)
        const { profile, isNewUser } =
          await telegramAuth.initializeUserProfile();

        if (profile) {
          console.log("Profile initialized:", profile);
          setUserProfile(profile);

          // Store user in localStorage
          localStorage.setItem("user", JSON.stringify(profile));

          // Show welcome toast for new Telegram users
          if (isTelegram && isNewUser) {
            toast({
              title: "Welcome to Number Master!",
              description: "Your Telegram profile has been connected.",
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Listen for sign out event
  useEffect(() => {
    const handleSignOut = (event: CustomEvent) => {
      try {
        if (event.detail?.view === "signout") {
          // Clear user data from localStorage
          localStorage.removeItem("user");
          localStorage.removeItem("userProfile");
          localStorage.removeItem("showAuth");
          // Keep hasVisitedWelcome so they don't have to go through welcome again
          // unless they want to switch accounts
          setUserProfile(null);

          // Create a guest profile
          telegramAuth.createGuestProfile().then(({ profile }) => {
            setUserProfile(profile);
            localStorage.setItem("user", JSON.stringify(profile));
          });
        }
        // Explicitly return undefined to avoid Promise issues
        return undefined;
      } catch (error) {
        console.error("Error in handleSignOut:", error);
        return undefined;
      }
    };

    document.addEventListener("changeView", handleSignOut as EventListener);

    return () => {
      document.removeEventListener(
        "changeView",
        handleSignOut as EventListener,
      );
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Always call useRoutes hook to maintain consistent hook order
  // We need to call useRoutes unconditionally to avoid hook order violations
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <Suspense fallback={<p>Loading...</p>}>
      {telegramAuth.isRunningInTelegram() && (
        <div className="bg-primary/10 py-2 px-4 text-center text-sm">
          <span className="font-medium">Announcements || </span>
          <span className="ml-2">Watch this space</span>
        </div>
      )}
      <Home />
      {/* For Tempo routes */}
      {import.meta.env.VITE_TEMPO === "true" && tempoRoutes}
      {/* Add this before any catchall route if you have one */}
      <Routes>
        {import.meta.env.VITE_TEMPO === "true" && <Route path="/tempobook/*" />}
      </Routes>
    </Suspense>
  );
}

export default App;

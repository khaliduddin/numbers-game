import { Suspense, useState, useEffect, useContext } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AuthContainer from "./components/auth/AuthContainer";
import routes from "tempo-routes";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  // Check if user exists in localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    // Skip welcome screen if user exists
    if (user) {
      setShowWelcome(false);
    } else {
      // Clean up any leftover flags if no user exists
      localStorage.removeItem("hasVisitedWelcome");
      localStorage.removeItem("showAuth");
    }
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
          setShowWelcome(true);
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

  const handleGuestLogin = () => {
    // Create a basic guest user in localStorage
    const guestUser = {
      username: "Guest",
      isGuest: true,
      lastLogin: new Date().toISOString(),
      guestId: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    localStorage.setItem("user", JSON.stringify(guestUser));
    setShowWelcome(false);
  };

  const handleSignInClick = () => {
    // No need to set hasVisitedWelcome anymore
    setShowWelcome(false);
    // The Home component will show the auth screen
    localStorage.setItem("showAuth", "false");
  };

  // Call useRoutes hook unconditionally to maintain hook order
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <Suspense fallback={<p>Loading...</p>}>
      {showWelcome ? (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
          <AuthContainer
            onGuestLogin={handleGuestLogin}
            onLogin={() => handleSignInClick()}
            onSignup={() => handleSignInClick()}
            showWelcomeTitle={true}
            defaultTab="login"
          />
        </div>
      ) : (
        <>
          <Routes>
            <Route path="/*" element={<Home />} />
          </Routes>
          {tempoRoutes}
        </>
      )}
    </Suspense>
  );
}

export default App;

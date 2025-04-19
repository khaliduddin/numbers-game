import { Suspense, useState, useEffect, useContext } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import WelcomeScreen from "./components/WelcomeScreen";
import routes from "tempo-routes";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  // Check if user has already been through welcome screen
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedWelcome");
    if (hasVisited === "true") {
      setShowWelcome(false);
    }
  }, []);

  // Listen for sign out event
  useEffect(() => {
    const handleSignOut = (event: CustomEvent) => {
      if (event.detail?.view === "signout") {
        // Clear user data from localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("userProfile");
        localStorage.removeItem("showAuth");
        // Keep hasVisitedWelcome so they don't have to go through welcome again
        // unless they want to switch accounts
        setShowWelcome(true);
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
    localStorage.setItem("hasVisitedWelcome", "true");
    // Create a basic guest user in localStorage
    const guestUser = {
      username: "Guest",
      isGuest: true,
      lastLogin: new Date().toISOString(),
    };
    localStorage.setItem("user", JSON.stringify(guestUser));
    setShowWelcome(false);
  };

  const handleSignInClick = () => {
    localStorage.setItem("hasVisitedWelcome", "true");
    setShowWelcome(false);
    // The Home component will show the auth screen
    localStorage.setItem("showAuth", "true");
  };

  // Call useRoutes hook unconditionally to maintain hook order
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <Suspense fallback={<p>Loading...</p>}>
      {showWelcome ? (
        <WelcomeScreen
          onGuestLogin={handleGuestLogin}
          onSignInClick={handleSignInClick}
        />
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

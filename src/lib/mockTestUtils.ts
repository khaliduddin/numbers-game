import { mockAuth } from "./mockAuth";
import { mockWallet } from "./mockWallet";
import { mockGame } from "./mockGameService";
import { mockTournament } from "./mockTournament";

// Test utilities for end-to-end testing
export const testUtils = {
  // Reset all mock data to initial state
  resetAllMockData: () => {
    // Clear local storage
    localStorage.clear();

    // Reset auth state
    mockAuth.logout();

    // Reset wallet state
    mockWallet.disconnectWallet();

    // Force page reload to reset all component states
    window.location.reload();
  },

  // Quick login as specific test user
  loginAsTestUser: async (userId: string) => {
    try {
      await mockAuth.loginAsUser(userId);
      return true;
    } catch (error) {
      console.error("Error logging in as test user:", error);
      return false;
    }
  },

  // Quick wallet connection for test user
  connectTestWallet: async (userId: string) => {
    try {
      await mockWallet.connectWallet(userId);
      return true;
    } catch (error) {
      console.error("Error connecting test wallet:", error);
      return false;
    }
  },

  // Simulate a complete game session for testing
  simulateGameSession: async (options: {
    userId: string;
    mode: "Solo" | "1v1" | "Tournament";
    rounds: number;
    difficulty?: "easy" | "medium" | "hard" | "expert";
  }) => {
    try {
      const result = await mockGame.simulateGameSession(options);
      return result;
    } catch (error) {
      console.error("Error simulating game session:", error);
      return null;
    }
  },

  // Simulate tournament actions
  tournaments: {
    // Start a tournament for testing
    startTournament: async (tournamentId: string) => {
      try {
        const result =
          await mockTournament.simulateStartTournament(tournamentId);
        return result;
      } catch (error) {
        console.error("Error starting tournament:", error);
        return null;
      }
    },

    // Complete a tournament for testing
    completeTournament: async (tournamentId: string) => {
      try {
        const result =
          await mockTournament.simulateCompleteTournament(tournamentId);
        return result;
      } catch (error) {
        console.error("Error completing tournament:", error);
        return null;
      }
    },

    // Register and pay for a tournament in one step
    quickJoinTournament: async (tournamentId: string, userId: string) => {
      try {
        // First register
        await mockTournament.registerForTournament(tournamentId, userId);

        // Then connect wallet if not already connected
        if (!mockWallet.isWalletConnected()) {
          await mockWallet.connectWallet(userId);
        }

        // Then pay
        const result = await mockTournament.payTournamentEntry(
          tournamentId,
          userId,
        );
        return result;
      } catch (error) {
        console.error("Error joining tournament:", error);
        return null;
      }
    },
  },

  // Simulate network conditions
  network: {
    // Simulate slow network
    simulateSlowNetwork: () => {
      // Override setTimeout and fetch to add delays
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = function (callback, time, ...args) {
        return originalSetTimeout(callback, (time || 0) * 3, ...args);
      };

      console.log("Slow network simulation enabled (3x delays)");
      return () => {
        // Return function to restore normal speed
        window.setTimeout = originalSetTimeout;
        console.log("Network simulation disabled");
      };
    },

    // Simulate network disconnection
    simulateOffline: () => {
      // Set browser to offline mode
      // @ts-ignore - Property exists on window but TypeScript doesn't know about it
      window.dispatchEvent(new Event("offline"));

      console.log("Offline mode simulated");
      return () => {
        // Return function to restore online status
        // @ts-ignore - Property exists on window but TypeScript doesn't know about it
        window.dispatchEvent(new Event("online"));
        console.log("Online mode restored");
      };
    },
  },
};

// Add to window for easy console access during testing
declare global {
  interface Window {
    testUtils: typeof testUtils;
  }
}

window.testUtils = testUtils;

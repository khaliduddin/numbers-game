import { getTournamentsByStatus, mockTournaments } from "./mockData";
import { mockWallet } from "./mockWallet";

// Mock tournament service
class MockTournamentService {
  // Get all tournaments
  getAllTournaments(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTournaments);
      }, 500);
    });
  }

  // Get tournaments by status
  getTournamentsByStatus(
    status: "upcoming" | "active" | "completed",
  ): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tournaments = getTournamentsByStatus(status);
        resolve(tournaments);
      }, 500);
    });
  }

  // Get tournament by ID
  getTournamentById(tournamentId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tournament = mockTournaments.find((t) => t.id === tournamentId);
        if (tournament) {
          resolve(tournament);
        } else {
          reject(new Error(`Tournament with ID ${tournamentId} not found`));
        }
      }, 500);
    });
  }

  // Register for a tournament
  registerForTournament(tournamentId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tournamentIndex = mockTournaments.findIndex(
          (t) => t.id === tournamentId,
        );

        if (tournamentIndex === -1) {
          reject(new Error(`Tournament with ID ${tournamentId} not found`));
          return;
        }

        const tournament = mockTournaments[tournamentIndex];

        // Check if tournament is full
        if (tournament.participantCount >= tournament.maxParticipants) {
          reject(new Error("Tournament is full"));
          return;
        }

        // Check if user is already registered
        const isAlreadyRegistered = tournament.participants.some(
          (p) => p.userId === userId,
        );
        if (isAlreadyRegistered) {
          reject(new Error("User is already registered for this tournament"));
          return;
        }

        // Add user to participants
        tournament.participants.push({
          userId,
          registered: true,
          paid: false,
        });

        // Update participant count
        tournament.participantCount += 1;

        resolve(tournament);
      }, 800);
    });
  }

  // Pay for tournament entry
  payTournamentEntry(tournamentId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const tournamentIndex = mockTournaments.findIndex(
          (t) => t.id === tournamentId,
        );

        if (tournamentIndex === -1) {
          reject(new Error(`Tournament with ID ${tournamentId} not found`));
          return;
        }

        const tournament = mockTournaments[tournamentIndex];

        // Find participant
        const participantIndex = tournament.participants.findIndex(
          (p) => p.userId === userId,
        );
        if (participantIndex === -1) {
          reject(new Error("User is not registered for this tournament"));
          return;
        }

        // Check if already paid
        if (tournament.participants[participantIndex].paid) {
          reject(new Error("Entry fee already paid"));
          return;
        }

        try {
          // Process payment through wallet
          await mockWallet.payTournamentEntry(
            tournamentId,
            tournament.entryFee,
          );

          // Update participant status
          tournament.participants[participantIndex].paid = true;

          resolve(tournament);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  }

  // Get tournament results
  getTournamentResults(tournamentId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tournament = mockTournaments.find((t) => t.id === tournamentId);

        if (!tournament) {
          reject(new Error(`Tournament with ID ${tournamentId} not found`));
          return;
        }

        if (tournament.status !== "completed") {
          reject(new Error("Tournament is not completed yet"));
          return;
        }

        resolve({
          tournamentId,
          name: tournament.name,
          winners: tournament.winners,
          totalParticipants: tournament.participantCount,
          prizePool: tournament.prizePool,
        });
      }, 800);
    });
  }

  // For testing: simulate starting a tournament
  simulateStartTournament(tournamentId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tournamentIndex = mockTournaments.findIndex(
          (t) => t.id === tournamentId,
        );

        if (tournamentIndex === -1) {
          reject(new Error(`Tournament with ID ${tournamentId} not found`));
          return;
        }

        const tournament = mockTournaments[tournamentIndex];

        if (tournament.status !== "upcoming") {
          reject(new Error("Only upcoming tournaments can be started"));
          return;
        }

        // Update tournament status
        tournament.status = "active";
        tournament.startTime = new Date();
        tournament.endTime = new Date(Date.now() + 3600000); // 1 hour duration

        // Initialize scores for participants
        tournament.participants.forEach((participant) => {
          if (participant.paid) {
            participant.currentScore = 0;
          }
        });

        resolve(tournament);
      }, 1000);
    });
  }

  // For testing: simulate completing a tournament
  simulateCompleteTournament(tournamentId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tournamentIndex = mockTournaments.findIndex(
          (t) => t.id === tournamentId,
        );

        if (tournamentIndex === -1) {
          reject(new Error(`Tournament with ID ${tournamentId} not found`));
          return;
        }

        const tournament = mockTournaments[tournamentIndex];

        if (tournament.status !== "active") {
          reject(new Error("Only active tournaments can be completed"));
          return;
        }

        // Update tournament status
        tournament.status = "completed";
        tournament.endTime = new Date();

        // Generate random scores for participants if not already set
        const paidParticipants = tournament.participants.filter((p) => p.paid);

        // Sort participants by score (or generate random scores)
        paidParticipants.sort((a, b) => {
          if (!a.currentScore) a.currentScore = Math.floor(Math.random() * 100);
          if (!b.currentScore) b.currentScore = Math.floor(Math.random() * 100);
          return b.currentScore - a.currentScore;
        });

        // Assign ranks and prizes
        const winners = [];
        let totalPrize = tournament.prizePool;
        const prizeDistribution = [0.5, 0.3, 0.2]; // 50% for 1st, 30% for 2nd, 20% for 3rd

        for (let i = 0; i < Math.min(3, paidParticipants.length); i++) {
          const prize = Math.floor(totalPrize * prizeDistribution[i]);
          const winner = {
            userId: paidParticipants[i].userId,
            rank: i + 1,
            prize,
          };
          winners.push(winner);

          // Update participant record
          const participantIndex = tournament.participants.findIndex(
            (p) => p.userId === paidParticipants[i].userId,
          );
          if (participantIndex !== -1) {
            tournament.participants[participantIndex].finalRank = i + 1;
            tournament.participants[participantIndex].prize = prize;
          }
        }

        tournament.winners = winners;

        resolve({
          tournament,
          winners,
        });
      }, 1500);
    });
  }
}

export const mockTournament = new MockTournamentService();

import { mockGameHistory, getUserById } from "./mockData";

// Mock game service
class MockGameService {
  // Generate a random multi-digit number
  generateRandomNumber(minDigits = 3, maxDigits = 5): string {
    const length =
      Math.floor(Math.random() * (maxDigits - minDigits + 1)) + minDigits;
    let number = "";
    for (let i = 0; i < length; i++) {
      number += Math.floor(Math.random() * 10);
    }
    return number;
  }

  // Calculate the digital root (sum of digits until single digit)
  calculateDigitalRoot(num: string): number {
    if (num.length === 1) return parseInt(num);
    const sum = num.split("").reduce((acc, digit) => acc + parseInt(digit), 0);
    return this.calculateDigitalRoot(sum.toString());
  }

  // Simulate opponent behavior in 1v1 mode
  simulateOpponentAnswer(
    correctAnswer: string,
    difficulty = "medium",
  ): {
    answer: string;
    timeUsed: number;
    isCorrect: boolean;
  } {
    let isCorrect = false;
    let timeUsed = 0;
    let answer = "";

    // Adjust difficulty
    let correctProbability = 0.7; // Default medium difficulty
    let minTime = 1.5;
    let maxTime = 4.5;

    switch (difficulty) {
      case "easy":
        correctProbability = 0.5;
        minTime = 2.5;
        maxTime = 6.0;
        break;
      case "hard":
        correctProbability = 0.85;
        minTime = 1.0;
        maxTime = 3.0;
        break;
      case "expert":
        correctProbability = 0.95;
        minTime = 0.8;
        maxTime = 2.0;
        break;
    }

    // Determine if opponent answers correctly
    isCorrect = Math.random() < correctProbability;

    if (isCorrect) {
      answer = correctAnswer;
    } else {
      // Generate a wrong answer (off by 1 or 2)
      const correctNum = parseInt(correctAnswer);
      const offset = Math.random() < 0.5 ? 1 : 2;
      const wrongNum = (correctNum + offset) % 10; // Ensure it's a single digit
      answer = wrongNum.toString();
    }

    // Generate a random time taken to answer
    timeUsed = minTime + Math.random() * (maxTime - minTime);

    return {
      answer,
      timeUsed,
      isCorrect,
    };
  }

  // Save game results
  saveGameResults(gameData: {
    userId: string;
    mode: "Solo" | "1v1" | "Tournament";
    score: number;
    outcome: "Win" | "Loss" | "Draw" | "Completed";
    opponent?: string;
    accuracy: number;
    timePerRound: number;
  }): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newGame = {
          id: `game-${mockGameHistory.length + 1}`,
          date: new Date().toISOString().split("T")[0],
          ...gameData,
        };

        // In a real app, this would be saved to a database
        // For this mock, we'll just add it to our mock data
        mockGameHistory.push(newGame);

        // Update user stats
        const user = getUserById(gameData.userId);
        if (user && user.stats) {
          user.stats.totalGames += 1;

          if (gameData.outcome === "Win") {
            user.stats.wins += 1;
          } else if (gameData.outcome === "Loss") {
            user.stats.losses += 1;
          }

          // Update average score
          const totalScore =
            user.stats.averageScore * (user.stats.totalGames - 1) +
            gameData.score;
          user.stats.averageScore = Math.round(
            totalScore / user.stats.totalGames,
          );

          // Update best score if applicable
          if (gameData.score > user.stats.bestScore) {
            user.stats.bestScore = gameData.score;
          }

          // Update fastest time if applicable
          const currentFastestTime = parseFloat(
            user.stats.fastestTime.replace("s", ""),
          );
          if (
            gameData.timePerRound < currentFastestTime ||
            currentFastestTime === 0
          ) {
            user.stats.fastestTime = `${gameData.timePerRound.toFixed(1)}s`;
          }

          // Update accuracy
          const totalAccuracy =
            user.stats.accuracy * (user.stats.totalGames - 1) +
            gameData.accuracy;
          user.stats.accuracy = Math.round(
            totalAccuracy / user.stats.totalGames,
          );
        }

        resolve(newGame);
      }, 800);
    });
  }

  // Get user's game history
  getUserGameHistory(userId: string): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const games = mockGameHistory.filter((game) => game.userId === userId);
        resolve(games);
      }, 500);
    });
  }

  // For testing: simulate a complete game session
  simulateGameSession(options: {
    userId: string;
    mode: "Solo" | "1v1" | "Tournament";
    rounds: number;
    difficulty?: "easy" | "medium" | "hard" | "expert";
    opponentName?: string;
  }): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const {
          userId,
          mode,
          rounds,
          difficulty = "medium",
          opponentName = "AI Opponent",
        } = options;

        // Generate random game stats
        let correctAnswers = 0;
        let totalTime = 0;
        let playerScore = 0;
        let opponentScore = 0;

        // Simulate each round
        for (let i = 0; i < rounds; i++) {
          const number = this.generateRandomNumber();
          const correctAnswer = this.calculateDigitalRoot(number).toString();

          // Simulate player answer
          const playerCorrect = Math.random() < 0.7; // 70% chance of correct answer
          const playerTime = 1 + Math.random() * 4; // 1-5 seconds

          if (playerCorrect) {
            correctAnswers++;
            const roundScore = Math.max(100 - Math.floor(playerTime * 5), 10);
            playerScore += roundScore;
          }

          totalTime += playerTime;

          // Simulate opponent answer for 1v1 or tournament modes
          if (mode !== "Solo") {
            const opponentResult = this.simulateOpponentAnswer(
              correctAnswer,
              difficulty,
            );
            if (opponentResult.isCorrect) {
              const opponentRoundScore = Math.max(
                100 - Math.floor(opponentResult.timeUsed * 5),
                10,
              );
              opponentScore += opponentRoundScore;
            }
          }
        }

        // Calculate final stats
        const accuracy = (correctAnswers / rounds) * 100;
        const avgTime = correctAnswers > 0 ? totalTime / correctAnswers : 0;

        // Determine outcome
        let outcome: "Win" | "Loss" | "Draw" | "Completed" = "Completed";
        if (mode !== "Solo") {
          if (playerScore > opponentScore) {
            outcome = "Win";
          } else if (playerScore < opponentScore) {
            outcome = "Loss";
          } else {
            outcome = "Draw";
          }
        }

        // Save game results
        const gameData = {
          userId,
          mode,
          score: playerScore,
          outcome,
          opponent: mode !== "Solo" ? opponentName : undefined,
          accuracy,
          timePerRound: avgTime,
        };

        this.saveGameResults(gameData).then((savedGame) => {
          resolve({
            game: savedGame,
            stats: {
              playerScore,
              opponentScore,
              accuracy,
              avgTime,
              correctAnswers,
              totalRounds: rounds,
            },
          });
        });
      }, 1500);
    });
  }
}

export const mockGame = new MockGameService();

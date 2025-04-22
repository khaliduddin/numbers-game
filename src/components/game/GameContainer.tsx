import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NumberDisplay from "./NumberDisplay";
import GameControls from "./GameControls";
import GameStats from "./GameStats";
import ResultsScreen from "./ResultsScreen";
import { gameStatsService } from "@/lib/gameStatsService";
import { v4 as uuidv4 } from "uuid";

interface GameContainerProps {
  gameMode?: "solo" | "1v1" | "tournament";
  totalRounds?: number;
  timePerRound?: number;
  onGameComplete?: (
    score: number,
    accuracy: number,
    avgTime: number,
    roundDetails?: any[],
  ) => void;
  onExit?: () => void;
}

const GameContainer: React.FC<GameContainerProps> = ({
  gameMode = "solo",
  totalRounds = 10,
  timePerRound = 10,
  onGameComplete = () => {},
  onExit = () => {},
}) => {
  // Game state
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [timeRemaining, setTimeRemaining] = useState<number>(timePerRound);
  const [currentNumber, setCurrentNumber] = useState<string>("7429");
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(true);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [roundBreak, setRoundBreak] = useState<boolean>(false);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [roundDetails, setRoundDetails] = useState<
    Array<{
      round: number;
      number: string;
      answer: string;
      correctAnswer: string;
      isCorrect: boolean;
      timeTaken: number;
      score: number;
    }>
  >([]);

  // Generate a random multi-digit number (only digits 1-9, no zeros)
  const generateRandomNumber = () => {
    const length = Math.floor(Math.random() * 3) + 3; // 3-5 digits
    let number = "";
    for (let i = 0; i < length; i++) {
      // Generate digits 1-9 only (no zeros)
      number += (Math.floor(Math.random() * 9) + 1).toString();
    }
    return number;
  };

  // Calculate the correct answer (digital root)
  const calculateDigitalRoot = (num: string): number => {
    if (!num || num.length === 0) return 0;
    if (num.length === 1) return parseInt(num);
    const sum = num.split("").reduce((acc, digit) => acc + parseInt(digit), 0);
    return calculateDigitalRoot(sum.toString());
  };

  // Start a new round
  const startNewRound = () => {
    const newNumber = generateRandomNumber();
    setCurrentNumber(newNumber);
    setTimeRemaining(timePerRound);
    setRoundBreak(false);
    console.log(`Starting round ${currentRound} with number: ${newNumber}`);
  };

  // Save game stats to database
  const saveGameStats = async (
    score: number,
    accuracy: number,
    avgTime: number,
    details: any[],
  ) => {
    try {
      // Get user info from localStorage
      const savedProfile = localStorage.getItem("userProfile");
      let userId = undefined;
      let guestId = undefined;

      if (savedProfile) {
        const userData = JSON.parse(savedProfile);
        // Check if it's a guest user or authenticated user
        if (
          userData.id === "00000000-0000-0000-0000-000000000000" ||
          userData.id.startsWith("guest_")
        ) {
          guestId = userData.id;
        } else {
          userId = userData.id;
        }
      }

      // Determine outcome based on game mode
      let outcome: "Win" | "Loss" | "Draw" | "Completed" = "Completed";
      if (gameMode !== "solo") {
        outcome =
          playerScore > opponentScore
            ? "Win"
            : playerScore < opponentScore
              ? "Loss"
              : "Draw";
      }

      // Save game stats
      const { id, error } = await gameStatsService.saveGameStats({
        userId,
        guestId,
        mode: (gameMode.charAt(0).toUpperCase() + gameMode.slice(1)) as
          | "Solo"
          | "1v1"
          | "Tournament",
        score,
        accuracy,
        timePerRound: avgTime,
        outcome,
        opponent: gameMode !== "solo" ? "AI Opponent" : undefined,
        roundDetails: details,
      });

      if (error) {
        console.error("Failed to save game stats:", error);
      } else {
        console.log("Game stats saved with ID:", id);
      }
    } catch (err) {
      console.error("Error saving game stats:", err);
    }
  };

  // Handle player answer submission
  const handleAnswerSubmit = (answer: string) => {
    if (!currentNumber) return; // Guard against undefined number

    const correctAnswer = calculateDigitalRoot(currentNumber).toString();
    const isCorrect = answer === correctAnswer;
    const timeUsed = timePerRound - timeRemaining;

    // Calculate score based on new rules
    let roundScore = 0;
    if (isCorrect) {
      roundScore = 10; // 10 points for correct answer
      setCorrectAnswers((prev) => prev + 1);
      setTotalTime((prev) => prev + timeUsed);
    } else {
      // Check if answer is empty
      if (answer === "") {
        roundScore = -1; // -1 points for empty/no answer (same as skip)
      } else {
        roundScore = -5; // -5 points for wrong answer
      }
    }

    // Update player score
    setPlayerScore((prev) => prev + roundScore);

    // Log for debugging
    console.log(
      `Round ${currentRound}: Number ${currentNumber}, Answer: ${answer}, Correct: ${correctAnswer}, isCorrect: ${isCorrect}`,
    );

    // Save round details
    setRoundDetails((prev) => [
      ...prev,
      {
        round: currentRound,
        number: currentNumber,
        answer: answer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        timeTaken: timeUsed,
        score: roundScore,
      },
    ]);

    // In multiplayer modes, simulate opponent scoring
    if (gameMode !== "solo") {
      const opponentCorrect = Math.random() > 0.3; // 70% chance opponent is correct
      if (opponentCorrect) {
        const opponentTimeUsed = Math.random() * (timePerRound - 1) + 1; // Random time between 1-9 seconds
        const opponentRoundScore = 10; // Same scoring rules for opponent
        setOpponentScore((prev) => prev + opponentRoundScore);
      } else {
        setOpponentScore((prev) => prev - 1); // Opponent gets wrong answer (-1 point)
      }
    }

    // Move to next round or end game
    if (currentRound < totalRounds) {
      setRoundBreak(true);
      setTimeRemaining(5); // Set fixed 5 second break timer
      setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        startNewRound();
      }, 5000); // 5 second break between rounds
    } else {
      // End game and show results
      const finalAccuracy = (correctAnswers / currentRound) * 100;
      const avgTime = correctAnswers > 0 ? totalTime / correctAnswers : 0;
      setAccuracy(finalAccuracy);
      setGameActive(false);

      // Save the updated roundDetails with the last round included
      const updatedRoundDetails = [
        ...roundDetails,
        {
          round: currentRound,
          number: currentNumber,
          answer: answer,
          correctAnswer: correctAnswer,
          isCorrect: isCorrect,
          timeTaken: timeUsed,
          score: roundScore,
        },
      ];

      // Update state with the complete round details
      setRoundDetails(updatedRoundDetails);
      setShowResults(true);

      // Save game stats to database with complete round details
      saveGameStats(
        playerScore + roundScore,
        finalAccuracy,
        avgTime,
        updatedRoundDetails,
      );

      onGameComplete(
        playerScore + roundScore,
        finalAccuracy,
        avgTime,
        updatedRoundDetails,
      );
    }
  };

  // Handle skipping a question
  const handleSkip = () => {
    if (!currentNumber) return; // Guard against undefined number

    const correctAnswer = calculateDigitalRoot(currentNumber).toString();
    const timeUsed = timePerRound - timeRemaining;
    const skipPenalty = -1; // -1 point for skipping

    // Calculate the final player score including this skip penalty
    const updatedPlayerScore = playerScore + skipPenalty;
    // Update player score with skip penalty
    setPlayerScore(updatedPlayerScore);

    // Log for debugging
    console.log(
      `Round ${currentRound}: Number ${currentNumber} SKIPPED, Correct answer was: ${correctAnswer}`,
    );

    // Create the current round details object
    const currentRoundDetails = {
      round: currentRound,
      number: currentNumber,
      answer: "skipped",
      correctAnswer: correctAnswer,
      isCorrect: false,
      timeTaken: timeUsed,
      score: skipPenalty,
    };

    // Create updated round details including the current round
    const updatedRoundDetails = [...roundDetails, currentRoundDetails];

    // Save round details to state
    setRoundDetails(updatedRoundDetails);

    // In multiplayer modes, simulate opponent scoring independently
    // (Skip only affects the current player, not the opponent)
    let updatedOpponentScore = opponentScore;
    if (gameMode !== "solo") {
      // Opponent still gets a chance to answer
      const opponentCorrect = Math.random() > 0.3; // 70% chance opponent is correct
      if (opponentCorrect) {
        const opponentTimeUsed = Math.random() * (timePerRound - 1) + 1; // Random time between 1-9 seconds
        const opponentRoundScore = 10; // Same scoring rules for opponent
        updatedOpponentScore = opponentScore + opponentRoundScore;
        setOpponentScore(updatedOpponentScore);
      } else {
        // Opponent gets their own answer wrong
        updatedOpponentScore = opponentScore - 5;
        setOpponentScore(updatedOpponentScore); // Opponent gets wrong answer (-5 points)
      }
    }

    // Move to next round with no points
    if (currentRound < totalRounds) {
      setRoundBreak(true);
      setTimeRemaining(5); // Set fixed 5 second break timer
      setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        startNewRound();
      }, 5000);
    } else {
      // End game
      const finalAccuracy = (correctAnswers / totalRounds) * 100;
      const avgTime = correctAnswers > 0 ? totalTime / correctAnswers : 0;
      setAccuracy(finalAccuracy);
      setGameActive(false);
      setShowResults(true);

      // Save game stats to database with complete round details
      // Use the updatedRoundDetails directly instead of state which might not be updated yet
      saveGameStats(
        updatedPlayerScore,
        finalAccuracy,
        avgTime,
        updatedRoundDetails,
      );

      onGameComplete(
        updatedPlayerScore,
        finalAccuracy,
        avgTime,
        updatedRoundDetails,
      );
    }
  };

  // Timer effect
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (roundBreak) {
          // Count down the break timer
          if (prev <= 1) {
            // This shouldn't happen as we handle round transitions in timeouts,
            // but just in case
            return 0;
          }
          return prev - 1;
        } else {
          // Normal gameplay timer
          if (prev <= 1) {
            clearInterval(timer);
            handleSkip(); // Auto-skip when time runs out
            return 0;
          }
          return prev - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, roundBreak]);

  // Initialize first round
  useEffect(() => {
    startNewRound();
  }, []);

  // If showing results screen
  if (showResults) {
    return (
      <ResultsScreen
        score={playerScore}
        accuracy={accuracy}
        averageTime={correctAnswers > 0 ? totalTime / correctAnswers : 0}
        isWinner={
          gameMode === "solo" ? playerScore > 0 : playerScore > opponentScore
        }
        gameMode={gameMode}
        opponentScore={opponentScore}
        roundDetails={roundDetails}
        onPlayAgain={() => {
          setCurrentRound(1);
          setPlayerScore(0);
          setOpponentScore(0);
          setCorrectAnswers(0);
          setTotalTime(0);
          setRoundDetails([]);
          setGameActive(true);
          setShowResults(false);
          startNewRound();
        }}
        onReturnHome={onExit}
      />
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4 space-y-6 bg-gray-50 min-h-[600px] rounded-xl shadow-lg"
      data-testid="game-container"
      data-round-details={JSON.stringify(roundDetails)}
    >
      <GameStats
        roundNumber={currentRound}
        totalRounds={totalRounds}
        timeRemaining={timeRemaining}
        maxTime={timePerRound}
        currentScore={playerScore}
        opponentScore={opponentScore}
        isMultiplayer={gameMode !== "solo"}
      />

      <AnimatePresence mode="wait">
        {roundBreak ? (
          <motion.div
            key="break"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-xl shadow-md w-full max-w-xl"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Round {currentRound} Complete!
            </h2>
            <p className="text-lg text-slate-300 mb-6">
              Next round starting in...
            </p>
            <div className="text-5xl font-bold text-white">
              {Math.ceil(timeRemaining)}s
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <NumberDisplay
              number={currentNumber}
              isAnimated={!roundBreak}
              size="large"
              isRevealed={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <GameControls
        onSubmit={handleAnswerSubmit}
        onSkip={handleSkip}
        isDisabled={roundBreak}
        timeRemaining={timeRemaining}
        roundNumber={currentRound}
        totalRounds={totalRounds}
      />
    </div>
  );
};

export default GameContainer;

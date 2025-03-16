import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NumberDisplay from "./NumberDisplay";
import GameControls from "./GameControls";
import GameStats from "./GameStats";
import ResultsScreen from "./ResultsScreen";

interface GameContainerProps {
  gameMode?: "solo" | "1v1" | "tournament";
  totalRounds?: number;
  timePerRound?: number;
  onGameComplete?: (score: number, accuracy: number, avgTime: number) => void;
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
    if (num.length === 1) return parseInt(num);
    const sum = num.split("").reduce((acc, digit) => acc + parseInt(digit), 0);
    return calculateDigitalRoot(sum.toString());
  };

  // Start a new round
  const startNewRound = () => {
    setCurrentNumber(generateRandomNumber());
    setTimeRemaining(timePerRound);
    setRoundBreak(false);
  };

  // Handle player answer submission
  const handleAnswerSubmit = (answer: string) => {
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
      const finalAccuracy = (correctAnswers / totalRounds) * 100;
      const avgTime = correctAnswers > 0 ? totalTime / correctAnswers : 0;
      setAccuracy(finalAccuracy);
      setGameActive(false);
      setShowResults(true);
      onGameComplete(playerScore, finalAccuracy, avgTime);
    }
  };

  // Handle skipping a question
  const handleSkip = () => {
    const correctAnswer = calculateDigitalRoot(currentNumber).toString();
    const timeUsed = timePerRound - timeRemaining;
    const skipPenalty = -1; // -1 point for skipping

    // Update player score with skip penalty
    setPlayerScore((prev) => prev + skipPenalty);

    // Save round details for the skipped question
    setRoundDetails((prev) => [
      ...prev,
      {
        round: currentRound,
        number: currentNumber,
        answer: "skipped",
        correctAnswer: correctAnswer,
        isCorrect: false,
        timeTaken: timeUsed,
        score: skipPenalty,
      },
    ]);

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
      onGameComplete(playerScore, finalAccuracy, avgTime);
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
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4 space-y-6 bg-gray-50 min-h-[600px] rounded-xl shadow-lg">
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
              isAnimated={true}
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

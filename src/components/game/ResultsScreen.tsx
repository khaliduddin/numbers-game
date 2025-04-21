import React from "react";
import { Share2, Home, Trophy, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface ResultsScreenProps {
  score?: number;
  accuracy?: number;
  averageTime?: number;
  isWinner?: boolean;
  gameMode?: "solo" | "1v1" | "tournament";
  opponentScore?: number;
  onShareResults?: () => void;
  onPlayAgain?: () => void;
  onReturnHome?: () => void;
  onViewLeaderboard?: () => void;
  roundDetails?: Array<{
    round: number;
    number: string;
    answer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeTaken: number;
    score: number;
  }>;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  score = 850,
  accuracy = 92,
  averageTime = 1.8,
  isWinner = true,
  gameMode = "solo",
  opponentScore = 720,
  onShareResults = () => {},
  onPlayAgain = () => {},
  onReturnHome = () => {},
  onViewLeaderboard = () => {},
  roundDetails = [],
}) => {
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <motion.div
        className="w-full max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="w-full overflow-hidden bg-white shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl font-bold mb-2">
                {isWinner ? "You did it!" : "Game Over"}
              </CardTitle>
              <CardDescription className="text-white/90 text-lg">
                {gameMode === "solo"
                  ? "Solo Practice Results"
                  : gameMode === "1v1"
                    ? "1v1 Match Results"
                    : "Tournament Results"}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="p-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={itemVariants}
            >
              <div className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <h3 className="text-lg font-medium text-gray-700">
                    Your Score
                  </h3>
                  <p className="text-4xl font-bold text-blue-600">{score}</p>
                </div>

                {gameMode !== "solo" && (
                  <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-700">
                      Opponent Score
                    </h3>
                    <p className="text-4xl font-bold text-gray-600">
                      {opponentScore}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between p-3 rounded-lg bg-green-50 border border-green-100">
                  <span className="text-gray-700">Accuracy</span>
                  <span className="font-semibold text-green-600">
                    {accuracy.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between p-3 rounded-lg bg-purple-50 border border-purple-100">
                  <span className="text-gray-700">Avg. Response Time</span>
                  <span className="font-semibold text-purple-600">
                    {averageTime.toFixed(1)}s
                  </span>
                </div>

                <div className="flex justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="text-gray-700">Total Time</span>
                  <span className="font-semibold text-blue-600">
                    {roundDetails
                      .reduce((total, round) => total + round.timeTaken, 0)
                      .toFixed(1)}
                    s
                  </span>
                </div>

                {gameMode === "tournament" && (
                  <div className="flex justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                    <span className="text-gray-700">Tournament Rank</span>
                    <span className="font-semibold text-yellow-600">
                      {isWinner ? "1st Place" : "Top 10"}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Round Details Section */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Round Details</h3>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left">Round</th>
                      <th className="px-2 py-1 text-left">Number</th>
                      <th className="px-2 py-1 text-left">Answer</th>
                      <th className="px-2 py-1 text-left">Correct</th>
                      <th className="px-2 py-1 text-left">Time</th>
                      <th className="px-2 py-1 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {roundDetails?.map((detail, index) => (
                      <tr
                        key={index}
                        className={
                          detail.isCorrect ? "bg-green-50" : "bg-red-50"
                        }
                      >
                        <td className="px-2 py-1">{detail.round}</td>
                        <td className="px-2 py-1">{detail.number}</td>
                        <td className="px-2 py-1">
                          {detail.answer === "skipped" ? (
                            <span className="text-gray-500">Skipped</span>
                          ) : (
                            <span
                              className={
                                detail.isCorrect
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {detail.answer}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1">
                          <span className="font-medium">
                            {detail.correctAnswer}
                          </span>
                        </td>
                        <td className="px-2 py-1">
                          {detail.timeTaken.toFixed(1)}s
                        </td>
                        <td className="px-2 py-1 text-right font-medium">
                          <span
                            className={
                              detail.score > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {detail.score > 0 ? "+" : ""}
                            {detail.score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {isWinner && (
              <motion.div
                className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold text-yellow-700 mb-1">
                  Achievement Unlocked!
                </h3>
                <p className="text-yellow-600">
                  {gameMode === "solo"
                    ? "Speed Demon: Complete a game with average response time under 2 seconds"
                    : gameMode === "1v1"
                      ? "Rival Crusher: Win 3 consecutive 1v1 matches"
                      : "Tournament Champion: Win your first tournament"}
                </p>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex flex-wrap justify-center gap-3 p-6 bg-gray-50">
            <motion.div variants={itemVariants}>
              <Button
                onClick={() => setShareDialogOpen(true)}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Share2 className="h-4 w-4" />
                Share Results
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                onClick={onPlayAgain}
                className="flex items-center gap-2"
                variant="secondary"
              >
                <RotateCcw className="h-4 w-4" />
                Play Again
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                onClick={onReturnHome}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </motion.div>

            {gameMode === "tournament" && (
              <motion.div variants={itemVariants}>
                <Button
                  onClick={onViewLeaderboard}
                  className="flex items-center gap-2"
                  variant="secondary"
                >
                  <Trophy className="h-4 w-4" />
                  View Leaderboard
                </Button>
              </motion.div>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Results</DialogTitle>
            <DialogDescription>
              Share your game results with friends on social media or via
              Telegram.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 p-4"
              onClick={() => {
                // Placeholder for social media sharing
                setShareDialogOpen(false);
                onShareResults();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-2 text-blue-500"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              <span>Facebook</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 p-4"
              onClick={() => {
                // Placeholder for Telegram sharing
                setShareDialogOpen(false);
                onShareResults();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-2 text-blue-400"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
              <span>Telegram</span>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResultsScreen;

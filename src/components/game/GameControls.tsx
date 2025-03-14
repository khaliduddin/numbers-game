import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";

interface GameControlsProps {
  onSubmit?: (answer: string) => void;
  onSkip?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  timeRemaining?: number;
  roundNumber?: number;
  totalRounds?: number;
}

const GameControls = ({
  onSubmit = () => {},
  onSkip = () => {},
  isDisabled = false,
  isLoading = false,
  timeRemaining = 10,
  roundNumber = 1,
  totalRounds = 10,
}: GameControlsProps) => {
  const [answer, setAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset answer when round changes
  useEffect(() => {
    setAnswer("");
    setIsSubmitting(false);
  }, [roundNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isDisabled || isSubmitting) return;

    setIsSubmitting(true);
    onSubmit(answer);
    // Form will be reset by the roundNumber useEffect when it changes
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-4 bg-gray-100 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="text-xs sm:text-sm font-medium">
          Round: <span className="text-primary">{roundNumber}</span> /{" "}
          {totalRounds}
        </div>
        <div className="text-xs sm:text-sm font-medium">
          Time:{" "}
          <span
            className={`${timeRemaining <= 3 ? "text-red-500" : "text-primary"}`}
          >
            {timeRemaining}s
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="flex gap-1 sm:gap-2">
          <Input
            type="number"
            placeholder="Enter your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isDisabled || isSubmitting}
            className="flex-1 text-base sm:text-lg font-medium h-9 sm:h-10"
            autoFocus
          />
          <Button
            type="submit"
            disabled={isDisabled || isSubmitting || !answer.trim()}
            className="w-20 sm:w-24 h-9 sm:h-10 text-xs sm:text-sm"
          >
            {isSubmitting ? (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <>
                Submit{" "}
                <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            disabled={isDisabled || isSubmitting}
            className="w-24 sm:w-32 h-8 sm:h-10 text-xs sm:text-sm"
          >
            Skip
          </Button>
        </div>
      </form>

      <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-center text-gray-500">
        Add all digits together repeatedly until you reach a single digit
      </div>
    </div>
  );
};

export default GameControls;

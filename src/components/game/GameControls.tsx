import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Toggle } from "../ui/toggle";

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
  const [selectedNumber, setSelectedNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset answer when round changes
  useEffect(() => {
    setSelectedNumber("");
    setIsSubmitting(false);
  }, [roundNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNumber || isDisabled || isSubmitting) return;

    setIsSubmitting(true);
    onSubmit(selectedNumber);
    // Form will be reset by the roundNumber useEffect when it changes
  };

  const handleNumberToggle = (number: string) => {
    setSelectedNumber((prev) => (prev === number ? "" : number));
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
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <Toggle
              key={number}
              pressed={selectedNumber === number.toString()}
              onPressedChange={() => handleNumberToggle(number.toString())}
              disabled={isDisabled || isSubmitting}
              className={`h-12 w-12 sm:h-14 sm:w-14 text-lg sm:text-xl font-bold ${selectedNumber === number.toString() ? "bg-primary text-primary-foreground hover:bg-primary/80" : "hover:bg-gray-300"} data-[state=on]:bg-primary data-[state=on]:text-primary-foreground`}
              aria-label={`Select number ${number}`}
            >
              {number}
            </Toggle>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            type="submit"
            disabled={isDisabled || isSubmitting || !selectedNumber}
            className="w-28 sm:w-32 h-9 sm:h-10 text-xs sm:text-sm"
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

          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            disabled={isDisabled || isSubmitting}
            className="w-24 sm:w-32 h-9 sm:h-10 text-xs sm:text-sm"
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

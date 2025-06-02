import React, { useState, useEffect, useRef } from "react";

interface NumberDisplayProps {
  number?: string;
  isAnimated?: boolean;
  size?: "small" | "medium" | "large";
  isRevealed?: boolean;
  instructionText?: string;
  helpText?: string;
}

const NumberDisplay = ({
  number = "7429",
  isAnimated = true,
  size = "large",
  isRevealed = true,
  instructionText = "Reduce this number:",
  helpText = "Add all digits together repeatedly until you get a single digit",
}: NumberDisplayProps) => {
  const [displayNumber, setDisplayNumber] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef<boolean>(true);

  // Size classes mapping
  const sizeClasses = {
    small: "text-2xl sm:text-3xl md:text-4xl",
    medium: "text-3xl sm:text-4xl md:text-5xl",
    large: "text-4xl sm:text-5xl md:text-7xl",
  };

  // Safely clear any existing animation
  const clearAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };

  // Safely get a valid number string
  const getValidNumber = (input: string | undefined | null): string => {
    // If input is undefined, null, or not a string, return default
    if (input === undefined || input === null) {
      return "7429";
    }

    // Convert to string if it's not already a string
    const inputStr = typeof input === "string" ? input : String(input);

    // Remove any non-digit characters
    const sanitized = inputStr.replace(/[^0-9]/g, "");

    // If sanitized is empty, return default
    return sanitized.length > 0 ? sanitized : "7429";
  };

  // Set up cleanup on component unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      clearAnimation();
    };
  }, []);

  useEffect(() => {
    // Clear any existing animation timeout
    clearAnimation();

    // Get a valid number string - ensure we have a valid string
    const validNumber = getValidNumber(number);

    // Handle hidden numbers
    if (!isRevealed) {
      setDisplayNumber("?".repeat(validNumber.length));
      return;
    }

    // Handle animation
    if (isAnimated) {
      setDisplayNumber(""); // Reset display before starting animation
      setIsAnimating(true);
      let currentIndex = 0;
      const digits = validNumber.split("");

      // Set up new animation interval
      animationRef.current = setInterval(() => {
        if (!isMounted.current) {
          clearAnimation();
          return;
        }

        if (currentIndex < digits.length) {
          setDisplayNumber((prev) => prev + digits[currentIndex]);
          currentIndex++;
        } else {
          clearAnimation();
        }
      }, 200); // Reveal each digit with a 200ms delay
    } else {
      // Show the full number immediately without animation
      setDisplayNumber(validNumber);
    }

    // Cleanup function to clear interval when component unmounts or number changes
    return () => {
      clearAnimation();
    };
  }, [number, isAnimated, isRevealed]);

  // Always ensure we have a valid display value
  const displayValue = displayNumber || getValidNumber(number);
  // Get a valid number for data attribute
  const validNumberForData = getValidNumber(number);

  return (
    <div className="w-full bg-slate-900 p-4 sm:p-6 md:p-8 rounded-xl shadow-lg flex flex-col items-center justify-center">
      {instructionText && (
        <h2 className="text-slate-400 mb-2 sm:mb-4 font-medium text-sm sm:text-base">
          {instructionText}
        </h2>
      )}
      <div
        className={`font-mono ${sizeClasses[size]} text-white tracking-wider font-bold flex justify-center items-center min-h-16 sm:min-h-20 md:min-h-24 ${isAnimating ? "animate-pulse" : ""}`}
        aria-live="polite"
        data-testid="number-display"
        data-number={validNumberForData}
        data-is-animating={isAnimating}
      >
        {displayValue}
      </div>
      {helpText && (
        <p className="mt-2 sm:mt-4 text-slate-400 text-xs sm:text-sm text-center">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default NumberDisplay;

import React, { useState, useEffect } from "react";

interface NumberDisplayProps {
  number?: string;
  isAnimated?: boolean;
  size?: "small" | "medium" | "large";
  isRevealed?: boolean;
}

const NumberDisplay = ({
  number = "7429",
  isAnimated = true,
  size = "large",
  isRevealed = true,
}: NumberDisplayProps) => {
  const [displayNumber, setDisplayNumber] = useState<string>("");

  // Size classes mapping
  const sizeClasses = {
    small: "text-2xl sm:text-3xl md:text-4xl",
    medium: "text-3xl sm:text-4xl md:text-5xl",
    large: "text-4xl sm:text-5xl md:text-7xl",
  };

  // Animation effect to reveal the number digit by digit
  useEffect(() => {
    if (!isRevealed) {
      setDisplayNumber("?".repeat(number.length));
      return;
    }

    if (isAnimated) {
      setDisplayNumber("");
      const timer = setTimeout(() => {
        let currentIndex = 0;
        const intervalId = setInterval(() => {
          if (currentIndex < number.length) {
            setDisplayNumber((prev) => prev + number[currentIndex]);
            currentIndex++;
          } else {
            clearInterval(intervalId);
          }
        }, 200); // Reveal each digit with a 200ms delay

        return () => clearInterval(intervalId);
      }, 500); // Start after a 500ms delay

      return () => clearTimeout(timer);
    } else {
      setDisplayNumber(number);
    }
  }, [number, isAnimated, isRevealed]);

  return (
    <div className="w-full bg-slate-900 p-4 sm:p-6 md:p-8 rounded-xl shadow-lg flex flex-col items-center justify-center">
      <h2 className="text-slate-400 mb-2 sm:mb-4 font-medium text-sm sm:text-base">
        Reduce this number:
      </h2>
      <div
        className={`font-mono ${sizeClasses[size]} text-white tracking-wider font-bold flex justify-center items-center min-h-16 sm:min-h-20 md:min-h-24`}
        aria-live="polite"
      >
        {displayNumber || (isRevealed ? number : "?".repeat(number.length))}
      </div>
      <p className="mt-2 sm:mt-4 text-slate-400 text-xs sm:text-sm text-center">
        Add all digits together repeatedly until you get a single digit
      </p>
    </div>
  );
};

export default NumberDisplay;

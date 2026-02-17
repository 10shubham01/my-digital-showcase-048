import { cn } from "@/lib/utils";
import { useInView } from "framer-motion";
import React, { useEffect, useRef, useState, useCallback } from "react";

interface AlienProps {
  text: string;
  className?: string;
}

interface HoverableLetterProps {
  letter: string;
  getRandomCharacter: () => string;
  index: number;
  className: string;
}

const katakana = [
  "ア","イ","ウ","エ","オ","カ","キ","ク","ケ","コ",
  "サ","シ","ス","セ","ソ","タ","チ","ツ","テ","ト",
  "ナ","ニ","ヌ","ネ","ノ","ハ","ヒ","フ","ヘ","ホ",
  "マ","ミ","ム","メ","モ","ヤ","ユ","ヨ","ー","ラ",
  "リ","ル","レ","ロ","ワ","ヰ","ヱ","ヲ","ン",
];

function HoverableLetter({ letter, getRandomCharacter, index, className }: HoverableLetterProps) {
  const [randomLetter, setRandomLetter] = useState(letter);
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && !initialAnimationDone) {
      const timeout = setTimeout(() => {
        const animationInterval = setInterval(() => {
          setRandomLetter(getRandomCharacter());
        }, 50);
        const clearTimeout2 = setTimeout(() => {
          clearInterval(animationInterval);
          setRandomLetter(letter);
          setInitialAnimationDone(true);
        }, 800);
        return () => clearTimeout(clearTimeout2);
      }, index * 80);
      return () => clearTimeout(timeout);
    }
  }, [isInView, initialAnimationDone, index, letter, getRandomCharacter]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    intervalRef.current = setInterval(() => {
      setRandomLetter(getRandomCharacter());
    }, 50);
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRandomLetter(letter);
  };

  return (
    <span
      ref={ref}
      className={cn("inline-block cursor-default transition-colors duration-150 font-mono", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {randomLetter === " " ? "\u00A0" : randomLetter}
    </span>
  );
}

function Alien({ text, className = "" }: AlienProps) {
  const getRandomCharacter = useCallback(
    () => katakana[Math.floor(Math.random() * katakana.length)],
    []
  );

  return (
    <span className={cn("inline-flex flex-wrap", className)}>
      {text.split("").map((letter, index) => (
        <HoverableLetter
          key={index}
          letter={letter}
          getRandomCharacter={getRandomCharacter}
          index={index}
          className={className}
        />
      ))}
    </span>
  );
}

export default Alien;

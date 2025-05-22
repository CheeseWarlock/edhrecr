import React from 'react';
import { Metamorphous } from "next/font/google";
import { OverlayFrame } from './OverlayFrame';
import { StreakStatus } from '../lib/streak';
import TinyChart from './TinyChart';
const metamorphous = Metamorphous({ 
  weight: '400',
  subsets: ["latin"],
});

interface StreakOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  streak: StreakStatus;
}

export function StreakOverlay({ isOpen, onClose, streak }: StreakOverlayProps) {
  const storedGuessCount = localStorage.getItem('edhr-guess-count');
  const guessCount = storedGuessCount ? JSON.parse(storedGuessCount) : [0, 0, 0, 0, 0, 0];
  
  const totalPlays = guessCount.reduce((a: number, b: number) => a + b, 0);
  const totalGuesses = guessCount.reduce((sum: number, count: number, index: number) => sum + (count * index), 0);
  const averageGuesses = totalPlays > 0 ? (totalGuesses / totalPlays).toFixed(2) : "0.00";

  const guessObject = [
    { label: '1', value: guessCount[1] },
    { label: '2', value: guessCount[2] },
    { label: '3', value: guessCount[3] },
    { label: '4', value: guessCount[4] },
    { label: '5', value: guessCount[5] },
    { label: 'X', value: guessCount[0] },
  ];

  return (
    <OverlayFrame isOpen={isOpen} onClose={onClose}>
      <div className="text-white space-y-8">
        <h2 className={`text-2xl md:text-4xl font-bold mb-6 ${metamorphous.className}`}>Your Stats</h2>
        
        <div className="flex flex-row justify-around mb-2">
          <div className="flex flex-col items-center">
            <span className="text-lg mb-2">Current Streak</span>
            <span className="text-4xl font-bold text-[#2694AF]">{streak.streakLength}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg mb-2">Total Plays</span>
            <span className="text-4xl font-bold text-[#2694AF]">{totalPlays}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg mb-2">Average Guesses</span>
            <span className="text-4xl font-bold text-[#2694AF]">{averageGuesses}</span>
          </div>
        </div>

        {streak.isTodayDone && streak.streakLength > 0 ? (
          <p className="text-center my-2">
            Keep coming back daily to maintain your streak!
          </p>
        ) : streak.isTodayDone ? (
          <p className="text-center my-2">
            Come back tomorrow to restart your streak!
          </p>
        ) : streak.isStreakActive ? (
          <p className="text-center my-2">
            Finish today&apos;s challenge to keep your streak alive!
          </p>
        ) : (
          <p className="text-center my-2">
            Finish today&apos;s challenge to start your streak!
          </p>
        )}

        <div className="space-y-4">
          <h3 className={`text-xl md:text-2xl font-bold text-center mt-8 ${metamorphous.className}`}>Guesses</h3>
          <div className="md:px-6 lg:px-12">
            <TinyChart data={guessObject} />
          </div>
        </div>
      </div>
    </OverlayFrame>
  );
} 
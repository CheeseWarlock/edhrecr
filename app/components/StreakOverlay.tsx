import React from 'react';
import { Metamorphous } from "next/font/google";
import { OverlayFrame } from './OverlayFrame';
import { StreakStatus } from '../lib/streak';
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
  return (
    <OverlayFrame isOpen={isOpen} onClose={onClose}>
      <div className="text-white space-y-4">
        <h2 className={`text-2xl md:text-4xl font-bold mb-2 ${metamorphous.className}`}>Your Streak</h2>
        <div className="text-center">
          <p className="text-6xl font-bold text-[#2694AF]">{streak.streakLength}</p>
          <p className="text-xl mt-2">day{streak.streakLength == 1 ? "" : "s"} in a row!</p>
        </div>
        {streak.isTodayDone ? (
          <p className="text-center mt-8">
            Keep coming back daily to maintain your streak!
          </p>
        ) : streak.isStreakActive ? (
          <p className="text-center mt-8">
            Finish today&apos;s challenge to keep your streak alive!
          </p>
        ) : (
          <p className="text-center mt-8">
            Finish today&apos;s challenge to start your streak!
          </p>
        )}
      </div>
    </OverlayFrame>
  );
} 
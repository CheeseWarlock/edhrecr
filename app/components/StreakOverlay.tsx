import React from 'react';
import { Metamorphous } from "next/font/google";
import { OverlayFrame } from './OverlayFrame';

const metamorphous = Metamorphous({ 
  weight: '400',
  subsets: ["latin"],
});

interface StreakOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
}

export function StreakOverlay({ isOpen, onClose, streak }: StreakOverlayProps) {
  return (
    <OverlayFrame isOpen={isOpen} onClose={onClose}>
      <div className="text-white space-y-4">
        <h2 className={`text-2xl font-bold mb-6 ${metamorphous.className}`}>Your Streak</h2>
        <div className="text-center">
          <p className="text-6xl font-bold text-[#2694AF]">{streak}</p>
          <p className="text-xl mt-2">days in a row!</p>
        </div>
        <p className="text-center mt-8">
          Keep coming back daily to maintain your streak!
        </p>
      </div>
    </OverlayFrame>
  );
} 
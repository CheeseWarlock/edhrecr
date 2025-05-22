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
  return (
    <OverlayFrame isOpen={isOpen} onClose={onClose}>
      <div className="text-white space-y-4">
        <h2 className={`text-2xl md:text-4xl font-bold mb-2 ${metamorphous.className}`}>Your Streak</h2>
        <div className="text-center">
          <p className="text-6xl font-bold text-[#2694AF]">{streak.streakLength}</p>
          <p className="text-xl mt-2">day{streak.streakLength == 1 ? "" : "s"} in a row!</p>
        </div>
        {streak.isTodayDone && streak.streakLength > 0 ? (
          <p className="text-center my-2 mb-10">
            Keep coming back daily to maintain your streak!
          </p>
        ) : streak.isTodayDone ? (
          <p className="text-center my-2 mb-10">
            Come back tomorrow to restart your streak!
          </p>
        ) : streak.isStreakActive ? (
          <p className="text-center my-2 mb-10">
            Finish today&apos;s challenge to keep your streak alive!
          </p>
        ) : (
          <p className="text-center my-2 mb-10">
            Finish today&apos;s challenge to start your streak!
          </p>
        )}
        <h2 className={`text-2xl md:text-4xl font-bold mb-2 ${metamorphous.className}`}>Your Stats</h2>
        <div className="md:px-6 lg:px-12">
          <TinyChart data={[ { label: '1', value: 2 }, { label: '2', value: 4 }, { label: '3', value: 10 }, { label: '4', value: 3 }, { label: '5', value: 2 }, { label: 'X', value: 1 }]} />
        </div>
        <div className="flex flex-row text-lg justify-around">
          <div>
          <span>Played:&nbsp;</span>
          <span>112</span>
          </div>
          <div>
            <span>Avg:&nbsp;</span>
            <span>2.38</span>
          </div>
        </div>
      </div>
    </OverlayFrame>
  );
} 
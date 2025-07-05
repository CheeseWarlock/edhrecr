'use client';

import React from 'react';
import { FaInfoCircle, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import { Metamorphous } from "next/font/google";
import { TinyIcon } from './TinyIcon';
import Link from 'next/link';

const metamorphous = Metamorphous({ 
  weight: '400',
  subsets: ["latin"],
});

interface TopBarProps {
  onCalendarClick: () => void;
  onInfoClick: () => void;
  onStreakClick: () => void;
}

export function TopBar({ onCalendarClick, onInfoClick, onStreakClick }: TopBarProps) {
  return (
    <div 
          className="fixed top-0 left-0 right-0 h-16 bg-[#444] grid grid-cols-3 items-center md:px-4 z-50 border-b-4 border-mana-blue"
    style={{
      background: 'linear-gradient(180deg, #484848, #404040)',
    }}
    >
      <div className="hidden md:flex justify-start">
        <div className="w-8" /> {/* Empty div to balance the right side */}
      </div>
      <div className="flex justify-center group col-span-2 md:col-span-1">
        <Link href="/">
          <div className={`text-white text-2xl md:text-4xl flex items-center gap-2 font-bold ${metamorphous.className}`}>
            <TinyIcon className="group-hover:rotate-180 transition-transform duration-300" />
                    <h1 className="group-hover:text-mana-blue transition-all duration-300 group-hover:-translate-x-0.5">EDHRanker</h1>
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-mana-blue text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Today&apos;s Game
          </span>
          </div>
        </Link>
      </div>
      <div className="flex justify-end md:gap-4">
        <button 
          onClick={onCalendarClick}
          className="w-8 flex items-center justify-center text-white hover:text-mana-blue transition-colors cursor-pointer group relative"
          title="View Calendar"
        >
          <FaCalendarAlt size={24} />
          <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-mana-blue text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Play Previous Days
          </span>
        </button>
        <button 
          onClick={onStreakClick}
          className="w-8 flex items-center justify-center text-white hover:text-mana-blue transition-colors cursor-pointer group relative"
          title="View Streak"
        >
          <FaChartBar size={24} />
          <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-mana-blue text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            View Your Stats
          </span>
        </button>
        <button 
          onClick={onInfoClick}
          className="w-8 flex items-center justify-center text-white hover:text-mana-blue transition-colors cursor-pointer group relative"
          title="How to Play"
        >
          <FaInfoCircle size={24} />
          <span className="absolute -bottom-12 left-1/2 -translate-x-full bg-mana-blue text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            How to Play
          </span>
        </button>
      </div>
    </div>
  );
} 
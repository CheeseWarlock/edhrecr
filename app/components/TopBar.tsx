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
    <div className="fixed top-0 left-0 right-0 h-16 bg-[#444] flex items-center justify-between px-4 z-50 border-b-4 border-[#2694af]">
      <div className="w-8" /> {/* Spacer for balance */}
      <Link href="/">
      <div className={`text-white text-2xl md:text-4xl flex items-center gap-2 font-bold ${metamorphous.className}`}>
        
          <TinyIcon />
          <h1>EDHRanker</h1>
        </div>
      </Link>
      <div className="flex gap-4">
      <button 
          onClick={onCalendarClick}
          className="w-8 flex items-center justify-center text-white hover:text-[#2694AF] transition-colors cursor-pointer"
        >
          <FaCalendarAlt size={24} />
        </button>
        <button 
          onClick={onStreakClick}
          className="w-8 flex items-center justify-center text-white hover:text-[#2694AF] transition-colors cursor-pointer"
        >
          <FaChartBar size={24} />
        </button>
        <button 
          onClick={onInfoClick}
          className="w-8 flex items-center justify-center text-white hover:text-[#2694AF] transition-colors cursor-pointer"
        >
          <FaInfoCircle size={24} />
        </button>
      </div>
    </div>
  );
} 
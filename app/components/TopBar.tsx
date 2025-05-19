'use client';

import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { Metamorphous } from "next/font/google";

const metamorphous = Metamorphous({ 
  weight: '400',
  subsets: ["latin"],
});

export function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-[#444] flex items-center justify-between px-4 z-50">
      <div className="w-8" /> {/* Spacer for balance */}
      <h1 className={`text-white text-2xl font-bold ${metamorphous.className}`}>EDHRanker</h1>
      <button className="w-8 h-8 flex items-center justify-center text-white hover:text-[#2694AF] transition-colors">
        <FaInfoCircle size={24} />
      </button>
    </div>
  );
} 
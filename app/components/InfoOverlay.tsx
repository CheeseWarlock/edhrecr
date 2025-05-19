'use client';

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { Metamorphous } from "next/font/google";

const metamorphous = Metamorphous({ 
  weight: '400',
  subsets: ["latin"],
});

interface InfoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoOverlay({ isOpen, onClose }: InfoOverlayProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#444] rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-[#2694AF] transition-colors cursor-pointer"
        >
          <FaTimes size={24} />
        </button>
        <div className="text-white space-y-4">
          <h2 className={`text-2xl font-bold mb-6 ${metamorphous.className}`}>How to Play EDHRanker</h2>
          <p>
            Welcome to EDHRanker! This is a daily game where you try to guess the popularity ranking of EDH (Commander) cards.
          </p>
          <p>
            Each day, you&#39;ll be presented with a set of cards. Your goal is to arrange them in order of their popularity in EDH decks, from most popular to least popular.
          </p>
          <p>
            To play:
          </p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Drag and drop the cards to arrange them in your guessed order</li>
            <li>Click &#34;Submit Guess&#34; when you&#39;re ready</li>
            <li>Cards you placed correctly will be locked in place</li>
            <li>Keep guessing with the remaining cards until you get them all right!</li>
          </ol>
          <p>
            The rankings are based on EDHRec data, collected from multiple sources like Archidekt and Moxfield deck lists, and provided by the Scryfall API.
          </p>
          <p>
            Come back each day for a new challenge!
          </p>
        </div>
      </div>
    </div>
  );
} 
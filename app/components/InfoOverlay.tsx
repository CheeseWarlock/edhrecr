'use client';

import React from 'react';
import { Metamorphous } from "next/font/google";
import { OverlayFrame } from './OverlayFrame';
import Link from 'next/link';

const metamorphous = Metamorphous({ 
  weight: '400',
  subsets: ["latin"],
});

interface InfoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoOverlay({ isOpen, onClose }: InfoOverlayProps) {
  return (
    <OverlayFrame isOpen={isOpen} onClose={onClose}>
      <div className="text-white space-y-4">
        <h2 className={`text-2xl md:text-4xl font-bold mb-6 ${metamorphous.className}`}>How to Play EDHRanker</h2>
        <p>
          EDHRanker is a daily game where you try to guess the popularity of Magic cards in EDH&#47;Commander, in as few guesses as possible.
        </p>
        <p>
          Each day, you&#39;ll be presented with a set of cards.
          Drag the cards to arrange them in order of their popularity in EDH decks, from most popular to least popular.
          Correctly placed cards will be locked in place. Tap a card to enlarge it.
          You can <Link href="/sample" className="text-[#2EB5D3] hover:underline">try a sample game</Link> to see how it works.
        </p>
        <p>
          The rankings are based on EDHRec data, collected from multiple sources like Archidekt and Moxfield deck lists, and provided by the Scryfall API.
        </p>
        <p>
          Come back each day for a new challenge and keep your streak going!
        </p>
      </div>
    </OverlayFrame>
  );
}
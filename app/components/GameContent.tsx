'use client';

import { useState } from 'react';
import { Card } from '../types';
import { GameArea } from './GameArea';
import { TopBar } from './TopBar';
import { InfoOverlay } from './InfoOverlay';

interface GameContentProps {
  cards: Card[];
}

export function GameContent({ cards }: GameContentProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#222]">
      <TopBar onInfoClick={() => setIsInfoOpen(true)} />
      <div className="pt-16 min-h-[calc(100vh-4rem)] md:p-8 flex items-center justify-center">
        <GameArea cards={cards} />
      </div>
      <InfoOverlay isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </main>
  );
} 
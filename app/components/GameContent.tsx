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
    <main className="items-center justify-items-center min-h-screen md:p-8 bg-[#222] flex justify-center pt-16 md:pt-16">
      <TopBar onInfoClick={() => setIsInfoOpen(true)} />
      <div className="flex flex-col h-full row-start-2">
        <GameArea cards={cards} />
      </div>
      <InfoOverlay isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </main>
  );
} 
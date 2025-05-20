'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../types';
import { GameArea } from './GameArea';
import { TopBar } from './TopBar';
import { InfoOverlay } from './InfoOverlay';
import { useLocalStorage } from '../utils/useLocalStorage';

interface GameContentProps {
  cards: Card[];
  date: string;
}

export function GameContent({ cards, date }: GameContentProps) {
  const [hasSeenInfo, setHasSeenInfo] = useLocalStorage("hasSeenInfo", false);
  const [isInfoOpen, setIsInfoOpen] = useState(!hasSeenInfo);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }

  return (
    <main className="items-center justify-items-center min-h-screen md:p-8 bg-[#222] flex justify-center pt-16 md:pt-16">
      <TopBar onInfoClick={() => setIsInfoOpen(true)} />
      <div className="flex flex-col h-full row-start-2">
        <GameArea cards={cards} />
      </div>
      <InfoOverlay isOpen={isInfoOpen} onClose={() => {
        setIsInfoOpen(false)
        setHasSeenInfo(true)
      }}/>
    </main>
  );
} 
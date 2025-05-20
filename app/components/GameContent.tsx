'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../types';
import { GameArea } from './GameArea';
import { TopBar } from './TopBar';
import { InfoOverlay } from './InfoOverlay';
import { StreakOverlay } from './StreakOverlay';
import { useLocalStorage } from '../utils/useLocalStorage';
import { updateStreak } from '../lib/streak';

interface GameContentProps {
  cards: Card[];
  date: string;
}

export function GameContent({ cards, date }: GameContentProps) {
  const [hasSeenInfo, setHasSeenInfo] = useLocalStorage("hasSeenInfo", false);
  const [isInfoOpen, setIsInfoOpen] = useState(!hasSeenInfo);
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }

  const handlePuzzleComplete = () => {
    const newStreak = updateStreak(date);
    setStreak(newStreak);
  };

  return (
    <main className="items-center justify-items-center min-h-screen md:p-8 bg-[#222] flex justify-center pt-16 md:pt-16">
      <TopBar 
        onInfoClick={() => setIsInfoOpen(true)} 
        onStreakClick={() => setIsStreakOpen(true)}
      />
      <div className="flex flex-col h-full row-start-2">
        <GameArea cards={cards} onPuzzleComplete={handlePuzzleComplete} />
      </div>
      <InfoOverlay isOpen={isInfoOpen} onClose={() => {
        setIsInfoOpen(false)
        setHasSeenInfo(true)
      }}/>
      <StreakOverlay 
        isOpen={isStreakOpen} 
        onClose={() => setIsStreakOpen(false)} 
        streak={streak}
      />
    </main>
  );
} 
'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../types';
import { GameArea } from './GameArea';
import { TopBar } from './TopBar';
import { InfoOverlay } from './InfoOverlay';
import { StreakOverlay } from './StreakOverlay';
import { useLocalStorage } from '../utils/useLocalStorage';
import { clearUserStreak, getUserStreakStatus, updateUserStreak } from '../lib/streak';
import { AnimatePresence } from 'motion/react';
import { CardImage } from './CardImage';
import { CardViewerContext } from './CardViewerContext';
import { CardViewFrame } from './CardViewFrame';

interface GameContentProps {
  cards: Card[];
  date: string;
}

export function GameContent({ cards, date }: GameContentProps) {
  const [hasSeenInfo, setHasSeenInfo] = useLocalStorage("edhr-has-seen-intro", "false");
  const [isInfoOpen, setIsInfoOpen] = useState(hasSeenInfo !== "true");
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [viewingCard, setViewingCard] = useState<Card | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const handlePuzzleComplete = () => {
    updateUserStreak(date, true);
  };

  const handlePuzzleFailed = () => {
    updateUserStreak(date, false);
  }

  return (
    <main
      style={{
        backgroundImage: 'url("/texture2.png"), url("/texture1.png")',
      }}
      className="items-center justify-items-center min-h-screen md:p-8 bg-[#222] flex justify-center pt-16 md:pt-16"
    >
      <CardViewerContext value={ (card) => {setViewingCard(card);} }>
      <TopBar 
        onInfoClick={() => setIsInfoOpen(true)} 
        onStreakClick={() => setIsStreakOpen(true)}
      />
      <div className="flex flex-col h-full row-start-2">
        <GameArea
          cards={cards}
          onPuzzleComplete={handlePuzzleComplete}
          onPuzzleFailed={handlePuzzleFailed}
          />
      </div>
      <AnimatePresence>
        {isInfoOpen &&
          <InfoOverlay isOpen={isInfoOpen} onClose={() => {
            setIsInfoOpen(false)
            setHasSeenInfo("true")
          }}/>
        }
      </AnimatePresence>
      <AnimatePresence>
        {isStreakOpen &&
          <StreakOverlay 
          isOpen={isStreakOpen} 
          onClose={() => setIsStreakOpen(false)} 
          streak={getUserStreakStatus(date)}
        />}
      </AnimatePresence>
      <AnimatePresence>
        {viewingCard &&
          <CardViewFrame isOpen={true} onClose={() => { setViewingCard(null)} }><CardImage card={viewingCard} /></CardViewFrame>
        }
      </AnimatePresence>
      </CardViewerContext>
    </main>
  );
} 
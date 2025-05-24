'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../types';
import { GameArea } from './GameArea';
import { TopBar } from './TopBar';
import { InfoOverlay } from './InfoOverlay';
import { StreakOverlay } from './StreakOverlay';
import { useLocalStorage, useLocalStorageWithSerializer } from '../utils/useLocalStorage';
import { getUserStreakStatus, updateUserStreak } from '../utils/localStorageUtils';
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
  const [storedGuesses, setStoredGuesses] = useLocalStorageWithSerializer<
    Card[][],
    { date: string, guesses: number[][] }
  >(
    "edhr-guesses",
    [],
    (cardData) => ({ guesses: cardData.map(order => order.map(card => cards.indexOf(card))), date: date }),
    (storedData) => storedData.guesses.map(order => order.map(cardIdx => cards[cardIdx]))
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const handleLockInGuess = (cardsInCurrentGuess: Card[]) => {
    const newGuessedOrders = [...storedGuesses, cardsInCurrentGuess];
    const correctOrder = ([...cards]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);
    const didWin = cardsInCurrentGuess.every((card, index) => {
      return correctOrder.indexOf(card) === index;
    });

    setStoredGuesses(newGuessedOrders);

    if (didWin) {
      handlePuzzleComplete(newGuessedOrders.length);
    } else if (newGuessedOrders.length === 5) {
      handlePuzzleFailed();
    }
  };

  const handlePuzzleComplete = (guessesCompleted: number) => {
    updateUserStreak(date, true, guessesCompleted);
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
          guessedOrders={storedGuesses}
          onLockInGuess={handleLockInGuess}
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
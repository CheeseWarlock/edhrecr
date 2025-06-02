'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../types';
import { GameArea } from './GameArea';
import { TopBar } from './TopBar';
import { InfoOverlay } from './InfoOverlay';
import { StreakOverlay } from './StreakOverlay';
import { useLocalStorage } from '../utils/useLocalStorage';
import { getUserStreakStatus, updateUserStreak } from '../utils/localStorageUtils';
import { AnimatePresence } from 'motion/react';
import { CardViewerContext } from './CardViewerContext';
import { CardViewFrame } from './CardViewFrame';
import { CalendarOverlay } from './CalendarOverlay';

interface GameContentProps {
  cards: Card[];
  /**
   * The date of the challenge.
   */
  date: string;
  /**
   * The current date.
   */
  today: string;
  storedGuesses: Card[][];
  setStoredGuesses: React.Dispatch<React.SetStateAction<Card[][]>>;
  shouldUpdateStreak?: boolean;
}

export function GameContent({ cards, date, storedGuesses, setStoredGuesses, shouldUpdateStreak = true, today }: GameContentProps) {
  const [hasSeenInfo, setHasSeenInfo] = useLocalStorage("edhr-has-seen-intro", "false");
  const [isInfoOpen, setIsInfoOpen] = useState(hasSeenInfo !== "true");
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [viewingCard, setViewingCard] = useState<Card | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
    if (shouldUpdateStreak) {
      updateUserStreak(date, true, guessesCompleted);
    }
  };

  const handlePuzzleFailed = () => {
    if (shouldUpdateStreak) {
      updateUserStreak(date, false);
    }
  }

  const correctOrder = ([...cards]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);

  const won = storedGuesses.length > 0 && storedGuesses[storedGuesses.length - 1].every((card, index) => {
    return correctOrder.indexOf(card) === index;
  });
  const lost = storedGuesses.length == 5;
  const gameOver = won || lost;

  return (
    <main
      style={{
        backgroundImage: 'url("/texture2.png"), url("/texture1.png")',
      }}
      className="items-center justify-items-center min-h-screen md:p-8 bg-[#222] flex justify-center pt-16 md:pt-16 relative overflow-hidden"
    >
      <svg
        className="absolute w-[120%] h-[120%] opacity-5 pointer-events-none"
        viewBox="0 0 100 200"
        preserveAspectRatio="xMidYMid meet"
      >
        <ellipse
          cx="50"
          cy="100"
          rx="44"
          ry="65"
          fill="#CCC"
        />
      </svg>
      <CardViewerContext value={ (card) => {setViewingCard(card);} }>
      <TopBar 
        onCalendarClick={() => setIsCalendarOpen(true)}
        onInfoClick={() => setIsInfoOpen(true)} 
        onStreakClick={() => setIsStreakOpen(true)}
      />
      <div className="flex flex-col h-full row-start-2">
        <GameArea
          cards={cards}
          guessedOrders={storedGuesses}
          onLockInGuess={handleLockInGuess}
          dateDisplay={date === today ? undefined : date}
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
          streak={getUserStreakStatus(today)}
        />}
      </AnimatePresence>
      <AnimatePresence>
        {isCalendarOpen &&
          <CalendarOverlay 
          isOpen={isCalendarOpen} 
          onClose={() => setIsCalendarOpen(false)}
          gameDate={new Date(date)}
          today={new Date(today)}
        />}
      </AnimatePresence>
      <AnimatePresence>
        {viewingCard &&
          <CardViewFrame card={viewingCard} isOpen={true} onClose={() => { setViewingCard(null)} } canViewInEDHRec={gameOver} />
        }
      </AnimatePresence>
      </CardViewerContext>
    </main>
  );
} 
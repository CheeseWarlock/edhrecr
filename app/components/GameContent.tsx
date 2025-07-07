'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../types';
import { GameArea } from './GameArea';
import { TopBar } from './TopBar';
import { InfoOverlay } from './InfoOverlay';
import { StreakOverlay } from './StreakOverlay';
import { useLocalStorage } from '../utils/useLocalStorage';
import { getUserStreakStatus, prepopulateUserPlayHistory, updateUserPlayHistory, updateUserStreak } from '../utils/localStorageUtils';
import { AnimatePresence } from 'motion/react';
import { CardViewerContext, ClickPosition } from './CardViewerContext';
import { CardViewFrame } from './CardViewFrame';
import { CalendarOverlay } from './CalendarOverlay';
import NoCardsNotice from './NoCardsNotice';

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
  setStoredGuesses: (guesses: Card[][]) => void;
  shouldUpdateStreak?: boolean;
  gameTitle?: string;
  shareable?: boolean;
}

export function GameContent({ cards, date, storedGuesses, setStoredGuesses, shouldUpdateStreak = true, today, gameTitle, shareable = true }: GameContentProps) {
  const [hasSeenInfo, setHasSeenInfo] = useLocalStorage("edhr-has-seen-intro", "false");
  const [isInfoOpen, setIsInfoOpen] = useState(hasSeenInfo !== "true");
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [viewingCard, setViewingCard] = useState<Card | null>(null);
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    prepopulateUserPlayHistory(today);
  }, [today]);

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
      handlePuzzleComplete(newGuessedOrders.length, date);
    } else if (newGuessedOrders.length === 5) {
      handlePuzzleFailed();
    }
  };

  const handlePuzzleComplete = (guessesCompleted: number, date: string) => {
    updateUserPlayHistory(date);
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

  const dateString = new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  
  const gameDateString = (date !== today) ? dateString : undefined;

  if (!gameTitle) {
    gameTitle = (date !== today) ? `Daily game for ${gameDateString}` : undefined;
  }

  const handleViewCard = (card: Card, position?: ClickPosition) => {
    setViewingCard(card);
    setClickPosition(position || null);
  };

  return (
    <main
      style={{
        backgroundImage: 'url("/texture2.png"), url("/texture1.png")',
      }}
      className="items-center justify-items-center min-h-screen md:p-8 bg-[#222] flex justify-center pt-16 md:pt-16 relative overflow-hidden"
    >
      <CardViewerContext value={handleViewCard}>
      <TopBar 
        onCalendarClick={() => setIsCalendarOpen(true)}
        onInfoClick={() => setIsInfoOpen(true)} 
        onStreakClick={() => setIsStreakOpen(true)}
      />
      <div className="flex flex-col h-full row-start-2">
        {cards.length > 0 ?
        <GameArea
          cards={cards}
          guessedOrders={storedGuesses}
          onLockInGuess={handleLockInGuess}
          gameTitle={gameTitle}
          isPastGame={date !== today}
          shareable={shareable}
          shareDateString={dateString}
        />
        :
        <NoCardsNotice />
        }
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
          <CardViewFrame 
            card={viewingCard} 
            isOpen={true} 
            onClose={() => { 
              setViewingCard(null);
              setClickPosition(null);
            }} 
            canViewInEDHRec={gameOver}
            clickPosition={clickPosition}
          />
        }
      </AnimatePresence>
      </CardViewerContext>
    </main>
  );
} 
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../types';
import { GameArea } from './GameArea';
import { TopBar } from './TopBar';
import { InfoOverlay } from './InfoOverlay';
import { StreakOverlay } from './StreakOverlay';
import { useLocalStorage, useLocalStorageWithSerializer } from '../utils/useLocalStorage';
import { getUserStreakStatus, updateUserStreak } from '../utils/localStorageUtils';
import { AnimatePresence } from 'motion/react';
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
  
  const serializer = useCallback((cardData: Card[][], currentData?: { date: string, guesses: number[][] }) => {
    console.log("Saving", { guesses: currentData?.date === date ? cardData.map(order => order.map(card => cards.indexOf(card))) : [], date: date });
    return { guesses: currentData?.date === date ? cardData.map(order => order.map(card => cards.indexOf(card))) : [], date: date };
  }, [cards, date]);
  const deserializer = useCallback((storedData: { date: string, guesses: number[][] }) =>{
    console.log("Loading", storedData.date === date ? storedData.guesses.map(order => order.map(cardIdx => cards[cardIdx])) : []);
    return storedData.date === date ? storedData.guesses.map(order => order.map(cardIdx => cards[cardIdx])) : []
  }, [cards, date]);

  const [storedGuesses, setStoredGuesses] = useLocalStorageWithSerializer<
    Card[][],
    { date: string, guesses: number[][] }
  >("edhr-guesses", [], serializer, deserializer);

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
          <CardViewFrame card={viewingCard} isOpen={true} onClose={() => { setViewingCard(null)} } canViewInEDHRec={gameOver} />
        }
      </AnimatePresence>
      </CardViewerContext>
    </main>
  );
} 
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../types';
import { GameContent } from './GameContent';
import { getUserGuesses, setUserGuesses } from '../utils/localStorageUtils';

interface PersistentGameContentProps {
  cards: Card[];
  date: string;
  today: string;
}

export function PersistentGameContent({ cards, date, today }: PersistentGameContentProps) {
  const [storedGuesses, setStoredGuesses] = useState<number[][]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setStoredGuesses(getUserGuesses(date));
    setHasMounted(true);
  }, [date]);

  const persistGuesses = useCallback((guesses: Card[][]) => {
    const cardsWithTodaysDate = guesses.map(guess => guess.map(card => cards.findIndex(c => c.id === card.id)));
    setUserGuesses(date, cardsWithTodaysDate);
    setStoredGuesses(cardsWithTodaysDate);
  }, [cards, date]);

  const storedGuessesAsCards = useMemo(() => storedGuesses.map(guess => guess.map(cardIdx => cards[cardIdx])), [storedGuesses, cards]);
  
  if (!hasMounted) {
    return null;
  }

  return (
    <GameContent 
      cards={cards} 
      date={date}
      storedGuesses={storedGuessesAsCards}
      setStoredGuesses={persistGuesses}
      today={today}
    />
  );
}
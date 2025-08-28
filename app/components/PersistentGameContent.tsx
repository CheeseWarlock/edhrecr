'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../types';
import { GameContent } from './GameContent';
import { getUserGuesses, setUserGuesses } from '../utils/localStorageUtils';
import { DailyCollection } from '../types';

interface PersistentGameContentProps {
  /**
   * The collection of cards for the game, with metadata.
   */
  collection: DailyCollection;
  today: string;
  /**
   * Whether a share link should be provided.
   */
  shareable?: boolean;
}

export function PersistentGameContent({ collection, today, shareable }: PersistentGameContentProps) {
  const [storedGuesses, setStoredGuesses] = useState<number[][]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setStoredGuesses(getUserGuesses(collection.date));
    setHasMounted(true);
  }, [collection.date]);

  const persistGuesses = useCallback((guesses: Card[][]) => {
    const cardsWithTodaysDate = guesses.map(guess => guess.map(card => collection.cards.findIndex(c => c.id === card.id)));
    setUserGuesses(collection.date, cardsWithTodaysDate);
    setStoredGuesses(cardsWithTodaysDate);
  }, [collection.cards, collection.date]);

  const storedGuessesAsCards = useMemo(() => storedGuesses.map(guess => guess.map(cardIdx => collection.cards[cardIdx])), [storedGuesses, collection.cards]);
  
  if (!hasMounted) {
    return null;
  }

  return (
    <GameContent 
      collection={collection}
      storedGuesses={storedGuessesAsCards}
      setStoredGuesses={persistGuesses}
      today={today}
      shareable={shareable}
    />
  );
}
'use client';

import React, { useCallback } from 'react';
import { Card } from '../types';
import { GameContent } from './GameContent';
import { useLocalStorageWithSerializer } from '../utils/useLocalStorage';

interface PersistentGameContentProps {
  cards: Card[];
  date: string;
  today: Date;
}

export function PersistentGameContent({ cards, date, today }: PersistentGameContentProps) {
  const serializer = useCallback((cardData: Card[][], currentData?: { date: string, guesses: number[][] }) => {
    return { guesses: currentData?.date === date ? cardData.map(order => order.map(card => cards.indexOf(card))) : [], date: date };
  }, [cards, date]);

  const deserializer = useCallback((storedData: { date: string, guesses: number[][] }) => {
    return storedData.date === date ? storedData.guesses.map(order => order.map(cardIdx => cards[cardIdx])) : []
  }, [cards, date]);

  const [storedGuesses, setStoredGuesses] = useLocalStorageWithSerializer<
    Card[][],
    { date: string, guesses: number[][] }
  >("edhr-guesses", [], serializer, deserializer);

  return (
    <GameContent 
      cards={cards} 
      date={date}
      storedGuesses={storedGuesses}
      setStoredGuesses={setStoredGuesses}
      today={today}
    />
  );
} 
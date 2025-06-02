'use client';

import React, { useState } from 'react';
import { Card } from '../types';
import { GameContent } from './GameContent';

interface NonPersistentGameContentProps {
  cards: Card[];
  date: string;
  today: string;
}

export function NonPersistentGameContent({ cards, date, today }: NonPersistentGameContentProps) {
  const [storedGuesses, setStoredGuesses] = useState<Card[][]>([]);

  return (
    <GameContent 
      cards={cards} 
      date={date}
      today={today}
      storedGuesses={storedGuesses}
      setStoredGuesses={setStoredGuesses}
      shouldUpdateStreak={false}
    />
  );
} 
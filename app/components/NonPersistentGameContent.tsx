'use client';

import React, { useState } from 'react';
import { Card } from '../types';
import { GameContent } from './GameContent';

interface NonPersistentGameContentProps {
  cards: Card[];
  date: string;
  today: string;
  title?: string;
  creator?: string;
  shareable?: boolean;
}

export function NonPersistentGameContent({ cards, date, today, title, shareable, creator }: NonPersistentGameContentProps) {
  const [storedGuesses, setStoredGuesses] = useState<Card[][]>([]);

  return (
    <GameContent 
      cards={cards} 
      date={date}
      today={today}
      storedGuesses={storedGuesses}
      setStoredGuesses={setStoredGuesses}
      shouldUpdateStreak={false}
      gameTitle={title}
      shareable={shareable}
      creator={creator}
    />
  );
} 
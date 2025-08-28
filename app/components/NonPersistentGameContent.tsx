'use client';

import React, { useState } from 'react';
import { Card, DailyCollection } from '../types';
import { GameContent } from './GameContent';

interface NonPersistentGameContentProps {
  collection: DailyCollection;
  today: string;
  shareable?: boolean;
}

export function NonPersistentGameContent({ collection, today, shareable }: NonPersistentGameContentProps) {
  const [storedGuesses, setStoredGuesses] = useState<Card[][]>([]);

  return (
    <GameContent 
      collection={collection}
      today={today}
      storedGuesses={storedGuesses}
      setStoredGuesses={setStoredGuesses}
      shouldUpdateStreak={false}
      shareable={shareable}
    />
  );
} 
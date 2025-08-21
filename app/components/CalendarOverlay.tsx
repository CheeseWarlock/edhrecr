'use client';

import { Metamorphous } from 'next/font/google';
import { OverlayFrame } from './OverlayFrame';
import { useRouter } from 'next/navigation';
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { getUserPlayHistory } from '../utils/localStorageUtils';
import { useState, useEffect } from 'react';

interface CalendarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  gameDate: Date;
  today: Date;
}

interface SpecialDay {
  date: string;
  is_special: boolean;
}

const metamorphous = Metamorphous({ 
  weight: '400',
  subsets: ["latin"],
});

export function CalendarOverlay({ isOpen, onClose, gameDate, today }: CalendarOverlayProps) {
  const router = useRouter();
  const daysPlayed = getUserPlayHistory();
  const [specialDays, setSpecialDays] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchSpecialDays = async () => {
      try {
        const response = await fetch('/api/calendar');
        if (response.ok) {
          const data: SpecialDay[] = await response.json();
          const specialDates = data
            .filter(day => day.is_special)
            .map(day => day.date.slice(0, 10));
          console.log(specialDates, 'special dates');
          setSpecialDays(specialDates);
        }
      } catch (error) {
        console.error('Failed to fetch special days:', error);
      }
    };

    fetchSpecialDays();
  }, []);

  return (
    <OverlayFrame isOpen={isOpen} onClose={onClose}>
      <div className="text-white space-y-4">
        <h2 className={`text-2xl md:text-4xl font-bold mb-6 ${metamorphous.className}`}>Past Games</h2>
        <p>
          Select a date to play that day&apos;s game. Past games will not count towards your streak.
        </p>
        <div className="flex flex-col items-center">
        <DayPicker
          timeZone="UTC"
          animate
          mode="single"
          selected={gameDate}
          modifiers={{
            played: (date) => daysPlayed.includes(date.toISOString().slice(0, 10)),
            special: (date) => specialDays.includes(date.toISOString().slice(0, 10))
          }}
          disabled={date => date < new Date('2025-05-15') || date > today}
          onSelect={date => {
            if (date) {
              if (date.getTime() === today.getTime()) {
                router.push(`/`);
              } else {
                router.push(`/replay/${date.toISOString().slice(0, 10)}`);
              }
            }
          }}
          modifiersClassNames={{
            played: 'played rounded-lg',
            special: 'special rounded-lg'
          }}
          defaultMonth={gameDate}
          startMonth={new Date('2025-05-15')}
          endMonth={today}
          />
        </div>
        <div className="flex flex-row justify-around items-center">
          <div className="text-lg p-2 flex items-center gap-2">
            { /* eslint-disable-next-line @next/next/no-img-element */ }
            <img src="/star.svg" alt="Star" className="w-5 h-5" />
            Special Games
          </div>
          <div className="text-lg bg-mana-green rounded-lg p-2 text-center">Already Played</div>
        </div>
      </div>
    </OverlayFrame>
  );
}
'use client';

import { Metamorphous } from 'next/font/google';
import { OverlayFrame } from './OverlayFrame';
import { useRouter } from 'next/navigation';
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { getUserPlayHistory } from '../utils/localStorageUtils';
interface CalendarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  gameDate: Date;
  today: Date;
}

const metamorphous = Metamorphous({ 
  weight: '400',
  subsets: ["latin"],
});

export function CalendarOverlay({ isOpen, onClose, gameDate, today }: CalendarOverlayProps) {
  const router = useRouter();
  const daysPlayed = getUserPlayHistory();
  console.log(daysPlayed);
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
            played: (date) => daysPlayed.includes(date.toISOString().slice(0, 10))
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
            played: 'played rounded-lg'
          }}
          defaultMonth={gameDate}
          startMonth={new Date('2025-05-15')}
          endMonth={today}
          />
        </div>
      </div>
    </OverlayFrame>
  );
}
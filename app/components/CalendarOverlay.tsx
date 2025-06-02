'use client';

import { OverlayFrame } from './OverlayFrame';
import { useRouter } from 'next/navigation';
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface CalendarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  gameDate: Date;
  today: Date;
}

export function CalendarOverlay({ isOpen, onClose, gameDate, today }: CalendarOverlayProps) {
  const router = useRouter();
  return (
    <OverlayFrame isOpen={isOpen} onClose={onClose}>
      <DayPicker
        animate
        mode="single"
        selected={gameDate}
        disabled={date => date < new Date('2025-05-15') || date > today}
        onSelect={date => {
          if (date) {
            router.push(`/replay/${date.toISOString().slice(0, 10)}`);
          }
        }}
        month={gameDate}
        startMonth={new Date('2025-05-15')}
        endMonth={today}
      />
    </OverlayFrame>
  );
}
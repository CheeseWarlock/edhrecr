import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

/**
 * A day picker for the game editor.
 * Shows which days already have a game.
 */
export function GameDayPicker({ populatedDays, today, gameDate, onSelect }: { populatedDays: Set<string>, today: string, gameDate: string, onSelect: (date: Date) => void }) {
  const todayDate = new Date(today);
  const gameDateDate = new Date(gameDate);
  
  return (
    <div className="absolute p-4 bg-gray-900 rounded-lg">
    <DayPicker
          timeZone="UTC"
          animate
          mode="single"
          selected={gameDateDate}
          modifiers={{
            hasGame: (date) => populatedDays.has(date.toISOString().slice(0, 10))
          }}
          disabled={date => date <= todayDate}
          onSelect={date => {
            if (date) {
              onSelect(date);
            }
          }}
          modifiersClassNames={{
            hasGame: 'played rounded-lg'
          }}
          defaultMonth={gameDateDate}
          startMonth={todayDate}
          />
    </div>
  )
}
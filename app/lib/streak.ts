export interface StreakData {
  streak: number;
  lastDay: string;
}

export function calculateStreak(storedData: StreakData | null, currentDate: string): StreakData {
  if (!storedData) {
    return { streak: 1, lastDay: currentDate };
  }

  const lastDay = new Date(storedData.lastDay);
  const currentDay = new Date(currentDate);
  
  // Check if the last day was yesterday
  const yesterday = new Date(currentDay);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let newStreak = storedData.streak;
  if (lastDay.toDateString() === yesterday.toDateString()) {
    newStreak += 1;
  } else if (lastDay.toDateString() !== currentDay.toDateString()) {
    newStreak = 1;
  }
  
  return { streak: newStreak, lastDay: currentDate };
}

export function updateStreak(currentDate: string): number {
  const storedStreak = localStorage.getItem('edhr-streak');
  const storedData = storedStreak ? JSON.parse(storedStreak) as StreakData : null;
  
  const newStreakData = calculateStreak(storedData, currentDate);
  localStorage.setItem('edhr-streak', JSON.stringify(newStreakData));
  
  return newStreakData.streak;
} 
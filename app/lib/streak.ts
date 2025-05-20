/**
 * Streak data as stored in local storage
 */
export interface StreakData {
  streak: number;
  lastDay: string;
}

/**
 * Current state of a streak
 */
export interface StreakStatus {
  streakLength: number;
  isStreakActive: boolean;
  isTodayDone: boolean;
}

/**
 * Determine the current streak length and whether the streak is active
 */
export function getCurrentStreakStatus(storedData: StreakData | null, currentDate: string): StreakStatus {
  if (!storedData) {
    return { streakLength: 0, isStreakActive: false, isTodayDone: false };
  }

  const lastDay = new Date(storedData.lastDay);
  const currentDay = new Date(currentDate);

  const yesterday = new Date(currentDay);
  yesterday.setDate(yesterday.getDate() - 1);

  // If the last day played was yesterday or today, the streak is active
  if (lastDay.toDateString() === yesterday.toDateString() || lastDay.toDateString() === currentDay.toDateString()) {
    return {
      streakLength: storedData.streak,
      isStreakActive: true,
      isTodayDone: lastDay.toDateString() === currentDay.toDateString(),
    };
  } else {
    return {
      streakLength: 0,
      isStreakActive: false,
      isTodayDone: false,
    };
  }
}

/**
 * Determine the new streak data for when the current date's game is finished
 */
export function getUpdatedStreakData(storedData: StreakData | null, currentDate: string): StreakData {
  if (!storedData) {
    return { streak: 1, lastDay: currentDate };
  }

  const lastDay = new Date(storedData.lastDay);
  const currentDay = new Date(currentDate);

  const yesterday = new Date(currentDay);
  yesterday.setDate(yesterday.getDate() - 1);

  // If the last day played was yesterday, increment the streak
  if (lastDay.toDateString() === yesterday.toDateString()) {
    return { streak: storedData.streak + 1, lastDay: currentDate };
  // If the last day played was today (replayed the same day), keep the streak
  } else if (lastDay.toDateString() === currentDay.toDateString()) {
    return storedData;
  // If the last day played was not yesterday or today, reset the streak
  } else {
    return { streak: 1, lastDay: currentDate };
  }
}

/**
 * Get the user's streak status based on local storage
 */
export function getUserStreakStatus(currentDate: string): StreakStatus {
  const storedStreak = localStorage.getItem('edhr-streak');
  const storedData = storedStreak ? JSON.parse(storedStreak) as StreakData : null;
  return getCurrentStreakStatus(storedData, currentDate);
}

/**
 * Update the user's streak in local storage
 */
export function updateUserStreak(currentDate: string) {
  const storedStreak = localStorage.getItem('edhr-streak');
  const storedData = storedStreak ? JSON.parse(storedStreak) as StreakData : null;
  const updatedStreakData = getUpdatedStreakData(storedData, currentDate);
  localStorage.setItem('edhr-streak', JSON.stringify(updatedStreakData));
}

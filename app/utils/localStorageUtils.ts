import { Card } from "../types";

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

export interface LoadedGameState {
  guesses: Card[][];
  remainingCards: Card[];
  correctIndices: boolean[];
  currentGuess: Card[];
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
export function getUpdatedStreakData(storedData: StreakData | null, currentDate: string, success: boolean): StreakData {
  if (!storedData) {
    return { streak: success ? 1 : 0, lastDay: currentDate };
  }

  const lastDay = new Date(storedData.lastDay);
  const currentDay = new Date(currentDate);

  const yesterday = new Date(currentDay);
  yesterday.setDate(yesterday.getDate() - 1);

  const isBackInTime = +currentDay < +lastDay; 

  // If the last day played was yesterday, increment the streak
  if (lastDay.toDateString() === yesterday.toDateString()) {
    return { streak: success ? (storedData.streak + 1) : 0, lastDay: currentDate };
  // If the last day played was today (replayed the same day), keep the streak
  } else if (lastDay.toDateString() === currentDay.toDateString()) {
    return storedData;
  // Handle edge case of out-of-order plays
  } else if (isBackInTime) {
    return storedData;
  // If the last day played was not yesterday or today, reset the streak
  } else {
    return { streak: success ? 1 : 0, lastDay: currentDate };
  }
}

/**
 * Update the user's guess count in local storage
 * If the user failed, pass 0, as that's how it's stored
 */
export function incrementUserGuessCount(newResult: number) {
  const storedGuessCount = localStorage.getItem('edhr-guess-count');
  const guessCount = storedGuessCount ? JSON.parse(storedGuessCount) : [0, 0, 0, 0, 0, 0];
  guessCount[newResult] = (guessCount[newResult] || 0) + 1;
  localStorage.setItem('edhr-guess-count', JSON.stringify(guessCount));
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
export function updateUserStreak(currentDate: string, success: boolean, guessesCompleted?: number) {
  const storedStreak = localStorage.getItem('edhr-streak');
  const storedData = storedStreak ? JSON.parse(storedStreak) as StreakData : null;
  const newData = getUpdatedStreakData(storedData, currentDate, success);
  localStorage.setItem('edhr-streak', JSON.stringify(newData));

  if (success && guessesCompleted !== undefined) {
    incrementUserGuessCount(guessesCompleted);
  } else if (!success) {
    incrementUserGuessCount(0);
  }
}

/**
 * Get the user's play history.
 */
export function getUserPlayHistory() {
  const storedHistory = localStorage.getItem('edhr-plays');
  return storedHistory ? JSON.parse(storedHistory) : [];
}

/**
 * Update the user's play history by adding a given date to their games played.
 */
export function updateUserPlayHistory(date: string) {
  const storedHistory = localStorage.getItem('edhr-plays');
  const history = storedHistory ? JSON.parse(storedHistory) : [];
  if (!history.includes(date)) {
    history.push(date);
    localStorage.setItem('edhr-plays', JSON.stringify(history));
  }
}

/**
 * If the user has streak data but no play history, back-populate their streak.
 * @param today - The current date from the server in YYYY-MM-DD format.
 */
export function prepopulateUserPlayHistory(today: string) {
  const storedStreak = getUserStreakStatus(today);
  if (storedStreak && !localStorage.getItem('edhr-plays')) {
    const dayStreak = storedStreak.streakLength;
    const isTodayDone = storedStreak.isTodayDone;
    const todayDate = new Date(today);
    const results: string[] = [];

    let lastDayToPrepopulate = todayDate;
    if (isTodayDone) {
      lastDayToPrepopulate = new Date(todayDate.setDate(todayDate.getDate() + 1));
    }
    for (let i = 0; i < dayStreak; i++) {
      const dayStringToPrepopulate = new Date(lastDayToPrepopulate.setDate(lastDayToPrepopulate.getDate() - 1)).toISOString().split('T')[0];
      results.push(dayStringToPrepopulate);
    }
    localStorage.setItem('edhr-plays', JSON.stringify(results));
  }
}
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

export function hydrateGameState(cards: Card[], lastGuess: Card[]) {
  const correctOrder = ([...cards]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);

  let remainingCards: Card[] = cards;
  let correctIndices: boolean[] = new Array(cards.length).fill(false);

  remainingCards = lastGuess.filter((item, index) => {
    return correctOrder.indexOf(item) !== index;
  });

  correctIndices = correctOrder.map((card, index) => {
    return lastGuess.indexOf(card) === index;
  });
  
  return {
    remainingCards,
    correctIndices,
  };
}

/**
 * Get the user's current game from local storage
 * If there's a game in progress, returns the game state
 * Otherwise, returns undefined
 */
export const getUserCurrentGame = (cards: Card[], date: string): LoadedGameState | undefined => {
    let guesses: Card[][] = [];

    const previousLoadString = localStorage.getItem("edhr-guesses");
    const previousLoad = previousLoadString ? JSON.parse(previousLoadString) : null;
    if (previousLoad && previousLoad.date == date) {
      guesses = previousLoad.guesses.map((guess: number[]) => guess.map((cardIdx: number) => cards[cardIdx]));

      if (guesses.length) {
        const lastGuess = guesses[guesses.length - 1];
        const { remainingCards, correctIndices } = hydrateGameState(cards, lastGuess);
        return {
          guesses,
          remainingCards,
          correctIndices,
          currentGuess: lastGuess,
        };
      }
    }
}
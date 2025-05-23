import { getCurrentStreakStatus, getUpdatedStreakData, StreakData } from './localStorageUtils';

describe('getUpdatedStreakData', () => {
  it('should start a new streak for a first-time player', () => {
    const result = getUpdatedStreakData(null, '2024-03-20', true);
    expect(result).toEqual({
      streak: 1,
      lastDay: '2024-03-20'
    });
  });

  it('should increment streak for a player playing consecutive days', () => {
    const storedData: StreakData = {
      streak: 1,
      lastDay: '2024-03-19'
    };
    const result = getUpdatedStreakData(storedData, '2024-03-20', true);
    expect(result).toEqual({
      streak: 2,
      lastDay: '2024-03-20'
    });
  });

  it('should reset streak for a player who missed a day', () => {
    const storedData: StreakData = {
      streak: 5,
      lastDay: '2024-03-18'
    };
    const result = getUpdatedStreakData(storedData, '2024-03-20', true);
    expect(result).toEqual({
      streak: 1,
      lastDay: '2024-03-20'
    });
  });

  it('should maintain streak when playing the same day', () => {
    const storedData: StreakData = {
      streak: 3,
      lastDay: '2024-03-20'
    };
    const result = getUpdatedStreakData(storedData, '2024-03-20', true);
    expect(result).toEqual({
      streak: 3,
      lastDay: '2024-03-20'
    });
  });
});

describe('handling odd states', () => {
  it('should not update streak if data for today already exists', () => {
    const storedData: StreakData = {
      streak: 0,
      lastDay: '2025-01-01'
    };
    const result = getUpdatedStreakData(storedData, '2025-01-01', true);
    expect(result).toEqual({
      streak: 0,
      lastDay: '2025-01-01'
    });
  });

  it('should not update streak if new data is in the past', () => {
    const storedData: StreakData = {
      streak: 2,
      lastDay: '2025-01-01'
    };
    const result = getUpdatedStreakData(storedData, '2024-04-04', true);
    expect(result).toEqual({
      streak: 2,
      lastDay: '2025-01-01'
    });
  });
});

describe('streak calculation', () => {
  it('should handle an entire user flow', () => {
    // The user plays for the first time...
    let userStreakData = getUpdatedStreakData(null, '2025-01-01', true);
    expect(userStreakData.streak).toBe(1);
    let streakStatus = getCurrentStreakStatus(userStreakData, '2025-01-01');
    expect(streakStatus).toEqual({
      streakLength: 1,
      isStreakActive: true,
      isTodayDone: true
    });

    // Comes back and plays the next day...
    userStreakData = getUpdatedStreakData(userStreakData, '2025-01-02', true);
    expect(userStreakData.streak).toBe(2);
    streakStatus = getCurrentStreakStatus(userStreakData, '2025-01-02');
    expect(streakStatus).toEqual({
      streakLength: 2,
      isStreakActive: true,
      isTodayDone: true
    });

    // Misses a day then comes back...
    streakStatus = getCurrentStreakStatus(userStreakData, '2025-01-04');
    expect(streakStatus).toEqual({
      streakLength: 0,
      isStreakActive: false,
      isTodayDone: false
    });
    userStreakData = getUpdatedStreakData(userStreakData, '2025-01-04', true);
    expect(userStreakData.streak).toBe(1);
    streakStatus = getCurrentStreakStatus(userStreakData, '2025-01-04');
    expect(streakStatus).toEqual({
      streakLength: 1,
      isStreakActive: true,
      isTodayDone: true
    });

    // Fails the next day...
    streakStatus = getCurrentStreakStatus(userStreakData, '2025-01-05');
    expect(streakStatus).toEqual({
      streakLength: 1,
      isStreakActive: true,
      isTodayDone: false
    });
    userStreakData = getUpdatedStreakData(userStreakData, '2025-01-05', false);
    expect(userStreakData.streak).toBe(0);
    streakStatus = getCurrentStreakStatus(userStreakData, '2025-01-05');
    expect(streakStatus).toEqual({
      streakLength: 0,
      isStreakActive: true,
      isTodayDone: true
    });

    // Then succeeds a few days in a row...
    userStreakData = getUpdatedStreakData(userStreakData, '2025-01-06', true);
    userStreakData = getUpdatedStreakData(userStreakData, '2025-01-07', true);
    userStreakData = getUpdatedStreakData(userStreakData, '2025-01-08', true);
    expect(userStreakData.streak).toBe(3);
    streakStatus = getCurrentStreakStatus(userStreakData, '2025-01-08');
    expect(streakStatus).toEqual({
      streakLength: 3,
      isStreakActive: true,
      isTodayDone: true
    });

    // Then misses a day and fails...
    userStreakData = getUpdatedStreakData(userStreakData, '2025-01-10', false);
    expect(userStreakData.streak).toBe(0);
  })
});
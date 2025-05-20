import { getCurrentStreakStatus, getUpdatedStreakData, StreakData, StreakStatus } from './streak';

describe('getUpdatedStreakData', () => {
  it('should start a new streak for a first-time player', () => {
    const result = getUpdatedStreakData(null, '2024-03-20');
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
    const result = getUpdatedStreakData(storedData, '2024-03-20');
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
    const result = getUpdatedStreakData(storedData, '2024-03-20');
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
    const result = getUpdatedStreakData(storedData, '2024-03-20');
    expect(result).toEqual({
      streak: 3,
      lastDay: '2024-03-20'
    });
  });
}); 
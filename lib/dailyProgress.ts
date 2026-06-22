import type { CompletedQuest, DungeonHistoryEntry } from '../types';
import { Difficulty } from '../types';
import { DUNGEONS, XP_PER_DIFFICULTY } from '../constants';

export const getLocalDateKey = (value: Date | number | string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getLocalEndOfDayIso = (dateKey: string): string => {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
};

export const getDailyProgressXp = (
    completedQuests: CompletedQuest[],
    dungeonHistory: DungeonHistoryEntry[],
    dateKey: string,
): number => {
    const questXp = completedQuests
        .filter(quest =>
            getLocalDateKey(quest.completedAt) === dateKey &&
            quest.difficulty !== Difficulty.X &&
            quest.id !== 'sys_x_01'
        )
        .reduce((sum, quest) => sum + Math.max(0, quest.earnedXp ?? XP_PER_DIFFICULTY[quest.difficulty] ?? 0), 0);

    const dungeonXp = dungeonHistory
        .filter(entry => entry.status === 'cleared' && getLocalDateKey(entry.completedAt) === dateKey)
        .reduce((sum, entry) => {
            const dungeon = DUNGEONS.find(item => item.id === entry.id);
            return sum + Math.max(0, dungeon?.rewards?.xp ?? 0);
        }, 0);

    return questXp + dungeonXp;
};

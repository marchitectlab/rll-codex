import { MATERIALS } from '../constants';
import { Difficulty } from '../types';

export type DungeonRewardRoll = {
    coins: number;
    drops: Record<string, number>;
};

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const rollDungeonRewards = (grade: Difficulty): DungeonRewardRoll => {
    const drops: Record<string, number> = {};
    let coins = 0;

    if (grade === Difficulty.E) {
        coins = rand(3, 8);
        drops[MATERIALS.COPPER] = 1;
    } else if (grade === Difficulty.D) {
        coins = rand(5, 15);
        drops[MATERIALS.COPPER] = rand(1, 3);
        drops[MATERIALS.IRON] = 1;
    } else if (grade === Difficulty.C) {
        coins = rand(10, 25);
        drops[MATERIALS.COPPER] = rand(1, 2);
        drops[MATERIALS.IRON] = rand(1, 2);
    } else if (grade === Difficulty.B) {
        coins = rand(15, 40);
        drops[MATERIALS.COPPER] = rand(5, 8);
        drops[MATERIALS.IRON] = rand(5, 8);
        drops[MATERIALS.ALUMINIUM] = rand(2, 3);
        drops[MATERIALS.FANG] = Math.random() > 0.5 ? 1 : 0;
    } else if (grade === Difficulty.A) {
        coins = rand(50, 100);
        drops[MATERIALS.COPPER] = rand(5, 10);
        drops[MATERIALS.IRON] = rand(5, 10);
        drops[MATERIALS.ALUMINIUM] = rand(5, 8);
        drops[MATERIALS.FANG] = rand(1, 5);
        if (Math.random() > 0.7) drops[MATERIALS.DIAMOND] = rand(1, 5);
        if (Math.random() > 0.9) drops[MATERIALS.SHARD] = rand(1, 2);
    } else {
        coins = grade === Difficulty.S ? rand(200, 500) : rand(300, 750);
        drops[MATERIALS.COPPER] = rand(35, 80);
        drops[MATERIALS.IRON] = rand(35, 80);
        drops[MATERIALS.ALUMINIUM] = rand(30, 60);
        drops[MATERIALS.FANG] = rand(25, 55);
        drops[MATERIALS.DIAMOND] = rand(10, 25);
        drops[MATERIALS.SHARD] = rand(2, 5);
        drops[MATERIALS.BLOODSTONE] = rand(0, 3);
    }

    return { coins, drops };
};

export const formatDungeonRewardSummary = ({ coins, drops }: DungeonRewardRoll) => {
    const materialSummary = Object.entries(drops)
        .filter(([, count]) => count > 0)
        .map(([id, count]) => `${id.replace('mat_', '').replace(/_/g, ' ').toUpperCase()} x${count}`);
    return [`COINS x${coins}`, ...materialSummary].join(', ');
};

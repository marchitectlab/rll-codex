
import { Difficulty, Rank, Attribute, Dungeon, Quest, ShopItem, Title, Achievement, Saga } from './types';

export const XP_PER_DIFFICULTY: Record<Difficulty, number> = {
  [Difficulty.E]: 7,
  [Difficulty.D]: 12,
  [Difficulty.C]: 20,
  [Difficulty.B]: 35,
  [Difficulty.A]: 55,
  [Difficulty.S]: 85,
  [Difficulty.S_PLUS]: 150,
  [Difficulty.X]: 0,
};

export const RANK_THRESHOLDS: { level: number; rank: Rank }[] = [
  { level: 1, rank: Rank.E },
  { level: 11, rank: Rank.D },
  { level: 26, rank: Rank.C },
  { level: 51, rank: Rank.B },
  { level: 76, rank: Rank.A },
  { level: 100, rank: Rank.S },
];

export const getRankForLevel = (level: number): Rank => {
  let currentRank = Rank.E;
  for (const threshold of RANK_THRESHOLDS) {
    if (level >= threshold.level) {
      currentRank = threshold.rank;
    }
  }
  return currentRank;
};

export const getXpToNextLevel = (level: number): number => {
    if (level < 1) return 100;
    const rank = getRankForLevel(level);
    const xpTable: Record<Rank, number> = {
        [Rank.E]: 100, [Rank.D]: 120, [Rank.C]: 150, [Rank.B]: 200, [Rank.A]: 500, [Rank.S]: 1000,
    };
    return xpTable[rank];
};

export const ATTRIBUTES: Attribute[] = [
  Attribute.Intellect,
  Attribute.Strength,
  Attribute.Agility,
  Attribute.Endurance,
  Attribute.Perception,
];

export const STAT_POINTS_PER_DIFFICULTY: Record<Difficulty, number> = {
  [Difficulty.E]: 1, [Difficulty.D]: 2, [Difficulty.C]: 3, [Difficulty.B]: 5, [Difficulty.A]: 8, [Difficulty.S]: 15, [Difficulty.S_PLUS]: 30, [Difficulty.X]: 0,
};

export const X_RANK_PENALTY_OVERRIDE = 1500; // Edit this to change the Sloth penalty

// --- WORKSHOP & MATERIALS ---
export const MATERIALS = {
    COPPER: 'mat_copper',
    IRON: 'mat_iron',
    ALUMINIUM: 'mat_aluminium',
    FANG: 'mat_beast_fang',
    DIAMOND: 'mat_diamond',
    SHARD: 'mat_brilliant_shard',
    BLOODSTONE: 'mat_bloodstone'
};

export const ENHANCEMENT_REQUIREMENT: Record<Difficulty, number> = {
    [Difficulty.E]: 10,
    [Difficulty.D]: 10,
    [Difficulty.C]: 10,
    [Difficulty.B]: 3,
    [Difficulty.A]: 3,
    [Difficulty.S]: 5,
    [Difficulty.S_PLUS]: 10,
    [Difficulty.X]: 10,
};

export const ADVANCEMENT_TRAITS: Record<Difficulty, number[]> = {
    [Difficulty.B]: [1, 1],
    [Difficulty.A]: [2, 3, 5],
    [Difficulty.S]: [3, 3, 3, 5, 10],
    [Difficulty.S_PLUS]: [5, 5, 8, 10, 15],
    [Difficulty.X]: [10, 10, 10, 10, 10],
    [Difficulty.E]: [], [Difficulty.D]: [], [Difficulty.C]: []
};

// --- SHOP ---
export const RANK_LEVEL_REQUIREMENTS: Record<Difficulty, number> = {
  [Difficulty.E]: 0,
  [Difficulty.D]: 0,
  [Difficulty.C]: 0,
  [Difficulty.B]: 0,
  [Difficulty.A]: 15,
  [Difficulty.S]: 25,
  [Difficulty.S_PLUS]: 50,
  [Difficulty.X]: 50,
};

export const getLevelRequirement = (rank: Difficulty): number => {
    return RANK_LEVEL_REQUIREMENTS[rank] || 0;
}

// --- DUNGEON LEVEL LOCKS ---
export const DUNGEON_LEVEL_REQUIREMENTS: Record<Difficulty, number> = {
  [Difficulty.E]: 1,
  [Difficulty.D]: 5,
  [Difficulty.C]: 10,
  [Difficulty.B]: 15,
  [Difficulty.A]: 30,
  [Difficulty.S]: 50,
  [Difficulty.S_PLUS]: 50,
  [Difficulty.X]: 50,
};

export const DUNGEON_KEYS_PER_DAY = 2;
export const DUNGEON_KEYS_PRO_PER_DAY = 4;
export const AD_BONUS_KEYS_PER_DAY = 2;

export const QUEST_COIN_REWARDS: Record<Difficulty, number> = {
  [Difficulty.E]: 1, [Difficulty.D]: 2, [Difficulty.C]: 3, [Difficulty.B]: 5,
  [Difficulty.A]: 8, [Difficulty.S]: 15, [Difficulty.S_PLUS]: 30, [Difficulty.X]: 0,
};

// --- DUNGEONS ---
export const DUNGEONS: Dungeon[] = [
    // --- E-RANK ---
    { 
        id: 'dungeon_e_01', 
        name: 'Sands of Shadow', 
        grade: Difficulty.E, 
        description: 'Escaping the scorching shadow desert.', 
        previewImage: '/dungeons/dungeon_e_01.png',
        backgroundImage: '/dungeons/dungeon_e_01.png',
        openingImage: '/dungeons/dungeon_e_01.png',
        floors: [
            {
                id: 'f1',
                name: 'Desert Entrance',
                backgroundImage: '/dungeons/dungeon_e_01.png',
                openingImage: '/dungeons/dungeon_e_01.png',
                tasks: [{
                    id: 't1',
                    description: 'Walk 180m through the scorching sand',
                    tracking: { mode: 'distance', distanceMeters: 180, autoComplete: true },
                    attribute: Attribute.Endurance,
                    page: { title: 'Cross the Sand', narrative: 'The sun burns...' }
                }]
            },
            {
                id: 'f2',
                name: 'Dry Oasis',
                backgroundImage: '/dungeons/dungeon_e_01_floor2.png',
                openingImage: '/dungeons/dungeon_e_01_floor2.png',
                tasks: [{
                    id: 't2',
                    description: 'Drink 2 glasses of water',
                    attribute: Attribute.Endurance,
                    page: { title: 'Hydrate', narrative: 'Your throat is dry, but the gate still watches.' }
                }]
            }
        ],
        rewards: { xp: 5 },
        failurePenalty: { xp: 3 }
    },
    { 
        id: 'dungeon_e_02', 
        name: 'Dark Room', 
        grade: Difficulty.E, 
        description: 'Entering the dungeon telports you into a pitch black room, find a light to exit the dungeon.', 
        previewImage: '/dungeons/dungeon_e_02.png',
        backgroundImage: '/dungeons/dungeon_e_02.png',
        openingImage: '/dungeons/dungeon_e_02.png',
        floors: [{
            id: 'f1', name: 'Dark room', 
            backgroundImage: '/dungeons/dungeon_e_02.png',
            openingImage: '/dungeons/dungeon_e_02.png',
            tasks: [{
                id: 't1',
                description: 'Complete 5 push-ups in search of light',
                attribute: Attribute.Strength,
                page: { title: 'Search for Light', narrative: 'Cannot see...' }
            }]
        }],
        rewards: { xp: 4 },
        failurePenalty: { xp: 2 }
    },
    // --- D-RANK ---
    { 
        id: 'dungeon_d_01', 
        name: 'Sniper Goblin\'s Perch', 
        grade: Difficulty.D, 
        description: 'Evade arrows from a high-perched goblin and reach the exit.', 
        previewImage: '/dungeons/dungeon_d_01.png',
        backgroundImage: '/dungeons/dungeon_d_01.png',
        openingImage: '/dungeons/dungeon_d_01.png',
        floors: [{
            id: 'f1', name: 'Goblin Tower',
            backgroundImage: '/dungeons/dungeon_d_01.png',
            openingImage: '/dungeons/dungeon_d_01.png',
            tasks: [{ id: 't1', description: '25 Squats', attribute: Attribute.Strength, page: { title: 'Dodge', narrative: 'Arrows fly...' }}]
        }],
        rewards: { xp: 10 },
        failurePenalty: { xp: 5 }
    },
    { 
        id: 'dungeon_d_02', 
        name: 'Ant wave', 
        grade: Difficulty.D, 
        type: 'standard', 
        description: 'Ants start crawling around your feet. Dodge their attacks.', 
        previewImage: '/dungeons/dungeon_d_02.png',
        backgroundImage: '/dungeons/dungeon_d_02.png',
        openingImage: '/dungeons/dungeon_d_02.png',
        timeLimit: 1200, 
        floors: [{
            id: 'f1', name: 'Ant Tunnel',
            backgroundImage: '/dungeons/dungeon_d_02.png',
            openingImage: '/dungeons/dungeon_d_02.png',
            tasks: [{ id: 't1', description: 'Dodge the ant bites and find the exit', attribute: Attribute.Agility, page: { title: 'Task 1: Complete 40 High Knees', narrative: 'Those bites will sting, perhaps the dungeon ants are poisonous...' }}]
        }], 
        rewards: { xp: 15, coins: QUEST_COIN_REWARDS[Difficulty.D] }
    },
    { 
        id: 'dungeon_d_03', 
        name: 'Laser Trap', 
        grade: Difficulty.D, 
        type: 'standard', 
        description: 'Survive the laser trap.', 
        previewImage: '/dungeons/dungeon_d_03.png',
        backgroundImage: '/dungeons/dungeon_d_03.png',
        openingImage: '/dungeons/dungeon_d_03.png',
        timeLimit: 300, 
        floors: [{
            id: 'f1', name: 'The Laser Trap',
            backgroundImage: '/dungeons/dungeon_d_03.png',
            openingImage: '/dungeons/dungeon_d_03.png',
            tasks: [{ id: 't1', description: 'The laser trap has been activated. Perform 1 set of 30 crunches', attribute: Attribute.Strength, page: { title: 'Task 1: Complete 30 Abdominal Crunches', narrative: 'With each crunch, you are hammering your core into a plate of armor.' }}]
        }], 
        rewards: { xp: 8, coins: QUEST_COIN_REWARDS[Difficulty.D] }
    },
    { 
        id: 'dungeon_d_04', 
        name: 'The Staircase', 
        grade: Difficulty.D, 
        type: 'standard', 
        description: 'You find yourself at the bottom of a seemingly endless staircase. Climb it to find the exit.', 
        previewImage: '/dungeons/dungeon_d_04.png',
        backgroundImage: '/dungeons/dungeon_d_04.png',
        openingImage: '/dungeons/dungeon_d_04.png',
        timeLimit: 300, 
        floors: [{
            id: 'f1', name: 'The Base',
            backgroundImage: '/dungeons/dungeon_d_04.png',
            openingImage: '/dungeons/dungeon_d_04.png',
            tasks: [{ id: 't1', description: 'Climb up 3 floors to find the exit', attribute: Attribute.Strength, page: { title: 'Task 1: Climb Up Three Floors', narrative: 'When will it end...' }}]
        }], 
        rewards: { xp: 12, coins: QUEST_COIN_REWARDS[Difficulty.D] }
    },
    { 
        id: 'dungeon_d_05', 
        name: 'Rock Fall', 
        grade: Difficulty.D, 
        description: 'Run 250m to escape the falling rocks.', 
        previewImage: '/dungeons/dungeon_d_05.png',
        backgroundImage: '/dungeons/dungeon_d_05.png',
        openingImage: '/dungeons/dungeon_d_05.png',
        floors: [{
            id: 'f1', name: 'Rock Fall',
            backgroundImage: '/dungeons/dungeon_d_05.png',
            openingImage: '/dungeons/dungeon_d_05.png',
            tasks: [{ id: 't1', description: '250m Run', tracking: { mode: 'distance', distanceMeters: 250, autoComplete: true }, attribute: Attribute.Agility, page: { title: 'Dodge', narrative: 'Rocks fall...' }}]
        }],
        rewards: { xp: 12 },
        failurePenalty: { xp: 8 }
    },
    // --- C-RANK ---
    { 
        id: 'dungeon_c_01', 
        name: 'Goblin Barracks', 
        grade: Difficulty.C, 
        type: 'standard',
        description: 'A small goblin barracks stands inside a dark dungeon corridor. Fight through the outer yard and break the goblin shield wall to reach the exit.', 
        previewImage: '/dungeons/dungeon_c_01.png',
        backgroundImage: '/dungeons/dungeon_c_01.png',
        openingImage: '/dungeons/dungeon_c_01.png',
        timeLimit: 500,
        floors: [
            {
                id: 'f1', name: 'Outer Yard',
                backgroundImage: '/dungeons/dungeon_c_01.png',
                openingImage: '/dungeons/dungeon_c_01.png',
                tasks: [{
                    id: 't1',
                    description: 'Perform 20 squats',
                    attribute: Attribute.Strength,
                    page: { title: 'Task 1: Push Through the Yard', narrative: 'Goblin scouts rush from every side. Plant your feet and force your way forward.' }
                }]
            },
            {
                id: 'f2', name: 'Shield Wall',
                backgroundImage: '/dungeons/dungeon_c_01_floor_2.png',
                openingImage: '/dungeons/dungeon_c_01_floor_2.png',
                tasks: [{
                    id: 't2',
                    description: 'Perform 1 set of 20 push-ups',
                    attribute: Attribute.Strength,
                    page: { title: 'Task 2: Break the Formation', narrative: 'A line of goblin soldiers blocks the final path. Their shields shake with every rep. Push harder.' }
                }]
            }
        ],
        rewards: { xp: 20, coins: QUEST_COIN_REWARDS[Difficulty.C] },
        failurePenalty: { xp: 20 }
    },
    { 
        id: 'dungeon_c_02', 
        name: 'Goblin Camp Raid', 
        grade: Difficulty.C, 
        type: 'standard',
        description: 'A larger goblin camp spreads through the dungeon ruins. Clear each section.', 
        previewImage: '/dungeons/dungeon_c_02.png',
        backgroundImage: '/dungeons/dungeon_c_02.png',
        openingImage: '/dungeons/dungeon_c_02.png',
        timeLimit: 700,
        floors: [
            {
                id: 'f1', name: 'Outer Patrol',
                backgroundImage: '/dungeons/dungeon_c_02.png',
                openingImage: '/dungeons/dungeon_c_02.png',
                tasks: [{
                    id: 't1',
                    description: 'Perform 40 jumping jacks',
                    attribute: Attribute.Agility,
                    page: { title: 'Task 1: Scatter the Patrol', narrative: 'Goblin scouts rush from the shadows. Move fast and break their rhythm.' }
                }]
            },
            {
                id: 'f2', name: 'Shield Wall',
                backgroundImage: '/dungeons/dungeon_c_02_floor_2.png',
                openingImage: '/dungeons/dungeon_c_02_floor_2.png',
                tasks: [{
                    id: 't2',
                    description: 'Perform 20 push-ups',
                    attribute: Attribute.Strength,
                    page: { title: 'Task 2: Break the Shield Wall', narrative: 'Their wooden shields lock together. Push through the formation.' }
                }]
            },
            {
                id: 'f3', name: 'Archer Escape',
                backgroundImage: '/dungeons/dungeon_c_02_floor_3.png',
                openingImage: '/dungeons/dungeon_c_02_floor_3.png',
                tasks: [{
                    id: 't3',
                    description: 'Perform 10 burpees',
                    attribute: Attribute.Agility,
                    page: { title: 'Task 3: Escape the Arrows', narrative: 'Arrows rain from above. Lift your knees and run.' }
                }]
            }
        ],
        rewards: { xp: 23, coins: QUEST_COIN_REWARDS[Difficulty.C] },
        failurePenalty: { xp: 23 }
    },
    { 
        id: 'dungeon_c_03', 
        name: 'Spider Nest', 
        grade: Difficulty.C, 
        type: 'standard',
        description: 'A web-filled dungeon tunnel crawling with spiders. Escape before the nest fully awakens.', 
        previewImage: '/dungeons/dungeon_c_03.png',
        backgroundImage: '/dungeons/dungeon_c_03.png',
        openingImage: '/dungeons/dungeon_c_03.png',
        timeLimit: 700,
        floors: [
            {
                id: 'f1', name: 'Webbed Ground',
                backgroundImage: '/dungeons/dungeon_c_03.png',
                openingImage: '/dungeons/dungeon_c_03.png',
                tasks: [{
                    id: 't1',
                    description: 'Perform 15 jumping squats',
                    attribute: Attribute.Strength,
                    page: { title: 'Task 1: Hold Your Ground', narrative: 'Webs stick to your feet. keep moving.' }
                }]
            },
            {
                id: 'f2', name: 'Wall Crawlers',
                backgroundImage: '/dungeons/dungeon_c_03_floor_2.png',
                openingImage: '/dungeons/dungeon_c_03_floor_2.png',
                tasks: [{
                    id: 't2',
                    description: 'Perform 10 pike push ups',
                    attributes: [Attribute.Agility, Attribute.Strength],
                    page: { title: 'Task 2: Outrun the Crawlers', narrative: 'Spiders crawl across the walls. Move before they reach you.' }
                }]
            },
            {
                id: 'f3', name: 'Escape Tunnel',
                backgroundImage: '/dungeons/dungeon_c_03_floor_3.png',
                openingImage: '/dungeons/dungeon_c_03_floor_3.png',
                tasks: [{
                    id: 't3',
                    description: 'Perform 20 chair dips',
                    attribute: Attribute.Strength,
                    page: { title: 'Task 3: Core of the Nest', narrative: 'The nest pulses around you. Escape through.' }
                }]
            }
        ],
        rewards: { xp: 25, coins: QUEST_COIN_REWARDS[Difficulty.C] },
        failurePenalty: { xp: 25 }
    },
    { 
        id: 'dungeon_c_04', 
        name: 'Residents of Grave', 
        grade: Difficulty.C, 
        type: 'standard',
        description: 'An abandoned graveyard has appeared inside the gate. The dead are crawling out of their graves.', 
        previewImage: '/dungeons/dungeon_c_04.png',
        backgroundImage: '/dungeons/dungeon_c_04.png',
        openingImage: '/dungeons/dungeon_c_04.png',
        timeLimit: 700,
        floors: [
            {
                id: 'f1', name: 'Restless Graves',
                backgroundImage: '/dungeons/dungeon_c_04.png',
                openingImage: '/dungeons/dungeon_c_04.png',
                tasks: [{
                    id: 't1',
                    description: 'Perform 20 lunges',
                    attribute: Attribute.Strength,
                    page: { title: 'Task 1: Move', narrative: 'The soil shifts beneath you. Hands crawl from the graves. Strengthen your core and resist the dead.' }
                }]
            },
            {
                id: 'f2', name: 'The Dead Chase',
                backgroundImage: '/dungeons/dungeon_c_04_floor_2.png',
                openingImage: '/dungeons/dungeon_c_04_floor_2.png',
                tasks: [{
                    id: 't2',
                    description: 'Run 500m. Fail if pace is slower than 07:00/km',
                    tracking: { mode: 'distance', distanceMeters: 500, autoComplete: true, maxPaceSecondsPerKm: 420 },
                    attributes: [Attribute.Agility, Attribute.Strength],
                    page: { title: 'Task 2: Run 500m', narrative: 'The horde of zombie are comming after you... RUN!!' }
                }]
            },
            {
                id: 'f3', name: 'Cornered',
                backgroundImage: '/dungeons/dungeon_c_04_floor_3.png',
                openingImage: '/dungeons/dungeon_c_04_floor_3.png',
                tasks: [{
                    id: 't3',
                    description: 'Perform 25 push ups',
                    attribute: Attribute.Strength,
                    page: { title: 'Task 3: Perform 25 Push Ups', narrative: 'Some of the dead have cornerd you right before the exit. Kill them and reach the exit.' }
                }]
            }
        ],
        rewards: { xp: 38, coins: QUEST_COIN_REWARDS[Difficulty.C] },
        failurePenalty: { xp: 38 }
    },
    // --- B-RANK ---
    { 
        id: 'dungeon_b_01', 
        name: 'Orc War Hall', 
        grade: Difficulty.B, 
        type: 'standard',
        description: 'A brutal orc war hall filled with armored warriors. Break through their ranks with raw strength.', 
        previewImage: '/dungeons/dungeon_b_01.png',
        backgroundImage: '/dungeons/dungeon_b_01.png',
        openingImage: '/dungeons/dungeon_b_01.png',
        timeLimit: 600,
        floors: [
            {
                id: 'f1', name: 'Orc Grunts',
                backgroundImage: '/dungeons/dungeon_b_01.png',
                openingImage: '/dungeons/dungeon_b_01.png',
                tasks: [{
                    id: 't1',
                    description: 'Perform 30 push-ups',
                    attribute: Attribute.Strength,
                    page: { title: 'Task 1: Crush the Grunts', narrative: 'The first wave charges with rusted blades. Meet them with force.' }
                }]
            },
            {
                id: 'f2', name: 'Orc Mages',
                backgroundImage: '/dungeons/dungeon_b_01_floor_2.png',
                openingImage: '/dungeons/dungeon_b_01_floor_2.png',
                tasks: [{
                    id: 't2',
                    description: 'Perform 30 squats',
                    attribute: Attribute.Strength,
                    page: { title: 'Task 2: Defeat the Orc Mages', narrative: 'Orc mages are getting you cornered. Do not falter.' }
                }]
            },
            {
                id: 'f3', name: 'Orc Chief',
                backgroundImage: '/dungeons/dungeon_b_01_floor_3.png',
                openingImage: '/dungeons/dungeon_b_01_floor_3.png',
                tasks: [{
                    id: 't3',
                    description: 'Perform 30 push ups',
                    attribute: Attribute.Strength,
                    page: { title: 'Task 3: Challenge the War Chief', narrative: 'The orc chief steps forward. Prove your strength is real.' }
                }]
            }
        ],
        rewards: { xp: 40, coins: QUEST_COIN_REWARDS[Difficulty.B] },
        failurePenalty: { xp: 40 }
    },
    { 
        id: 'dungeon_b_02', 
        name: 'Wild Forest', 
        grade: Difficulty.B, 
        type: 'standard',
        description: 'You are lost in a mysterious forest, you must find a way out with caution.', 
        previewImage: '/dungeons/dungeon_b_02.png',
        backgroundImage: '/dungeons/dungeon_b_02.png',
        openingImage: '/dungeons/dungeon_b_02.png',
        timeLimit: 600,
        floors: [
            {
                id: 'f1', name: 'The Search',
                backgroundImage: '/dungeons/dungeon_b_02.png',
                openingImage: '/dungeons/dungeon_b_02.png',
                tasks: [{
                    id: 't1',
                    description: 'Walk or run 500m',
                    tracking: { mode: 'distance', distanceMeters: 500, autoComplete: true },
                    attribute: Attribute.Endurance,
                    page: { title: 'Task 1: Explore the Forest', narrative: 'There is definitely something out there.' }
                }]
            },
            {
                id: 'f2', name: 'Wild Beasts',
                backgroundImage: '/dungeons/dungeon_b_02_floor_2.png',
                openingImage: '/dungeons/dungeon_b_02_floor_2.png',
                tasks: [{
                    id: 't2',
                    description: 'Perform 25 squats',
                    attribute: Attribute.Strength,
                    page: { title: 'Task 2: Defeat the Wild Beasts', narrative: 'Beast pack is attacking in coordination.' }
                }]
            },
            {
                id: 'f3', name: 'Giant Beast',
                backgroundImage: '/dungeons/dungeon_b_02_floor_3.png',
                openingImage: '/dungeons/dungeon_b_02_floor_3.png',
                tasks: [{
                    id: 't3',
                    description: 'Perform 30 push ups',
                    attribute: Attribute.Strength,
                    page: { title: 'Task 3: Defeat the Giant Beast', narrative: 'The giant beast roars.' }
                }]
            }
        ],
        rewards: { xp: 40, coins: QUEST_COIN_REWARDS[Difficulty.B] },
        failurePenalty: { xp: 40 }
    },
    // --- A-RANK ---
    { 
        id: 'dungeon_a_01', 
        name: 'Mystery of Miracle', 
        grade: Difficulty.A, 
        description: 'Escaping toxic fog in a damp cave.', 
        previewImage: '/dungeons/dungeon_a_01.jpg',
        backgroundImage: '/dungeons/dungeon_a_01.jpg',
        openingImage: '/dungeons/dungeon_a_01.jpg',
        floors: [
            { id: 'f1', name: 'Mist Entry', tasks: [{ id: 't1', description: 'plank 2 minutes', page: { title: 'Holding Breath', narrative: 'The air turns thick...' }}]},
            { id: 'f2', name: 'Poison Path', tasks: [{ id: 't2', description: '30 Squats', page: { title: 'Swift Move', narrative: 'Vapors rise...' }}]},
            { id: 'f3', name: 'The Core', tasks: [{ id: 't3', description: '30 push ups ', page: { title: 'The Escape', narrative: 'I can see the light...' }}]}
        ],
        rewards: { xp: 75 },
        failurePenalty: { xp: 100 }
    },
    { 
        id: 'dungeon_a_02', 
        name: 'Orc Attack', 
        grade: Difficulty.A, 
        description: 'Defeat all the Orcs in the dungeon.', 
        previewImage: '/dungeons/dungeon_a_02.jpg',
        backgroundImage: '/dungeons/dungeon_a_02.jpg',
        openingImage: '/dungeons/dungeon_a_02.jpg',
        floors: [
            { id: 'f1', name: 'Orc Goons', tasks: [{ id: 't1', description: 'shadow box 3 minutes 5 rounds', page: { title: '3 groups of Orcs attacks', narrative: 'ambushed...' }}]},
            { id: 'f2', name: 'High Orcs', tasks: [{ id: 't2', description: 'weighted shadow boxing 3mins 3 rounds', page: { title: 'tough situatiom', narrative: 'in a pinch...' }}]},
            { id: 'f3', name: 'Orc Leader', tasks: [{ id: 't3', description: 'heavy bag 3 minutes 5 rounds', page: { title: 'The head Orc', narrative: 'kill...' }}]}
        ],
        rewards: { xp: 225 },
        failurePenalty: { xp: 250 }
    },
    { 
        id: 'dungeon_a_03', 
        name: 'The Volcano\'s Core', 
        grade: Difficulty.A, 
        type: 'standard', 
        description: 'The ground rumbles as you descend into a volcano. The air is scorching, and the floor is unstable. You must reach the summit and escape before it erupts.', 
        previewImage: '/dungeons/dungeon_a_03.jpg',
        backgroundImage: '/dungeons/dungeon_a_03.jpg',
        openingImage: '/dungeons/dungeon_a_03.jpg',
        timeLimit: 900, 
        floors: [
            { id: 'f1', name: 'The Slopes', tasks: [{ id: 't1', description: 'Perform 50 jumping lunges to scale the slippery incline.', attribute: Attribute.Strength, page: { title: 'Task 1: The Ascent', narrative: 'The volcano\'s slope is steep and covered in treacherous ash.' }}]},
            { id: 'f2', name: 'Steam Field', tasks: [{ id: 't2', description: 'Perform 30 squat jumps to evade the scalding steam.', attribute: Attribute.Agility, page: { title: 'Task 2: Steam Vents', narrative: 'The path is riddled with superheated steam vents.' }}]},
            { id: 'f3', name: 'The Summit', tasks: [{ id: 't3', description: 'Sprint for 30 seconds without stopping to outrun the pyroclastic flow.', attribute: Attribute.Agility, page: { title: 'Task 3: The Summit Sprint', narrative: 'The volcano has begun its final eruption!' }}]}
        ],
        rewards: { xp: 75, coins: QUEST_COIN_REWARDS[Difficulty.A] }, 
        failurePenalty: { xp: 50 }
    },
    { 
        id: 'dungeon_a_04', 
        name: 'The Assassin\'s Gauntlet', 
        grade: Difficulty.A, 
        type: 'standard', 
        description: 'You\'ve been dropped into an assassin\'s training gauntlet. Traps are everywhere. Your only hope is to move with inhuman speed and agility.', 
        previewImage: '/dungeons/dungeon_a_04.jpg',
        backgroundImage: '/dungeons/dungeon_a_04.jpg',
        openingImage: '/dungeons/dungeon_a_04.jpg',
        timeLimit: 720, 
        floors: [
            { id: 'f1', name: 'Hall of Blades', tasks: [{ id: 't1', description: '3 minutes of high-intensity shadow boxing to disarm pressure plates', attribute: Attribute.Agility, page: { title: 'Task 1: The Hall of Blades', narrative: 'The floor is a tapestry of pressure plates.' }}]},
            { id: 'f2', name: 'Laser Path', tasks: [{ id: 't2', description: 'Perform 60 seconds of high knees to leap over tripwires', attribute: Attribute.Agility, page: { title: 'Task 2: The Razor Wire', narrative: 'Gleaming wires are strung at shin-height.' }}]},
            { id: 'f3', name: 'Final Chasm', tasks: [{ id: 't3', description: '30 squat jumps to clear a chasm', attribute: Attribute.Strength, page: { title: 'Task 3: The Leap of Faith', narrative: 'The final obstacle is a chasm.' }}]}
        ],
        rewards: { xp: 80, coins: QUEST_COIN_REWARDS[Difficulty.A] }, 
        failurePenalty: { xp: 55 }
    },
    { 
        id: 'dungeon_a_05', 
        name: 'The Wyrm\'s Breath', 
        grade: Difficulty.A, 
        type: 'standard', 
        description: 'A great wyrm guards the path. It unleashes a torrent of fire, forcing you to constantly move. This is a pure test of agility and stamina.', 
        previewImage: '/dungeons/dungeon_a_05.jpg',
        backgroundImage: '/dungeons/dungeon_a_05.jpg',
        openingImage: '/dungeons/dungeon_a_05.jpg',
        timeLimit: 600, 
        floors: [
            { id: 'f1', name: 'The Scorched Path', tasks: [{ id: 't1', description: 'Complete 3 rounds of: 10 burpees, 20 mountain climbers.', attribute: Attribute.Agility, page: { title: 'Task 1: The First Salvo', narrative: 'The wyrm unleashes its first wave of fire.' }}]},
            { id: 'f2', name: 'The Inferno', tasks: [{ id: 't2', description: 'Complete 3 rounds of: 15 jumping squats, 10 push-ups.', attribute: Attribute.Agility, page: { title: 'Task 2: The Inferno', narrative: 'Angered, the wyrm floods the area with fire.' }}]},
            { id: 'f3', name: 'The Final Breach', tasks: [{ id: 't3', description: 'Survive for 2 minutes by performing continuous shuttle sprints.', attribute: Attribute.Agility, page: { title: 'Task 3: The Final Barrage', narrative: 'The wyrm makes a final, desperate attempt to incinerate you.' }}]}
        ],
        rewards: { xp: 110, coins: QUEST_COIN_REWARDS[Difficulty.A] }, 
        failurePenalty: { xp: 60 }
    },
    { 
        id: 'dungeon_a_06', 
        name: 'The Berserker\'s Rage', 
        grade: Difficulty.A, 
        type: 'standard', 
        description: 'You\'ve consumed a berserker\'s brew. A wave of uncontrollable energy fills you. You must expend it through intense physical exertion before it consumes you.', 
        previewImage: '/dungeons/dungeon_a_06.jpg',
        backgroundImage: '/dungeons/dungeon_a_06.jpg',
        openingImage: '/dungeons/dungeon_a_06.jpg',
        timeLimit: 900, 
        floors: [
            { id: 'f1', name: 'Primal Burst', tasks: [{ id: 't1', description: 'Perform 50 kettlebell swings (or dumbbell swings/burpees) to begin expending the raw energy.', attribute: Attribute.Strength, page: { title: 'Task 1: The Boiling Blood', narrative: 'The rage begins to build, a fire in your veins.' }}]},
            { id: 'f2', name: 'Unchained Fury', tasks: [{ id: 't2', description: 'Perform 3 sets of maximum-repetition push-ups, with only 30 seconds rest between sets.', attribute: Attribute.Strength, page: { title: 'Task 2: The Unchained Fury', narrative: 'The brew takes full effect. You feel an urge to destroy.' }}]},
            { id: 'f3', name: 'Rage Burnout', tasks: [{ id: 't3', description: 'Perform a 100-meter sprint at maximum effort to fully burn out the rage.', tracking: { mode: 'distance', distanceMeters: 100, autoComplete: true }, attribute: Attribute.Agility, page: { title: 'Task 3: The Final Howl', narrative: 'The rage is almost spent. PURGE IT.' }}]}
        ],
        rewards: { xp: 130, coins: QUEST_COIN_REWARDS[Difficulty.A] }, 
        failurePenalty: { xp: 50 }
    },
    { 
        id: 'dungeon_a_07', 
        name: 'The Gravity Well', 
        grade: Difficulty.A, 
        type: 'standard', 
        description: 'You are caught in a gravity well that threatens to crush you. Only by generating immense upward force can you hope to escape its pull.', 
        previewImage: '/dungeons/dungeon_a_07.jpg',
        backgroundImage: '/dungeons/dungeon_a_07.jpg',
        openingImage: '/dungeons/dungeon_a_07.jpg',
        timeLimit: 720, 
        floors: [
            { id: 'f1', name: 'Crushing Weight', tasks: [{ id: 't1', description: 'Perform 100 weighted calf raises (or 200 bodyweight) to fight against the initial pull.', attribute: Attribute.Strength, page: { title: 'Task 1: Resisting the Pull', narrative: 'The gravity well pulls at you, trying to root you to the ground.' }}]},
            { id: 'f2', name: 'Escape Velocity', tasks: [{ id: 't2', description: 'Perform 50 box jumps (or tuck jumps) to generate explosive upward force.', attribute: Attribute.Agility, page: { title: 'Task 2: Upward Burst', narrative: 'You need to generate escape velocity.' }}]},
            { id: 'f3', name: 'The Breakout', tasks: [{ id: 't3', description: 'Perform 50 burpees to create a final, full-body shockwave to break free.', attribute: Attribute.Endurance, page: { title: 'Task 3: The Final Push', narrative: 'A final, full-body shockwave is needed to shatter the well\'s hold.' }}]}
        ],
        rewards: { xp: 85, coins: QUEST_COIN_REWARDS[Difficulty.A] }, 
        failurePenalty: { xp: 70 }
    },
    { 
        id: 'dungeon_a_08', 
        name: 'The Final Stand', 
        grade: Difficulty.A, 
        type: 'standard', 
        description: 'The horde is endless. Your back is against the wall. This is your final stand. Fight until you have nothing left.', 
        previewImage: '/dungeons/dungeon_a_08.jpg',
        backgroundImage: '/dungeons/dungeon_a_08.jpg',
        openingImage: '/dungeons/dungeon_a_08.jpg',
        timeLimit: 1200, 
        floors: [
            { id: 'f1', name: 'The Outer Wall', tasks: [{ id: 't1', description: 'Survive the first 5 minutes by completing 50 push-ups.', attribute: Attribute.Strength, page: { title: 'Task 1: The Vanguard', narrative: 'The first wave of the horde crashes against your position.' }}]},
            { id: 'f2', name: 'The Courtyard', tasks: [{ id: 't2', description: 'Survive the next 7 minutes by completing 100 squats.', attribute: Attribute.Strength, page: { title: 'Task 2: The Elites', narrative: 'Heavily armored elites have joined the fray.' }}]},
            { id: 'f3', name: 'The Keep', tasks: [{ id: 't3', description: 'Survive the final 8 minutes by completing 25 pull-ups (or 50 inverted rows).', attribute: Attribute.Strength, page: { title: 'Task 3: The General', narrative: 'The enemy general has appeared. This is the final push.' }}]}
        ],
        rewards: { xp: 250, coins: QUEST_COIN_REWARDS[Difficulty.A] }, 
        failurePenalty: { xp: 80 }
    },
    // --- S-RANK ---
    { 
        id: 'dungeon_s_01', 
        name: 'Grim Reaper', 
        grade: Difficulty.S, 
        description: 'Outrunning death itself.', 
        previewImage: '/dungeons/dungeon_s_01.jpg',
        backgroundImage: '/dungeons/dungeon_s_01.jpg',
        openingImage: '/dungeons/dungeon_s_01.jpg',
        floors: [
            { id: 'f1', name: 'Chamber of Silence', tasks: [{ id: 't1', description: '3km Run nonstop no music', tracking: { mode: 'distance', distanceMeters: 3000, autoComplete: true }, attribute: Attribute.Endurance, page: { title: 'Whispers', narrative: 'its easy to quit...' }}]},
            { id: 'f2', name: 'End of the tunnel', tasks: [{ id: 't2', description: '100m sprint', tracking: { mode: 'distance', distanceMeters: 100, autoComplete: true }, attribute: Attribute.Agility, page: { title: 'the light', narrative: 'final push...' }}]},
        ],
        rewards: { xp: 450 },
        failurePenalty: { xp: 600 }
    }
];

export const SHOP_ITEMS: ShopItem[] = [
    // Helmets
    { id: 'helm_rogue', name: 'Rogue Helmet', type: 'Gear', slot: 'helmet', rank: Difficulty.C, bonusXp: 1, effectDescription: "Basic equipment.", cost: 100 },
    { id: 'helm_iron', name: 'Iron Helmet', type: 'Gear', slot: 'helmet', rank: Difficulty.B, bonusXp: 2, effectDescription: "Decent gear.", cost: 250 },
    { id: 'helm_shadow', name: 'Shadow Helmet', type: 'Gear', slot: 'helmet', rank: Difficulty.A, bonusXp: 3, effectDescription: "Forged with dark metals.", cost: 500 },
    { id: 'helm_light', name: 'Brilliant Light Helmet', type: 'Gear', slot: 'helmet', rank: Difficulty.S, bonusXp: 3, effectDescription: "Forged with the highest caliber of metals and gold.", cost: 1200, diamondCost: 10 },
    
    // Armor
    { id: 'armor_rogue', name: 'Rogue Armor', type: 'Gear', slot: 'armor', rank: Difficulty.C, bonusXp: 1, effectDescription: "Basic equipment.", cost: 100 },
    { id: 'armor_iron', name: 'Iron Armor', type: 'Gear', slot: 'armor', rank: Difficulty.B, bonusXp: 2, effectDescription: "Decent gear.", cost: 250 },
    { id: 'armor_shadow', name: 'Shadow Armor', type: 'Gear', slot: 'armor', rank: Difficulty.A, bonusXp: 5, effectDescription: "Forged with dark metals.", cost: 500 },
    { id: 'armor_light', name: 'Brilliant Light Armor', type: 'Gear', slot: 'armor', rank: Difficulty.S, bonusXp: 15, effectDescription: "Forged with the highest caliber of metals and gold.", cost: 1200, diamondCost: 10 },
    { id: 'armor_berserker', name: 'Berserker Armor', type: 'Gear', slot: 'armor', rank: Difficulty.X, bonusXp: 0, effectDescription: "CURSED. CRAVES BLOOD AND ATTRACTS EVIL. Significantly increases penalty but offers greater bonuses. Cannot be removed normally.", cost: 2200, diamondCost: 50 },
     
    // Gloves
    { id: 'gloves_rogue', name: 'Rogue Gloves', type: 'Gear', slot: 'gloves', rank: Difficulty.C, bonusXp: 1, effectDescription: "Basic equipment.", cost: 100 },
    { id: 'gloves_iron', name: 'Iron Gloves', type: 'Gear', slot: 'gloves', rank: Difficulty.B, bonusXp: 2, effectDescription: "Decent gear.", cost: 250 },
    { id: 'gloves_shadow', name: 'Shadow Gloves', type: 'Gear', slot: 'gloves', rank: Difficulty.A, bonusXp: 4, effectDescription: "Forged with dark metals.", cost: 500 },
    { id: 'gloves_light', name: 'Brilliant Light Gloves', type: 'Gear', slot: 'gloves', rank: Difficulty.S, bonusXp: 12, effectDescription: "Forged with the highest caliber of metals and gold.", cost: 1200, diamondCost: 10 },
    
    // Boots
    { id: 'boots_rogue', name: 'Rogue Boots', type: 'Gear', slot: 'boots', rank: Difficulty.C, bonusXp: 1, effectDescription: "Basic equipment.", cost: 100 },
    { id: 'boots_iron', name: 'Iron Boots', type: 'Gear', slot: 'boots', rank: Difficulty.B, bonusXp: 2, effectDescription: "Decent gear.", cost: 250 },
    { id: 'boots_shadow', name: 'Shadow Boots', type: 'Gear', slot: 'boots', rank: Difficulty.A, bonusXp: 4, effectDescription: "Forged with dark metals.", cost: 500 },
    { id: 'boots_light', name: 'Brilliant Light Boots', type: 'Gear', slot: 'boots', rank: Difficulty.S, bonusXp: 12, effectDescription: "Forged with the highest caliber of metals and gold.", cost: 1200, diamondCost: 10 },
    
    // Special Gear
    { id: 'gear_shadow', name: 'Shadow Sword', type: 'Gear', slot: 'gear', rank: Difficulty.A, bonusXp: 4, effectDescription: "Forged with dark metals.", cost: 700 },
    { id: 'gear_light', name: 'Brilliant Light Sword', type: 'Gear', slot: 'gear', rank: Difficulty.S, bonusXp: 12, effectDescription: "Forged with the highest caliber of metals and gold.", cost: 1500, diamondCost: 10 },
    { id: 'gear_dragon_slayer', name: 'Dragon Slayer', type: 'Gear', slot: 'gear', rank: Difficulty.S_PLUS, bonusXp: 50, effectDescription: "Forged with the malice of slain spirits.", cost: 3000, diamondCost: 50 },
    
    // Items
    { id: 'brilliant_light_orb', name: 'Brilliant Light Orb', type: 'Potion', rank: Difficulty.S, effectDescription: "Used to Uplift Berserker Gear curse.", cost: 2000 },
];

export const TITLES: Record<string, Title> = {
    'title_s_the_relentless': { id: 'title_s_the_relentless', name: 'The Relentless', rank: Difficulty.S },
};

export const ACHIEVEMENTS_DATA: Record<string, Achievement> = {
    'lvl_10': { id: 'lvl_10', name: 'Novice', description: 'Reach Level 10.', rank: Difficulty.E, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'REACH_LEVEL', rewardCoins: 100 },
    'lvl_15': { id: 'lvl_15', name: 'Rookie Hunter', description: 'Reach Level 15.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 15, type: 'REACH_LEVEL', rewardCoins: 150 },
    'lvl_20': { id: 'lvl_20', name: 'Tough Cookie', description: 'Reach Level 20.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 20, type: 'REACH_LEVEL', rewardCoins: 300 },
    'lvl_25': { id: 'lvl_25', name: 'Fighter', description: 'Reach Level 25.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'REACH_LEVEL', rewardCoins: 500 },
    'lvl_30': { id: 'lvl_30', name: 'Epic hunter', description: 'Reach Level 30.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 30, type: 'REACH_LEVEL', rewardCoins: 800 },
    'lvl_40': { id: 'lvl_40', name: 'Hitman', description: 'Reach Level 40.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 40, type: 'REACH_LEVEL', rewardCoins: 1000 },
    'lvl_50': { id: 'lvl_50', name: 'Hero', description: 'Reach Level 50.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'REACH_LEVEL', rewardCoins: 1250 },
    'lvl_60': { id: 'lvl_60', name: 'Discipline', description: 'Reach Level 60.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 60, type: 'REACH_LEVEL', rewardCoins: 1500 },
    'lvl_70': { id: 'lvl_70', name: 'Pushing Past Limits', description: 'Reach Level 70.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 70, type: 'REACH_LEVEL', rewardCoins: 2000 },
    'lvl_80': { id: 'lvl_80', name: 'Elite Hunter', description: 'Reach Level 80.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 80, type: 'REACH_LEVEL', rewardCoins: 2250 },
    'lvl_90': { id: 'lvl_90', name: 'Warrior', description: 'Reach Level 90.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 90, type: 'REACH_LEVEL', rewardCoins: 2500 },
    'lvl_100': { id: 'lvl_100', name: 'Pinnacle', description: 'Reach Level 100.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'REACH_LEVEL', rewardCoins: 5000, titleReward: 'title_s_the_relentless' },
    
    // E Rank Quests
    'q_e_10': { id: 'q_e_10', name: 'Novice Contractor I', description: 'Complete 10 E-Rank Quests.', rank: Difficulty.E, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.E }, rewardCoins: 10 },
    'q_e_30': { id: 'q_e_30', name: 'Novice Contractor II', description: 'Complete 30 E-Rank Quests.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 30, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.E }, rewardCoins: 25 },
    'q_e_50': { id: 'q_e_50', name: 'Novice Contractor III', description: 'Complete 50 E-Rank Quests.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.E }, rewardCoins: 50 },
    'q_e_100': { id: 'q_e_100', name: 'Novice Contractor IV', description: 'Complete 100 E-Rank Quests.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.E }, rewardCoins: 150 },

    // D Rank Quests
    'q_d_10': { id: 'q_d_10', name: 'Consistent Hunter I', description: 'Complete 10 D-Rank Quests.', rank: Difficulty.E, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.D }, rewardCoins: 15 },
    'q_d_30': { id: 'q_d_30', name: 'Consistent Hunter II', description: 'Complete 30 D-Rank Quests.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 30, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.D }, rewardCoins: 35 },
    'q_d_50': { id: 'q_d_50', name: 'Consistent Hunter III', description: 'Complete 50 D-Rank Quests.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.D }, rewardCoins: 60 },
    'q_d_100': { id: 'q_d_100', name: 'Consistent Hunter IV', description: 'Complete 100 D-Rank Quests.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.D }, rewardCoins: 200 },

    // C Rank Quests
    'q_c_10': { id: 'q_c_10', name: 'Solid Core I', description: 'Complete 10 C-Rank Quests.', rank: Difficulty.E, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.C }, rewardCoins: 20 },
    'q_c_25': { id: 'q_c_25', name: 'Solid Core II', description: 'Complete 25 C-Rank Quests.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.C }, rewardCoins: 50 },
    'q_c_50': { id: 'q_c_50', name: 'Solid Core III', description: 'Complete 50 C-Rank Quests.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.C }, rewardCoins: 75 },
    'q_c_75': { id: 'q_c_75', name: 'Solid Core IV', description: 'Complete 75 C-Rank Quests.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 75, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.C }, rewardCoins: 100 },
    'q_c_100': { id: 'q_c_100', name: 'Solid Core V', description: 'Complete 100 C-Rank Quests.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.C }, rewardCoins: 200 },

    // B Rank Quests
    'q_b_10': { id: 'q_b_10', name: 'Tenacious Will I', description: 'Complete 10 B-Rank Quests.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.B }, rewardCoins: 30 },
    'q_b_25': { id: 'q_b_25', name: 'Tenacious Will II', description: 'Complete 25 B-Rank Quests.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.B }, rewardCoins: 60 },
    'q_b_50': { id: 'q_b_50', name: 'Tenacious Will III', description: 'Complete 50 B-Rank Quests.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.B }, rewardCoins: 100 },
    'q_b_75': { id: 'q_b_75', name: 'Tenacious Will IV', description: 'Complete 75 B-Rank Quests.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 75, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.B }, rewardCoins: 150 },
    'q_b_100': { id: 'q_b_100', name: 'Tenacious Will V', description: 'Complete 100 B-Rank Quests.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.B }, rewardCoins: 300 },

    // A Rank Quests
    'q_a_10': { id: 'q_a_10', name: 'Iron Discipline I', description: 'Complete 10 A-Rank Quests.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.A }, rewardCoins: 50 },
    'q_a_25': { id: 'q_a_25', name: 'Iron Discipline II', description: 'Complete 25 A-Rank Quests.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.A }, rewardCoins: 100 },
    'q_a_50': { id: 'q_a_50', name: 'Iron Discipline III', description: 'Complete 50 A-Rank Quests.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.A }, rewardCoins: 150 },
    'q_a_75': { id: 'q_a_75', name: 'Iron Discipline IV', description: 'Complete 75 A-Rank Quests.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 75, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.A }, rewardCoins: 250 },
    'q_a_100': { id: 'q_a_100', name: 'Iron Discipline V', description: 'Complete 100 A-Rank Quests.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.A }, rewardCoins: 550 },

    // S Rank Quests
    'q_s_10': { id: 'q_s_10', name: 'Pinnacle Seeker I', description: 'Complete 10 S-Rank Quests.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S }, rewardCoins: 100 },
    'q_s_25': { id: 'q_s_25', name: 'Pinnacle Seeker II', description: 'Complete 25 S-Rank Quests.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S }, rewardCoins: 200 },
    'q_s_50': { id: 'q_s_50', name: 'Pinnacle Seeker III', description: 'Complete 50 S-Rank Quests.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S }, rewardCoins: 550 },
    'q_s_75': { id: 'q_s_75', name: 'Pinnacle Seeker IV', description: 'Complete 75 S-Rank Quests.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 75, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S }, rewardCoins: 850 },
    'q_s_100': { id: 'q_s_100', name: 'Pinnacle Seeker V', description: 'Complete 100 S-Rank Quests.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S }, rewardCoins: 1250 },

    // S+ Rank Quests
    'q_sp_10': { id: 'q_sp_10', name: 'Unyielding Monarch I', description: 'Complete 10 S+-Rank Quests.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S_PLUS }, rewardCoins: 150 },
    'q_sp_25': { id: 'q_sp_25', name: 'Unyielding Monarch II', description: 'Complete 25 S+-Rank Quests.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S_PLUS }, rewardCoins: 300 },
    'q_sp_50': { id: 'q_sp_50', name: 'Unyielding Monarch III', description: 'Complete 50 S+-Rank Quests.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S_PLUS }, rewardCoins: 500 },
    'q_sp_75': { id: 'q_sp_75', name: 'Unyielding Monarch IV', description: 'Complete 75 S+-Rank Quests.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 75, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S_PLUS }, rewardCoins: 1000 },
    'q_sp_100': { id: 'q_sp_100', name: 'Unyielding Monarch V', description: 'Complete 100 S+-Rank Quests.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'COMPLETE_QUEST', meta: { difficulty: Difficulty.S_PLUS }, rewardCoins: 1500 },

    // Dungeons Total
    'd_total_10': { id: 'd_total_10', name: 'Gate Breaker I', description: 'Complete 10 Dungeons.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'CLEAR_DUNGEON', rewardCoins: 250 },
    'd_total_30': { id: 'd_total_30', name: 'Gate Breaker II', description: 'Complete 30 Dungeons.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 30, type: 'CLEAR_DUNGEON', rewardCoins: 450 },
    'd_total_50': { id: 'd_total_50', name: 'Gate Breaker III', description: 'Complete 50 Dungeons.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'CLEAR_DUNGEON', rewardCoins: 700 },
    'd_total_100': { id: 'd_total_100', name: 'Gate Breaker IV', description: 'Complete 100 Dungeons.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'CLEAR_DUNGEON', rewardCoins: 1200 },

    // A Rank Dungeons
    'd_a_10': { id: 'd_a_10', name: 'Expert Raider I', description: 'Complete 10 A-Rank Dungeons.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'CLEAR_DUNGEON', meta: { grade: Difficulty.A }, rewardCoins: 200 },
    'd_a_30': { id: 'd_a_30', name: 'Expert Raider II', description: 'Complete 30 A-Rank Dungeons.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 30, type: 'CLEAR_DUNGEON', meta: { grade: Difficulty.A }, rewardCoins: 450 },
    'd_a_50': { id: 'd_a_50', name: 'Expert Raider III', description: 'Complete 50 A-Rank Dungeons.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'CLEAR_DUNGEON', meta: { grade: Difficulty.A }, rewardCoins: 850 },

    // S Rank Dungeons
    'd_s_5': { id: 'd_s_5', name: 'Legendary Hunter I', description: 'Complete 5 S-Rank Dungeons.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 5, type: 'CLEAR_DUNGEON', meta: { grade: Difficulty.S }, rewardCoins: 300 },
    'd_s_10': { id: 'd_s_10', name: 'Legendary Hunter II', description: 'Complete 10 S-Rank Dungeons.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'CLEAR_DUNGEON', meta: { grade: Difficulty.S }, rewardCoins: 700 },
    'd_s_25': { id: 'd_s_25', name: 'Legendary Hunter III', description: 'Complete 25 S-Rank Dungeons.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'CLEAR_DUNGEON', meta: { grade: Difficulty.S }, rewardCoins: 1000 },

    // Weapon Ownership
    'own_s_1': { id: 'own_s_1', name: 'Elite Arsenal I', description: 'Own one S-Grade Weapon.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 1, type: 'OWN_GEAR', meta: { grade: Difficulty.S }, rewardCoins: 150 },
    'own_s_3': { id: 'own_s_3', name: 'Elite Arsenal II', description: 'Own three S-Grade Weapons.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 3, type: 'OWN_GEAR', meta: { grade: Difficulty.S }, rewardCoins: 500 },
    'own_sp_1': { id: 'own_sp_1', name: 'Aura', description: 'Own one S+-Grade Weapon.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 1, type: 'OWN_GEAR', meta: { grade: Difficulty.S_PLUS }, rewardCoins: 250 },
    'own_x_1': { id: 'own_x_1', name: 'Cursed Relic', description: 'Own one X-Grade Weapon.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 1, type: 'OWN_GEAR', meta: { grade: Difficulty.X }, rewardCoins: 250 },

    // Advancement Weapons
    'adv_gear_3': { id: 'adv_gear_3', name: 'Blacksmith Novice', description: 'Advance Weapons 3 times.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 3, type: 'ADVANCE_GEAR', rewardCoins: 500 },
    'adv_gear_5': { id: 'adv_gear_5', name: 'Blacksmith Apprentice', description: 'Advance Weapons 5 times.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 5, type: 'ADVANCE_GEAR', rewardCoins: 1000 },
    'adv_gear_10': { id: 'adv_gear_10', name: 'Skilled Artisan', description: 'Advance Weapons 10 times.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'ADVANCE_GEAR', rewardCoins: 2000 },
    'adv_gear_25': { id: 'adv_gear_25', name: 'Master Craftsman', description: 'Advance Weapons 25 times.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'ADVANCE_GEAR', rewardCoins: 3550 },
    'adv_gear_50': { id: 'adv_gear_50', name: 'Legendary Smith', description: 'Advance Weapons 50 times.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'ADVANCE_GEAR', rewardCoins: 5000 },

    // Skill Training
    'train_skill_10': { id: 'train_skill_10', name: 'Novice Monk I', description: 'Train Skills 10 times.', rank: Difficulty.E, isUnlocked: false, unlockDate: null, progress: 0, goal: 10, type: 'TRAIN_SKILL', rewardCoins: 30 },
    'train_skill_50': { id: 'train_skill_50', name: 'Novice Monk II', description: 'Train Skills 50 times.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'TRAIN_SKILL', rewardCoins: 50 },
    'train_skill_100': { id: 'train_skill_100', name: 'Focused Soul I', description: 'Train Skills 100 times.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'TRAIN_SKILL', rewardCoins: 150 },
    'train_skill_200': { id: 'train_skill_200', name: 'Focused Soul II', description: 'Train Skills 200 times.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 200, type: 'TRAIN_SKILL', rewardCoins: 250 },
    'train_skill_350': { id: 'train_skill_350', name: 'Meditation Master I', description: 'Train Skills 350 times.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 350, type: 'TRAIN_SKILL', rewardCoins: 550 },
    'train_skill_500': { id: 'train_skill_500', name: 'Meditation Master II', description: 'Train Skills 500 times.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 500, type: 'TRAIN_SKILL', rewardCoins: 750 },
    'train_skill_1000': { id: 'train_skill_1000', name: 'Enlightened One', description: 'Train Skills 1000 times.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 1000, type: 'TRAIN_SKILL', rewardCoins: 1000 },

    // Skill Advancement (Ascension)
    'adv_skill_5': { id: 'adv_skill_5', name: 'Breaking Limits I', description: 'Advance Skills 5 times.', rank: Difficulty.D, isUnlocked: false, unlockDate: null, progress: 0, goal: 5, type: 'ADVANCE_SKILL', rewardCoins: 250 },
    'adv_skill_25': { id: 'adv_skill_25', name: 'Breaking Limits II', description: 'Advance Skills 25 times.', rank: Difficulty.C, isUnlocked: false, unlockDate: null, progress: 0, goal: 25, type: 'ADVANCE_SKILL', rewardCoins: 550 },
    'adv_skill_50': { id: 'adv_skill_50', name: 'Breaking Limits III', description: 'Advance Skills 50 times.', rank: Difficulty.B, isUnlocked: false, unlockDate: null, progress: 0, goal: 50, type: 'ADVANCE_SKILL', rewardCoins: 1250 },
    'adv_skill_100': { id: 'adv_skill_100', name: 'Breaking Limits IV', description: 'Advance Skills 100 times.', rank: Difficulty.A, isUnlocked: false, unlockDate: null, progress: 0, goal: 100, type: 'ADVANCE_SKILL', rewardCoins: 2350 },
    'adv_skill_250': { id: 'adv_skill_250', name: 'Breaking Limits V', description: 'Advance Skills 250 times.', rank: Difficulty.S, isUnlocked: false, unlockDate: null, progress: 0, goal: 250, type: 'ADVANCE_SKILL', rewardCoins: 3850 },
    'adv_skill_500': { id: 'adv_skill_500', name: 'Transcendent Entity', description: 'Advance Skills 500 times.', rank: Difficulty.S_PLUS, isUnlocked: false, unlockDate: null, progress: 0, goal: 500, type: 'ADVANCE_SKILL', rewardCoins: 1250 },
}; 

export const SYSTEM_QUESTS: Quest[] = [
    // E Rank
    { id: 'sys_e_01', name: 'WALKING', difficulty: Difficulty.E, attributes: [Attribute.Endurance], description: "THE START OF A JOURNEY.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_e_02', name: 'WARM UP', difficulty: Difficulty.E, attributes: [Attribute.Endurance], description: "5-10 MINUTES OF WARM UP TO PREPARE FOR THE FIGHTS AHEAD.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_run_01', name: 'RUN QUEST', difficulty: Difficulty.E, attributes: [Attribute.Endurance, Attribute.Agility], description: "START A GPS TRACKED RUN. FINAL GRADE IS BASED ON DISTANCE AND PACE.", type: 'repetitive', questMode: 'distance', isSystemQuest: true },
    // D Rank
    { id: 'sys_d_01', name: '15 PUSH UPS', difficulty: Difficulty.D, attributes: [Attribute.Strength], description: "COMPLETE 15 PUSH UPS IN GOOD FORM.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_d_02', name: 'DEAD HANG 30SEC', difficulty: Difficulty.D, attributes: [Attribute.Endurance], description: "HOLD THE DEAD HANG FOR 30 SECONDS.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_d_03', name: 'CRUNCHES 25', difficulty: Difficulty.D, attributes: [Attribute.Strength], description: "PERFORM 25 ABDOMINAL CRUNCHES.", type: 'repetitive', isSystemQuest: true },
    // C Rank
    { id: 'sys_c_01', name: 'PUSH UPS 25', difficulty: Difficulty.C, attributes: [Attribute.Strength], description: "COMPLETE 25 PUSH UPS IN GOOD FORM.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_c_02', name: 'PULL UPS 10', difficulty: Difficulty.C, attributes: [Attribute.Strength], description: "COMPLETE 10 PULL UPS.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_c_03', name: 'PLANK 60 SEC', difficulty: Difficulty.C, attributes: [Attribute.Endurance, Attribute.Strength], description: "HOLD PLANK FOR 60 SECONDS.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_c_04', name: 'SQUATS 20', difficulty: Difficulty.C, attributes: [Attribute.Strength], description: "PERFORM 20 SQUATS.", type: 'repetitive', isSystemQuest: true },
    // B Rank
    { id: 'sys_b_01', name: 'STUDY 1HR', difficulty: Difficulty.B, attributes: [Attribute.Intellect], description: "SEEK KNOWLEDGE OF ANY KIND FOR AN HOUR.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_b_02', name: 'PUSH UPS 50', difficulty: Difficulty.B, attributes: [Attribute.Strength], description: "COMPLETE 50 PUSH UPS IN GOOD FORM.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_b_03', name: 'SQUATS 50', difficulty: Difficulty.B, attributes: [Attribute.Strength], description: "PERFORM 50 SQUATS.", type: 'repetitive', isSystemQuest: true },
    // A Rank
    { id: 'sys_a_01', name: 'PUSH UPS 75', difficulty: Difficulty.A, attributes: [Attribute.Strength], description: "COMPLETE 75 PUSH UPS IN GOOD FORM.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_a_02', name: 'SQUATS 75', difficulty: Difficulty.A, attributes: [Attribute.Strength], description: "PERFORM 75 SQUATS.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_a_03', name: '40 BURPEES', difficulty: Difficulty.A, attributes: [Attribute.Strength], description: "PERFORM 40 BURPEES.", type: 'repetitive', isSystemQuest: true },
    // S Rank
    { id: 'sys_s_01', name: 'PUSH UPS 100', difficulty: Difficulty.S, attributes: [Attribute.Strength], description: "COMPLETE 100 PUSH UPS IN GOOD FORM.", type: 'repetitive', isSystemQuest: true },
    { id: 'sys_s_02', name: 'SQUATS 100', difficulty: Difficulty.S, attributes: [Attribute.Strength], description: "PERFORM 100 SQUATS.", type: 'repetitive', isSystemQuest: true },
    // Special Rank
    { id: 'sys_x_01', name: 'SLOTH-GLUTTONY', difficulty: Difficulty.X, attributes: [], description: "An uncontrollable temptation boils within. You can only succumb to it. There is no victory, only the aftermath.", failurePenalty: { xp: 250 }, type: 'repetitive', isSystemQuest: true },
];

export const TRAINING_PER_HALF_STAR: Record<Difficulty, number> = { [Difficulty.E]: 3, [Difficulty.D]: 4, [Difficulty.C]: 5, [Difficulty.B]: 8, [Difficulty.A]: 12, [Difficulty.S]: 20, [Difficulty.S_PLUS]: 30, [Difficulty.X]: 999 };
export const SKILL_UNLOCK_REQUIREMENTS: Record<Difficulty, number> = { [Difficulty.E]: 8, [Difficulty.D]: 10, [Difficulty.C]: 12, [Difficulty.B]: 15, [Difficulty.A]: 20, [Difficulty.S]: 30, [Difficulty.S_PLUS]: 50, [Difficulty.X]: 999 };
export const XP_FOR_SKILL_UNLOCK: Record<Difficulty, number> = { [Difficulty.E]: 50, [Difficulty.D]: 80, [Difficulty.C]: 120, [Difficulty.B]: 150, [Difficulty.A]: 250, [Difficulty.S]: 500, [Difficulty.S_PLUS]: 750, [Difficulty.X]: 0 };
export const XP_FOR_SKILL_ASCENSION: Record<Difficulty, number> = { [Difficulty.E]: 10, [Difficulty.D]: 12, [Difficulty.C]: 15, [Difficulty.B]: 22, [Difficulty.A]: 35, [Difficulty.S]: 50, [Difficulty.S_PLUS]: 0, [Difficulty.X]: 0 };

// --- MISSING CONSTANTS FOR DAILY QUESTS AND SAGAS ---

export const DAILY_XP_GOAL = 100;
export const DAILY_QUEST_PENALTY = 50;
export const STREAK_BONUS_XP = 20;

export const SAGAS: Saga[] = [];

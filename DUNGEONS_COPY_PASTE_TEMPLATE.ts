// COPY-PASTE DUNGEON TEMPLATE
// Edit this text and paste it back into chat.
// You can change names, descriptions, image paths, floors, tasks, rewards, and penalties.
// For GPS dungeon tasks, use: tracking: { mode: 'distance', distanceMeters: 500, autoComplete: true }
// Keep ids unique. Image files should go in public/dungeons.

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
        name: 'Residents of the Grave', 
        grade: Difficulty.C, 
        description: 'Kill the undead.', 
        previewImage: '/dungeons/dungeon_c_01.jpg',
        backgroundImage: '/dungeons/dungeon_c_01.jpg',
        openingImage: '/dungeons/dungeon_c_01.jpg',
        floors: [{
            id: 'f1', name: 'Graveyard',
            tasks: [{ id: 't1', description: 'Shadow box 3 mins', page: { title: 'First Wave', narrative: 'Bones rattle...' }}]
        }],
        rewards: { xp: 15 },
        failurePenalty: { xp: 20 }
    },
    { 
        id: 'dungeon_c_02', 
        name: 'The King\'s Road Patrol', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'The King\'s Road is beset by bandits. Patrol a 1km stretch to ensure the safety of travelers.', 
        previewImage: '/dungeons/dungeon_c_02.jpg',
        backgroundImage: '/dungeons/dungeon_c_02.jpg',
        openingImage: '/dungeons/dungeon_c_02.jpg',
        timeLimit: 1200, 
        floors: [{
            id: 'f1', name: 'The King\'s Road',
            tasks: [{ id: 't1', description: 'Jog or run for 500m', tracking: { mode: 'distance', distanceMeters: 500, autoComplete: true }, attribute: Attribute.Endurance, page: { title: 'Task 1: Securing the Road', narrative: 'Your presence is a deterrent. Your speed is a weapon. Clear the King\'s Road.' }}]
        }], 
        rewards: { xp: 20, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_03', 
        name: 'The Great Library', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'The Great Library holds infinite knowledge, but you are only permitted to study one tome. Absorb its contents for half an hour.', 
        previewImage: '/dungeons/dungeon_c_03.jpg',
        backgroundImage: '/dungeons/dungeon_c_03.jpg',
        openingImage: '/dungeons/dungeon_c_03.jpg',
        timeLimit: 2100, 
        floors: [{
            id: 'f1', name: 'The Silent Stacks',
            tasks: [{ id: 't1', description: 'Read a book for 30 minutes', attribute: Attribute.Intellect, page: { title: 'Task 1: Communion with Knowledge', narrative: 'The silence of the library is filled with the voices of the past. Listen to them.' }}]
        }], 
        rewards: { xp: 17, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_04', 
        name: 'The Banquet\'s Aftermath', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'A grand banquet has concluded, leaving a mountain of dirty plates and goblets. It falls to you to restore order to the castle kitchen.', 
        previewImage: '/dungeons/dungeon_c_04.jpg',
        backgroundImage: '/dungeons/dungeon_c_04.jpg',
        openingImage: '/dungeons/dungeon_c_04.jpg',
        timeLimit: 1800, 
        floors: [{
            id: 'f1', name: 'The Scullery',
            tasks: [{ id: 't1', description: 'Do all the dishes in the house, including pots and pans', attribute: Attribute.Endurance, page: { title: 'Task 1: The Scullery Maid\'s Trial', narrative: 'This thankless task builds more character than a thousand battles. Find discipline in the mundane.' }}]
        }], 
        rewards: { xp: 16, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_05', 
        name: 'The Triad of Power', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'A true warrior balances strength, agility, and endurance. Complete a circuit of push-ups, squats, and planks.', 
        previewImage: '/dungeons/dungeon_c_05.jpg',
        backgroundImage: '/dungeons/dungeon_c_05.jpg',
        openingImage: '/dungeons/dungeon_c_05.jpg',
        timeLimit: 1200, 
        floors: [{
            id: 'f1', name: 'The Trinity Arena',
            tasks: [{ id: 't1', description: 'Complete 3 rounds of: 10 push-ups, 15 squats, 30-sec plank', attribute: Attribute.Strength, page: { title: 'Task 1: The Trinity Circuit', narrative: 'Forge your body in the three pillars of physical prowess. Do not falter.' }}]
        }], 
        rewards: { xp: 20, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_06', 
        name: 'The Loremaster\'s Challenge', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'A Loremaster challenges you to recall an ancient lay. Read a chapter of a book, then summarize its key points.', 
        previewImage: '/dungeons/dungeon_c_06.jpg',
        backgroundImage: '/dungeons/dungeon_c_06.jpg',
        openingImage: '/dungeons/dungeon_c_06.jpg',
        timeLimit: 1800, 
        floors: [{
            id: 'f1', name: 'The High Study',
            tasks: [{ id: 't1', description: 'Read a chapter, then write a short summary', attribute: Attribute.Intellect, page: { title: 'Task 1: Absorb and Recount', narrative: 'It is not enough to read the words; you must understand their soul. Prove your comprehension.' }}]
        }], 
        rewards: { xp: 19, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_07', 
        name: 'The Garrison\'s Laundry', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'The entire garrison\'s laundry has been assigned to you. A daunting task, but one that builds character.', 
        previewImage: '/dungeons/dungeon_c_07.jpg',
        backgroundImage: '/dungeons/dungeon_c_07.jpg',
        openingImage: '/dungeons/dungeon_c_07.jpg',
        timeLimit: 3600, 
        floors: [{
            id: 'f1', name: 'The Wash Yard',
            tasks: [{ id: 't1', description: 'Wash, dry, and fold a load of laundry', attribute: Attribute.Endurance, page: { title: 'Task 1: The Quartermaster\'s Burden', narrative: 'An army runs on clean linen as much as it does on steel. See this task through.' }}]
        }], 
        rewards: { xp: 15, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_08', 
        name: 'The Endurance Run', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'The system requires you to test your stamina. A brisk walk through the enchanted forest is in order.', 
        previewImage: '/dungeons/dungeon_c_08.jpg',
        backgroundImage: '/dungeons/dungeon_c_08.jpg',
        openingImage: '/dungeons/dungeon_c_08.jpg',
        timeLimit: 2100, 
        floors: [{
            id: 'f1', name: 'The Long Path',
            tasks: [{ id: 't1', description: 'Go for a 30-minute walk', attribute: Attribute.Endurance, page: { title: 'Task 1: The Long Path', narrative: 'This is not a race. This is a test of sustained effort. Maintain your pace.' }}]
        }], 
        rewards: { xp: 18, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_09', 
        name: 'The Spellbook\'s Secrets', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'You\'ve found a new spellbook, but the incantations are complex. You must memorize one spell completely.', 
        previewImage: '/dungeons/dungeon_c_09.jpg',
        backgroundImage: '/dungeons/dungeon_c_09.jpg',
        openingImage: '/dungeons/dungeon_c_09.jpg',
        timeLimit: 1500, 
        floors: [{
            id: 'f1', name: 'The Mind Chamber',
            tasks: [{ id: 't1', description: 'Memorize a new piece of information (e.g., a recipe, a formula, 10 vocabulary words)', attribute: Attribute.Intellect, page: { title: 'Task 1: Etching the Mind', narrative: 'Carve this new knowledge into your memory until it is as familiar as your own name.' }}]
        }], 
        rewards: { xp: 19, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_10', 
        name: 'The Wyvern\'s Climb', 
        grade: Difficulty.C, 
        type: 'standard', 
        description: 'To reach the wyvern\'s nest, you must scale a cliff face. This requires immense upper body strength.', 
        previewImage: '/dungeons/dungeon_c_10.jpg',
        backgroundImage: '/dungeons/dungeon_c_10.jpg',
        openingImage: '/dungeons/dungeon_c_10.jpg',
        timeLimit: 1200, 
        floors: [{
            id: 'f1', name: 'The Wyvern Cliff',
            tasks: [{ id: 't1', description: 'Complete 3 sets of pull-ups or an alternative back exercise to failure', attribute: Attribute.Strength, page: { title: 'Task 1: The Vertical Ascent', narrative: 'The only way is up. Pull your body towards the sky, rep by rep.' }}]
        }], 
        rewards: { xp: 20, coins: QUEST_COIN_REWARDS[Difficulty.C] }
    },
    { 
        id: 'dungeon_c_11_lz', 
        name: 'Lava Zone', 
        grade: Difficulty.C, 
        description: 'user will be given a pair of eagle wings use them to fly and escape the lava.', 
        previewImage: '/dungeons/dungeon_c_11_lz.jpg',
        backgroundImage: '/dungeons/dungeon_c_11_lz.jpg',
        openingImage: '/dungeons/dungeon_c_11_lz.jpg',
        floors: [{
            id: 'f1', name: 'Lava Zone',
            tasks: [{ id: 't1', description: 'complete lateral raises 3 sets of 15 reps', page: { title: 'Fly...', narrative: 'Bones rattle...' }}]
        }],
        rewards: { xp: 20 },
        failurePenalty: { xp: 25 }
    },
    { 
        id: 'dungeon_c_12_gp', 
        name: 'Goblin Pack', 
        grade: Difficulty.C, 
        description: 'kill the goblins', 
        previewImage: '/dungeons/dungeon_c_12_gp.jpg',
        backgroundImage: '/dungeons/dungeon_c_12_gp.jpg',
        openingImage: '/dungeons/dungeon_c_12_gp.jpg',
        floors: [{
            id: 'f1', name: 'Goblins Pack',
            tasks: [{ id: 't1', description: 'Shadow box for 3 mins', page: { title: 'fight...', narrative: 'kill the goblins...' }}]
        }],
        rewards: { xp: 15 },
        failurePenalty: { xp: 15 }
    },
    // --- B-RANK ---
    { 
        id: 'dungeon_b_01', 
        name: 'The Colosseum Gauntlet', 
        grade: Difficulty.B, 
        type: 'standard', 
        description: 'You are a contender in the Colosseum. Survive four rounds of grueling exercises to earn the crowd\'s favor.', 
        previewImage: '/dungeons/dungeon_b_01.jpg',
        backgroundImage: '/dungeons/dungeon_b_01.jpg',
        openingImage: '/dungeons/dungeon_b_01.jpg',
        timeLimit: 2700, 
        floors: [{
            id: 'f1', name: 'The Colosseum Floor',
            tasks: [{ id: 't1', description: 'Complete 3 sets of a compound exercise (e.g., 4x12 squats or deadlifts)', attribute: Attribute.Strength, page: { title: 'Task 1: The Test of Strength', narrative: 'The crowd roars. Your opponent is the iron itself. Defeat it four times over.' }}]
        }], 
        rewards: { xp: 40, coins: QUEST_COIN_REWARDS[Difficulty.B] }
    },
    { 
        id: 'dungeon_b_02', 
        name: 'The Titan\'s Legs', 
        grade: Difficulty.B, 
        type: 'standard', 
        description: 'To stand against a titan, you must possess legs of equal might. This brutal leg workout will forge them.', 
        previewImage: '/dungeons/dungeon_b_02.jpg',
        backgroundImage: '/dungeons/dungeon_b_02.jpg',
        openingImage: '/dungeons/dungeon_b_02.jpg',
        timeLimit: 2100, 
        floors: [{
            id: 'f1', name: 'The Earth Shaker Arena',
            tasks: [{ id: 't1', description: 'Complete 2 sets of a difficult leg exercise (e.g., Bulgarian split squats) to failure', attribute: Attribute.Strength, page: { title: 'Task 1: The Earth Shaker', narrative: 'This exercise will break you down to build you up stronger. Push until your legs scream for mercy.' }}]
        }], 
        rewards: { xp: 38, coins: QUEST_COIN_REWARDS[Difficulty.B] }
    },
    { 
        id: 'dungeon_b_03', 
        name: 'The Full-Body Blitz', 
        grade: Difficulty.B, 
        type: 'standard', 
        description: 'The ultimate test of a B-Rank warrior. A relentless full-body workout designed to push you to your limits.', 
        previewImage: '/dungeons/dungeon_b_03.jpg',
        backgroundImage: '/dungeons/dungeon_b_03.jpg',
        openingImage: '/dungeons/dungeon_b_03.jpg',
        timeLimit: 1800, 
        floors: [{
            id: 'f1', name: 'The Eye of the Storm',
            tasks: [{ id: 't1', description: 'Complete 3 rounds of: 10 burpees, 20 lunges, 15 push-ups', attribute: Attribute.Endurance, page: { title: 'Task 1: The Storm', narrative: 'There is no rest, no respite. Only the storm of movement. Endure it.' }}]
        }], 
        rewards: { xp: 40, coins: QUEST_COIN_REWARDS[Difficulty.B] }
    },
    { 
        id: 'dungeon_b_04', 
        name: 'The Mountain Pass', 
        grade: Difficulty.B, 
        type: 'standard', 
        description: 'A treacherous mountain pass stands between you and your objective. A 1km run is the only way through.', 
        previewImage: '/dungeons/dungeon_b_04.jpg',
        backgroundImage: '/dungeons/dungeon_b_04.jpg',
        openingImage: '/dungeons/dungeon_b_04.jpg',
        timeLimit: 2400, 
        floors: [{
            id: 'f1', name: 'The High Road',
            tasks: [{ id: 't1', description: 'Run 1km', tracking: { mode: 'distance', distanceMeters: 1000, autoComplete: true }, attribute: Attribute.Endurance, page: { title: 'Task 1: The High Road', narrative: 'The air is thin and the path is steep. Your endurance is the only thing that will see you to the other side.' }}]
        }], 
        rewards: { xp: 35, coins: QUEST_COIN_REWARDS[Difficulty.B] }
    },
    { 
        id: 'dungeon_b_05', 
        name: 'The Forgemaster\'s Challenge', 
        grade: Difficulty.B, 
        type: 'standard', 
        description: 'The Forgemaster demands you prove your upper body strength. Two grueling exercises are your test.', 
        previewImage: '/dungeons/dungeon_b_05.jpg',
        backgroundImage: '/dungeons/dungeon_b_05.jpg',
        openingImage: '/dungeons/dungeon_b_05.jpg',
        timeLimit: 2700, 
        floors: [{
            id: 'f1', name: 'The Twin Anvils',
            tasks: [{ id: 't1', description: 'Complete 2 difficult upper body exercises (e.g., 4 sets of pull-ups, 4 sets of bench press)', attribute: Attribute.Strength, page: { title: 'Task 1: The Twin Anvils', narrative: 'One exercise tests your pull, the other tests your push. Master both to earn the Forgemaster\'s respect.' }}]
        }], 
        rewards: { xp: 40, coins: QUEST_COIN_REWARDS[Difficulty.B] }
    },
    { 
        id: 'dungeon_b_06_cs', 
        name: 'The Code Sorcerer', 
        grade: Difficulty.B, 
        description: 'Mastering logical incantations.', 
        previewImage: '/dungeons/dungeon_b_06_cs.jpg',
        backgroundImage: '/dungeons/dungeon_b_06_cs.jpg',
        openingImage: '/dungeons/dungeon_b_06_cs.jpg',
        floors: [{
            id: 'f1', name: 'Sanctum of Logic',
            tasks: [{ id: 't1', description: 'Study 40 mins', page: { title: 'Decipher', narrative: 'The glyphs hum...' }}]
        }],
        rewards: { xp: 35 },
        failurePenalty: { xp: 40 }
    },
    { 
        id: 'dungeon_b_07_wf', 
        name: 'Wild Forest', 
        grade: Difficulty.B, 
        description: 'Survive the wild life.', 
        previewImage: '/dungeons/dungeon_b_07_wf.jpg',
        backgroundImage: '/dungeons/dungeon_b_07_wf.jpg',
        openingImage: '/dungeons/dungeon_b_07_wf.jpg',
        floors: [{
            id: 'f1', name: 'Wild Forest',
            tasks: [{ id: 't1', description: '50 push ups', page: { title: 'Push...', narrative: 'Strong will...' }}]
        }],
        rewards: { xp: 35 },
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

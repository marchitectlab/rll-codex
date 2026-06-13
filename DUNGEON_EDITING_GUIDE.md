# Dungeon Editing Guide

Edit dungeon text, floors, tasks, rank, rewards, and penalties in `constants.ts` under `export const DUNGEONS`.

Drop dungeon images in `public/dungeons`.

## Image Naming

The app automatically looks for this file for each dungeon:

```text
public/dungeons/<dungeon-id>.jpg
```

Example:

```text
public/dungeons/dungeon_a_02.jpg
```

If you want different images for the list card and the entered dungeon screen, add these optional fields to that dungeon in `constants.ts`:

```ts
previewImage: '/dungeons/dungeon_a_02-card.jpg',
backgroundImage: '/dungeons/dungeon_a_02-bg.jpg',
openingImage: '/dungeons/dungeon_a_02-open.jpg',
```

Use `.jpg`, `.png`, or `.webp`. For best results use 16:9 images around 1600x900 or 1920x1080.

## Dungeon Structure

```ts
{
  id: 'dungeon_a_02',
  name: 'Orc Attack',
  grade: Difficulty.A,
  description: 'Defeat all the Orcs in the dungeon.',
  previewImage: '/dungeons/dungeon_a_02-card.jpg',
  backgroundImage: '/dungeons/dungeon_a_02-bg.jpg',
  openingImage: '/dungeons/dungeon_a_02-open.jpg',
  floors: [
    {
      id: 'f1',
      name: 'Orc Goons',
      tasks: [
        {
          id: 't1',
          description: 'Shadow box 3 minutes for 5 rounds',
          attribute: Attribute.Agility,
          page: {
            title: 'Ambush',
            narrative: 'The first wave closes in from the smoke.'
          }
        }
      ]
    }
  ],
  rewards: { xp: 225, coins: QUEST_COIN_REWARDS[Difficulty.A] },
  failurePenalty: { xp: 250 }
}
```

## Add Or Remove Floors

Add another object inside `floors`:

```ts
{
  id: 'f2',
  name: 'High Orcs',
  tasks: [
    {
      id: 't2',
      description: 'Weighted shadow boxing 3 minutes for 3 rounds',
      attribute: Attribute.Strength,
      page: {
        title: 'High Orcs',
        narrative: 'Heavier steps echo from deeper inside the gate.'
      }
    }
  ]
}
```

Remove a floor by deleting its whole `{ id, name, tasks }` block.

## Add Or Remove Tasks

Add more task objects inside a floor's `tasks` array. The app will show them one by one.

Keep ids unique inside the dungeon: `f1`, `f2`, `t1`, `t2`, etc.

## GPS Distance Tasks

To make a dungeon task open the GPS tracker and auto-clear after a target distance, add `tracking` to the task:

```ts
{
  id: 't1',
  description: 'Run 500m before the gate collapses',
  tracking: { mode: 'distance', distanceMeters: 500, autoComplete: true },
  attribute: Attribute.Endurance,
  page: {
    title: 'Collapse Run',
    narrative: 'The corridor fractures behind you. Move.'
  }
}
```

When the player reaches the target distance, the tracker stops and the dungeon automatically moves to the next task or floor.

## Current Dungeon Image Checklist

- `dungeon_e_01` - Sands of Shadow
- `dungeon_e_02` - Dark Room
- `dungeon_d_01` - Sniper Goblin's Perch
- `dungeon_d_02` - The Scholar's Test
- `dungeon_d_03` - The Jester's Agility
- `dungeon_d_04` - Forging the Abs
- `dungeon_d_05` - The Message Runner
- `dungeon_d_06` - The Staircase
- `dungeon_d_07` - Deciphering the Runes
- `dungeon_d_08` - The Griffin's Roost
- `dungeon_d_09` - The Silent Oracle
- `dungeon_d_10` - The Golem's Push
- `dungeon_d_11_rf` - Rock Fall
- `dungeon_c_01` - Residents of the Grave
- `dungeon_c_02` - The King's Road Patrol
- `dungeon_c_03` - The Great Library
- `dungeon_c_04` - The Banquet's Aftermath
- `dungeon_c_05` - The Triad of Power
- `dungeon_c_06` - The Loremaster's Challenge
- `dungeon_c_07` - The Garrison's Laundry
- `dungeon_c_08` - The Endurance Run
- `dungeon_c_09` - The Spellbook's Secrets
- `dungeon_c_10` - The Wyvern's Climb
- `dungeon_c_11_lz` - Lava Zone
- `dungeon_c_12_gp` - Goblin Pack
- `dungeon_b_01` - The Colosseum Gauntlet
- `dungeon_b_02` - The Titan's Legs
- `dungeon_b_03` - The Full-Body Blitz
- `dungeon_b_04` - The Mountain Pass
- `dungeon_b_05` - The Forgemaster's Challenge
- `dungeon_b_06_cs` - The Code Sorcerer
- `dungeon_b_07_wf` - Wild Forest
- `dungeon_a_01` - Mystery of Miracle
- `dungeon_a_02` - Orc Attack
- `dungeon_a_03` - The Volcano's Core
- `dungeon_a_04` - The Assassin's Gauntlet
- `dungeon_a_05` - The Wyrm's Breath
- `dungeon_a_06` - The Berserker's Rage
- `dungeon_a_07` - The Gravity Well
- `dungeon_a_08` - The Final Stand
- `dungeon_s_01` - Grim Reaper

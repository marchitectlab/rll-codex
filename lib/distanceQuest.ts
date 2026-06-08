import { Difficulty, DistanceRunResult } from '../types';
import { XP_PER_DIFFICULTY } from '../constants';

const gradeOrder = [
  Difficulty.E,
  Difficulty.D,
  Difficulty.C,
  Difficulty.B,
  Difficulty.A,
  Difficulty.S,
  Difficulty.S_PLUS,
];

const runGrades: Array<{ minMeters: number; grade: Difficulty; title: string }> = [
  { minMeters: 5000, grade: Difficulty.S_PLUS, title: 'Berserk Run' },
  { minMeters: 3000, grade: Difficulty.S, title: 'S-Rank Run' },
  { minMeters: 2300, grade: Difficulty.A, title: 'Elite Run' },
  { minMeters: 1600, grade: Difficulty.B, title: 'Discipline Run' },
  { minMeters: 1000, grade: Difficulty.C, title: 'Average Run' },
  { minMeters: 500, grade: Difficulty.D, title: 'Novice Run' },
  { minMeters: 0, grade: Difficulty.E, title: 'Beginner Run' },
];

const demoteGrade = (grade: Difficulty, steps: number): Difficulty => {
  const index = gradeOrder.indexOf(grade);
  if (index === -1) return grade;
  return gradeOrder[Math.max(0, index - steps)];
};

const getPaceBonus = (paceSecondsPerKm: number | null): number => {
  if (paceSecondsPerKm === null) return 0;
  if (paceSecondsPerKm < 300) return 20;
  if (paceSecondsPerKm < 330) return 15;
  if (paceSecondsPerKm < 360) return 10;
  if (paceSecondsPerKm < 390) return 5;
  if (paceSecondsPerKm < 420) return 3;
  return 0;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};

export const formatDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours > 0) return `${hours}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${remMins}:${secs.toString().padStart(2, '0')}`;
};

export const formatPace = (paceSecondsPerKm: number | null): string => {
  if (paceSecondsPerKm === null || !Number.isFinite(paceSecondsPerKm)) return '-- /km';
  return `${formatDuration(Math.round(paceSecondsPerKm))} /km`;
};

export const calculateDistanceQuestResult = (distanceMeters: number, durationSeconds: number): DistanceRunResult => {
  const safeDistance = Math.max(0, distanceMeters);
  const safeDuration = Math.max(0, durationSeconds);
  const tier = runGrades.find(item => safeDistance >= item.minMeters) || runGrades[runGrades.length - 1];
  const paceSecondsPerKm = safeDistance > 0 ? safeDuration / (safeDistance / 1000) : null;
  const baseIsRanked = gradeOrder.indexOf(tier.grade) >= gradeOrder.indexOf(Difficulty.B);

  let finalGrade = tier.grade;
  let modifierLabel = 'Distance grade applied';
  let paceBonusXp = 0;

  if (baseIsRanked && paceSecondsPerKm !== null) {
    if (paceSecondsPerKm > 600) {
      finalGrade = demoteGrade(tier.grade, 2);
      modifierLabel = 'Pace demotion x2';
    } else if (paceSecondsPerKm > 480) {
      finalGrade = demoteGrade(tier.grade, 1);
      modifierLabel = 'Pace demotion x1';
    } else {
      paceBonusXp = getPaceBonus(paceSecondsPerKm);
      modifierLabel = paceBonusXp > 0 ? `Pace bonus +${paceBonusXp} XP` : 'Pace stable';
    }
  }

  const baseXp = XP_PER_DIFFICULTY[finalGrade] || 0;

  return {
    distanceMeters: Math.round(safeDistance),
    durationSeconds: Math.round(safeDuration),
    paceSecondsPerKm,
    baseGrade: tier.grade,
    finalGrade,
    baseXp,
    paceBonusXp,
    totalXp: baseXp + paceBonusXp,
    title: tier.title,
    modifierLabel,
  };
};

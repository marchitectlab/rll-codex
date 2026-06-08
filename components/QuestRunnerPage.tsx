import React, { useEffect, useMemo, useState } from 'react';
import type { Quest } from '../types';
import { XP_PER_DIFFICULTY, QUEST_COIN_REWARDS } from '../constants';
import { formatDuration } from '../lib/distanceQuest';

type RunnerStatus = 'details' | 'running' | 'complete';
type RoundPhase = 'work' | 'interval';

interface QuestRunnerPageProps {
  quest: Quest;
  onCancel: () => void;
  onComplete: (questId: string) => void;
}

const getModeLabel = (quest: Quest): string => {
  if (quest.questMode === 'countdown') return 'Countdown Quest';
  if (quest.questMode === 'rounds') return 'Round Quest';
  return 'Standard Quest';
};

const getInitialTime = (quest: Quest): number => {
  if (quest.questMode === 'countdown') return quest.timerConfig?.durationSeconds || 60;
  if (quest.questMode === 'rounds') return quest.timerConfig?.roundSeconds || 60;
  return 0;
};

const StatPanel: React.FC<{ label: string; value: string; tone?: string }> = ({ label, value, tone = 'text-white' }) => (
  <div className="border border-blue-500/20 bg-black/40 rounded p-3">
    <p className="font-orbitron text-[8px] text-blue-300/60 uppercase tracking-[0.25em] mb-1">{label}</p>
    <p className={`font-orbitron text-xl md:text-2xl font-black ${tone}`}>{value}</p>
  </div>
);

export const QuestRunnerPage: React.FC<QuestRunnerPageProps> = ({ quest, onCancel, onComplete }) => {
  const [status, setStatus] = useState<RunnerStatus>('details');
  const [timeLeft, setTimeLeft] = useState(getInitialTime(quest));
  const [roundIndex, setRoundIndex] = useState(1);
  const [phase, setPhase] = useState<RoundPhase>('work');
  const [completed, setCompleted] = useState(false);

  const totalRounds = Math.max(1, quest.timerConfig?.roundCount || 1);
  const roundSeconds = Math.max(5, quest.timerConfig?.roundSeconds || 60);
  const intervalSeconds = Math.max(0, quest.timerConfig?.intervalSeconds || 0);
  const rewardXp = XP_PER_DIFFICULTY[quest.difficulty] || 0;
  const rewardCoins = QUEST_COIN_REWARDS[quest.difficulty] || 0;

  const primaryLabel = useMemo(() => {
    if (quest.questMode === 'rounds') return phase === 'work' ? `Round ${roundIndex}` : 'Interval';
    if (quest.questMode === 'countdown') return 'Countdown';
    return 'Objective Active';
  }, [quest.questMode, phase, roundIndex]);

  const finishQuest = () => {
    if (completed) return;
    setCompleted(true);
    onComplete(quest.id);
    setStatus('complete');
  };

  useEffect(() => {
    if (status !== 'running') return;
    if (quest.questMode !== 'countdown' && quest.questMode !== 'rounds') return;

    const timer = window.setInterval(() => {
      setTimeLeft(current => {
        if (current > 1) return current - 1;

        if (quest.questMode === 'countdown') {
          window.clearInterval(timer);
          setTimeout(finishQuest, 0);
          return 0;
        }

        if (phase === 'work') {
          if (intervalSeconds > 0 && roundIndex < totalRounds) {
            setPhase('interval');
            return intervalSeconds;
          }
          if (roundIndex >= totalRounds) {
            window.clearInterval(timer);
            setTimeout(finishQuest, 0);
            return 0;
          }
          setRoundIndex(index => index + 1);
          return roundSeconds;
        }

        setPhase('work');
        setRoundIndex(index => Math.min(totalRounds, index + 1));
        return roundSeconds;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status, quest.questMode, phase, roundIndex, totalRounds, roundSeconds, intervalSeconds, completed]);

  const startQuest = () => {
    setStatus('running');
    setTimeLeft(getInitialTime(quest));
    setRoundIndex(1);
    setPhase('work');
    setCompleted(false);
  };

  return (
    <div className="min-h-full bg-[#020617] text-white overflow-y-auto">
      <div className="min-h-full px-4 py-5 md:p-8 flex flex-col">
        <header className="flex items-center justify-between gap-3 mb-6">
          <button onClick={onCancel} className="font-orbitron text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/10 px-3 py-2 rounded hover:text-white hover:border-blue-400/50">
            Back
          </button>
          <div className="text-right min-w-0">
            <p className="font-orbitron text-[8px] text-blue-400 uppercase tracking-[0.3em]">{getModeLabel(quest)}</p>
            <h1 className="font-orbitron text-lg md:text-2xl font-black uppercase tracking-widest truncate">{quest.name}</h1>
          </div>
        </header>

        <section className="border border-blue-500/20 bg-blue-950/10 rounded p-4 md:p-6 mb-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="font-orbitron text-[9px] text-gray-500 uppercase tracking-[0.25em]">Quest Grade</p>
              <p className="font-orbitron text-5xl md:text-7xl font-black text-blue-300 drop-shadow-[0_0_18px_rgba(56,189,248,0.6)]">[{quest.difficulty}]</p>
            </div>
            <div className="text-right">
              <p className="font-orbitron text-[9px] text-gray-500 uppercase tracking-[0.25em]">Reward</p>
              <p className="font-orbitron text-3xl font-black text-yellow-300">+{rewardXp} XP</p>
              {rewardCoins > 0 && <p className="text-[10px] text-yellow-400/80 uppercase tracking-widest">{rewardCoins} coins</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <StatPanel label="Mode" value={getModeLabel(quest)} tone="text-cyan-300" />
            <StatPanel label="Status" value={status === 'complete' ? 'Clear' : status === 'running' ? 'Active' : 'Ready'} />
            <StatPanel label="Timer" value={quest.questMode === 'standard' ? '--' : formatDuration(timeLeft)} tone="text-green-300" />
            <StatPanel label="Type" value={quest.type.replace('-', ' ')} tone="text-blue-300" />
          </div>
        </section>

        <div className="flex-1 border border-white/10 bg-black/30 rounded p-4 md:p-6 mb-5">
          {status === 'complete' ? (
            <div className="h-full flex flex-col justify-center text-center py-8">
              <p className="font-orbitron text-[10px] text-blue-400 uppercase tracking-[0.3em] mb-3">Quest Complete</p>
              <h2 className="font-orbitron text-3xl md:text-5xl font-black text-white uppercase mb-2">Mission Accomplished</h2>
              <p className="font-orbitron text-6xl font-black text-blue-300 mb-6">+{rewardXp}</p>
              <button onClick={onCancel} className="font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-5 py-3 rounded uppercase text-[10px] font-black tracking-widest border border-blue-400/50">
                Return to Quest Log
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center text-center py-8">
              <p className="font-orbitron text-[10px] text-blue-300 uppercase tracking-[0.3em] mb-3">{primaryLabel}</p>
              <p className="font-orbitron text-6xl md:text-8xl font-black text-white mb-4">
                {quest.questMode === 'standard' ? 'READY' : formatDuration(timeLeft)}
              </p>
              {quest.questMode === 'rounds' && (
                <p className="font-orbitron text-xs text-gray-400 uppercase tracking-[0.25em]">
                  {phase === 'work' ? 'Work phase' : 'Interval'} | {roundIndex}/{totalRounds}
                </p>
              )}
              {quest.description && (
                <p className="text-xs md:text-sm text-gray-400 uppercase tracking-widest leading-relaxed max-w-xl mx-auto mt-5">
                  {quest.description}
                </p>
              )}
            </div>
          )}
        </div>

        {status === 'details' && (
          <button onClick={startQuest} className="font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-6 py-4 rounded uppercase text-xs font-black tracking-widest border border-blue-400/50">
            Start Quest
          </button>
        )}
        {status === 'running' && quest.questMode === 'standard' && (
          <button onClick={finishQuest} className="font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-6 py-4 rounded uppercase text-xs font-black tracking-widest border border-blue-400/50">
            Complete Quest
          </button>
        )}
      </div>
    </div>
  );
};

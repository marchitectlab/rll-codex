import React, { useEffect, useMemo, useState } from 'react';
import type { Quest } from '../types';
import { XP_PER_DIFFICULTY, QUEST_COIN_REWARDS } from '../constants';
import { formatDuration } from '../lib/distanceQuest';

type RunnerStatus = 'details' | 'running' | 'complete';
type RoundPhase = 'work' | 'interval';

interface QuestRunnerPageProps {
  quest: Quest;
  onCancel: () => void;
  onComplete: (questId: string, elapsedSeconds?: number) => void;
}

const getModeLabel = (quest: Quest): string => {
  if (quest.questMode === 'countdown') return 'Countdown Quest';
  if (quest.questMode === 'rounds') return 'Round Quest';
  if (quest.questMode === 'stopwatch') return 'Stopwatch Quest';
  return 'Standard Quest';
};

const getInitialTime = (quest: Quest): number => {
  if (quest.questMode === 'countdown') return quest.timerConfig?.durationSeconds || 60;
  if (quest.questMode === 'rounds') return quest.timerConfig?.roundSeconds || 60;
  return 0;
};

const StatPanel: React.FC<{ label: string; value: string; tone?: string }> = ({ label, value, tone = 'text-white' }) => (
  <div className="border border-blue-500/15 bg-black/35 rounded p-3">
    <p className="font-orbitron text-[8px] text-blue-300/60 uppercase tracking-normal mb-1">{label}</p>
    <p className={`font-orbitron text-base md:text-xl font-bold ${tone}`}>{value}</p>
  </div>
);

export const QuestRunnerPage: React.FC<QuestRunnerPageProps> = ({ quest, onCancel, onComplete }) => {
  const questMode = quest.questMode || 'standard';
  const [status, setStatus] = useState<RunnerStatus>('details');
  const [guideOpen, setGuideOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getInitialTime(quest));
  const [roundIndex, setRoundIndex] = useState(1);
  const [phase, setPhase] = useState<RoundPhase>('work');
  const [completed, setCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const totalRounds = Math.max(1, quest.timerConfig?.roundCount || 1);
  const roundSeconds = Math.max(5, quest.timerConfig?.roundSeconds || 60);
  const intervalSeconds = Math.max(0, quest.timerConfig?.intervalSeconds || 0);
  const rewardXp = XP_PER_DIFFICULTY[quest.difficulty] || 0;
  const rewardCoins = QUEST_COIN_REWARDS[quest.difficulty] || 0;
  const minimumStopwatchSeconds = quest.timerConfig?.minDurationSeconds || 0;
  const stopwatchGrades = [...(quest.timerConfig?.stopwatchGrades || [])].sort((a, b) => a.minSeconds - b.minSeconds);
  const currentStopwatchGrade = stopwatchGrades.reduce((grade, threshold) => (
    elapsedSeconds >= threshold.minSeconds ? threshold.grade : grade
  ), quest.difficulty);

  const primaryLabel = useMemo(() => {
    if (questMode === 'rounds') return phase === 'work' ? `Round ${roundIndex}` : 'Interval';
    if (questMode === 'countdown') return 'Countdown';
    if (questMode === 'stopwatch') return elapsedSeconds < minimumStopwatchSeconds ? 'Minimum Time Required' : `Current Grade [${currentStopwatchGrade}]`;
    return 'Objective Active';
  }, [questMode, phase, roundIndex, elapsedSeconds, minimumStopwatchSeconds, currentStopwatchGrade]);

  const finishQuest = () => {
    if (completed) return;
    setCompleted(true);
    onComplete(quest.id, questMode === 'stopwatch' ? elapsedSeconds : undefined);
    setStatus('complete');
  };

  useEffect(() => {
    if (status !== 'running') return;
    if (questMode !== 'countdown' && questMode !== 'rounds') return;

    const timer = window.setInterval(() => {
      setTimeLeft(current => {
        if (current > 1) return current - 1;

        if (questMode === 'countdown') {
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
  }, [status, questMode, phase, roundIndex, totalRounds, roundSeconds, intervalSeconds, completed]);

  useEffect(() => {
    if (status !== 'running' || questMode !== 'stopwatch') return;
    const timer = window.setInterval(() => {
      setElapsedSeconds(current => current + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status, questMode]);

  const startQuest = () => {
    setStatus('running');
    setTimeLeft(getInitialTime(quest));
    setRoundIndex(1);
    setPhase('work');
    setCompleted(false);
    setElapsedSeconds(0);
  };

  return (
    <div className="min-h-full bg-[#020617] text-white overflow-y-auto">
      {guideOpen && quest.backgroundImage && (
        <div className="fixed inset-0 z-[700] bg-[#020617] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.2),transparent_42%)]" />
          <div className="relative z-10 flex h-full flex-col">
            <header className="flex items-center justify-between gap-3 px-4 py-4 border-b border-blue-500/20 bg-black/60">
              <div className="min-w-0">
                <p className="font-orbitron text-[8px] text-blue-400 uppercase tracking-[0.3em]">Exercise Guide</p>
                <h2 className="font-orbitron text-sm font-black uppercase tracking-widest truncate">{quest.name}</h2>
              </div>
              <button onClick={() => setGuideOpen(false)} className="font-orbitron text-[10px] font-black uppercase tracking-widest text-blue-200 border border-blue-500/40 px-4 py-2 rounded hover:bg-blue-500/10">
                Close
              </button>
            </header>
            <div className="flex-1 overflow-auto p-3 md:p-6">
              <img src={quest.backgroundImage} alt="" className="mx-auto h-auto max-h-none w-full max-w-3xl rounded border border-blue-500/20 bg-black" />
            </div>
          </div>
        </div>
      )}
      <div className="min-h-full px-4 pb-5 md:p-8 flex flex-col" style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}>
        <header className="flex items-center justify-between gap-3 mb-6">
          <button onClick={onCancel} className="font-orbitron text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/10 px-3 py-2 rounded hover:text-white hover:border-blue-400/50">
            Back
          </button>
          <div className="text-right min-w-0">
            <p className="font-orbitron text-[8px] text-blue-400 uppercase tracking-[0.3em]">{getModeLabel(quest)}</p>
            <h1 className="font-orbitron text-base md:text-xl font-bold uppercase tracking-normal truncate">{quest.name}</h1>
          </div>
        </header>

        <section className="border border-blue-500/20 bg-blue-950/20 backdrop-blur-sm rounded p-4 md:p-5 mb-4 shadow-[0_0_26px_rgba(37,99,235,0.12)]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="font-orbitron text-[9px] text-gray-500 uppercase tracking-normal">Quest Grade</p>
              <p className="font-orbitron text-3xl md:text-5xl font-bold text-blue-300 drop-shadow-[0_0_14px_rgba(56,189,248,0.45)]">[{quest.difficulty}]</p>
            </div>
            <div className="text-right">
              <p className="font-orbitron text-[9px] text-gray-500 uppercase tracking-normal">Reward</p>
              <p className="font-orbitron text-xl md:text-2xl font-bold text-yellow-300">+{rewardXp} XP</p>
              {rewardCoins > 0 && <p className="text-[10px] text-yellow-400/80 uppercase tracking-normal">{rewardCoins} coins</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <StatPanel label="Mode" value={getModeLabel(quest)} tone="text-cyan-300" />
            <StatPanel label="Status" value={status === 'complete' ? 'Clear' : status === 'running' ? 'Active' : 'Ready'} />
            <StatPanel label="Timer" value={questMode === 'standard' ? '--' : questMode === 'stopwatch' ? formatDuration(elapsedSeconds) : formatDuration(timeLeft)} tone="text-green-300" />
            <StatPanel label="Type" value={quest.type.replace('-', ' ')} tone="text-blue-300" />
          </div>
          {questMode === 'stopwatch' && (
            <p className="mt-4 text-[10px] text-cyan-200/80 uppercase tracking-widest leading-relaxed">
              Below {formatDuration(minimumStopwatchSeconds)} is discarded. {stopwatchGrades.map(rule => `${formatDuration(rule.minSeconds)}+ = ${rule.grade}`).join(' | ')}
            </p>
          )}
        </section>

        <div className="flex-1 border border-blue-500/20 bg-black/50 backdrop-blur-[2px] rounded overflow-hidden mb-5 shadow-[0_0_34px_rgba(14,165,233,0.12)]">
          {status === 'complete' ? (
            <div className="h-full flex flex-col justify-center text-center py-8 px-4 md:px-6">
              <p className="font-orbitron text-[10px] text-blue-400 uppercase tracking-[0.3em] mb-3">Quest Complete</p>
              <h2 className="font-orbitron text-3xl md:text-5xl font-black text-white uppercase mb-2">Mission Accomplished</h2>
              <p className="font-orbitron text-6xl font-black text-blue-300 mb-6">+{rewardXp}</p>
              <button onClick={onCancel} className="font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-5 py-3 rounded uppercase text-[10px] font-black tracking-widest border border-blue-400/50">
                Return to Quest Log
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col text-center">
              <div className="relative min-h-[220px] overflow-hidden rounded-t bg-[#020617]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(37,99,235,0.36),transparent_40%),linear-gradient(180deg,rgba(2,6,23,0.1),rgba(2,6,23,0.94))]" />
                <div className="absolute left-1/2 top-8 h-32 w-32 -translate-x-1/2 rounded-full border border-blue-400/25 bg-blue-500/10 shadow-[0_0_70px_rgba(59,130,246,0.28)]" />
                <div className="absolute left-1/2 top-11 h-28 w-20 -translate-x-1/2 rounded-t-full bg-gradient-to-b from-blue-200/20 via-blue-500/15 to-transparent blur-sm" />
                <div className="absolute left-1/2 top-16 h-16 w-16 -translate-x-1/2 rounded-full border border-blue-300/30 bg-slate-950/70 shadow-[0_0_32px_rgba(96,165,250,0.25)]" />
                <div className="absolute left-1/2 top-32 h-28 w-44 -translate-x-1/2 rounded-t-[70px] border-t border-blue-300/30 bg-gradient-to-b from-blue-500/20 to-transparent" />
                <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 px-4 pb-5 md:px-6 md:pb-6">
                  <p className="font-orbitron text-lg md:text-2xl font-bold text-white uppercase tracking-normal drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]">{quest.name}</p>
                  <p className="font-orbitron text-3xl md:text-5xl font-black text-white mt-1 drop-shadow-[0_0_18px_rgba(59,130,246,0.35)]">
                    {questMode === 'standard' ? 'READY' : questMode === 'stopwatch' ? formatDuration(elapsedSeconds) : formatDuration(timeLeft)}
                  </p>
                </div>
              </div>
              <div className="px-4 pb-5 pt-4 md:px-6 md:pb-6 md:pt-5 bg-gradient-to-b from-black/80 via-slate-950/80 to-slate-950">
                <p className="font-orbitron text-[9px] md:text-[10px] text-blue-300 uppercase tracking-[0.24em] mb-3">{primaryLabel}</p>
                {questMode === 'rounds' && (
                  <p className="font-orbitron text-xs text-gray-400 uppercase tracking-[0.25em] mb-3">
                    {phase === 'work' ? 'Work phase' : 'Interval'} | {roundIndex}/{totalRounds}
                  </p>
                )}
                {quest.description && (
                  <p className="text-xs md:text-sm text-gray-400 uppercase tracking-widest leading-relaxed max-w-xl mx-auto">
                    {quest.description}
                  </p>
                )}
                {quest.backgroundImage && (
                  <button onClick={() => setGuideOpen(true)} className="mt-5 font-orbitron text-[10px] font-black uppercase tracking-widest text-cyan-200 border border-cyan-400/40 px-5 py-3 rounded bg-cyan-500/10 hover:bg-cyan-500/20">
                    View Exercise Guide
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {status === 'details' && (
          <button onClick={startQuest} className="sticky bottom-4 font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-6 py-4 rounded uppercase text-xs font-black tracking-widest border border-blue-400/50 shadow-[0_0_24px_rgba(37,99,235,0.38)]">
            Start Quest
          </button>
        )}
        {status === 'running' && questMode === 'standard' && (
          <button onClick={finishQuest} className="sticky bottom-4 font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-6 py-4 rounded uppercase text-xs font-black tracking-widest border border-blue-400/50 shadow-[0_0_24px_rgba(37,99,235,0.38)]">
            Complete Quest
          </button>
        )}
        {status === 'running' && questMode === 'stopwatch' && (
          <button onClick={finishQuest} className={`sticky bottom-4 font-orbitron text-white px-6 py-4 rounded uppercase text-xs font-black tracking-widest border shadow-[0_0_24px_rgba(37,99,235,0.38)] ${elapsedSeconds < minimumStopwatchSeconds ? 'bg-red-800 hover:bg-red-700 border-red-400/50' : 'bg-blue-700 hover:bg-blue-600 border-blue-400/50'}`}>
            {elapsedSeconds < minimumStopwatchSeconds ? 'Finish and Discard' : `Finish [${currentStopwatchGrade}]`}
          </button>
        )}
      </div>
    </div>
  );
};

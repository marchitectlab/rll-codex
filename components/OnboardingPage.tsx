import React, { useMemo, useState } from 'react';

type OnboardingPageProps = {
  onComplete: () => void;
};

const steps = [
  {
    label: 'Awakening',
    title: 'System Online',
    grade: 'E',
    body: 'R.L.L turns real actions into quests, XP, ranks, skills, equipment, and dungeon clears.',
    points: ['Complete real tasks', 'Earn XP', 'Build discipline'],
  },
  {
    label: 'Leveling',
    title: 'Rank Protocol',
    grade: 'D',
    body: 'Your level and rank rise as you gain XP. Miss discipline long enough and the system can punish sloth.',
    points: ['XP raises level', 'Level raises rank', 'Consistency prevents penalties'],
  },
  {
    label: 'Quests',
    title: 'Mission Board',
    grade: 'C',
    body: 'Create standard, timer, round, and distance quests. Clear them only when the real-world task is done.',
    points: ['Daily missions', 'Timed runs', 'Distance tracking'],
  },
  {
    label: 'Skills',
    title: 'Ability Matrix',
    grade: 'B',
    body: 'Skills grow through training. Locked skills, prerequisites, folders, and skill trees let you build your own progression path.',
    points: ['Train skills', 'Link prerequisites', 'Unlock higher tiers'],
  },
  {
    label: 'Dungeons',
    title: 'Gate Operations',
    grade: 'A',
    body: 'Dungeons are higher-risk multi-step challenges. Clear floors, claim rewards, and return stronger.',
    points: ['Enter gates', 'Clear floors', 'Collect loot'],
  },
  {
    label: 'Gear',
    title: 'Inventory Sync',
    grade: 'S',
    body: 'Shop gear, materials, enhancements, and reports help you tune your build and track long-term progress.',
    points: ['Buy gear', 'Enhance equipment', 'Export reports'],
  },
  {
    label: 'Begin',
    title: 'Journey Authorized',
    grade: 'S+',
    body: 'Start with one simple quest today. Build the system slowly, then make it ruthless when your habits are ready.',
    points: ['Open Quests', 'Clear your first mission', 'Return tomorrow'],
  },
];

const gradeTone: Record<string, string> = {
  E: 'text-gray-300 border-gray-500/40',
  D: 'text-green-300 border-green-500/40',
  C: 'text-orange-300 border-orange-500/40',
  B: 'text-indigo-300 border-indigo-500/40',
  A: 'text-purple-300 border-purple-500/40',
  S: 'text-yellow-300 border-yellow-500/50',
  'S+': 'text-red-300 border-red-500/50',
};

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const progress = useMemo(() => ((index + 1) / steps.length) * 100, [index]);

  return (
    <div className="min-h-full bg-[#020617] text-white overflow-y-auto">
      <div className="min-h-full px-5 py-7 md:p-10 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <header className="mb-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-orbitron text-[8px] text-blue-400 uppercase tracking-[0.35em]">First Login Sequence</p>
                <h1 className="font-orbitron text-2xl md:text-4xl font-black text-blue-200 uppercase mt-1">R.L.L Lite</h1>
              </div>
              <div className={`font-orbitron text-3xl md:text-5xl font-black border px-4 py-2 rounded ${gradeTone[step.grade]}`}>
                [{step.grade}]
              </div>
            </div>
            <div className="h-1 bg-slate-900 border border-blue-500/10 rounded mt-5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-700 via-cyan-400 to-blue-300 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
            <section className="border border-blue-500/20 bg-black/35 rounded p-5 md:p-7 shadow-[0_0_35px_rgba(14,165,233,0.08)]">
              <p className="font-orbitron text-[9px] text-cyan-300 uppercase tracking-[0.3em] mb-3">{step.label}</p>
              <h2 className="font-orbitron text-2xl md:text-3xl font-black uppercase text-white mb-4">{step.title}</h2>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl">{step.body}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
                {step.points.map(point => (
                  <div key={point} className="border border-blue-500/10 bg-slate-950/70 rounded p-3">
                    <p className="font-orbitron text-[10px] text-blue-100 uppercase tracking-widest leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="border border-blue-500/20 bg-[#020617] rounded p-4 space-y-2">
              {steps.map((item, itemIndex) => (
                <button
                  key={item.label}
                  onClick={() => setIndex(itemIndex)}
                  className={`w-full text-left border rounded px-3 py-2 transition-all ${itemIndex === index ? 'border-cyan-400/60 bg-blue-500/10 text-white' : 'border-white/10 bg-black/20 text-gray-500 hover:text-gray-300'}`}
                >
                  <span className="font-orbitron text-[9px] uppercase tracking-widest">[{item.grade}] {item.label}</span>
                </button>
              ))}
            </aside>
          </main>

          <footer className="flex items-center justify-between gap-3 mt-6">
            <button
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
              className="font-orbitron text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/10 px-4 py-3 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:text-white hover:border-blue-400/40"
            >
              Back
            </button>
            <button
              onClick={() => isLast ? onComplete() : setIndex(index + 1)}
              className="font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-5 py-3 rounded uppercase text-[10px] font-black tracking-widest border border-blue-400/50"
            >
              {isLast ? 'Begin Journey' : 'Continue'}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

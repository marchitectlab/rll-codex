
import React, { useState, useMemo } from 'react';
import type { CompletedQuest, DungeonHistoryEntry } from '../types';
import { Difficulty } from '../types';
import { XP_PER_DIFFICULTY, DUNGEONS } from '../constants';
import { formatDistance, formatPace } from '../lib/distanceQuest';
import { createRouteImage, downloadRouteImage } from '../lib/routeImage';

// --- TYPES & INTERFACES ---
interface QuestHistoryProps {
  completedQuests: CompletedQuest[];
  dungeonHistory: DungeonHistoryEntry[];
  onUpgradePro: () => void;
  isPro: boolean;
}

interface DailyActivity {
  quests: CompletedQuest[];
  dungeons: DungeonHistoryEntry[];
  totalXp: number;
}

const getDungeonTaskDescriptions = (entry: DungeonHistoryEntry): string[] => {
    const dungeon = DUNGEONS.find(item => item.id === entry.id);
    if (!dungeon) return [];
    return dungeon.floors.flatMap(floor => floor.tasks.map(task => task.description));
};

// --- HELPER FUNCTIONS & CONSTANTS ---
const difficultyStyles: Record<Difficulty, { text: string; border: string }> = {
    [Difficulty.E]: { text: 'text-gray-500', border: 'border-gray-700' },
    [Difficulty.D]: { text: 'text-green-300', border: 'border-green-500' },
    [Difficulty.C]: { text: 'text-orange-300', border: 'border-orange-500' },
    [Difficulty.B]: { text: 'text-indigo-300', border: 'border-indigo-500' },
    [Difficulty.A]: { text: 'text-purple-300', border: 'border-purple-500' },
    [Difficulty.S]: { text: 'text-yellow-300', border: 'border-yellow-500' },
    [Difficulty.S_PLUS]: { text: 'text-red-400', border: 'border-red-500' },
    [Difficulty.X]: { text: 'text-red-400', border: 'border-red-800' },
};

const RLL_BLUE = '59, 130, 246';

const getActivityBlueStyle = (xp: number): React.CSSProperties | undefined => {
    if (xp <= 30) return undefined;

    const intensity = xp <= 50
        ? { fill: 0.05, border: 0.16, text: 0.36, glow: 0 }
        : xp <= 80
            ? { fill: 0.08, border: 0.24, text: 0.48, glow: 0 }
            : xp <= 100
                ? { fill: 0.12, border: 0.34, text: 0.62, glow: 0 }
                : xp <= 150
                    ? { fill: 0.18, border: 0.52, text: 0.82, glow: 0 }
                    : xp <= 200
                        ? { fill: 0.2, border: 0.62, text: 0.9, glow: 8 }
                        : xp <= 250
                            ? { fill: 0.24, border: 0.76, text: 1, glow: 14 }
                            : { fill: 0.3, border: 0.95, text: 1, glow: 22 };

    return {
        color: `rgba(${RLL_BLUE}, ${intensity.text})`,
        backgroundColor: `rgba(${RLL_BLUE}, ${intensity.fill})`,
        borderColor: `rgba(${RLL_BLUE}, ${intensity.border})`,
        boxShadow: intensity.glow > 0
            ? `0 0 ${intensity.glow}px rgba(${RLL_BLUE}, ${intensity.border}), inset 0 0 ${Math.max(4, intensity.glow / 2)}px rgba(${RLL_BLUE}, ${intensity.fill})`
            : 'none',
    };
};

const RoutePreview: React.FC<{ points: NonNullable<CompletedQuest['runRoute']> }> = ({ points }) => {
    if (points.length < 2) {
        return <div className="h-48 border border-white/10 bg-slate-950 rounded flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-500">No route points saved</div>;
    }

    const minLat = Math.min(...points.map(p => p.latitude));
    const maxLat = Math.max(...points.map(p => p.latitude));
    const minLon = Math.min(...points.map(p => p.longitude));
    const maxLon = Math.max(...points.map(p => p.longitude));
    const latRange = Math.max(0.00001, maxLat - minLat);
    const lonRange = Math.max(0.00001, maxLon - minLon);
    const width = 360;
    const height = 220;
    const padding = 24;
    const scale = Math.min((width - padding * 2) / lonRange, (height - padding * 2) / latRange);
    const routeWidth = lonRange * scale;
    const routeHeight = latRange * scale;
    const offsetX = padding + (width - padding * 2 - routeWidth) / 2;
    const offsetY = padding + (height - padding * 2 - routeHeight) / 2;
    const path = points.map((point, index) => {
        const x = offsetX + (point.longitude - minLon) * scale;
        const y = offsetY + (maxLat - point.latitude) * scale;
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 border border-cyan-500/20 bg-slate-950 rounded">
            <defs>
                <pattern id="route-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(56,189,248,0.12)" strokeWidth="1" />
                </pattern>
                <filter id="route-glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <rect width={width} height={height} fill="url(#route-grid)" />
            <path d={path} fill="none" stroke="#22d3ee" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" filter="url(#route-glow)" />
            <circle cx={offsetX + (points[0].longitude - minLon) * scale} cy={offsetY + (maxLat - points[0].latitude) * scale} r="7" fill="#22c55e" />
            <circle cx={offsetX + (points[points.length - 1].longitude - minLon) * scale} cy={offsetY + (maxLat - points[points.length - 1].latitude) * scale} r="7" fill="#f43f5e" />
        </svg>
    );
};

const RunDetailPanel: React.FC<{ quest: CompletedQuest }> = ({ quest }) => {
    if (!quest.runStats) return null;
    const image = quest.runRouteImage || (quest.runRoute ? createRouteImage(quest.runRoute, quest.runStats, quest.name) : null);
    return (
        <div className="border border-cyan-500/25 bg-slate-950/80 rounded p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-orbitron text-[9px] text-cyan-300 uppercase tracking-[0.25em]">Run Details</p>
                    <h3 className="font-orbitron text-lg text-white font-bold uppercase">{quest.name}</h3>
                </div>
                <span className="font-orbitron text-2xl text-blue-300 font-black">[{quest.runStats.finalGrade}]</span>
            </div>
            {quest.runRoute && <RoutePreview points={quest.runRoute} />}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/40 border border-white/10 rounded p-2"><p className="text-[8px] text-gray-500 uppercase">Distance</p><p className="font-orbitron text-cyan-300 text-sm">{formatDistance(quest.runStats.distanceMeters)}</p></div>
                <div className="bg-black/40 border border-white/10 rounded p-2"><p className="text-[8px] text-gray-500 uppercase">Pace</p><p className="font-orbitron text-green-300 text-sm">{formatPace(quest.runStats.paceSecondsPerKm)}</p></div>
                <div className="bg-black/40 border border-white/10 rounded p-2"><p className="text-[8px] text-gray-500 uppercase">XP</p><p className="font-orbitron text-yellow-300 text-sm">+{quest.runStats.totalXp}</p></div>
            </div>
            {image && (
                <button onClick={() => downloadRouteImage(image, `${quest.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-route.png`)} className="w-full font-orbitron bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-3 rounded uppercase text-[10px] font-black tracking-widest border border-cyan-400/50">
                    Save Route Image
                </button>
            )}
        </div>
    );
};

// --- DETAIL MODAL ---
const HistoryDetailModal: React.FC<{ date: Date; activities: DailyActivity; onClose: () => void }> = ({ date, activities, onClose }) => {
    const [selectedRun, setSelectedRun] = useState<CompletedQuest | null>(null);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 border-2 border-blue-500/50 rounded-lg shadow-2xl shadow-blue-500/20 w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="font-orbitron text-xl text-blue-300">{date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                        <p className="font-bold text-yellow-300">Total XP Earned: {activities.totalXp}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
                    {selectedRun && <RunDetailPanel quest={selectedRun} />}
                    {activities.quests.length > 0 && <div><h3 className="font-orbitron text-lg text-gray-300 mb-2">Activities Recorded</h3><div className="space-y-2">{activities.quests.map(q => {
                        const content = <><span className={`font-bold mr-2 ${difficultyStyles[q.difficulty].text}`}>[{q.difficulty}]</span>{q.name} - <span className={q.difficulty === Difficulty.X ? 'text-red-500' : 'text-yellow-400'}>{q.difficulty === Difficulty.X ? 'PENALTY APPLIED' : `${q.earnedXp ?? XP_PER_DIFFICULTY[q.difficulty]} XP`}</span>{q.runStats && <div className="mt-1 text-[10px] uppercase tracking-normal text-cyan-300/80">{formatDistance(q.runStats.distanceMeters)} | {formatPace(q.runStats.paceSecondsPerKm)} | {q.runStats.modifierLabel}</div>}</>;
                        return q.runStats ? (
                            <button key={q.completionId} onClick={() => setSelectedRun(q)} className="w-full text-left p-2 bg-gray-900/50 hover:bg-cyan-950/40 rounded-md text-sm border border-cyan-500/20 transition-colors">{content}</button>
                        ) : (
                            <div key={q.completionId} className={`p-2 bg-gray-900/50 rounded-md text-sm ${q.difficulty === Difficulty.X ? 'border border-red-800' : ''}`}>{content}</div>
                        );
                    })}</div></div>}
                    {activities.dungeons.length > 0 && (
                        <div>
                            <h3 className="font-orbitron text-lg text-gray-300 mb-2">Dungeon Tasks Recorded</h3>
                            <div className="space-y-2">
                                {activities.dungeons.flatMap(d => {
                                    const tasks = getDungeonTaskDescriptions(d);
                                    return tasks.length > 0
                                        ? tasks.map((task, index) => (
                                            <div key={`${d.completedAt}-${index}`} className="p-2 bg-gray-900/50 rounded-md text-sm">
                                                <span className={`font-bold mr-2 ${difficultyStyles[d.grade].text}`}>[{d.grade}]</span>
                                                {task}
                                            </div>
                                        ))
                                        : [(
                                            <div key={d.completedAt} className="p-2 bg-gray-900/50 rounded-md text-sm">
                                                <span className={`font-bold mr-2 ${difficultyStyles[d.grade].text}`}>[{d.grade}]</span>
                                                {d.name}
                                            </div>
                                        )];
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export const QuestHistory: React.FC<QuestHistoryProps> = ({ completedQuests, dungeonHistory, onUpgradePro, isPro }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<DailyActivity | null>(null);

    const activitiesByDate = useMemo(() => {
        const data = new Map<string, DailyActivity>();
        const toLocalDateKey = (d: Date | number | string): string => {
            const date = new Date(d);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        completedQuests.forEach(quest => {
            const dateStr = toLocalDateKey(quest.completedAt);
            const entry = data.get(dateStr) || { quests: [], dungeons: [], totalXp: 0 };
            entry.quests.push(quest);
            entry.totalXp += quest.earnedXp ?? (XP_PER_DIFFICULTY[quest.difficulty] || 0);
            data.set(dateStr, entry);
        });

        dungeonHistory.forEach(dungeon => {
            if (dungeon.status === 'cleared') {
                const dateStr = toLocalDateKey(dungeon.completedAt);
                const entry = data.get(dateStr) || { quests: [], dungeons: [], totalXp: 0 };
                entry.dungeons.push(dungeon);
                const dungeonData = DUNGEONS.find(d => d.id === dungeon.id);
                entry.totalXp += dungeonData?.rewards?.xp || 0;
                data.set(dateStr, entry);
            }
        });

        return data;
    }, [completedQuests, dungeonHistory]);

    const handleDayClick = (date: Date, activity: DailyActivity) => {
        if (isPro) {
            setSelectedDate(date);
            setSelectedActivity(activity);
        } else {
            onUpgradePro();
        }
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const cells = [];
        const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
        for (let i = 0; i < paddingDays; i++) {
            cells.push(<div key={`pad-start-${i}`} className="h-14"></div>);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayActivity = activitiesByDate.get(dateStr);
            const hasActivity = !!dayActivity;
            const activityXp = dayActivity?.totalXp || 0;
            const activityStyle = getActivityBlueStyle(activityXp);
            const isLowActivity = hasActivity && activityXp <= 30;
            
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

            cells.push(
                <div key={day} className="flex items-center justify-center h-14">
                    <button 
                        onClick={() => { if (hasActivity) handleDayClick(date, dayActivity!); }}
                        className={`w-12 h-12 flex items-center justify-center text-base font-bold rounded-full transition-[filter,transform] duration-200 border-2 ${hasActivity ? 'hover:brightness-125 hover:scale-105 cursor-pointer' : 'bg-transparent border-gray-800 text-gray-600 cursor-default'} ${isLowActivity ? 'bg-gray-900/50 border-gray-700 text-gray-400' : ''} ${isToday ? 'ring-1 ring-white/35 ring-offset-2 ring-offset-[#020617]' : ''}`}
                        style={activityStyle}
                        aria-label={hasActivity ? `${day}, ${activityXp} XP earned` : `${day}, no activity`}
                        disabled={!hasActivity}
                    >
                        <span>{day}</span>
                    </button>
                </div>
            );
        }
        return cells;
    };
    
    const changeMonth = (delta: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    return (
        <div>
            {!isPro && (
                <div className="flex items-center gap-2 mb-4 text-[10px] font-orbitron font-black text-yellow-500/70 uppercase tracking-widest bg-yellow-900/20 border border-yellow-500/20 rounded px-3 py-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <span>Tap a date to view details — <span className="text-yellow-300">Pro feature</span></span>
                </div>
            )}
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="font-orbitron p-2 rounded-md hover:bg-gray-700">&lt;</button>
                <h2 className="font-orbitron text-2xl text-blue-300">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => changeMonth(1)} className="font-orbitron p-2 rounded-md hover:bg-gray-700">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 text-sm mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

            {selectedDate && selectedActivity && (
                <HistoryDetailModal
                    date={selectedDate}
                    activities={selectedActivity}
                    onClose={() => { setSelectedDate(null); setSelectedActivity(null); }}
                />
            )}
        </div>
    );
};

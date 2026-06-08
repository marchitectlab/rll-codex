import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { DistanceRunResult, Quest } from '../types';
import { calculateDistanceQuestResult, formatDistance, formatDuration, formatPace } from '../lib/distanceQuest';

type RunStatus = 'ready' | 'running' | 'summary';
type SummaryState = 'saved' | 'discarded';

const MIN_RECORDABLE_DISTANCE_METERS = 400;
const MAX_COUNTED_ACCURACY_METERS = 25;
const MAX_REASONABLE_RUN_SPEED_MPS = 7.5;
const MIN_COUNTED_SEGMENT_METERS = 4;
const REQUIRED_STABLE_FIXES = 3;

interface DistanceRunPageProps {
  quest: Quest;
  onCancel: () => void;
  onFinish: (questId: string, distanceMeters: number, durationSeconds: number) => DistanceRunResult | null;
}

type RunPoint = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
};

const toRadians = (value: number) => value * Math.PI / 180;

const getDistanceBetween = (a: RunPoint, b: RunPoint): number => {
  const earthRadius = 6371000;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const StatBlock: React.FC<{ label: string; value: string; tone?: string }> = ({ label, value, tone = 'text-white' }) => (
  <div className="bg-black/40 border border-blue-500/20 rounded p-3">
    <p className="font-orbitron text-[8px] text-blue-300/60 uppercase tracking-[0.25em] mb-1">{label}</p>
    <p className={`font-orbitron text-xl font-black ${tone}`}>{value}</p>
  </div>
);

const RouteMap: React.FC<{ points: RunPoint[]; distanceMeters: number }> = ({ points, distanceMeters }) => {
  const path = useMemo(() => {
    if (points.length < 2) return '';
    const minLat = Math.min(...points.map(p => p.latitude));
    const maxLat = Math.max(...points.map(p => p.latitude));
    const minLng = Math.min(...points.map(p => p.longitude));
    const maxLng = Math.max(...points.map(p => p.longitude));
    const latRange = Math.max(0.00001, maxLat - minLat);
    const lngRange = Math.max(0.00001, maxLng - minLng);

    return points.map(p => {
      const x = 8 + ((p.longitude - minLng) / lngRange) * 84;
      const y = 92 - ((p.latitude - minLat) / latRange) * 84;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  }, [points]);

  return (
    <div className="border border-blue-500/20 bg-black/40 rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="font-orbitron text-[8px] text-blue-300/60 uppercase tracking-[0.25em]">Route Map</p>
        <p className="font-orbitron text-[8px] text-cyan-300 uppercase tracking-widest">{formatDistance(distanceMeters)}</p>
      </div>
      <svg viewBox="0 0 100 100" className="w-full h-44 md:h-56 bg-slate-950/70 border border-white/5 rounded">
        <defs>
          <pattern id="route-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(56,189,248,0.12)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#route-grid)" />
        {path ? (
          <>
            <polyline points={path} fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={path} fill="none" stroke="#67e8f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={path.split(' ')[0].split(',')[0]} cy={path.split(' ')[0].split(',')[1]} r="2.6" fill="#22c55e" />
            <circle cx={path.split(' ').at(-1)?.split(',')[0]} cy={path.split(' ').at(-1)?.split(',')[1]} r="2.6" fill="#f87171" />
          </>
        ) : (
          <text x="50" y="52" textAnchor="middle" className="fill-slate-500 text-[5px] font-bold uppercase tracking-widest">Waiting for stable GPS movement</text>
        )}
      </svg>
    </div>
  );
};

export const DistanceRunPage: React.FC<DistanceRunPageProps> = ({ quest, onCancel, onFinish }) => {
  const [status, setStatus] = useState<RunStatus>('ready');
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('Awaiting GPS lock');
  const [result, setResult] = useState<DistanceRunResult | null>(null);
  const [summaryState, setSummaryState] = useState<SummaryState>('saved');
  const [routePoints, setRoutePoints] = useState<RunPoint[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const lastPointRef = useRef<RunPoint | null>(null);
  const stableFixCountRef = useRef(0);

  const preview = useMemo(
    () => calculateDistanceQuestResult(distanceMeters, elapsedSeconds),
    [distanceMeters, elapsedSeconds]
  );

  useEffect(() => {
    if (status !== 'running') return;
    const timer = window.setInterval(() => {
      if (startedAtRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const startRun = () => {
    if (!navigator.geolocation) {
      setGpsStatus('GPS is not available on this device.');
      return;
    }

    setDistanceMeters(0);
    setElapsedSeconds(0);
    setResult(null);
    setSummaryState('saved');
    setRoutePoints([]);
    lastPointRef.current = null;
    stableFixCountRef.current = 0;
    startedAtRef.current = Date.now();
    setStatus('running');
    setGpsStatus('Searching for GPS signal');

    watchIdRef.current = navigator.geolocation.watchPosition(
      position => {
        const point: RunPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp || Date.now(),
        };

        if (point.accuracy && point.accuracy > MAX_COUNTED_ACCURACY_METERS) {
          stableFixCountRef.current = 0;
          setGpsStatus(`Weak GPS accuracy: ${Math.round(point.accuracy)} m. Move outdoors for a stable lock.`);
          return;
        }

        stableFixCountRef.current += 1;
        if (stableFixCountRef.current < REQUIRED_STABLE_FIXES) {
          lastPointRef.current = point;
          setGpsStatus(`Stabilizing GPS lock ${stableFixCountRef.current}/${REQUIRED_STABLE_FIXES}`);
          return;
        }

        const previous = lastPointRef.current;
        lastPointRef.current = point;

        setGpsStatus(point.accuracy ? `GPS locked: ${Math.round(point.accuracy)} m accuracy` : 'GPS locked');
        setRoutePoints(current => current.length === 0 ? [point] : current);

        if (!previous) {
          setRoutePoints(current => current.length === 0 ? [point] : current);
          return;
        }

        const segment = getDistanceBetween(previous, point);
        const secondsBetween = Math.max(1, (point.timestamp - previous.timestamp) / 1000);
        const speed = segment / secondsBetween;
        const accuracyNoiseFloor = Math.max(
          MIN_COUNTED_SEGMENT_METERS,
          ((previous.accuracy || MAX_COUNTED_ACCURACY_METERS) + (point.accuracy || MAX_COUNTED_ACCURACY_METERS)) * 0.45
        );

        if (segment >= accuracyNoiseFloor && speed <= MAX_REASONABLE_RUN_SPEED_MPS) {
          setDistanceMeters(current => current + segment);
          setRoutePoints(current => [...current, point].slice(-800));
        } else if (speed > MAX_REASONABLE_RUN_SPEED_MPS) {
          setGpsStatus('GPS jump ignored. Keep moving steadily.');
        } else {
          setGpsStatus('Small GPS drift ignored.');
        }
      },
      error => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Location permission denied.'
          : error.code === error.POSITION_UNAVAILABLE
            ? 'GPS position unavailable.'
            : 'GPS signal timed out.';
        setGpsStatus(message);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
  };

  const finishRun = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    const duration = startedAtRef.current ? Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000)) : elapsedSeconds;
    setElapsedSeconds(duration);
    if (distanceMeters < MIN_RECORDABLE_DISTANCE_METERS) {
      setSummaryState('discarded');
      setResult(calculateDistanceQuestResult(distanceMeters, duration));
      setStatus('summary');
      return;
    }

    const savedResult = onFinish(quest.id, distanceMeters, duration);
    setSummaryState('saved');
    setResult(savedResult);
    setStatus('summary');
  };

  return (
    <div className="min-h-full bg-[#020617] text-white overflow-y-auto">
      <div className="min-h-full px-4 py-5 md:p-8 flex flex-col">
        <header className="flex items-center justify-between gap-3 mb-6">
          <button onClick={onCancel} className="font-orbitron text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/10 px-3 py-2 rounded hover:text-white hover:border-blue-400/50">
            Back
          </button>
          <div className="text-right min-w-0">
            <p className="font-orbitron text-[8px] text-blue-400 uppercase tracking-[0.3em]">Distance Quest</p>
            <h1 className="font-orbitron text-lg md:text-2xl font-black uppercase tracking-widest truncate">{quest.name}</h1>
          </div>
        </header>

        <section className="border border-blue-500/20 bg-blue-950/10 rounded p-4 md:p-6 mb-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="font-orbitron text-[9px] text-gray-500 uppercase tracking-[0.25em]">Live Grade</p>
              <p className="font-orbitron text-5xl md:text-7xl font-black text-blue-300 drop-shadow-[0_0_18px_rgba(56,189,248,0.6)]">[{preview.finalGrade}]</p>
            </div>
            <div className="text-right">
              <p className="font-orbitron text-[9px] text-gray-500 uppercase tracking-[0.25em]">Reward</p>
              <p className="font-orbitron text-3xl font-black text-yellow-300">+{preview.totalXp}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{preview.modifierLabel}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <StatBlock label="Distance" value={formatDistance(distanceMeters)} tone="text-cyan-300" />
            <StatBlock label="Time" value={formatDuration(elapsedSeconds)} />
            <StatBlock label="Pace" value={formatPace(preview.paceSecondsPerKm)} tone="text-green-300" />
          </div>
        </section>

        <div className="mb-5">
          <RouteMap points={routePoints} distanceMeters={distanceMeters} />
        </div>

        <div className="flex-1 border border-white/10 bg-black/30 rounded p-4 md:p-6 mb-5">
          {status === 'summary' && result ? (
            <div className="h-full flex flex-col justify-center text-center py-8">
              <p className={`font-orbitron text-[10px] uppercase tracking-[0.3em] mb-3 ${summaryState === 'discarded' ? 'text-red-400' : 'text-blue-400'}`}>{summaryState === 'discarded' ? 'Run Discarded' : 'Run Summary'}</p>
              <h2 className="font-orbitron text-3xl md:text-5xl font-black text-white uppercase mb-2">{summaryState === 'discarded' ? 'Minimum Not Met' : result.title}</h2>
              <p className={`font-orbitron text-6xl font-black mb-6 ${summaryState === 'discarded' ? 'text-red-400' : 'text-blue-300'}`}>{summaryState === 'discarded' ? '0 XP' : `[${result.finalGrade}]`}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                <StatBlock label="Distance" value={formatDistance(result.distanceMeters)} tone="text-cyan-300" />
                <StatBlock label="Time" value={formatDuration(result.durationSeconds)} />
                <StatBlock label="Pace" value={formatPace(result.paceSecondsPerKm)} tone="text-green-300" />
                <StatBlock label="XP" value={summaryState === 'discarded' ? '+0' : `+${result.totalXp}`} tone="text-yellow-300" />
              </div>
              {summaryState === 'discarded' && (
                <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed max-w-xl mx-auto mb-6">
                  Runs under {MIN_RECORDABLE_DISTANCE_METERS} m are treated as warmups and are not saved to history.
                </p>
              )}
              <button onClick={onCancel} className="font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-5 py-3 rounded uppercase text-[10px] font-black tracking-widest border border-blue-400/50">
                Return to Quest Log
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center text-center py-8">
              <p className="font-orbitron text-[10px] text-blue-300 uppercase tracking-[0.3em] mb-3">{status === 'running' ? 'Run in progress' : 'Ready for deployment'}</p>
              <p className="text-xs md:text-sm text-gray-400 uppercase tracking-widest leading-relaxed max-w-xl mx-auto">
                {status === 'running'
                  ? 'Keep the app open while running. GPS drift and sudden jumps are filtered out.'
                  : `Start outside with location enabled. Runs under ${MIN_RECORDABLE_DISTANCE_METERS} m are discarded.`}
              </p>
              <p className="font-orbitron text-[9px] text-gray-500 uppercase tracking-widest mt-5">{gpsStatus}</p>
            </div>
          )}
        </div>

        {status === 'running' ? (
          <button onClick={finishRun} className="font-orbitron bg-red-700 hover:bg-red-600 text-white px-6 py-4 rounded uppercase text-xs font-black tracking-widest border border-red-400/50">
            Finish Run
          </button>
        ) : status === 'ready' ? (
          <button onClick={startRun} className="font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-6 py-4 rounded uppercase text-xs font-black tracking-widest border border-blue-400/50">
            Start Run
          </button>
        ) : null}
      </div>
    </div>
  );
};

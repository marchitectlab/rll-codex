import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DistanceRunResult, Quest, RunRoutePoint } from '../types';
import { calculateDistanceQuestResult, formatDistance, formatDuration, formatPace } from '../lib/distanceQuest';
import { openRunTrackerSettings, startRunTracker, type RunTrackerHandle } from '../lib/runTracker';
import { createRouteImage, downloadRouteImage } from '../lib/routeImage';

type RunStatus = 'ready' | 'acquiring' | 'running' | 'summary';
type SummaryState = 'saved' | 'discarded';

const MIN_RECORDABLE_DISTANCE_METERS = 400;
const MAX_COUNTED_ACCURACY_METERS = 25;
const MAX_REASONABLE_RUN_SPEED_MPS = 7.5;
const MIN_COUNTED_SEGMENT_METERS = 4;
const REQUIRED_STABLE_FIXES = 3;

interface DistanceRunPageProps {
  quest: Quest;
  onCancel: () => void;
  onFinish: (questId: string, distanceMeters: number, durationSeconds: number, route: RunRoutePoint[], routeImage?: string) => DistanceRunResult | null;
  headerLabel?: string;
  targetDistanceMeters?: number;
  autoCompleteTarget?: boolean;
  onTargetComplete?: (distanceMeters: number, durationSeconds: number, route: RunRoutePoint[], routeImage?: string) => void;
  showLiveGrade?: boolean;
  isDungeonMode?: boolean;
  backgroundImage?: string;
  abortLabel?: string;
  threatWarning?: string;
  disableManualFinish?: boolean;
  dungeonTimeRemainingSeconds?: number | null;
}

type RunPoint = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number | null;
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

const StatBlock: React.FC<{ label: string; value: string; tone?: string; compact?: boolean }> = ({ label, value, tone = 'text-white', compact = false }) => (
  <div className={`bg-slate-950/70 border border-blue-500/20 rounded-sm shadow-[inset_0_0_18px_rgba(15,23,42,0.75)] ${compact ? 'p-2' : 'p-3'}`}>
    <p className={`font-orbitron text-blue-300/55 uppercase tracking-normal ${compact ? 'text-[7px] mb-0.5' : 'text-[8px] mb-1'}`}>{label}</p>
    <p className={`font-orbitron font-bold leading-none ${compact ? 'text-xs' : 'text-base md:text-xl'} ${tone}`}>{value}</p>
  </div>
);

const buildMarkerIcon = (color: string, label: string) => L.divIcon({
  className: 'rll-run-marker',
  html: `<div style="width:30px;height:30px;border-radius:9999px;background:rgba(2,6,23,.9);border:2px solid ${color};box-shadow:0 0 0 5px rgba(2,6,23,.45),0 0 22px ${color};display:flex;align-items:center;justify-content:center;"><span style="width:12px;height:12px;border-radius:9999px;background:${color};box-shadow:0 0 18px ${color};color:#020617;font-size:8px;font-weight:900;font-family:Arial,sans-serif;line-height:12px;text-align:center;">${label}</span></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const startIcon = buildMarkerIcon('#22c55e', 'S');
const currentIcon = buildMarkerIcon('#38bdf8', '');

const RouteMap: React.FC<{ points: RunPoint[]; distanceMeters: number; gpsStatus: string; compact?: boolean }> = ({ points, distanceMeters, gpsStatus, compact }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const routeGlowRef = useRef<L.Polyline | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    }).setView([0, 0], 1);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      crossOrigin: true,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    routeGlowRef.current = L.polyline([], {
      color: '#0ea5e9',
      weight: 13,
      opacity: 0.24,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false,
    }).addTo(map);

    routeRef.current = L.polyline([], {
      color: '#67e8f9',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      routeRef.current = null;
      routeGlowRef.current = null;
      startMarkerRef.current = null;
      currentMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const route = routeRef.current;
    const routeGlow = routeGlowRef.current;
    if (!map || !route || !routeGlow) return;

    const latLngs = points.map(p => L.latLng(p.latitude, p.longitude));
    route.setLatLngs(latLngs);
    routeGlow.setLatLngs(latLngs);

    if (latLngs.length === 0) {
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
      if (currentMarkerRef.current) {
        currentMarkerRef.current.remove();
        currentMarkerRef.current = null;
      }
      return;
    }

    const first = latLngs[0];
    const last = latLngs[latLngs.length - 1];

    if (!startMarkerRef.current) {
      startMarkerRef.current = L.marker(first, { icon: startIcon, keyboard: false }).addTo(map);
    } else {
      startMarkerRef.current.setLatLng(first);
    }

    if (!currentMarkerRef.current) {
      currentMarkerRef.current = L.marker(last, { icon: currentIcon, keyboard: false }).addTo(map);
    } else {
      currentMarkerRef.current.setLatLng(last);
    }

    if (latLngs.length === 1) {
      map.setView(last, 17, { animate: true });
    } else {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds.pad(0.25), { maxZoom: 17, animate: true });
    }
  }, [points]);

  return (
    <div className={`relative overflow-hidden bg-slate-950 shadow-[0_22px_60px_rgba(0,0,0,0.45)] ${compact ? 'h-28 w-28 rounded-full border-2 border-cyan-300/35 ring-2 ring-black/45' : 'rounded-sm border border-blue-500/20'}`}>
      <div className={`absolute left-0 right-0 top-0 z-[401] pointer-events-none bg-gradient-to-b from-black/70 via-black/20 to-transparent ${compact ? 'p-1.5' : 'p-3'}`}>
        <div className="flex items-center justify-between gap-3">
          {!compact && <div>
            <p className="font-orbitron text-[8px] text-blue-200/60 uppercase tracking-[0.22em]">Live Route</p>
            <p className="font-orbitron text-[10px] text-slate-200 uppercase tracking-normal">{gpsStatus}</p>
          </div>}
          <div className={`border border-cyan-300/30 bg-black/55 text-center ${compact ? 'mx-auto rounded-full px-2 py-1' : 'rounded-sm px-3 py-2 text-right'}`}>
            {!compact && <p className="font-orbitron text-[8px] text-cyan-200/60 uppercase tracking-[0.18em]">Distance</p>}
            <p className={`font-orbitron text-cyan-200 font-bold leading-none ${compact ? 'text-[9px]' : 'text-sm'}`}>{formatDistance(distanceMeters)}</p>
          </div>
        </div>
      </div>
      <div className="relative">
        <div ref={containerRef} className={`run-map-modern w-full bg-slate-950 ${compact ? 'h-28 min-h-[7rem] rounded-full' : 'h-[58vh] min-h-[360px] max-h-[620px]'}`} />
        <div className={`absolute inset-0 pointer-events-none ${compact ? 'rounded-full bg-[radial-gradient(circle_at_center,transparent_35%,rgba(2,6,23,0.65)),linear-gradient(180deg,rgba(2,6,23,0.02),rgba(2,6,23,0.24))]' : 'bg-[radial-gradient(circle_at_center,transparent_45%,rgba(2,6,23,0.45)),linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.36))]'}`} />
        {!compact && <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none bg-gradient-to-t from-black/70 to-transparent" />}
        {points.length === 0 && (
          <div className={`absolute inset-0 pointer-events-none flex items-center justify-center bg-slate-950/72 backdrop-blur-[2px] ${compact ? 'rounded-full' : ''}`}>
            <div className={`border border-blue-400/25 bg-black/45 text-center shadow-[0_0_30px_rgba(56,189,248,0.12)] ${compact ? 'rounded-full px-2 py-2' : 'rounded-sm px-5 py-4'}`}>
              <p className={`font-orbitron text-blue-300 uppercase ${compact ? 'text-[7px] tracking-normal mb-0' : 'text-[9px] tracking-[0.22em] mb-2'}`}>{compact ? 'GPS' : 'Acquiring Signal'}</p>
              {!compact && <p className="font-rajdhani text-sm text-slate-200 font-semibold uppercase tracking-normal px-4">{gpsStatus}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DistanceRunPage: React.FC<DistanceRunPageProps> = ({ quest, onCancel, onFinish, headerLabel = 'Distance Quest', targetDistanceMeters, autoCompleteTarget = false, onTargetComplete, showLiveGrade = true, isDungeonMode = false, backgroundImage, abortLabel = 'Back', threatWarning, disableManualFinish = false, dungeonTimeRemainingSeconds = null }) => {
  const [status, setStatus] = useState<RunStatus>('ready');
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('Awaiting GPS lock');
  const [result, setResult] = useState<DistanceRunResult | null>(null);
  const [summaryState, setSummaryState] = useState<SummaryState>('saved');
  const [routePoints, setRoutePoints] = useState<RunPoint[]>([]);
  const [routeImage, setRouteImage] = useState<string | null>(null);
  const trackerHandleRef = useRef<RunTrackerHandle | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const lastRawPointRef = useRef<RunPoint | null>(null);
  const lastAcceptedPointRef = useRef<RunPoint | null>(null);
  const latestStablePointRef = useRef<RunPoint | null>(null);
  const hasUserStartedRef = useRef(false);
  const stableFixCountRef = useRef(0);
  const targetCompletedRef = useRef(false);

  const preview = useMemo(
    () => calculateDistanceQuestResult(distanceMeters, elapsedSeconds),
    [distanceMeters, elapsedSeconds]
  );
  const dungeonClock = dungeonTimeRemainingSeconds !== null
    ? `${Math.floor(Math.max(0, dungeonTimeRemainingSeconds) / 60).toString().padStart(2, '0')}:${(Math.max(0, dungeonTimeRemainingSeconds) % 60).toString().padStart(2, '0')}`
    : null;

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
      void trackerHandleRef.current?.stop();
      trackerHandleRef.current = null;
    };
  }, []);

  const stopTracker = async () => {
    if (trackerHandleRef.current) {
      await trackerHandleRef.current.stop();
      trackerHandleRef.current = null;
    }
  };

  const beginTracking = async () => {
    await stopTracker();

    setDistanceMeters(0);
    setElapsedSeconds(0);
    setResult(null);
    setSummaryState('saved');
    setRouteImage(null);
    setRoutePoints([]);
    lastRawPointRef.current = null;
    lastAcceptedPointRef.current = null;
    latestStablePointRef.current = null;
    hasUserStartedRef.current = false;
    stableFixCountRef.current = 0;
    targetCompletedRef.current = false;
    startedAtRef.current = null;
    setStatus('acquiring');
    setGpsStatus('Locating you with native high-accuracy GPS.');

    try {
      trackerHandleRef.current = await startRunTracker(
        (position, error) => {
          if (error) {
            const message = error.code === 'NOT_AUTHORIZED' || error.code === '1'
              ? 'Location permission denied. Enable precise location in app settings.'
              : error.message || 'GPS position unavailable.';
            setGpsStatus(message);
            if (error.code === 'NOT_AUTHORIZED') {
              void openRunTrackerSettings();
            }
            if (!startedAtRef.current) {
              setStatus('ready');
            }
            return;
          }

          if (!position) return;

          const point: RunPoint = {
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
            speed: position.speed,
            timestamp: position.timestamp || Date.now(),
          };

          if (point.accuracy && point.accuracy > MAX_COUNTED_ACCURACY_METERS) {
            stableFixCountRef.current = 0;
            setGpsStatus(`Weak GPS accuracy: ${Math.round(point.accuracy)} m. Move outdoors for a stable lock.`);
            return;
          }

          stableFixCountRef.current += 1;
          if (stableFixCountRef.current < REQUIRED_STABLE_FIXES) {
            lastRawPointRef.current = point;
            setGpsStatus(`Stabilizing GPS lock ${stableFixCountRef.current}/${REQUIRED_STABLE_FIXES}`);
            return;
          }

          const previousRawPoint = lastRawPointRef.current;
          lastRawPointRef.current = point;
          latestStablePointRef.current = point;

          setGpsStatus(point.accuracy ? `GPS locked: ${Math.round(point.accuracy)} m accuracy` : 'GPS locked');
          if (!hasUserStartedRef.current) {
            lastAcceptedPointRef.current = point;
            setRoutePoints([point]);
            setStatus('ready');
            return;
          }

          if (!startedAtRef.current) {
            startedAtRef.current = Date.now();
            setElapsedSeconds(0);
            setStatus('running');
          }

          if (!lastAcceptedPointRef.current) {
            lastAcceptedPointRef.current = point;
            setRoutePoints(current => current.length === 0 ? [point] : current);
            return;
          }

          const previousAcceptedPoint = lastAcceptedPointRef.current;
          const segment = getDistanceBetween(previousAcceptedPoint, point);
          const acceptedSecondsBetween = Math.max(1, (point.timestamp - previousAcceptedPoint.timestamp) / 1000);
          const acceptedSpeed = segment / acceptedSecondsBetween;
          const rawSegment = previousRawPoint ? getDistanceBetween(previousRawPoint, point) : 0;
          const rawSecondsBetween = previousRawPoint ? Math.max(1, (point.timestamp - previousRawPoint.timestamp) / 1000) : 1;
          const rawSpeed = rawSegment / rawSecondsBetween;
          const accuracyNoiseFloor = Math.max(
            MIN_COUNTED_SEGMENT_METERS,
            ((previousAcceptedPoint.accuracy || MAX_COUNTED_ACCURACY_METERS) + (point.accuracy || MAX_COUNTED_ACCURACY_METERS)) * 0.45
          );

          if (rawSpeed > MAX_REASONABLE_RUN_SPEED_MPS || acceptedSpeed > MAX_REASONABLE_RUN_SPEED_MPS) {
            setGpsStatus('GPS jump ignored. Keep moving steadily.');
          } else if (segment >= accuracyNoiseFloor) {
            lastAcceptedPointRef.current = point;
            setDistanceMeters(current => current + segment);
            setRoutePoints(current => [...current, point].slice(-800));
          } else {
            setGpsStatus('Movement accumulating. Small GPS drift filtered.');
          }
        }
      );
      setGpsStatus(
        trackerHandleRef.current.mode === 'native-background'
          ? 'Native background tracker active. Locating you.'
          : 'Browser tracker active. Locating you.'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not start location tracking.';
      setGpsStatus(message);
      setStatus('ready');
    }
  };

  useEffect(() => {
    void beginTracking();
    return () => {
      void stopTracker();
    };
  }, [quest.id]);

  const startRun = () => {
    const startPoint = latestStablePointRef.current || lastAcceptedPointRef.current;
    if (!startPoint) {
      setStatus('acquiring');
      setGpsStatus('Still locating. Wait for a stable GPS lock.');
      return;
    }
    hasUserStartedRef.current = true;
    startedAtRef.current = Date.now();
    lastRawPointRef.current = startPoint;
    lastAcceptedPointRef.current = startPoint;
    setDistanceMeters(0);
    setElapsedSeconds(0);
    setRoutePoints([startPoint]);
    setStatus('running');
    setGpsStatus(startPoint.accuracy ? `Run started: ${Math.round(startPoint.accuracy)} m GPS accuracy` : 'Run started');
  };

  const finishRun = async () => {
    await stopTracker();
    const duration = startedAtRef.current ? Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000)) : elapsedSeconds;
    setElapsedSeconds(duration);
    if (distanceMeters < MIN_RECORDABLE_DISTANCE_METERS) {
      setSummaryState('discarded');
      setResult(calculateDistanceQuestResult(distanceMeters, duration));
      setStatus('summary');
      return;
    }

    const routeForSave = routePoints.map(({ latitude, longitude, accuracy, timestamp }) => ({ latitude, longitude, accuracy, timestamp }));
    const image = createRouteImage(routeForSave, calculateDistanceQuestResult(distanceMeters, duration), quest.name);
    setRouteImage(image);
    const savedResult = onFinish(quest.id, distanceMeters, duration, routeForSave, image || undefined);
    setSummaryState('saved');
    setResult(savedResult);
    setStatus('summary');
  };

  useEffect(() => {
    if (!autoCompleteTarget || !targetDistanceMeters || !onTargetComplete || status !== 'running' || targetCompletedRef.current) return;
    if (distanceMeters < targetDistanceMeters) return;

    targetCompletedRef.current = true;
    const completeTarget = async () => {
      await stopTracker();
      const duration = startedAtRef.current ? Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000)) : elapsedSeconds;
      const routeForSave = routePoints.map(({ latitude, longitude, accuracy, timestamp }) => ({ latitude, longitude, accuracy, timestamp }));
      const image = createRouteImage(routeForSave, calculateDistanceQuestResult(distanceMeters, duration), quest.name);
      onTargetComplete(distanceMeters, duration, routeForSave, image || undefined);
    };

    void completeTarget();
  }, [autoCompleteTarget, distanceMeters, elapsedSeconds, onTargetComplete, quest.name, routePoints, status, targetDistanceMeters]);

  return (
    <div
      className={`${isDungeonMode ? 'h-screen min-h-screen overflow-hidden' : 'min-h-full overflow-y-auto'} bg-[#020617] text-white`}
      style={isDungeonMode && backgroundImage ? {
        backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.02), rgba(2,6,23,0.10) 45%, rgba(2,6,23,0.30)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      <div className={`${isDungeonMode ? 'h-screen min-h-screen max-w-lg mx-auto justify-end' : 'min-h-full'} px-4 pb-5 md:p-8 flex flex-col`} style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', paddingBottom: isDungeonMode ? 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' : undefined }}>
        <header className={`flex items-center justify-between gap-3 ${isDungeonMode ? 'mb-3 rounded-sm border border-blue-300/20 bg-black/32 px-3 py-2 backdrop-blur-[2px] shadow-[0_0_22px_rgba(15,23,42,0.35)]' : 'mb-4'}`}>
          {isDungeonMode ? (
            <button onClick={onCancel} className="font-orbitron text-[9px] font-black uppercase tracking-widest text-red-300 border border-red-400/30 px-2.5 py-1.5 rounded-sm hover:text-white hover:border-red-300 bg-red-950/35">
              {abortLabel}
            </button>
          ) : (
            <button onClick={onCancel} className="font-orbitron text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/10 px-3 py-2 rounded-sm hover:text-white hover:border-blue-400/50 bg-black/30">
              Back
            </button>
          )}
          <div className="text-right min-w-0">
            {threatWarning && <p className="font-orbitron text-[8px] text-red-400 uppercase tracking-[0.22em] font-black">{threatWarning}</p>}
            <p className={`font-orbitron text-blue-400 uppercase ${isDungeonMode ? 'text-[7px] tracking-[0.2em]' : 'text-[8px] tracking-[0.3em]'}`}>{headerLabel}</p>
            <h1 className={`font-orbitron font-bold uppercase tracking-normal truncate ${isDungeonMode ? 'text-sm md:text-base' : 'text-base md:text-xl'}`}>{quest.name}</h1>
            {dungeonClock && <p className="mt-1 font-orbitron text-[9px] text-red-300 uppercase tracking-widest">Time {dungeonClock}</p>}
          </div>
        </header>

        <section className={`border border-blue-500/20 bg-blue-950/10 rounded-sm mb-4 ${isDungeonMode ? 'p-3 backdrop-blur-[2px] bg-black/28' : 'p-4 md:p-5'}`}>
          {showLiveGrade ? (
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="font-orbitron text-[9px] text-gray-500 uppercase tracking-normal">Live Grade</p>
                <p className="font-orbitron text-3xl md:text-5xl font-bold text-blue-300 drop-shadow-[0_0_14px_rgba(56,189,248,0.45)]">[{preview.finalGrade}]</p>
              </div>
              <div className="text-right">
                <p className="font-orbitron text-[9px] text-gray-500 uppercase tracking-normal">Reward</p>
                <p className="font-orbitron text-xl md:text-2xl font-bold text-yellow-300">+{preview.totalXp}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-normal">{preview.modifierLabel}</p>
              </div>
            </div>
          ) : (
            <div className={`flex items-center justify-between gap-3 ${isDungeonMode ? 'mb-2' : 'mb-4'}`}>
              <div>
                <p className="font-orbitron text-[8px] text-gray-400 uppercase tracking-normal">Dungeon Objective</p>
                <p className={`font-orbitron font-bold text-blue-300 drop-shadow-[0_0_14px_rgba(56,189,248,0.45)] ${isDungeonMode ? 'text-lg' : 'text-2xl md:text-4xl'}`}>{targetDistanceMeters ? formatDistance(targetDistanceMeters) : 'Distance'}</p>
              </div>
              <div className="text-right max-w-[45%]">
                <p className="font-orbitron text-[8px] text-gray-400 uppercase tracking-normal">Clear Rule</p>
                <p className={`font-orbitron font-bold text-yellow-300 ${isDungeonMode ? 'text-xs' : 'text-xl md:text-2xl'}`}>On Target</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-normal">Auto advance</p>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-3 ${isDungeonMode ? 'gap-1.5' : 'gap-2 md:gap-3'}`}>
            <StatBlock label="Distance" value={formatDistance(distanceMeters)} tone="text-cyan-300" compact={isDungeonMode} />
            {targetDistanceMeters && <StatBlock label="Target" value={formatDistance(targetDistanceMeters)} tone={distanceMeters >= targetDistanceMeters ? 'text-green-300' : 'text-blue-300'} compact={isDungeonMode} />}
            <StatBlock label="Time" value={formatDuration(elapsedSeconds)} compact={isDungeonMode} />
            {!targetDistanceMeters && <StatBlock label="Pace" value={formatPace(preview.paceSecondsPerKm)} tone="text-green-300" compact={isDungeonMode} />}
          </div>
        </section>

        <div className={isDungeonMode ? 'mb-3 flex justify-end' : 'mb-4'}>
          <RouteMap points={routePoints} distanceMeters={distanceMeters} gpsStatus={gpsStatus} compact={isDungeonMode} />
        </div>

        <div className={`${isDungeonMode ? 'mt-auto mb-3 p-3' : 'flex-1 mb-5 p-4 md:p-6'} border border-white/10 bg-black/38 backdrop-blur-[2px] rounded-sm`}>
          {status === 'summary' && result ? (
            <div className="h-full flex flex-col justify-center text-center py-8">
              <p className={`font-orbitron text-[10px] uppercase tracking-[0.3em] mb-3 ${summaryState === 'discarded' ? 'text-red-400' : 'text-blue-400'}`}>{summaryState === 'discarded' ? 'Run Discarded' : 'Run Summary'}</p>
              <h2 className="font-orbitron text-2xl md:text-4xl font-bold text-white uppercase mb-2">{summaryState === 'discarded' ? 'Minimum Not Met' : result.title}</h2>
              <p className={`font-orbitron text-4xl md:text-5xl font-bold mb-6 ${summaryState === 'discarded' ? 'text-red-400' : 'text-blue-300'}`}>{summaryState === 'discarded' ? '0 XP' : `[${result.finalGrade}]`}</p>
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
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {routeImage && (
                  <button onClick={() => downloadRouteImage(routeImage, `${quest.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-route.png`)} className="font-orbitron bg-cyan-700 hover:bg-cyan-600 text-white px-5 py-3 rounded uppercase text-[10px] font-black tracking-widest border border-cyan-400/50">
                    Save Route Image
                  </button>
                )}
                <button onClick={onCancel} className="font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-5 py-3 rounded uppercase text-[10px] font-black tracking-widest border border-blue-400/50">
                  Return to Quest Log
                </button>
              </div>
            </div>
          ) : (
            <div className={`h-full flex flex-col justify-center text-center ${isDungeonMode ? 'py-2' : 'py-8'}`}>
              <p className={`font-orbitron text-blue-300 uppercase ${isDungeonMode ? 'text-[9px] tracking-[0.22em] mb-1.5' : 'text-[10px] tracking-[0.3em] mb-3'}`}>{status === 'running' ? 'Run in progress' : status === 'acquiring' ? 'Locating GPS' : 'Ready to start'}</p>
              <p className={`${isDungeonMode ? 'text-[10px] tracking-wide' : 'text-xs md:text-sm tracking-widest'} text-gray-400 uppercase leading-relaxed max-w-xl mx-auto`}>
                {status === 'running'
                  ? targetDistanceMeters
                    ? `Reach ${formatDistance(targetDistanceMeters)}. This dungeon objective will clear automatically when the target is achieved.`
                    : 'Keep the app open while running. GPS drift and sudden jumps are filtered out.'
                  : status === 'acquiring'
                    ? 'Waiting for a stable high-accuracy fix before enabling the start button.'
                  : targetDistanceMeters
                    ? `GPS is locked. Start when ready. Target: ${formatDistance(targetDistanceMeters)}.`
                    : `GPS is locked. Start when ready. Runs under ${MIN_RECORDABLE_DISTANCE_METERS} m are discarded.`}
              </p>
              <p className={`font-orbitron text-gray-500 uppercase tracking-widest ${isDungeonMode ? 'text-[8px] mt-3' : 'text-[9px] mt-5'}`}>{gpsStatus}</p>
            </div>
          )}
        </div>

        {status === 'running' && isDungeonMode && disableManualFinish ? (
          <button onClick={onCancel} className="font-orbitron bg-red-900/75 hover:bg-red-800 text-white px-6 rounded-sm uppercase font-black tracking-widest border border-red-400/50 py-3 text-[10px]">
            {abortLabel}
          </button>
        ) : status === 'running' ? (
          <button onClick={finishRun} className={`font-orbitron bg-red-700 hover:bg-red-600 text-white px-6 rounded-sm uppercase font-black tracking-widest border border-red-400/50 ${isDungeonMode ? 'py-3 text-[10px]' : 'py-4 text-xs'}`}>
            Finish Run
          </button>
        ) : status === 'acquiring' ? (
          <button disabled className={`font-orbitron bg-slate-800 text-slate-400 px-6 rounded-sm uppercase font-black tracking-widest border border-white/10 cursor-wait ${isDungeonMode ? 'py-3 text-[10px]' : 'py-4 text-xs'}`}>
            Locating GPS
          </button>
        ) : status === 'ready' ? (
          <button onClick={startRun} className={`font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-6 rounded-sm uppercase font-black tracking-widest border border-blue-400/50 shadow-[0_0_22px_rgba(37,99,235,0.28)] ${isDungeonMode ? 'py-3 text-[10px]' : 'py-4 text-xs'}`}>
            Start Run
          </button>
        ) : null}
      </div>
    </div>
  );
};


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PlayerStats } from './components/PlayerStats';
import { QuestList } from './components/QuestList';
import { CreateQuestForm } from './components/CreateQuestForm';
import { usePlayerData } from './hooks/usePlayerData';
import { usePro } from './hooks/usePro';
import { QuestHistory } from './components/QuestHistory';
import { ProPurchaseModal } from './components/ProPurchaseModal';
import { DistanceRunPage } from './components/DistanceRunPage';
import { QuestRunnerPage } from './components/QuestRunnerPage';
import type { Player, Quest, CompletedQuest, Difficulty, ActiveDungeonState, DungeonCooldown, DungeonHistoryEntry, Achievement, ShopItem, Inventory, EquipmentSlot, SystemNotification, Page, DayOfWeek, Dungeon, DungeonKeys } from './types';
import { Attribute, Difficulty as DifficultyEnum } from './types';
import { DUNGEONS, SHOP_ITEMS, getLevelRequirement, DUNGEON_LEVEL_REQUIREMENTS, DUNGEON_KEYS_PER_DAY, DUNGEON_KEYS_PRO_PER_DAY, AD_BONUS_KEYS_PER_DAY, DAILY_XP_GOAL, XP_PER_DIFFICULTY, MATERIALS } from './constants';
import { Codex } from './components/Codex';
import { SkillsPage } from './components/SkillsPage';
import StartupPage from './components/StartupPage';
import { AuthPage } from './components/AuthPage';
import { ReportExport } from './components/ReportExport';
import { TaskList } from './components/TaskList';
import { WorkshopPage } from './components/WorkshopPage';
import { SettingsPage } from './components/SettingsPage';
import { OnboardingPage } from './components/OnboardingPage';
import { supabase } from './lib/supabase';
import { schedulePlannerReminder, scheduleQuestReminder } from './lib/notifications';
import { getGearFullImage, getGearIcon } from './lib/gearIcons';
import { getMaterialIcon, getMaterialName } from './lib/materialIcons';
import { primeNotificationSound } from './lib/notificationSound';
import { rollDungeonRewards, type DungeonRewardRoll } from './lib/dungeonRewards';

// ---- AdMob IDs ----
const BANNER_AD_ID = 'ca-app-pub-2481483129842770/1727552190';
const INTERSTITIAL_AD_ID = 'ca-app-pub-2481483129842770/9928108860';
const REWARDED_AD_ID = 'ca-app-pub-2481483129842770/3292365019';
const APP_VERSION = '1.1.0';

// Pages that show banner ads
const BANNER_PAGES: string[] = ['menu', 'quests', 'dungeons'];
// Pages that trigger interstitial on enter
const INTERSTITIAL_ON_ENTER: string[] = ['history', 'status'];

// Lazy-load AdMob so the app still works on web/non-capacitor environments
let AdMobLib: any = null;
const getAdMob = async () => {
  if (AdMobLib) return AdMobLib;
  try {
    const mod = await import('@capacitor-community/admob');
    AdMobLib = mod;
    return mod;
  } catch {
    return null;
  }
};

// Lazy-load @capacitor/app for back button + app state events
let CapAppLib: any = null;
const getCapApp = async () => {
  if (CapAppLib) return CapAppLib;
  try {
    const mod = await import('@capacitor/app');
    CapAppLib = mod;
    return mod;
  } catch {
    return null;
  }
};

const initAdMob = async () => {
  const lib = await getAdMob();
  if (!lib) return;
  try {
    await lib.AdMob.initialize({ requestTrackingAuthorization: false, testingDevices: [] });
  } catch {}
};

const showBannerAd = async () => {
  const lib = await getAdMob();
  if (!lib) return;
  try {
    await lib.AdMob.showBanner({
      adId: BANNER_AD_ID,
      adSize: lib.BannerAdSize.ADAPTIVE_BANNER,
      position: lib.BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false,
    });
  } catch {}
};

const hideBannerAd = async () => {
  const lib = await getAdMob();
  if (!lib) return;
  try { await lib.AdMob.hideBanner(); } catch {}
};

const prepareInterstitialAd = async () => {
  const lib = await getAdMob();
  if (!lib) return;
  try {
    await lib.AdMob.prepareInterstitial({ adId: INTERSTITIAL_AD_ID, isTesting: false });
  } catch {}
};

const showInterstitialAd = async () => {
  const lib = await getAdMob();
  if (!lib) return;
  try { await lib.AdMob.showInterstitial(); } catch {}
  prepareInterstitialAd();
};


const prepareRewardedAd = async () => {
  const lib = await getAdMob();
  if (!lib) return;
  try {
    await lib.AdMob.prepareRewardVideoAd({ adId: REWARDED_AD_ID, isTesting: false });
  } catch {}
};

const showRewardedAd = async (onRewarded: () => void) => {
  const lib = await getAdMob();
  if (!lib) { onRewarded(); return; }
  try {
    const listener = await lib.AdMob.addListener(
      lib.RewardAdPluginEvents?.Rewarded ?? 'onRewardedVideoAdRewardedUser',
      () => { onRewarded(); listener.remove(); }
    );
    await lib.AdMob.showRewardVideoAd();
    prepareRewardedAd();
  } catch { onRewarded(); }
};

// --- ICONS ---
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>);
const BackIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mt-0 pt-0 pl-[14px] -ml-[11px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>);
const StatusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const StatsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const QuestLogIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const DungeonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 2.209-1.791 4-4 4s-4-1.791-4-4 1.791-4 4-4 4 1.791-4 4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 2.209 1.791 4 4 4s4-1.791 4-4-1.791-4-4-4-4 1.791-4 4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m-8-10H2m20 0h-2m-1.757-6.243l-1.414 1.414M7.172 16.828l-1.414 1.414M16.828 16.828l1.414 1.414M7.172 7.172l-1.414-1.414" />
    <circle cx="12" cy="11" r="3" fill="currentColor" opacity="0.2" />
  </svg>
);
const CoinIcon = ({ className = "h-5 w-5" }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`${className} inline-block text-yellow-400`} viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8" fill="#FBBF24" /><circle cx="10" cy="10" r="6" fill="#F59E0B" /></svg>);
const WorkshopIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const ShopIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>);
const InventoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>);
const ReportIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const AchievementIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const SkillIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// --- Pro Version Banner Component ---
const ProVersionBanner: React.FC<{ compact?: boolean; onUpgrade: () => void }> = ({ compact, onUpgrade }) => (
  <button
    onClick={onUpgrade}
    className={`w-full flex items-center gap-2 bg-gradient-to-r from-yellow-900/60 to-amber-800/40 border border-yellow-500/40 rounded-sm px-3 py-2 cursor-pointer hover:from-yellow-800/70 transition-all group ${compact ? 'text-[9px]' : 'text-[10px]'}`}
  >
    <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
    <span className="font-orbitron font-black text-yellow-300 uppercase tracking-wide leading-tight group-hover:text-yellow-100 transition-colors">
      <span className="text-yellow-400">Upgrade to Pro</span> — go <span className="text-white">100% ad-free</span>
    </span>
  </button>
);

// --- Rate App Modal (shown after level-ups) ---
const RateAppModal: React.FC<{ level: number; onClose: () => void }> = ({ level, onClose }) => {
  const handleRate = () => {
    window.open('https://play.google.com/store/apps/details?id=com.rll.mobile', '_blank');
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[210] backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border-2 border-cyan-400/60 rounded-lg p-6 shadow-[0_0_40px_rgba(34,211,238,0.25)]">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">⚔️</div>
            <span className="font-orbitron text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em]">LEVEL UP ACHIEVED</span>
            <h3 className="font-orbitron text-2xl font-black text-cyan-400 uppercase mt-1">Level {level}!</h3>
          </div>
          <p className="text-gray-300 text-xs text-center mb-1 leading-relaxed">
            Your real-life progress is legendary. Help other hunters find their path —
          </p>
          <p className="text-white text-xs font-black text-center mb-5 uppercase tracking-wide">
            Leave a review on the Play Store!
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 bg-gray-800 px-3 py-2.5 rounded text-[9px] uppercase font-black tracking-widest text-gray-400 hover:text-white transition-colors border border-gray-700">Not Now</button>
            <button onClick={handleRate} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-2.5 rounded text-[9px] uppercase font-black tracking-widest text-white shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:scale-105 transition-transform">
              ★ Rate Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- In-App Promo Modal (shown periodically) ---
const PromoModal: React.FC<{ onClose: () => void; onPurchase: () => void }> = ({ onClose, onPurchase }) => (
  <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-[200] backdrop-blur-sm" onClick={onClose}>
    <div className="w-full max-w-sm mb-20 mx-4" onClick={e => e.stopPropagation()}>
      <div className="bg-gradient-to-br from-slate-900 to-amber-950/40 border-2 border-yellow-500/60 rounded-lg p-5 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="font-orbitron text-[9px] font-black text-yellow-500 uppercase tracking-[0.3em]">SYSTEM NOTICE</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">&times;</button>
        </div>
        <h3 className="font-orbitron text-lg font-black text-yellow-400 uppercase mb-1">Upgrade to Pro</h3>
        <p className="text-gray-300 text-xs mb-4 leading-relaxed">
          You are currently playing <span className="text-yellow-400 font-bold">R.L.L Lite</span>. Upgrade to <span className="text-white font-bold">Pro</span> for:
        </p>
        <ul className="text-[10px] text-gray-400 space-y-1 mb-4 font-bold uppercase tracking-wide">
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 100% Ad-Free Experience</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Full Progress Tracking</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> All Premium Features Unlocked</li>
        </ul>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-800 px-3 py-2 rounded text-[9px] uppercase font-black tracking-widest text-gray-500">Later</button>
          <button onClick={() => { onClose(); onPurchase(); }} className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-500 px-3 py-2 rounded text-[9px] uppercase font-black tracking-widest text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  </div>
);


// --- Upgrade to Pro Modal ---
const UpgradeToProModal: React.FC<{ featureName: string; onClose: () => void; onPurchase: () => void }> = ({ featureName, onClose, onPurchase }) => (
  <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[220] backdrop-blur-sm" onClick={onClose}>
    <div className="w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
      <div className="bg-gradient-to-br from-slate-900 to-yellow-950/30 border-2 border-yellow-500/60 rounded-lg p-6 shadow-[0_0_40px_rgba(234,179,8,0.25)]">
        <div className="flex justify-between items-start mb-4">
          <span className="font-orbitron text-[9px] font-black text-yellow-500 uppercase tracking-[0.3em]">SYSTEM LOCK</span>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">&times;</button>
        </div>
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="font-orbitron text-xl font-black text-yellow-400 uppercase mb-1">Pro Required</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            <span className="text-white font-bold">{featureName}</span> is a <span className="text-yellow-400 font-bold">Pro-exclusive</span> feature. Upgrade to Pro to unlock full access.
          </p>
        </div>
        <ul className="text-[10px] text-gray-400 space-y-1 mb-5 font-bold uppercase tracking-wide">
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Detailed History Log</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> System Reports Export</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 100% Ad-Free Experience</li>
        </ul>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-800 px-3 py-2.5 rounded text-[9px] uppercase font-black tracking-widest text-gray-400 hover:text-white transition-colors border border-gray-700">Later</button>
          <button onClick={() => { onClose(); onPurchase(); }} className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-500 px-3 py-2.5 rounded text-[9px] uppercase font-black tracking-widest text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  </div>
);

const getGradeStyles = (difficulty: Difficulty) => {
    switch (difficulty) {
        case DifficultyEnum.E: return { text: 'text-gray-400', border: 'border-gray-500/60', bg: 'bg-gray-500/10', glow: '' };
        case DifficultyEnum.D: return { text: 'text-green-400', border: 'border-green-500/60', bg: 'bg-green-500/10', glow: '' };
        case DifficultyEnum.C: return { text: 'text-blue-400', border: 'border-blue-500/60', bg: 'bg-blue-500/10', glow: '' };
        case DifficultyEnum.B: return { text: 'text-indigo-400', border: 'border-indigo-500/60', bg: 'bg-indigo-500/10', glow: '' };
        case DifficultyEnum.A: return { text: 'text-purple-400', border: 'border-purple-500/70', bg: 'bg-purple-500/10', glow: 'animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.3)]' };
        case DifficultyEnum.S: return { text: 'text-yellow-400', border: 'border-yellow-500/80', bg: 'bg-yellow-500/15', glow: 'animate-grade-s-glow' };
        case DifficultyEnum.S_PLUS: return { text: 'text-red-500', border: 'border-red-600/90', bg: 'bg-red-900/20', glow: 'animate-grade-s-plus-glow' };
        case DifficultyEnum.X: return { text: 'text-red-700', border: 'border-black', bg: 'bg-black/80', glow: 'animate-black-hole' };
        default: return { text: 'text-white', border: 'border-white/30', bg: 'bg-white/5', glow: '' };
    }
};

const NotificationManager: React.FC<{ notifications: SystemNotification[] }> = ({ notifications }) => {
    return (
        <div className="fixed top-6 right-6 z-[300] flex flex-col items-end pointer-events-none w-full max-w-xs gap-2">
            {notifications.map(n => {
                let color = 'border-blue-500 text-blue-200';
                let bg = 'bg-slate-900/95 shadow-[0_0_20px_rgba(56,189,248,0.2)]';
                
                if (n.type === 'danger') {
                  color = 'border-red-600 text-red-200';
                  bg = 'bg-red-950/90 shadow-[0_0_15px_rgba(220,38,38,0.3)]';
                } else if (n.type === 'warning') {
                  color = 'border-yellow-500 text-yellow-200';
                } else if (n.type === 'achievement' || n.type === 'level_up') {
                  color = 'border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.4)]';
                  bg = 'bg-cyan-950/90';
                }

                return (
                    <div key={n.id} className={`glass-panel p-3 px-5 rounded-sm border-2 animate-notification pointer-events-auto backdrop-blur-md w-full ${color} ${bg}`}>
                        <div className="flex flex-col items-start gap-0.5">
                          <h4 className="font-orbitron text-[8px] font-black uppercase tracking-[0.3em] opacity-60 leading-none mb-1">SYSTEM ALERT</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest leading-tight border-b border-white/5 pb-0.5 mb-0.5 w-full">{n.title}</p>
                          <p className="text-[12px] font-bold tracking-wide leading-tight italic">{n.message}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const PlayerQualificationScreen: React.FC<{ onAccept: () => void; onDecline: () => void }> = ({ onAccept, onDecline }) => (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-5 scanline-effect">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_38%),linear-gradient(180deg,rgba(2,6,23,0.2),rgba(0,0,0,0.92))] pointer-events-none" />
        <div className="relative w-full max-w-md border border-blue-500/35 bg-slate-950/88 shadow-[0_0_40px_rgba(14,165,233,0.16)] rounded-sm p-5 overflow-hidden">
            <div className="absolute inset-x-5 top-0 h-px bg-blue-300/40" />
            <div className="absolute inset-x-5 bottom-0 h-px bg-blue-300/25" />
            <div className="flex items-center gap-3 mb-6">
                <span className="h-9 w-9 rounded-sm border border-blue-400/50 bg-blue-500/10 text-blue-200 flex items-center justify-center font-orbitron text-lg font-black">!</span>
                <div>
                    <p className="font-orbitron text-[10px] uppercase tracking-[0.16em] text-blue-300/70">System Notification</p>
                    <h1 className="font-orbitron text-lg uppercase font-bold text-blue-100">Awakening Check</h1>
                </div>
            </div>
            <div className="border border-blue-500/20 bg-black/35 rounded-sm p-4 mb-6">
                <p className="font-rajdhani text-lg font-semibold leading-relaxed text-slate-100">
                    You have acquired the qualifications to be a Player.
                </p>
                <p className="font-rajdhani text-base font-semibold text-blue-200 mt-3">
                    Will you accept?
                </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={onDecline} className="border border-slate-700 bg-slate-950 px-4 py-3 rounded-sm font-orbitron text-[11px] uppercase font-bold tracking-[0.12em] text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
                    No
                </button>
                <button onClick={onAccept} className="border border-blue-400/60 bg-blue-600/25 px-4 py-3 rounded-sm font-orbitron text-[11px] uppercase font-bold tracking-[0.12em] text-blue-100 hover:bg-blue-500/35 shadow-[0_0_18px_rgba(14,165,233,0.16)] transition-all">
                    Yes
                </button>
            </div>
        </div>
    </div>
);

const ConfirmationModal: React.FC<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; isDangerous?: boolean }> = ({ isOpen, title, message, onConfirm, onCancel, isDangerous }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] backdrop-blur-md">
            <div className={`glass-panel border-2 rounded-lg p-6 w-full max-w-sm m-4 ${isDangerous ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-blue-500 shadow-[0_0_20px_rgba(56,189,248,0.3)]'}`}>
                <h3 className={`font-orbitron text-lg font-black mb-2 uppercase ${isDangerous ? 'text-red-500' : 'text-blue-300'}`}>{title}</h3>
                <p className="text-gray-300 text-xs mb-8 uppercase tracking-tighter font-bold">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} className="bg-gray-800 px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-white transition-colors">Cancel</button>
                    <button onClick={() => { onConfirm(); onCancel(); }} className={`${isDangerous ? 'bg-red-700' : 'bg-blue-700'} px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest hover:scale-105 transition-transform`}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

const getDungeonEntranceImage = (dungeon: Dungeon): string => (
    dungeon.grade === DifficultyEnum.A ? '/dungeons/entrance_a.png' : '/dungeons/entrance_eb.png'
);

const DungeonEntranceModal: React.FC<{ dungeon: Dungeon | null; onConfirm: () => void; onCancel: () => void }> = ({ dungeon, onConfirm, onCancel }) => {
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        setShowWarning(false);
    }, [dungeon?.id]);

    if (!dungeon) return null;

    const styles = getGradeStyles(dungeon.grade);
    const entranceImage = getDungeonEntranceImage(dungeon);

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[160] backdrop-blur-md p-4">
            <div className={`relative w-full max-w-md overflow-hidden rounded border-2 ${styles.border} shadow-[0_0_30px_rgba(56,189,248,0.25)]`}>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${entranceImage})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-slate-950/70 to-black/95" />
                <div className="relative p-5 min-h-[520px] flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-orbitron text-[9px] text-blue-200 uppercase tracking-[0.24em]">System Gate Alert</p>
                            <h3 className="font-orbitron text-xl font-black uppercase text-white mt-1">{dungeon.name}</h3>
                            <p className={`font-orbitron text-sm font-black ${styles.text}`}>[{dungeon.grade}] Rank Gate</p>
                        </div>
                        <button
                            onClick={() => setShowWarning(value => !value)}
                            className="h-9 w-9 rounded-full border border-blue-300/50 bg-black/55 text-blue-100 flex items-center justify-center font-orbitron text-sm font-black hover:bg-blue-500/20 transition-colors"
                            aria-label="Show safety warning"
                        >
                            i
                        </button>
                    </div>

                    <div className="mt-auto space-y-4">
                        {showWarning && (
                            <div className="border border-yellow-400/40 bg-yellow-950/45 rounded p-3">
                                <p className="font-orbitron text-[9px] text-yellow-300 uppercase tracking-[0.2em] mb-1">Safety Warning</p>
                                <p className="text-[11px] text-yellow-50/90 uppercase tracking-wide leading-relaxed font-bold">
                                    Please make sure you are in an environment where you can complete physical tasks safely, including indoor workouts and running.
                                </p>
                            </div>
                        )}
                        <div className="border border-blue-400/25 bg-black/55 rounded p-4">
                            <p className="font-rajdhani text-lg font-semibold leading-relaxed text-slate-100">
                                A gate has opened. Confirm entry only when you are ready to complete the required tasks.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={onCancel} className="border border-slate-700 bg-slate-950/90 px-4 py-3 rounded-sm font-orbitron text-[11px] uppercase font-bold tracking-[0.12em] text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
                                Cancel
                            </button>
                            <button onClick={onConfirm} className="border border-blue-400/60 bg-blue-600/35 px-4 py-3 rounded-sm font-orbitron text-[11px] uppercase font-bold tracking-[0.12em] text-blue-100 hover:bg-blue-500/45 shadow-[0_0_18px_rgba(14,165,233,0.18)] transition-all">
                                Enter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusPage: React.FC<{ player: Player; onRename: (name: string) => void }> = ({ player, onRename }) => (<div className="w-full h-full"><PlayerStats player={player} onRename={onRename} /></div>);

const AchievementsPage: React.FC<{ achievements: Record<string, Achievement> }> = ({ achievements }) => {
    const list: Achievement[] = Object.values(achievements);
    return (
        <div className="space-y-6">
            <h2 className="font-orbitron text-2xl text-blue-400 uppercase tracking-widest font-black mb-6">SYSTEM ACHIEVEMENTS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.length === 0 ? <p className="text-gray-500 uppercase text-xs italic">No achievements recorded yet.</p> : list.map((ach: Achievement) => {
                    const styles = getGradeStyles(ach.rank);
                    return (
                        <div key={ach.id} className={`glass-panel p-4 rounded border ${styles.border} ${ach.isUnlocked ? styles.bg : 'opacity-40 grayscale'} ${ach.isUnlocked ? styles.glow : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`font-orbitron text-[10px] font-black ${styles.text}`}>[{ach.rank}]</span>
                                {ach.isUnlocked && <span className="text-[9px] font-black text-green-400 uppercase">SYNCHRONIZED</span>}
                            </div>
                            <h3 className="font-orbitron text-sm font-black text-white uppercase mb-1">{ach.name}</h3>
                            <p className="text-gray-500 text-[10px] uppercase tracking-tighter mb-2">{ach.description}</p>
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-1 text-yellow-400 text-xs font-black">
                                    <CoinIcon className="h-3 w-3" /> {ach.rewardCoins}
                                </div>
                                {!ach.isUnlocked && <div className="text-[10px] text-gray-600 font-black">{ach.progress}/{ach.goal}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const getLocalDateKey = (value: Date | number | string): string => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const DailyXpRequirementBar: React.FC<{
    completedQuests: CompletedQuest[];
    dungeonHistory: DungeonHistoryEntry[];
}> = ({ completedQuests, dungeonHistory }) => {
    const [showWarning, setShowWarning] = useState(false);
    const todayKey = getLocalDateKey(new Date());
    const questXp = completedQuests
        .filter(q => getLocalDateKey(q.completedAt) === todayKey && q.difficulty !== DifficultyEnum.X)
        .reduce((sum, q) => sum + (q.earnedXp ?? XP_PER_DIFFICULTY[q.difficulty] ?? 0), 0);
    const dungeonXp = dungeonHistory
        .filter(d => d.status === 'cleared' && getLocalDateKey(d.completedAt) === todayKey)
        .reduce((sum, d) => {
            const dungeon = DUNGEONS.find(item => item.id === d.id);
            return sum + (dungeon?.rewards?.xp || 0);
        }, 0);
    const totalXp = Math.max(0, questXp + dungeonXp);
    const progress = Math.min(100, (totalXp / DAILY_XP_GOAL) * 100);
    const remaining = Math.max(0, DAILY_XP_GOAL - totalXp);

    return (
        <div className="border border-blue-500/20 bg-slate-950/70 rounded p-3">
            <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                    <p className="font-orbitron text-[9px] text-blue-300 uppercase tracking-normal">Daily XP Requirement</p>
                    <p className="text-[11px] text-gray-400 uppercase tracking-normal">{remaining === 0 ? 'Requirement complete' : `${remaining} XP remaining before reset`}</p>
                </div>
                <button
                    onClick={() => setShowWarning(value => !value)}
                    className="w-8 h-8 rounded-full border border-red-500/50 bg-red-950/50 text-red-300 flex items-center justify-center font-orbitron font-bold"
                    aria-label="Daily XP penalty warning"
                >
                    !
                </button>
            </div>
            <div className="h-2 bg-black/60 border border-white/10 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-300 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-[10px] uppercase tracking-normal text-gray-500">
                <span>{Math.round(totalXp)} XP earned</span>
                <span>{DAILY_XP_GOAL} XP required</span>
            </div>
            {showWarning && (
                <div className="mt-3 border border-red-500/30 bg-red-950/30 rounded p-3 text-[11px] text-red-200 uppercase tracking-normal leading-relaxed">
                    If the daily XP requirement remains incomplete, penalties will be given accordingly.
                </div>
            )}
        </div>
    );
};

const QuestLogPage: React.FC<{
    quests: Quest[];
    completedQuests: CompletedQuest[];
    dungeonHistory: DungeonHistoryEntry[];
    onComplete: (id: string) => void;
    onStartQuest: (quest: Quest) => void;
    onStartDistance: (quest: Quest) => void;
    onDelete: (id: string) => void;
    onFail: (id: string) => void;
    onAddQuest: (name: string, difficulty: Difficulty, type: 'repetitive' | 'one-time', attributes: Attribute[], description: string, questMode?: Quest['questMode']) => void;
    onWatchAdForQuest: (onGranted: () => void) => void;
}> = ({ quests, completedQuests, dungeonHistory, onComplete, onStartQuest, onStartDistance, onDelete, onFail, onAddQuest, onWatchAdForQuest }) => {
    const [view, setView] = useState<'list' | 'add'>('list');
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="font-orbitron text-2xl text-blue-400 uppercase tracking-normal font-bold">QUEST LOG</h2>
                <button onClick={() => setView(view === 'list' ? 'add' : 'list')} className="bg-blue-600 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-normal border border-blue-400/50 hover:bg-blue-500 transition-colors">
                    {view === 'list' ? 'Initialize New Entry' : 'Abort Entry'}
                </button>
            </div>
            <DailyXpRequirementBar completedQuests={completedQuests} dungeonHistory={dungeonHistory} />
            
            {view === 'list' ? (
                <QuestList quests={quests} onComplete={onComplete} onStartQuest={onStartQuest} onStartDistance={onStartDistance} onDelete={onDelete} onFail={onFail} />
            ) : (
                <div className="glass-panel p-4 md:p-8 rounded-lg border-blue-500/30">
                    <CreateQuestForm
                        addQuest={(...args) => { onAddQuest(...args); setView('list'); }}
                        onWatchAd={onWatchAdForQuest}
                    />
                </div>
            )}
        </div>
    );
};

const formatDungeonClock = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
    const rest = (safeSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${rest}`;
};

const getDungeonTaskAttributes = (task?: Dungeon['floors'][number]['tasks'][number]) => {
    if (!task) return [Attribute.Endurance];
    if (task.attributes?.length) return task.attributes;
    if (task.attribute) return [task.attribute];
    return [Attribute.Endurance];
};

const DungeonsPage: React.FC<{
    onStartDungeon: (d: Dungeon) => void;
    activeDungeon: ActiveDungeonState | null;
    dungeonCooldowns: Record<string, DungeonCooldown>;
    onClearDungeon: (rewardRoll?: DungeonRewardRoll) => void;
    onFailDungeon: () => void;
    onDungeonTimeout: () => void;
    onProgressDungeon: () => void;
    dungeonHistory: DungeonHistoryEntry[];
    playerLevel: number;
    dungeonKeys: DungeonKeys;
    isPro: boolean;
    onEarnKey: () => void;
}> = ({ onStartDungeon, activeDungeon, dungeonCooldowns, onClearDungeon, onFailDungeon, onDungeonTimeout, onProgressDungeon, dungeonHistory, playerLevel, dungeonKeys, isPro, onEarnKey }) => {
    const [selectedRank, setSelectedRank] = useState<Difficulty | null>(null);
    const [view, setView] = useState<'gates' | 'cooldowns' | 'history'>('gates');
    const [isLootOpening, setIsLootOpening] = useState(false);
    const [lootReadyToClaim, setLootReadyToClaim] = useState(false);
    const [pendingLoot, setPendingLoot] = useState<DungeonRewardRoll | null>(null);
    const [now, setNow] = useState(Date.now());
    const [activeTimedTaskId, setActiveTimedTaskId] = useState<string | null>(null);
    const [taskTimerStartedAt, setTaskTimerStartedAt] = useState<number | null>(null);
    const [taskTimerDone, setTaskTimerDone] = useState(false);
    const timeoutTriggeredRef = useRef<string | null>(null);
    const getDungeonImage = (dungeon: Dungeon, mode: 'preview' | 'background' | 'opening' = 'background') => {
        if (mode === 'preview') return dungeon.previewImage || dungeon.backgroundImage || `/dungeons/${dungeon.id}.jpg`;
        if (mode === 'opening') return dungeon.openingImage || dungeon.backgroundImage || dungeon.previewImage || `/dungeons/${dungeon.id}.jpg`;
        return dungeon.backgroundImage || dungeon.previewImage || `/dungeons/${dungeon.id}.jpg`;
    };
    const getDungeonFloorImage = (dungeon: Dungeon, floor: Dungeon['floors'][number], mode: 'preview' | 'background' | 'opening' = 'background') => {
        if (mode === 'preview') return floor.previewImage || floor.backgroundImage || getDungeonImage(dungeon, 'preview');
        if (mode === 'opening') return floor.openingImage || floor.backgroundImage || floor.previewImage || getDungeonImage(dungeon, 'opening');
        return floor.backgroundImage || floor.previewImage || getDungeonImage(dungeon, 'background');
    };
    const getDungeonExitImage = (grade: Difficulty) => {
        if (grade === DifficultyEnum.E) return '/dungeons/exit_e.png';
        if (grade === DifficultyEnum.D) return '/dungeons/exit_d.png';
        if (grade === DifficultyEnum.C) return '/dungeons/exit_c.png';
        if (grade === DifficultyEnum.B) return '/dungeons/exit_b.png';
        if (grade === DifficultyEnum.A) return '/dungeons/exit_a.png';
        return '/dungeons/exit_s.png';
    };
    const activeDungeonConfig = activeDungeon ? DUNGEONS.find(d => d.id === activeDungeon.dungeonId) : null;
    const activeFloor = activeDungeon && activeDungeonConfig ? activeDungeonConfig.floors[activeDungeon.currentFloorIndex] : null;
    const activeTask = activeDungeon && activeFloor ? activeFloor.tasks[activeDungeon.currentTaskIndex] : null;
    const dungeonTimeRemainingSeconds = activeDungeon && activeDungeonConfig?.timeLimit
        ? Math.max(0, activeDungeonConfig.timeLimit - Math.floor((now - activeDungeon.startedAt) / 1000))
        : null;
    const taskTimerRemainingSeconds = activeTask?.timerSeconds && taskTimerStartedAt && activeTimedTaskId === activeTask.id
        ? Math.max(0, activeTask.timerSeconds - Math.floor((now - taskTimerStartedAt) / 1000))
        : activeTask?.timerSeconds ?? null;
    const isTaskTimerActive = Boolean(activeTask?.timerSeconds && taskTimerStartedAt && activeTimedTaskId === activeTask.id && !taskTimerDone);

    useEffect(() => {
        if (!activeDungeon) return;
        const timer = window.setInterval(() => setNow(Date.now()), 500);
        return () => window.clearInterval(timer);
    }, [activeDungeon?.id]);

    useEffect(() => {
        if (!activeDungeon || dungeonTimeRemainingSeconds !== 0) return;
        if (timeoutTriggeredRef.current === activeDungeon.id) return;
        timeoutTriggeredRef.current = activeDungeon.id;
        onDungeonTimeout();
    }, [activeDungeon, dungeonTimeRemainingSeconds, onDungeonTimeout]);

    useEffect(() => {
        setActiveTimedTaskId(null);
        setTaskTimerStartedAt(null);
        setTaskTimerDone(false);
    }, [activeDungeon?.dungeonId, activeDungeon?.currentFloorIndex, activeDungeon?.currentTaskIndex]);

    useEffect(() => {
        if (!activeTask?.timerSeconds || !isTaskTimerActive || taskTimerRemainingSeconds !== 0) return;
        setTaskTimerDone(true);
    }, [activeTask?.timerSeconds, isTaskTimerActive, taskTimerRemainingSeconds]);

    if (activeDungeon) {
        const dungeon = activeDungeonConfig!;
        const currentFloor = activeFloor!;
        const currentTask = activeTask;
        const isCompletionReady = activeDungeon.currentFloorIndex >= dungeon.floors.length - 1 && activeDungeon.currentTaskIndex >= currentFloor.tasks.length;
        const activeBackground = isCompletionReady ? getDungeonExitImage(dungeon.grade) : getDungeonFloorImage(dungeon, currentFloor, 'opening');
        const isHighLevelThreat = dungeon.grade === DifficultyEnum.A;
        const handleClaimRewards = () => {
            if (isLootOpening || lootReadyToClaim) return;
            const rewardRoll = rollDungeonRewards(dungeon.grade);
            setPendingLoot(rewardRoll);
            setIsLootOpening(true);
            window.setTimeout(() => {
                setIsLootOpening(false);
                setLootReadyToClaim(true);
            }, 1250);
        };
        const handleConfirmLootClaim = () => {
            if (!pendingLoot) return;
            onClearDungeon(pendingLoot);
            setPendingLoot(null);
            setLootReadyToClaim(false);
            setIsLootOpening(false);
        };
        const lootMaterials = pendingLoot
            ? Object.entries(pendingLoot.drops)
                .filter(([, count]) => count > 0)
                .map(([id, count]) => ({ id, count, icon: getMaterialIcon(id), name: getMaterialName(id) }))
            : [];

        if (!isCompletionReady && currentTask?.tracking?.mode === 'distance') {
            const taskAttributes = getDungeonTaskAttributes(currentTask);
            return (
                <DistanceRunPage
                    quest={{
                        id: currentTask.id,
                        name: `${dungeon.name}: ${currentFloor.name}`,
                        difficulty: dungeon.grade,
                        attributes: taskAttributes,
                        description: currentTask.description,
                        type: 'one-time',
                        questMode: 'distance',
                    }}
                    headerLabel="Dungeon Distance Objective"
                    targetDistanceMeters={currentTask.tracking.distanceMeters}
                    autoCompleteTarget={currentTask.tracking.autoComplete !== false}
                    showLiveGrade={false}
                    isDungeonMode
                    backgroundImage={activeBackground}
                    abortLabel="Abort Dungeon"
                    threatWarning={isHighLevelThreat ? 'High Level Threat' : undefined}
                    disableManualFinish
                    dungeonTimeRemainingSeconds={dungeonTimeRemainingSeconds}
                    onCancel={onFailDungeon}
                    onFinish={() => null}
                    onTargetComplete={(distanceMeters, durationSeconds) => {
                        const paceSecondsPerKm = distanceMeters > 0 ? durationSeconds / (distanceMeters / 1000) : Infinity;
                        const maxPace = currentTask.tracking?.maxPaceSecondsPerKm;
                        if (maxPace && paceSecondsPerKm > maxPace) {
                            onDungeonTimeout();
                            return;
                        }
                        onProgressDungeon();
                    }}
                />
            );
        }

        return (
            <div
                className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white"
                style={{
                    backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.18), rgba(2,6,23,0.46) 48%, rgba(2,6,23,0.82)), radial-gradient(circle at 50% 18%, rgba(239,68,68,0.18), transparent 45%), url(${activeBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:34px_34px] opacity-20 pointer-events-none" />
                <div className="relative flex min-h-screen flex-col px-4 pb-6 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] md:px-8 md:pb-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="font-orbitron text-[9px] text-red-300/70 uppercase tracking-[0.26em] font-black">Gate Entered</p>
                            <h2 className="font-orbitron text-xl md:text-3xl text-red-300 uppercase tracking-tight font-black drop-shadow-[0_0_14px_rgba(248,113,113,0.45)]">{dungeon.name}</h2>
                            {isHighLevelThreat && <p className="mt-1 font-orbitron text-[9px] text-red-500 uppercase tracking-[0.24em] font-black">High Level Threat Warning</p>}
                        </div>
                        <div className="flex flex-col items-end bg-black/35 border border-white/10 px-3 py-2 backdrop-blur-sm">
                            {dungeonTimeRemainingSeconds !== null && <div className="mb-1 text-red-300 font-orbitron text-[11px] font-black uppercase tracking-widest">TIME {formatDungeonClock(dungeonTimeRemainingSeconds)}</div>}
                            <div className="text-gray-300 font-orbitron text-[10px] font-bold uppercase tracking-widest">FLOOR {activeDungeon.currentFloorIndex + 1} / {dungeon.floors.length}</div>
                            {!isCompletionReady && <div className="text-[9px] text-red-300 font-black mt-1 uppercase">OBJ {activeDungeon.currentTaskIndex + 1} / {currentFloor.tasks.length}</div>}
                        </div>
                    </div>

                    <div className="relative flex flex-1 items-end md:items-center">
                        {isCompletionReady ? (
                            <div className="w-full max-w-lg mx-auto text-center bg-black/42 border border-green-300/25 backdrop-blur-md px-5 py-7 shadow-[0_0_34px_rgba(34,197,94,0.16)]">
                                <h3 className="font-orbitron text-3xl text-green-300 mb-3 neon-text">GATE OPENED</h3>
                                <p className="text-gray-300 mb-6 uppercase tracking-[0.2em] text-[10px] font-black">All floors cleared. Claim the dungeon core.</p>
                                <div className={`relative mx-auto mb-6 h-24 w-32 ${isLootOpening ? 'loot-crate-open' : ''}`}>
                                    <div className="absolute bottom-0 left-1/2 h-16 w-24 -translate-x-1/2 border border-yellow-300/40 bg-gradient-to-b from-yellow-700/40 to-black shadow-[0_0_22px_rgba(250,204,21,0.18)]" />
                                    <div className="absolute bottom-14 left-1/2 h-5 w-28 -translate-x-1/2 border border-yellow-200/50 bg-yellow-500/35 shadow-[0_0_18px_rgba(250,204,21,0.35)]" />
                                    {isLootOpening && pendingLoot && (
                                        <div className="loot-reward-float absolute left-1/2 top-8 flex h-10 min-w-10 items-center justify-center rounded-full border border-yellow-300/40 bg-yellow-500/20 px-2 text-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.35)]" style={{ ['--loot-x' as string]: '-54px' }}>
                                            <CoinIcon className="h-5 w-5" />
                                            <span className="font-orbitron text-[9px] font-black ml-1">+{pendingLoot.coins}</span>
                                        </div>
                                    )}
                                    {isLootOpening && lootMaterials.map((mat, idx) => mat.icon && (
                                        <div
                                            key={mat.id}
                                            className="loot-reward-float absolute left-1/2 top-8 flex h-10 min-w-10 items-center justify-center rounded-sm border border-blue-300/30 bg-black/70 px-1.5"
                                            style={{ animationDelay: `${(idx + 1) * 80}ms`, ['--loot-x' as string]: `${(idx - (lootMaterials.length - 1) / 2) * 38 + 22}px` }}
                                        >
                                            <img src={mat.icon} alt={mat.name} className="h-8 w-8 rounded-sm object-cover" />
                                            <span className="font-orbitron text-[8px] font-black text-blue-100 ml-1">x{mat.count}</span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={lootReadyToClaim ? handleConfirmLootClaim : handleClaimRewards} disabled={isLootOpening} className="bg-green-600 px-10 py-4 rounded-sm text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:scale-105 transition-transform disabled:opacity-70 disabled:scale-100">{isLootOpening ? 'Opening Crate...' : lootReadyToClaim ? 'Claim' : 'Open Crate'}</button>
                            </div>
                        ) : (
                            <div className="w-full max-w-2xl bg-black/46 border border-red-300/25 backdrop-blur-md px-5 py-6 shadow-[0_0_34px_rgba(239,68,68,0.12)]">
                                <div className="border-b border-white/10 pb-3 mb-4">
                                    <h3 className="font-orbitron text-lg text-blue-200 uppercase tracking-wide">{currentFloor.name}</h3>
                                </div>
                                <h4 className="font-orbitron text-xl md:text-2xl text-white uppercase tracking-wide">{currentTask.page.title}</h4>
                                <p className="text-gray-300 italic text-sm border-l-2 border-white/10 pl-4 mt-3">"{currentTask.page.narrative}"</p>
                                <div className="bg-black/45 p-5 border border-blue-300/20 rounded-sm mt-6 backdrop-blur-sm">
                                    <p className="text-blue-300 font-black uppercase tracking-[0.2em] text-xs mb-2">System Instruction:</p>
                                    <p className="text-white font-bold uppercase tracking-widest text-base">{currentTask.description}</p>
                                </div>
                                {currentTask.timerSeconds && (
                                    <div className="mt-5 flex items-center gap-4 rounded-sm border border-cyan-300/20 bg-black/35 p-3">
                                        <div className="relative grid h-20 w-20 flex-shrink-0 place-items-center rounded-full border-2 border-cyan-300/50 bg-slate-950/80 shadow-[0_0_22px_rgba(34,211,238,0.16)]">
                                            <div className="absolute inset-1 rounded-full border border-blue-400/20" />
                                            <span className="font-orbitron text-sm font-black text-cyan-100">{formatDungeonClock(taskTimerRemainingSeconds ?? currentTask.timerSeconds)}</span>
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <p className="font-orbitron text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">Timed Objective</p>
                                            <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-300">{taskTimerDone ? 'Timer complete. Claim the floor objective.' : isTaskTimerActive ? 'Hold until the circle reaches zero.' : 'Start the floor timer when ready.'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!isCompletionReady && (
                        <div className="relative mt-5 flex gap-3">
                            <button onClick={onFailDungeon} className="bg-red-900/65 hover:bg-red-800 px-5 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest border border-red-400/30 transition-colors">Abandon</button>
                            {currentTask?.timerSeconds && !taskTimerDone ? (
                                <button
                                    onClick={() => {
                                        if (isTaskTimerActive) return;
                                        setActiveTimedTaskId(currentTask.id);
                                        setTaskTimerStartedAt(Date.now());
                                        setTaskTimerDone(false);
                                    }}
                                    disabled={isTaskTimerActive}
                                    className="flex-grow bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all disabled:opacity-70"
                                >
                                    {isTaskTimerActive ? 'Timer Running' : 'Start Timer'}
                                </button>
                            ) : (
                                <button onClick={onProgressDungeon} className="flex-grow bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all">Task Completed</button>
                            )}
                        </div>
                    )}
                </div>
                {lootReadyToClaim && pendingLoot && (
                    <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 px-4 backdrop-blur-sm">
                        <div className="w-full max-w-sm border border-green-300/35 bg-slate-950/95 p-5 text-center shadow-[0_0_42px_rgba(34,197,94,0.18)]">
                            <p className="font-orbitron text-[9px] font-black uppercase tracking-[0.26em] text-green-300">Dungeon Core Opened</p>
                            <h3 className="mt-2 font-orbitron text-2xl font-black uppercase text-white">Rewards Acquired</h3>
                            <div className="mt-5 space-y-2">
                                <div className="flex items-center justify-between border border-yellow-300/20 bg-yellow-500/10 px-3 py-2">
                                    <span className="flex items-center gap-2 text-sm font-bold text-yellow-100"><CoinIcon className="h-4 w-4" /> Coins</span>
                                    <span className="font-orbitron text-sm font-black text-yellow-200">+{pendingLoot.coins}</span>
                                </div>
                                {lootMaterials.map(mat => (
                                    <div key={mat.id} className="flex items-center justify-between border border-blue-300/20 bg-blue-500/10 px-3 py-2">
                                        <span className="flex items-center gap-2 text-sm font-bold text-blue-100">
                                            {mat.icon && <img src={mat.icon} alt={mat.name} className="h-7 w-7 rounded-sm object-cover" />}
                                            {mat.name}
                                        </span>
                                        <span className="font-orbitron text-sm font-black text-blue-100">x{mat.count}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleConfirmLootClaim} className="mt-5 w-full bg-green-600 px-6 py-3 font-orbitron text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:bg-green-500">Claim</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const renderSubNav = () => (
        <div className="flex gap-6 border-b border-blue-500/20 mb-6 overflow-x-auto no-scrollbar">
            {(['gates', 'cooldowns', 'history'] as const).map(v => (
                <button key={v} onClick={() => { setView(v); setSelectedRank(null); }} className={`font-orbitron text-xs uppercase tracking-[0.2em] font-black pb-3 whitespace-nowrap transition-all flex-shrink-0 ${view === v ? 'text-blue-400 border-b-2 border-blue-400 neon-text' : 'text-gray-500 hover:text-gray-300'}`}>{v === 'history' ? 'RUN LOG' : v}</button>
            ))}
        </div>
    );

    const maxKeys = dungeonKeys.maxPerDay ?? DUNGEON_KEYS_PER_DAY;
    const adBonusUsed = dungeonKeys.adBonusCount ?? 0;
    const adBonusLeft = AD_BONUS_KEYS_PER_DAY - adBonusUsed;
    const KeysBadge = ({ small }: { small?: boolean }) => (
        <div className="flex flex-wrap items-center gap-2">
            <div className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-sm ${dungeonKeys.count <= 0 ? 'border-red-500/40 bg-red-950/20' : 'border-yellow-500/30 bg-black/40'}`}>
                <svg className={`${small ? 'w-3 h-3' : 'w-4 h-4'} ${dungeonKeys.count <= 0 ? 'text-red-400' : 'text-yellow-400'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                <span className={`font-orbitron ${small ? 'text-[10px]' : 'text-xs'} font-black ${dungeonKeys.count <= 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {dungeonKeys.count}/{maxKeys} Keys{isPro ? ' ★' : ''}
                </span>
            </div>
            {adBonusLeft > 0 && (
                <button onClick={onEarnKey} className="flex items-center gap-1.5 border border-blue-500/40 bg-blue-950/20 px-3 py-1.5 rounded-sm hover:bg-blue-900/40 active:scale-95 transition-all">
                    <svg className="w-3 h-3 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    <span className="font-orbitron text-[10px] font-black text-blue-400">Watch Ad +1 Key ({adBonusUsed}/{AD_BONUS_KEYS_PER_DAY})</span>
                </button>
            )}
        </div>
    );

    if (view === 'history') {
        const sorted = [...dungeonHistory].sort((a, b) => b.completedAt - a.completedAt);
        return (
            <div className="space-y-4">
                {renderSubNav()}
                <h2 className="font-orbitron text-xl text-blue-400 uppercase tracking-widest font-black">DUNGEON RUN LOG</h2>
                {sorted.length === 0 ? (
                    <div className="text-center py-20 bg-black/20 border border-white/5 rounded-sm">
                        <p className="font-orbitron text-gray-700 uppercase font-black tracking-[0.3em] text-sm">No runs recorded yet.</p>
                        <p className="text-gray-600 text-[10px] uppercase tracking-wider mt-2">Complete a gate to see your history here.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sorted.map(entry => {
                            const styles = getGradeStyles(entry.grade);
                            const date = new Date(entry.completedAt);
                            const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                            const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                            return (
                                <div key={entry.id} className={`glass-panel px-4 py-3 rounded border flex items-center justify-between ${entry.status === 'cleared' ? styles.border : 'border-red-900/40'}`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className={`font-orbitron text-xs font-black flex-shrink-0 ${entry.status === 'cleared' ? styles.text : 'text-red-500'}`}>[{entry.grade}]</span>
                                        <div className="min-w-0">
                                            <p className="font-orbitron text-xs font-black text-white uppercase truncate">{entry.name}</p>
                                            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">{dateStr} · {timeStr}</p>
                                        </div>
                                    </div>
                                    <span className={`font-orbitron text-[9px] font-black uppercase tracking-widest flex-shrink-0 ml-3 px-2 py-1 rounded-sm ${entry.status === 'cleared' ? 'text-green-400 bg-green-950/40 border border-green-800/30' : 'text-red-400 bg-red-950/40 border border-red-800/30'}`}>
                                        {entry.status === 'cleared' ? '✓ Cleared' : '✗ Failed'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    if (view === 'cooldowns') {
        const dungeonsOnCooldown = (Object.entries(dungeonCooldowns) as [string, DungeonCooldown][]).filter(([_, data]) => data.readyAt > Date.now());
        return (
            <div className="space-y-4">
                {renderSubNav()}
                <h2 className="font-orbitron text-xl text-blue-400 uppercase tracking-widest font-black mb-4">RESTRICTED ACCESS</h2>
                <div className="grid grid-cols-1 gap-3">
                    {dungeonsOnCooldown.length > 0 ? dungeonsOnCooldown.map(([id, data]) => {
                        const dungeon = DUNGEONS.find(d => d.id === id);
                        if (!dungeon) return null;
                        const styles = getGradeStyles(dungeon.grade);
                        const refreshDate = new Date(data.readyAt).toLocaleDateString();
                        return (
                            <div key={id} className="glass-panel p-4 rounded border border-red-500/20 bg-red-950/10 flex items-center justify-between opacity-80">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-orbitron text-[9px] font-black ${styles.text}`}>[{dungeon.grade}]</span>
                                        <p className="font-orbitron text-xs font-black text-white uppercase">{dungeon.name}</p>
                                    </div>
                                    <p className="text-[8px] text-red-400/60 uppercase font-black tracking-widest">Available: {refreshDate}</p>
                                </div>
                                <div className="text-red-500">
                                    <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-16 bg-black/20 border border-white/5 rounded-sm">
                            <p className="font-orbitron text-gray-700 uppercase font-black tracking-[0.3em]">No gates currently on cooldown.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!selectedRank) {
        const ranks = [DifficultyEnum.E, DifficultyEnum.D, DifficultyEnum.C, DifficultyEnum.B, DifficultyEnum.A];
        return (
            <div className="space-y-4">
                {renderSubNav()}
                <div className="mb-4 border-b border-blue-500/20 pb-4">
                    <h2 className="font-orbitron text-xl text-blue-400 uppercase tracking-widest font-black mb-3">GATE CLASSIFICATIONS</h2>
                    <KeysBadge />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {ranks.map(rank => {
                        const styles = getGradeStyles(rank);
                        const count = DUNGEONS.filter(d => d.grade === rank).length;
                        const levelReq = DUNGEON_LEVEL_REQUIREMENTS[rank] || 1;
                        const isLevelLocked = playerLevel < levelReq;
                        return (
                            <button key={rank} onClick={() => !isLevelLocked && setSelectedRank(rank)} disabled={isLevelLocked} className={`glass-panel p-5 rounded border transition-all duration-300 group text-center flex flex-col items-center relative ${isLevelLocked ? 'opacity-50 cursor-not-allowed border-gray-700' : `hover:scale-105 ${styles.border} ${styles.glow}`}`}>
                                {isLevelLocked && (
                                    <div className="absolute top-2 right-2 bg-gray-800/90 border border-gray-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <svg className="w-2.5 h-2.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1C8.676 1 6 3.676 6 7v1H4v15h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z"/></svg>
                                        <span className="font-orbitron text-[7px] font-black text-gray-400">LV {levelReq}</span>
                                    </div>
                                )}
                                <span className={`font-orbitron text-4xl font-black mb-2 ${isLevelLocked ? 'text-gray-600' : styles.text}`}>[{rank}]</span>
                                <span className="font-orbitron text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Rank Gates</span>
                                {isLevelLocked ? (
                                    <span className="bg-red-900/30 border border-red-500/30 px-2 py-0.5 rounded-full text-[8px] font-bold text-red-400 uppercase tracking-widest">Lv {levelReq} Req</span>
                                ) : (
                                    <span className="bg-white/5 px-3 py-0.5 rounded-full text-[8px] font-bold text-gray-500 uppercase tracking-widest">{count} Available</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    const filteredDungeons = DUNGEONS.filter(d => d.grade === selectedRank);
    const styles = getGradeStyles(selectedRank);
    const gradeIsLevelLocked = playerLevel < (DUNGEON_LEVEL_REQUIREMENTS[selectedRank] || 1);
    const noKeysLeft = dungeonKeys.count <= 0;

    return (
        <div className="space-y-4">
            <div className="mb-4 border-b border-blue-500/20 pb-4">
                <div className="flex items-center gap-3 mb-3">
                    <button onClick={() => setSelectedRank(null)} className="text-blue-400 hover:text-blue-200 transition-colors flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h2 className="font-orbitron text-lg text-blue-400 uppercase tracking-widest font-black">[{selectedRank}] RANK GATES</h2>
                </div>
                <KeysBadge />
            </div>
            {noKeysLeft && (
                <div className="bg-red-950/20 border border-red-500/30 rounded p-4 text-center">
                    <p className="font-orbitron text-xs font-black text-red-400 uppercase tracking-widest">Dungeon Keys Depleted</p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">Keys reset at midnight. Come back tomorrow.</p>
                </div>
            )}
            <div className="grid grid-cols-1 gap-4">
                {filteredDungeons.map(d => {
                    const cooldown = dungeonCooldowns[d.id];
                    const isOnCooldown = cooldown && cooldown.readyAt > Date.now();
                    const isBlocked = isOnCooldown || gradeIsLevelLocked || noKeysLeft;
                    return (
                        <div
                            key={d.id}
                            className={`glass-panel relative overflow-hidden min-h-[168px] p-5 rounded border transition-all duration-500 ${isBlocked ? 'opacity-60' : 'hover:-translate-y-0.5'} ${styles.border} ${styles.glow} group`}
                            style={{
                                backgroundImage: `linear-gradient(90deg, rgba(2,6,23,0.98), rgba(2,6,23,0.82) 52%, rgba(2,6,23,0.52)), url(${getDungeonImage(d, 'preview')})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.12),transparent_34%)] pointer-events-none" />
                            <div className="relative flex justify-between items-start mb-3">
                                <div className="min-w-0 flex-1 pr-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-orbitron text-xs font-black flex-shrink-0 ${styles.text}`}>[{d.grade}]</span>
                                        <h3 className="font-orbitron text-sm font-black text-white uppercase truncate">{d.name}</h3>
                                    </div>
                                    <p className="text-gray-400 text-[10px] uppercase tracking-tighter max-w-2xl">{d.description}</p>
                                </div>
                            </div>
                            <div className="relative flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                                <div className="text-[9px] text-gray-500 uppercase font-black">{d.floors.length} FLOORS</div>
                                {isOnCooldown ? (
                                    <span className="text-[9px] text-red-400 font-black uppercase tracking-widest">ON COOLDOWN</span>
                                ) : gradeIsLevelLocked ? (
                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1">
                                        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1C8.676 1 6 3.676 6 7v1H4v15h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z"/></svg>
                                        Lv {DUNGEON_LEVEL_REQUIREMENTS[d.grade]} Required
                                    </span>
                                ) : noKeysLeft ? (
                                    <span className="text-[9px] text-red-400 font-black uppercase tracking-widest">No Keys Left</span>
                                ) : (
                                    <button onClick={() => onStartDungeon(d)} className={`px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${styles.border} ${styles.text} hover:bg-white/5`}>Enter Gate</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ShopPage: React.FC<{
    player: Player;
    inventory: Inventory;
    onBuyItem: (item: ShopItem) => void;
}> = ({ player, inventory, onBuyItem }) => {
    const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);
    const previewImage = getGearFullImage(previewItem);
    const diamondCount = inventory.materials.find(m => m.id === MATERIALS.DIAMOND)?.count || 0;
    const diamondIcon = getMaterialIcon(MATERIALS.DIAMOND);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-blue-500/20 pb-4">
                <h2 className="font-orbitron text-2xl text-blue-400 uppercase tracking-widest font-black">SYSTEM EXCHANGE</h2>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 border border-yellow-500/20 rounded-sm">
                        <CoinIcon className="h-5 w-5" />
                        <span className="font-orbitron text-xl md:text-2xl text-yellow-400 font-black">{player.shopCoins}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 border border-blue-300/20 rounded-sm">
                        {diamondIcon && <img src={diamondIcon} alt="" className="h-5 w-5 rounded-sm object-cover" />}
                        <span className="font-orbitron text-xl md:text-2xl text-blue-200 font-black">{diamondCount}</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SHOP_ITEMS.map(item => {
                    const styles = getGradeStyles(item.rank);
                    const icon = getGearIcon(item);
                    const hasItem = (item.type === 'Gear') && (inventory.storage.some(i => i.id === item.id) || (Object.values(inventory.equipment) as (ShopItem | null)[]).some(i => i?.id === item.id));
                    const canAfford = player.shopCoins >= item.cost && diamondCount >= (item.diamondCost || 0);
                    const reqLevel = getLevelRequirement(item.rank);
                    const isLevelLocked = player.level < reqLevel;
                    return (
                        <div key={item.id} className={`glass-panel p-6 rounded border flex flex-col justify-between transition-all duration-300 ${styles.border} ${styles.glow} ${hasItem ? 'opacity-50 grayscale' : 'hover:scale-[1.02]'} ${isLevelLocked ? 'opacity-70 bg-gray-900/40 border-gray-700/30' : ''}`}>
                            <div className="relative">
                                {isLevelLocked && (
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 rounded-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500/50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <p className="font-orbitron text-[10px] text-red-400 font-bold tracking-widest bg-black/60 px-2 py-1 rounded">LV {reqLevel} REQUIRED</p>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{item.type} {item.slot ? `| ${item.slot}` : ''}</span>
                                    <span className={`font-orbitron text-xs font-black ${styles.text}`}>[{item.rank}]</span>
                                </div>
                                <div className="flex items-start gap-3 mb-3">
                                    {icon && (
                                        <button
                                            type="button"
                                            onClick={() => setPreviewItem(item)}
                                            className={`h-16 w-16 flex-shrink-0 rounded-sm border ${styles.border} ${styles.bg} overflow-hidden bg-black/70 shadow-inner hover:scale-105 transition-transform`}
                                            aria-label={`View ${item.name}`}
                                        >
                                            <img src={icon} alt="" className="h-full w-full object-cover" />
                                        </button>
                                    )}
                                    <h3 className="font-orbitron text-sm font-black text-white uppercase tracking-wide leading-tight pt-1">{item.name}</h3>
                                </div>
                                <p className="text-gray-500 text-[10px] mb-4 h-10 uppercase tracking-tighter leading-tight">{item.effectDescription}</p>
                            </div>
                            <div className="mt-4 flex justify-between items-center pt-4 border-t border-white/5">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <div className="flex items-center gap-1">
                                        <CoinIcon />
                                        <span className="font-orbitron text-yellow-500 font-black text-lg">{item.cost}</span>
                                    </div>
                                    {!!item.diamondCost && (
                                        <div className="flex items-center gap-1">
                                            {diamondIcon && <img src={diamondIcon} alt="" className="h-4 w-4 rounded-sm object-cover" />}
                                            <span className="font-orbitron text-blue-200 font-black text-lg">{item.diamondCost}</span>
                                        </div>
                                    )}
                                </div>
                                <button disabled={hasItem || !canAfford || isLevelLocked} onClick={() => onBuyItem(item)} className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${hasItem ? 'bg-gray-800 text-gray-500' : isLevelLocked ? 'bg-gray-900 border border-gray-800 text-gray-600 cursor-not-allowed' : canAfford ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-red-900/40 text-red-400 cursor-not-allowed'}`}>
                                    {hasItem ? 'OWNED' : isLevelLocked ? 'LOCKED' : 'EXCHANGE'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {previewItem && previewImage && (
                <div className="fixed inset-0 z-[450] bg-black/90 backdrop-blur-md flex items-center justify-center p-5" onClick={() => setPreviewItem(null)}>
                    <div className="w-full max-w-md border border-blue-500/35 bg-slate-950 rounded-sm p-4 shadow-[0_0_35px_rgba(56,189,248,0.18)]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                                <p className="font-orbitron text-[9px] text-blue-300/70 uppercase tracking-[0.18em]">Gear Preview</p>
                                <h3 className="font-orbitron text-sm text-white uppercase font-black">{previewItem.name}</h3>
                            </div>
                            <button onClick={() => setPreviewItem(null)} className="h-8 w-8 border border-slate-700 rounded-sm text-slate-400 hover:text-white hover:border-blue-400 transition-colors">X</button>
                        </div>
                        <img src={previewImage} alt={previewItem.name} className="w-full max-h-[70vh] object-contain rounded-sm bg-black border border-white/10" />
                    </div>
                </div>
            )}
        </div>
    );
};

const InventoryPageWrapper: React.FC<{ inventory: Inventory; player: Player; onEquip: any; onUnequip: any; onBreak: any }> = ({ inventory, onEquip, onUnequip, onBreak }) => {
    const [subTab, setSubTab] = useState<'loadout' | 'storage'>('loadout');
    const [storageType, setStorageType] = useState<'gear' | 'items'>('gear');
    return (
        <div className="space-y-6">
            <div className="flex gap-8 border-b border-blue-500/20 mb-8">
                {(['loadout', 'storage'] as const).map(t => (
                    <button key={t} onClick={() => setSubTab(t)} className={`font-orbitron text-sm uppercase tracking-[0.3em] font-black pb-3 transition-all ${subTab === t ? 'text-blue-400 border-b-2 border-blue-400 neon-text' : 'text-gray-500 hover:text-gray-300'}`}>{t}</button>
                ))}
            </div>
            {subTab === 'loadout' ? (
                <div className="glass-panel p-8 rounded-lg border-blue-500/30">
                    <h2 className="font-orbitron text-xl text-blue-400 mb-8 uppercase font-black tracking-widest">ACTIVE LOADOUT</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {(['helmet', 'armor', 'gloves', 'boots', 'gear'] as EquipmentSlot[]).map(slot => {
                            const item = inventory.equipment[slot];
                            const styles = item ? getGradeStyles(item.rank) : null;
                            const icon = getGearIcon(item);
                            const isCursed = item && ['armor_berserker', 'shadow_sword', 'shadow_gloves', 'shadow_boots'].includes(item.id);
                            return (
                                <div key={slot} className={`group relative bg-black/40 border p-5 rounded-sm min-h-[140px] flex flex-col items-center justify-center text-center transition-all ${styles ? `${styles.border} ${styles.glow} border-2` : 'border-gray-800 border-dashed'}`}>
                                    <span className="text-[9px] text-blue-500/40 absolute top-2 uppercase font-black tracking-[0.2em]">{slot}</span>
                                    {item ? (
                                        <>
                                            {icon && <img src={icon} alt="" className="mb-3 mt-3 h-20 w-20 rounded-sm object-cover border border-white/10 bg-black/60 shadow-[0_0_18px_rgba(56,189,248,0.15)]" />}
                                            <p className={`font-orbitron text-[11px] font-black uppercase tracking-tight ${styles?.text}`}>{item.name}</p>
                                            <div className="flex gap-1 mt-2">{[...Array(item.stars || 0)].map((_, i) => <span key={i} className="text-yellow-400 text-[10px]">★</span>)}</div>
                                            <p className="text-[8px] text-yellow-500/70 mt-2 font-black uppercase tracking-[0.2em]">ADV. ★ {item.stars || 0}</p>
                                            <button onClick={() => isCursed ? onBreak(slot) : onUnequip(slot)} className={`absolute inset-0 ${isCursed ? 'bg-red-900/90' : 'bg-blue-900/90'} opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all text-white backdrop-blur-sm`}>
                                                {isCursed ? 'Break (Orb)' : 'Unequip'}
                                            </button>
                                        </>
                                    ) : <span className="text-gray-800 text-[10px] font-black uppercase tracking-widest">Empty</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex gap-4">
                        {(['gear', 'items'] as const).map(t => (
                            <button key={t} onClick={() => setStorageType(t)} className={`px-6 py-2 rounded-sm text-[10px] uppercase font-black border transition-all tracking-[0.2em] ${storageType === t ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'bg-gray-900 border-slate-800 text-gray-500 hover:text-gray-300'}`}>{t} storage</button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {storageType === 'gear' ? inventory.storage.filter(i => i.type === 'Gear').map(item => {
                            const styles = getGradeStyles(item.rank);
                            const icon = getGearIcon(item);
                            return (
                                <div key={item.id} className={`p-4 rounded border-2 flex justify-between items-center transition-all glass-panel ${styles.border} ${styles.glow}`}>
                                    {icon && <img src={icon} alt="" className="h-16 w-16 flex-shrink-0 rounded-sm object-cover border border-white/10 bg-black/70 mr-4" />}
                                    <div className="min-w-0 flex-grow pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-orbitron text-[9px] font-black ${styles.text}`}>[{item.rank}]</span>
                                            <p className="font-orbitron text-xs font-black text-white uppercase truncate">{item.name}</p>
                                        </div>
                                        <p className="text-[8px] text-gray-500 uppercase tracking-tighter truncate">{item.effectDescription}</p>
                                    </div>
                                    <button onClick={() => onEquip(item)} className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest text-white transition-colors">Equip</button>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full space-y-6">
                                <h3 className="font-orbitron text-sm text-gray-500 uppercase tracking-[0.3em] border-l-2 border-blue-500/40 pl-3">Material Reserves</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {inventory.materials.map(mat => {
                                        const materialIcon = getMaterialIcon(mat.id);
                                        return (
                                        <div key={mat.id} className="bg-gray-900/60 p-4 rounded-sm border border-slate-800 text-center hover:border-blue-500/40 transition-colors">
                                            {materialIcon && <img src={materialIcon} alt="" className="mx-auto mb-2 h-12 w-12 rounded-sm object-cover border border-blue-300/15 bg-black/70" />}
                                            <p className="font-orbitron text-2xl font-black text-blue-300 mb-1">{mat.count}</p>
                                            <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">{mat.name}</p>
                                        </div>
                                    );})}
                                    {inventory.materials.length === 0 && <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest col-span-full italic">No materials discovered.</p>}
                                </div>
                                <h3 className="font-orbitron text-sm text-gray-500 uppercase tracking-[0.3em] border-l-2 border-yellow-500/40 pl-3 mt-10">Consumables</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {inventory.storage.filter(i => i.type === 'Potion').map(item => (
                                        <div key={item.id} className="glass-panel p-4 rounded-sm border border-slate-800 flex justify-between items-center hover:border-yellow-500/30 transition-all">
                                            <div className="min-w-0 pr-4">
                                                <p className="font-orbitron text-xs font-black text-white truncate uppercase">{item.name}</p>
                                                <p className="text-[9px] text-gray-500 uppercase tracking-tighter mt-1">{item.effectDescription}</p>
                                            </div>
                                            <div className="text-[9px] font-black text-blue-500 border border-blue-500/30 px-2 py-1 bg-blue-500/5 uppercase tracking-widest">Potion</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const RATE_EVERY_N_LEVELS = 3; // show rate prompt every 3 level-ups
const RATE_STORAGE_KEY = 'rll_levelups_since_rate';
const ONBOARDING_STORAGE_KEY = 'rll_onboarding_complete_v1';
const PLAYER_QUALIFICATION_STORAGE_KEY = 'rll_player_qualification_accepted_v1';

interface AppProps {
  userEmail?: string;
  userId?: string;
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (email: string, password: string) => Promise<{ success: boolean; needsConfirmation: boolean }>;
  onSignOut: () => Promise<void>;
  onResetPassword: (email: string) => Promise<boolean>;
  authError: string | null;
  onClearAuthError: () => void;
  authLoading: boolean;
}

const App: React.FC<AppProps> = ({ userEmail, userId, onSignIn, onSignUp, onSignOut, onResetPassword, authError, onClearAuthError, authLoading }) => {
    const data = usePlayerData();
    const { isPro, purchasing, offeringsLoading, offeringsError, offeringsErrorMsg, monthlyPlan, lifetimePlan, purchasePlan, restoreProPurchases, retryOfferings, refreshProStatus } = usePro(userId);
    const [page, setPage] = useState<Page | 'startup'>('startup');
    const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true');
    const [showQualification, setShowQualification] = useState(() => (
        localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true' &&
        localStorage.getItem(PLAYER_QUALIFICATION_STORAGE_KEY) !== 'true'
    ));
    const handleSignOut = useCallback(async () => {
        await onSignOut();
    }, [onSignOut]);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [confirm, setConfirm] = useState<any>(null);
    const [gateConfirm, setGateConfirm] = useState<Dungeon | null>(null);
    const [showPromo, setShowPromo] = useState(false);
    const [showRate, setShowRate] = useState(false);
    const [showUpgradePro, setShowUpgradePro] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [purchaseInitialPlan, setPurchaseInitialPlan] = useState<'monthly' | 'lifetime' | undefined>(undefined);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [upgradeFeatureName, setUpgradeFeatureName] = useState('');
    const [activeDistanceQuest, setActiveDistanceQuest] = useState<Quest | null>(null);
    const [activeQuestRunner, setActiveQuestRunner] = useState<Quest | null>(null);
    const promoCountRef = React.useRef(0);
    const prevLevelRef = React.useRef<number | null>(null);
    const pageRef = React.useRef<Page | 'startup'>('startup');
    const activeDungeonRef = React.useRef<ActiveDungeonState | null>(null);
    const failActiveDungeonRef = React.useRef(data.failActiveDungeon);
    // Track whether we should reopen the paywall after login completes
    const reopenPaywallAfterLoginRef = React.useRef(false);

    // Keep a ref in sync so the back-button handler always reads current page
    useEffect(() => { pageRef.current = page; }, [page]);
    useEffect(() => { activeDungeonRef.current = data.activeDungeon; }, [data.activeDungeon]);
    useEffect(() => { failActiveDungeonRef.current = data.failActiveDungeon; }, [data.failActiveDungeon]);

    // Open the purchase modal directly — prices visible immediately (RC is anonymous)
    const openPurchaseModal = useCallback(async () => {
        setShowPurchaseModal(true);
    }, []);

    // Login-gated purchase: show paywall immediately (anonymous pricing),
    // but require login before completing the actual transaction.
    const handlePurchaseWithLoginGate = useCallback(async (plan: 'monthly' | 'lifetime'): Promise<{ success: boolean; error?: string }> => {
        if (!userId) {
            // Not logged in — close paywall, show auth modal, reopen after login
            setPurchaseInitialPlan(plan);
            setShowPurchaseModal(false);
            reopenPaywallAfterLoginRef.current = true;
            setShowAuthModal(true);
            return { success: false, error: 'Please log in or create an account to complete your purchase.' };
        }
        return purchasePlan(plan);
    }, [userId, purchasePlan]);

    // Login-gated restore: same pattern as purchase
    const handleRestoreWithLoginGate = useCallback(async (): Promise<{ success: boolean; wasPro: boolean; error?: string }> => {
        if (!userId) {
            setPurchaseInitialPlan(undefined);
            setShowPurchaseModal(false);
            reopenPaywallAfterLoginRef.current = true;
            setShowAuthModal(true);
            return { success: false, wasPro: false, error: 'Please log in to restore your previous purchase.' };
        }
        return restoreProPurchases();
    }, [userId, restoreProPurchases]);

    // Sync pro dungeon key allowance whenever isPro changes
    useEffect(() => {
        data.setProDungeonKeys(isPro);
    }, [isPro]); // eslint-disable-line react-hooks/exhaustive-deps

    // Initialize AdMob on mount (skip if Pro)
    useEffect(() => {
        if (isPro) return;
        initAdMob().then(() => { prepareInterstitialAd(); prepareRewardedAd(); });
    }, [isPro]);

    // Android hardware back button: page → menu → startup → exit confirm
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        let listener: any = null;
        getCapApp().then(lib => {
            if (!lib) return;
            lib.App.addListener('backButton', async ({ canGoBack }: { canGoBack: boolean }) => {
                const current = pageRef.current;
                if (activeDungeonRef.current) {
                    setConfirm({
                        title: 'Abandon Dungeon',
                        message: 'Leaving now will result in failure. Confirm abandonment?',
                        isDangerous: true,
                        onConfirm: () => failActiveDungeonRef.current()
                    });
                } else if (current !== 'startup' && current !== 'menu') {
                    setPage('menu');
                } else if (current === 'menu') {
                    setPage('startup');
                } else {
                    // On startup page — ask to exit
                    setShowExitConfirm(true);
                }
            }).then((l: any) => { listener = l; });
        });
        return () => { listener?.remove?.(); };
    }, []);

    // Schedule device notifications when app goes to background
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        let listener: any = null;
        getCapApp().then(lib => {
            if (!lib) return;
            lib.App.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => {
                if (!isActive) {
                    scheduleQuestReminder(data.quests);
                    schedulePlannerReminder(data.weeklyPlan);
                }
            }).then((l: any) => { listener = l; });
        });
        return () => { listener?.remove?.(); };
    }, [data.quests, data.weeklyPlan]);

    // Detect level-up and show rate prompt every RATE_EVERY_N_LEVELS levels
    useEffect(() => {
        const currentLevel = data.player.level;
        if (prevLevelRef.current === null) {
            prevLevelRef.current = currentLevel;
            return;
        }
        if (currentLevel > prevLevelRef.current) {
            const levelsGained = currentLevel - prevLevelRef.current;
            prevLevelRef.current = currentLevel;
            const stored = parseInt(localStorage.getItem(RATE_STORAGE_KEY) || '0', 10);
            const updated = stored + levelsGained;
            if (updated >= RATE_EVERY_N_LEVELS) {
                localStorage.setItem(RATE_STORAGE_KEY, '0');
                setTimeout(() => setShowRate(true), 1500);
            } else {
                localStorage.setItem(RATE_STORAGE_KEY, String(updated));
            }
        }
    }, [data.player.level]);

    // Show promo modal every 5 page navigations (only for non-Pro users)
    const maybeShowPromo = useCallback(() => {
        if (isPro) return;
        promoCountRef.current += 1;
        if (promoCountRef.current % 5 === 0) {
            setShowPromo(true);
        }
    }, [isPro]);

    // Manage banner ads based on page (skip if Pro)
    useEffect(() => {
        if (isPro) { hideBannerAd(); return; }
        if (BANNER_PAGES.includes(page as string)) {
            showBannerAd();
        } else {
            hideBannerAd();
        }
    }, [page, isPro]);

    // Navigate with ad logic (skip interstitials if Pro)
    const navigateTo = useCallback((newPage: Page | 'startup') => {
        if (!isPro && INTERSTITIAL_ON_ENTER.includes(newPage as string)) {
            showInterstitialAd();
        }
        maybeShowPromo();
        setPage(newPage);
    }, [maybeShowPromo, isPro]);

    const completeOnboarding = useCallback(() => {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
        setShowOnboarding(false);
        setShowQualification(false);
        setPage('quests');
        setTimeout(() => {
            data.addNotification('WELCOME HUNTER', 'Start with one E-rank quest today. Clear it, then build your first custom skill.', 'achievement');
        }, 250);
    }, [data]);

    const acceptQualification = useCallback(() => {
        primeNotificationSound();
        localStorage.setItem(PLAYER_QUALIFICATION_STORAGE_KEY, 'true');
        setShowQualification(false);
        setShowOnboarding(true);
    }, []);

    const declineQualification = useCallback(async () => {
        const lib = await getCapApp();
        if (Capacitor.isNativePlatform() && lib?.App?.exitApp) {
            lib.App.exitApp();
            return;
        }
        window.close();
        setPage('startup');
    }, []);

    // Clear dungeon — skip interstitial if Pro
    const handleClearDungeon = useCallback(async (rewardRoll?: DungeonRewardRoll) => {
        if (!isPro) await showInterstitialAd();
        data.clearActiveDungeon(rewardRoll);
    }, [data, isPro]);

    // Complete quest — skip interstitial if Pro
    const handleCompleteQuest = useCallback((id: string) => {
        setConfirm({
            title: 'Clear Quest',
            message: 'Confirm mission accomplishment?',
            onConfirm: async () => {
                if (!isPro) await showInterstitialAd();
                data.completeQuest(id);
            }
        });
    }, [data, isPro]);

    const handleStartDistanceQuest = useCallback((quest: Quest) => {
        setActiveDistanceQuest(quest);
    }, []);

    const handleStartQuestRunner = useCallback((quest: Quest) => {
        setActiveQuestRunner(quest);
    }, []);

    const handleRunnerComplete = useCallback((id: string, elapsedSeconds?: number) => {
        void (async () => {
            if (!isPro) await showInterstitialAd();
            const quest = data.quests.find(q => q.id === id);
            if (quest?.questMode === 'stopwatch' && typeof elapsedSeconds === 'number') {
                data.completeStopwatchQuest(id, elapsedSeconds);
                return;
            }
            data.completeQuest(id);
        })();
    }, [data, isPro]);

    // Watch ad for quest — grant immediately if Pro
    const handleWatchAdForQuest = useCallback((onGranted: () => void) => {
        if (isPro) { onGranted(); return; }
        showRewardedAd(onGranted);
    }, [isPro]);

    const handleShowUpgrade = useCallback((featureName: string) => {
        setUpgradeFeatureName(featureName);
        setShowUpgradePro(true);
    }, []);

    const handleSyncToCloud = useCallback(async () => {
        if (!userId) {
            setShowAuthModal(true);
            return false;
        }
        return data.syncToCloud(userId);
    }, [data, userId]);

    const handleSyncFromCloud = useCallback(async () => {
        if (!userId) {
            setShowAuthModal(true);
            return false;
        }
        return data.syncFromCloud(userId);
    }, [data, userId]);

    const nav = [
        { id: 'status', label: 'STATUS', icon: <StatusIcon /> },
        { id: 'quests', label: 'QUESTS', icon: <QuestLogIcon /> },
        { id: 'skills', label: 'SKILLS', icon: <SkillIcon /> },
        { id: 'dungeons', label: 'DUNGEONS', icon: <DungeonIcon /> },
        { id: 'menu', label: 'MENU', icon: <MenuIcon /> },
    ];

    const fullNav = [
        ...nav,
        { id: 'history', label: 'HISTORY', icon: <HistoryIcon /> },
        { id: 'workshop', label: 'WORKSHOP', icon: <WorkshopIcon /> },
        { id: 'task-list', label: 'PLANNER', icon: <StatsIcon /> },
        { id: 'shop', label: 'SHOP', icon: <ShopIcon /> },
        { id: 'inventory', label: 'INVENTORY', icon: <InventoryIcon /> },
        { id: 'achievements', label: 'ACHIEVEMENTS', icon: <AchievementIcon /> },
        { id: 'settings', label: 'SETTINGS', icon: <SettingsIcon /> },
        { id: 'report', label: 'REPORTS', icon: <ReportIcon /> },
        { id: 'codex', label: 'CODEX', icon: <InfoIcon /> },
    ];

    const render = () => {
        switch (page) {
            case 'menu': return (
                <div className="animate-fadeIn pb-24 lg:pb-0 space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {fullNav.filter(n => n.id !== 'menu').map(n => (
                            <button key={n.id} onClick={() => navigateTo(n.id as Page)} className="bg-[#020617] p-4 md:p-6 rounded-lg flex flex-col items-center justify-center hover:bg-blue-500/10 transition-all border border-blue-500/20 group hover:border-blue-400/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
                                <div className="text-blue-400 mb-2 md:mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] p-2.5 border border-blue-500/30 rounded-lg bg-blue-500/5 group-hover:border-blue-400/60 group-hover:bg-blue-500/10">{n.icon}</div>
                                <span className="font-orbitron text-[9px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.3em] text-white uppercase text-center leading-tight">{n.label}</span>
                            </button>
                        ))}
                    </div>

                </div>
            );
            case 'status': return <StatusPage player={data.player} onRename={data.renamePlayer} />;
            case 'achievements': return <AchievementsPage achievements={data.achievements} />;
            case 'quests': return <QuestLogPage quests={data.quests} completedQuests={data.completedQuests} dungeonHistory={data.dungeonHistory} onComplete={handleCompleteQuest} onStartQuest={handleStartQuestRunner} onStartDistance={handleStartDistanceQuest} onDelete={id => setConfirm({ title: 'Erase Entry', message: 'Permanently purge this quest record?', isDangerous: true, onConfirm: () => data.deleteQuest(id) })} onFail={id => data.failQuest(id)} onAddQuest={data.addQuest} onWatchAdForQuest={handleWatchAdForQuest} />;
            case 'skills': return <SkillsPage skills={data.skills} skillFolders={data.skillFolders} categories={data.categories} improveSkill={data.improveSkill} addSkill={data.addSkill} addSkillFolder={data.addSkillFolder} addCategory={data.addCategory} onDeleteSkill={data.deleteSkill} onDeleteSkillFolder={data.deleteSkillFolder} onDeleteCategory={data.deleteCategory} />;
            case 'dungeons': return <DungeonsPage onStartDungeon={d => setGateConfirm(d)} activeDungeon={data.activeDungeon} dungeonCooldowns={data.dungeonCooldowns} onClearDungeon={handleClearDungeon} onFailDungeon={() => setConfirm({ title: 'Abandon Dungeon', message: 'Leaving now will result in failure. Confirm abandonment?', isDangerous: true, onConfirm: data.failActiveDungeon })} onDungeonTimeout={data.failActiveDungeon} onProgressDungeon={data.progressDungeon} dungeonHistory={data.dungeonHistory} playerLevel={data.player.level} dungeonKeys={data.dungeonKeys} isPro={isPro} onEarnKey={() => showRewardedAd(data.earnDungeonKey)} />;
            case 'history': return <QuestHistory completedQuests={data.completedQuests} dungeonHistory={data.dungeonHistory} onUpgradePro={() => handleShowUpgrade('Detailed History Log')} isPro={isPro} />;
            case 'task-list': return <TaskList weeklyPlan={data.weeklyPlan} onAddTask={data.addTaskListTask} onToggleTask={data.toggleTaskListTask} onDeleteTask={data.deleteTaskListTask} />;
            case 'workshop': return <WorkshopPage inventory={data.inventory} onEnhance={data.enhanceGear} onAdvance={data.advanceGear} player={data.player} />;
            case 'shop': return <ShopPage player={data.player} inventory={data.inventory} onBuyItem={i => setConfirm({ title: 'System Exchange', message: `Authorize exchange for ${i.name}? Cost: ${i.cost} coins${i.diamondCost ? ` + ${i.diamondCost} diamonds` : ''}.`, onConfirm: () => data.buyItem(i) })} />;
            case 'inventory': return <InventoryPageWrapper inventory={data.inventory} player={data.player} onEquip={data.equipItem} onUnequip={data.unequipItem} onBreak={slot => setConfirm({ title: 'Break Curse', message: 'Permanently destroy cursed equipment using Light Orb?', isDangerous: true, onConfirm: () => data.breakGear(slot) })} />;
            case 'settings': return <SettingsPage userEmail={userEmail} isPro={isPro} appVersion={APP_VERSION} onLoginPress={() => setShowAuthModal(true)} onSignOut={handleSignOut} onExport={data.exportState} onImport={data.importState} onSyncToCloud={handleSyncToCloud} onSyncFromCloud={handleSyncFromCloud} />;
            case 'codex': return <Codex onOpenExport={data.exportState} onOpenImport={data.importState} onSetBackground={() => {}} background={null} onNavigateToReport={() => navigateTo('report')} />;
            case 'report': return <ReportExport player={data.player} completedQuests={data.completedQuests} dungeonHistory={data.dungeonHistory} achievements={data.achievements} inventory={data.inventory} onUpgradePro={() => handleShowUpgrade('System Reports')} isPro={isPro} />;
            default: return null;
        }
    };

    if (showQualification) {
        return <PlayerQualificationScreen onAccept={acceptQualification} onDecline={declineQualification} />;
    }

    if (showOnboarding) {
        return <OnboardingPage onComplete={completeOnboarding} />;
    }

    if (page === 'startup') {
        return (
            <>
                <StartupPage onEnter={() => navigateTo('menu')} onLoginPress={!userEmail ? () => setShowAuthModal(true) : undefined} userEmail={userEmail} />
                {showExitConfirm && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[500] backdrop-blur-md">
                        <div className="glass-panel border-2 border-blue-500 rounded-lg p-6 w-full max-w-sm m-4 shadow-[0_0_30px_rgba(56,189,248,0.3)]">
                            <h3 className="font-orbitron text-lg font-black mb-2 uppercase text-blue-300">Exit System?</h3>
                            <p className="text-gray-400 text-xs mb-8 uppercase tracking-tighter font-bold">Close the R.L.L application?</p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setShowExitConfirm(false)} className="bg-gray-800 px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-white transition-colors">Stay</button>
                                <button
                                    onClick={async () => {
                                        setShowExitConfirm(false);
                                        const lib = await getCapApp();
                                        lib?.App?.exitApp?.();
                                    }}
                                    className="bg-blue-700 px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest hover:scale-105 transition-transform"
                                >
                                    Exit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {showAuthModal && (
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[500] flex items-end justify-center" onClick={() => setShowAuthModal(false)}>
                        <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                            <AuthPage
                                onSignIn={async (email, password) => { const ok = await onSignIn(email, password); if (ok) { setShowAuthModal(false); if (reopenPaywallAfterLoginRef.current) { reopenPaywallAfterLoginRef.current = false; setShowPurchaseModal(true); } } return ok; }}
                                onSignUp={onSignUp}
                                onForgotPassword={onResetPassword}
                                loading={authLoading}
                                error={authError}
                                onClearError={onClearAuthError}
                                onBack={() => setShowAuthModal(false)}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    }

    if (activeDistanceQuest) {
        return (
            <DistanceRunPage
                quest={activeDistanceQuest}
                onCancel={() => setActiveDistanceQuest(null)}
                onFinish={data.completeDistanceQuest}
            />
        );
    }

    if (activeQuestRunner) {
        return (
            <QuestRunnerPage
                quest={activeQuestRunner}
                onCancel={() => setActiveQuestRunner(null)}
                onComplete={handleRunnerComplete}
            />
        );
    }

    const isActiveDungeonPage = page === 'dungeons' && !!data.activeDungeon;

    return (
        <div
            className="root-bottom-pad bg-[#020617] text-white font-sans flex flex-col lg:flex-row overflow-hidden lg:pb-0"
            style={{ height: '100%', paddingBottom: isActiveDungeonPage ? '0px' : 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
        >
            <NotificationManager notifications={data.notifications} />

            {/* Desktop Sidebar */}
            {!isActiveDungeonPage && <aside className="hidden lg:flex w-72 flex-col glass-panel border-r border-blue-500/10 p-8 z-50 overflow-y-auto custom-scrollbar">
                <header className="mb-8">
                    <div className="flex items-baseline gap-2">
                        <h1 className="font-orbitron font-black text-3xl tracking-tighter text-blue-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">R.L.L</h1>
                        <span className="font-orbitron text-[8px] font-black text-blue-300/60 uppercase tracking-[0.2em] border border-blue-500/30 px-1 py-0.5 rounded-sm">LITE</span>
                    </div>
                    <p className="font-orbitron text-[8px] text-blue-500/40 uppercase tracking-widest mt-0.5">REAL LIFE LEVELLING LITE</p>
                    <div className="h-1 w-16 bg-blue-500 mt-2 rounded-full"></div>
                </header>
                <nav className="flex flex-col gap-3 flex-grow">
                    {fullNav.map(n => (
                        <button key={n.id} onClick={() => navigateTo(n.id as Page)} className={`flex items-center gap-5 p-4 rounded-sm transition-all font-orbitron text-[10px] font-black tracking-[0.2em] uppercase border border-transparent ${page === n.id ? 'bg-blue-600/30 text-white border-blue-500 shadow-[inset_0_0_10px_rgba(56,189,248,0.2)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                            <span className={`w-5 h-5 flex items-center justify-center transition-transform ${page === n.id ? 'scale-110 text-blue-300' : ''}`}>{n.icon}</span>
                            <span>{n.label}</span>
                        </button>
                    ))}
                </nav>
                {/* Pro Version Banner in sidebar — hidden when Pro */}
                {!isPro && (
                    <div className="mt-6">
                        <ProVersionBanner compact onUpgrade={openPurchaseModal} />
                    </div>
                )}
                {userEmail && (
                    <div className="mt-4 pt-4 border-t border-blue-500/10">
                        <p className="font-orbitron text-[7px] text-gray-600 uppercase tracking-widest truncate mb-2">{userEmail}</p>
                        <button onClick={handleSignOut} className="w-full text-[9px] font-orbitron font-black uppercase tracking-widest text-gray-500 hover:text-red-400 transition-colors py-1">
                            Sign Out
                        </button>
                    </div>
                )}
                <footer className="mt-4 text-[8px] font-orbitron text-blue-500/40 tracking-widest uppercase">
                    &copy; 2025 R.L.L OS // LITE EDITION
                </footer>
            </aside>}

            {/* Mobile Top Header — padded for status bar */}
            {!isActiveDungeonPage && (
            <div
                className="lg:hidden fixed top-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md border-b border-blue-500/10 z-[100] shadow-lg"
                style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
            >
            <div className="h-14 px-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {page !== 'menu' && (
                         <button onClick={() => navigateTo('menu')} className="text-blue-500 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <div className="flex items-baseline gap-1.5">
                        <h1 className="font-orbitron font-black text-xl text-blue-400 tracking-tighter uppercase leading-none">R.L.L</h1>
                        <span className="font-orbitron text-[7px] font-black text-blue-300/50 uppercase tracking-[0.15em] border border-blue-500/20 px-1 rounded-sm">LITE</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-orbitron text-[10px] font-black text-blue-500/60 uppercase tracking-widest bg-blue-500/5 px-2 py-1 rounded border border-blue-500/20">LVL {data.player.level}</span>
                    {userEmail && (
                        <button onClick={handleSignOut} className="font-orbitron text-[8px] font-black text-gray-600 hover:text-red-400 uppercase tracking-widest transition-colors px-1">
                            OUT
                        </button>
                    )}
                </div>
            </div>
            </div>
            )}

            <main
                className="mobile-main flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar lg:pt-0"
                style={{ paddingTop: isActiveDungeonPage ? '0px' : 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
            >
                <div className={isActiveDungeonPage ? 'w-full min-h-full p-0' : page === 'status' ? 'w-full h-full p-2 md:p-4 lg:p-12' : 'max-w-6xl mx-auto p-4 md:p-6 lg:p-16 border-none rounded-none'}>
                    {render()}
                </div>
            </main>

            {/* Mobile Bottom Navigation — padded for nav bar */}
            {!isActiveDungeonPage && (
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-lg border-t border-blue-500/10 z-[110] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
                {/* Pro Version Banner above bottom nav — hidden when Pro */}
                {!isPro && (
                    <div className="px-3 pt-1.5 pb-0 border-b border-blue-500/5">
                        <ProVersionBanner compact onUpgrade={openPurchaseModal} />
                    </div>
                )}
                <div className="h-16 flex items-center justify-around px-2">
                    {nav.map(n => (
                        <button
                            key={n.id}
                            onClick={() => navigateTo(n.id as Page)}
                            className={`flex flex-col items-center justify-center w-14 h-full transition-all ${page === n.id ? 'text-blue-400' : 'text-gray-500'}`}
                        >
                            <div className={`transition-transform duration-300 ${page === n.id ? 'scale-110 mb-0.5' : 'scale-90 opacity-60'}`}>{n.icon}</div>
                            <span className={`font-orbitron text-[7px] font-black tracking-widest uppercase transition-all ${page === n.id ? 'opacity-100' : 'opacity-40'}`}>{n.label}</span>
                            {page === n.id && (
                                <div className="absolute bottom-1 w-6 h-0.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
            </nav>
            )}

            <ConfirmationModal isOpen={!!confirm} title={confirm?.title || ''} message={confirm?.message || ''} onConfirm={confirm?.onConfirm || (() => {})} onCancel={() => setConfirm(null)} isDangerous={confirm?.isDangerous} />
            <DungeonEntranceModal
                dungeon={gateConfirm}
                onCancel={() => setGateConfirm(null)}
                onConfirm={() => {
                    if (gateConfirm) data.startDungeon(gateConfirm.id);
                    setGateConfirm(null);
                }}
            />

            {showPromo && <PromoModal onClose={() => setShowPromo(false)} onPurchase={openPurchaseModal} />}
            {showRate && <RateAppModal level={data.player.level} onClose={() => setShowRate(false)} />}
            {showUpgradePro && <UpgradeToProModal featureName={upgradeFeatureName} onClose={() => setShowUpgradePro(false)} onPurchase={openPurchaseModal} />}
            {showPurchaseModal && (
                <ProPurchaseModal
                    onClose={() => { setShowPurchaseModal(false); setPurchaseInitialPlan(undefined); }}
                    onPurchase={handlePurchaseWithLoginGate}
                    onRestore={handleRestoreWithLoginGate}
                    onRetry={retryOfferings}
                    purchasing={purchasing}
                    offeringsLoading={offeringsLoading}
                    offeringsError={offeringsError}
                    offeringsErrorMsg={offeringsErrorMsg}
                    monthlyPlan={monthlyPlan}
                    lifetimePlan={lifetimePlan}
                    initialPlan={purchaseInitialPlan}
                />
            )}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[500] flex items-end justify-center" onClick={() => setShowAuthModal(false)}>
                    <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <AuthPage
                            onSignIn={async (email, password) => { const ok = await onSignIn(email, password); if (ok) { setShowAuthModal(false); if (reopenPaywallAfterLoginRef.current) { reopenPaywallAfterLoginRef.current = false; setShowPurchaseModal(true); } } return ok; }}
                            onSignUp={onSignUp}
                            onForgotPassword={onResetPassword}
                            loading={authLoading}
                            error={authError}
                            onClearError={onClearAuthError}
                            onBack={() => setShowAuthModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;

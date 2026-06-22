import React, { useRef } from 'react';

interface SettingsPageProps {
  userEmail?: string;
  isPro: boolean;
  appVersion: string;
  onLoginPress: () => void;
  onSignOut: () => void;
  onExport: (mode?: 'share' | 'download') => void;
  onImport: (json: string) => void;
  onSyncToCloud: () => Promise<boolean>;
  onSyncFromCloud: () => Promise<boolean>;
}

const ImportDataButton: React.FC<{ onImport: (json: string) => void }> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') onImport(content);
    };
    reader.readAsText(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
      <button onClick={() => fileInputRef.current?.click()} className="font-orbitron bg-red-700/80 hover:bg-red-600 text-white px-4 py-3 rounded text-[10px] font-black uppercase tracking-widest border border-red-400/40 transition-all">
        Sync From File
      </button>
    </>
  );
};

const StatusDot: React.FC<{ tone: 'green' | 'yellow' | 'red' | 'blue' }> = ({ tone }) => {
  const colors = {
    green: 'bg-green-400 shadow-green-400/70',
    yellow: 'bg-yellow-400 shadow-yellow-400/70',
    red: 'bg-red-400 shadow-red-400/70',
    blue: 'bg-blue-400 shadow-blue-400/70',
  };
  return <span className={`inline-block w-2 h-2 rounded-full shadow-[0_0_10px] ${colors[tone]}`} />;
};

const SettingPanel: React.FC<{ title: string; eyebrow: string; children: React.ReactNode }> = ({ title, eyebrow, children }) => (
  <section className="border border-blue-500/20 bg-[#020617] rounded p-4 md:p-5">
    <p className="font-orbitron text-[8px] text-blue-400/60 uppercase tracking-[0.3em] mb-1">{eyebrow}</p>
    <h3 className="font-orbitron text-lg text-white font-black uppercase tracking-widest mb-4">{title}</h3>
    {children}
  </section>
);

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userEmail,
  isPro,
  appVersion,
  onLoginPress,
  onSignOut,
  onExport,
  onImport,
  onSyncToCloud,
  onSyncFromCloud,
}) => {
  const linked = !!userEmail;
  const [syncing, setSyncing] = React.useState<'up' | 'down' | null>(null);

  const runSync = async (direction: 'up' | 'down') => {
    if (!linked || syncing) return;
    setSyncing(direction);
    try {
      if (direction === 'up') await onSyncToCloud();
      else await onSyncFromCloud();
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-0">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-orbitron text-[9px] text-blue-400/70 uppercase tracking-[0.35em]">System Control</p>
          <h2 className="font-orbitron text-2xl md:text-3xl text-blue-300 uppercase tracking-widest font-black">Settings</h2>
        </div>
        <div className="text-right">
          <p className="font-orbitron text-[8px] text-gray-500 uppercase tracking-widest">Version</p>
          <p className="font-orbitron text-sm text-white font-black">{appVersion}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SettingPanel eyebrow="Identity" title="Account">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <StatusDot tone={linked ? 'green' : 'yellow'} />
                <p className="font-orbitron text-[10px] text-gray-300 uppercase tracking-widest">{linked ? 'Linked' : 'Guest Mode'}</p>
              </div>
              <p className="font-orbitron text-sm text-blue-300 truncate">{userEmail || 'No account linked'}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">{isPro ? 'Pro entitlement active' : 'Standard entitlement active'}</p>
            </div>
            {linked ? (
              <button onClick={onSignOut} className="font-orbitron text-[10px] font-black uppercase tracking-widest text-red-300 border border-red-500/30 hover:bg-red-500/10 px-4 py-3 rounded transition-all">
                Logout
              </button>
            ) : (
              <button onClick={onLoginPress} className="font-orbitron text-[10px] font-black uppercase tracking-widest text-blue-300 border border-blue-500/40 hover:bg-blue-500/10 px-4 py-3 rounded transition-all">
                Login
              </button>
            )}
          </div>
        </SettingPanel>

        <SettingPanel eyebrow="Cloud" title="Sync Status">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusDot tone={linked ? 'blue' : 'yellow'} />
                <span className="font-orbitron text-[10px] text-gray-300 uppercase tracking-widest">{linked ? 'Account Ready' : 'Login Required'}</span>
              </div>
              <span className="font-orbitron text-[9px] text-gray-500 uppercase tracking-widest">Supabase</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => runSync('up')} disabled={!linked || !!syncing} className={`font-orbitron px-3 py-3 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${linked ? 'bg-blue-700 hover:bg-blue-600 text-white border-blue-400/40 disabled:opacity-50' : 'bg-blue-900/30 text-blue-300/40 border-blue-500/10 cursor-not-allowed'}`}>
                {syncing === 'up' ? 'Syncing...' : 'Sync To Account'}
              </button>
              <button onClick={() => runSync('down')} disabled={!linked || !!syncing} className={`font-orbitron px-3 py-3 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${linked ? 'bg-cyan-700 hover:bg-cyan-600 text-white border-cyan-400/40 disabled:opacity-50' : 'bg-blue-900/30 text-blue-300/40 border-blue-500/10 cursor-not-allowed'}`}>
                {syncing === 'down' ? 'Syncing...' : 'Sync From Account'}
              </button>
            </div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">Uses Supabase account cloud save.</p>
          </div>
        </SettingPanel>

        <SettingPanel eyebrow="Backup" title="Local Data">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => onExport('share')} className="font-orbitron bg-blue-700 hover:bg-blue-600 text-white px-4 py-3 rounded text-[10px] font-black uppercase tracking-widest border border-blue-400/40 transition-all">
              Share Backup
            </button>
            <ImportDataButton onImport={onImport} />
          </div>
        </SettingPanel>

        <SettingPanel eyebrow="Build" title="Version">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-orbitron text-[8px] text-gray-500 uppercase tracking-widest mb-1">App</p>
              <p className="font-orbitron text-sm text-white font-black">R.L.L</p>
            </div>
            <div>
              <p className="font-orbitron text-[8px] text-gray-500 uppercase tracking-widest mb-1">Release</p>
              <p className="font-orbitron text-sm text-white font-black">{appVersion}</p>
            </div>
          </div>
        </SettingPanel>
      </div>
    </div>
  );
};

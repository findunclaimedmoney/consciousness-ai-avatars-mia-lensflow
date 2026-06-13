import React, { useState, useEffect } from 'react';

interface Lock {
  id: string;
  name: string;
  message: string;
  unlockAt: string;
  videoUrl: string;
  createdAt: string;
}

function Countdown({ target }: { target: string }) {
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    const calc = () => setDiff(new Date(target).getTime() - Date.now());
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [target]);

  if (diff <= 0) return <span className="text-green-400 font-mono text-sm">Unlocked</span>;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex gap-3 font-mono">
      {[['d', d], ['h', h], ['m', m], ['s', s]].map(([u, v]) => (
        <div key={u as string} className="text-center">
          <div className="text-2xl font-bold text-white">{String(v).padStart(2, '0')}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-widest">{u}</div>
        </div>
      ))}
    </div>
  );
}

export default function TimeLockPage() {
  const [locks, setLocks] = useState<Lock[]>(() => {
    try { return JSON.parse(localStorage.getItem('glimr-timelocks') || '[]'); } catch { return []; }
  });
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [unlockAt, setUnlockAt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [revealed, setRevealed] = useState<string | null>(null);

  const save = (updated: Lock[]) => {
    setLocks(updated);
    localStorage.setItem('glimr-timelocks', JSON.stringify(updated));
  };

  const createLock = () => {
    if (!name || !unlockAt) return;
    const lock: Lock = {
      id: Date.now().toString(),
      name, message, unlockAt, videoUrl,
      createdAt: new Date().toISOString(),
    };
    save([lock, ...locks]);
    setName(''); setMessage(''); setUnlockAt(''); setVideoUrl('');
  };

  const deleteLock = (id: string) => save(locks.filter((l) => l.id !== id));

  const isUnlocked = (l: Lock) => new Date(l.unlockAt).getTime() <= Date.now();

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-8 font-sans">
      <header className="mb-10">
        <p className="text-[11px] tracking-[3px] text-orange-500 uppercase mb-2">Feature 02</p>
        <h1 className="text-4xl font-bold tracking-tight">Birthday Time-Lock</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-md">
          Set a Glimr to unlock at an exact moment. It stays sealed until the second arrives.
        </p>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create */}
        <div className="bg-[#141414] rounded-xl border border-[#222] p-6 space-y-4 h-fit">
          <p className="text-[11px] tracking-[2px] text-gray-500 uppercase">Create a Lock</p>

          <label className="block">
            <span className="text-xs text-gray-500">Label</span>
            <input
              className="mt-1 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-orange-600 transition-colors"
              placeholder="Sarah's 30th"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500">Message (shown on unlock)</span>
            <textarea
              className="mt-1 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-orange-600 transition-colors resize-none h-24"
              placeholder="Happy birthday. Open this when you're ready..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500">Unlock Date &amp; Time</span>
            <input
              type="datetime-local"
              className="mt-1 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-orange-600 transition-colors"
              value={unlockAt}
              onChange={(e) => setUnlockAt(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500">Glimr Video URL (optional)</span>
            <input
              className="mt-1 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-orange-600 transition-colors"
              placeholder="https://..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </label>

          <button
            onClick={createLock}
            disabled={!name || !unlockAt}
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold tracking-wide transition-colors"
          >
            Seal Lock
          </button>
        </div>

        {/* Locks list */}
        <div className="space-y-4">
          <p className="text-[11px] tracking-[2px] text-gray-500 uppercase">Active Locks ({locks.length})</p>

          {locks.length === 0 && (
            <div className="bg-[#141414] rounded-xl border border-[#222] p-8 text-center text-gray-700 text-sm">
              No locks yet. Create one to get started.
            </div>
          )}

          {locks.map((lock) => {
            const unlocked = isUnlocked(lock);
            const open = revealed === lock.id;

            return (
              <div
                key={lock.id}
                className={`rounded-xl border p-5 transition-colors ${
                  unlocked ? 'border-green-800 bg-green-950/10' : 'border-[#222] bg-[#141414]'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{lock.name}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Unlocks {new Date(lock.unlockAt).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteLock(lock.id)}
                    className="text-[10px] text-gray-700 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>

                {!unlocked ? (
                  <div className="bg-black/40 rounded-lg p-4 flex flex-col items-center gap-2">
                    <p className="text-[10px] tracking-[2px] text-gray-600 uppercase mb-1">Time remaining</p>
                    <Countdown target={lock.unlockAt} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs text-green-400 tracking-widest uppercase font-semibold">Unlocked</span>
                    </div>
                    {!open ? (
                      <button
                        onClick={() => setRevealed(lock.id)}
                        className="w-full py-2 text-sm font-semibold rounded-lg bg-green-800 hover:bg-green-700 transition-colors"
                      >
                        Open Glimr
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {lock.message && (
                          <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-orange-600 pl-3">
                            {lock.message}
                          </p>
                        )}
                        {lock.videoUrl && (
                          <a
                            href={lock.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-xs text-orange-400 underline"
                          >
                            Watch Glimr
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useStudio } from '@/studio/StudioContext';

type GlimrAction = 'START_RECORDING' | 'STOP_RECORDING' | 'INIT_HARDWARE';

interface GlimrActionEvent extends CustomEvent {
  detail: { action: GlimrAction; payload?: Record<string, unknown> };
}

function dispatch(action: GlimrAction, payload?: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent('GLIMR_ACTION', { detail: { action, payload } }));
}

export default function CreateGlimr() {
  const engine = useStudio();

  const [eventLog, setEventLog] = useState<string[]>(['Listening for GLIMR_ACTION events...']);
  const [isRecording, setIsRecording] = useState(false);
  const [hardwareReady, setHardwareReady] = useState(false);

  const log = (msg: string) =>
    setEventLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 8));

  useEffect(() => {
    const handleGlimrAction = async (event: Event) => {
      const { action, payload } = (event as GlimrActionEvent).detail;
      log(`Event received → ${action}${payload ? ' ' + JSON.stringify(payload) : ''}`);

      try {
        if (action === 'INIT_HARDWARE') {
          await engine.initHardware();
          setHardwareReady(true);
          log('Hardware initialized.');
        } else if (action === 'START_RECORDING') {
          if (!hardwareReady && !engine.stream) {
            await engine.initHardware();
            setHardwareReady(true);
          }
          engine.record();
          setIsRecording(true);
          log('Recording started.');
        } else if (action === 'STOP_RECORDING') {
          const url = await engine.stopAndSave();
          setIsRecording(false);
          log(`Recording saved → ${url.substring(0, 32)}...`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`ERROR: ${msg}`);
      }
    };

    window.addEventListener('GLIMR_ACTION', handleGlimrAction);
    return () => window.removeEventListener('GLIMR_ACTION', handleGlimrAction);
  }, [engine, hardwareReady]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-orange-500 rounded-full" />
          <h1 className="text-3xl font-extrabold tracking-tight">Create Glimr</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1 ml-5">
          Event-driven recording controller via <code className="text-orange-400 text-xs bg-gray-900 px-1 py-0.5 rounded">GLIMR_ACTION</code>
        </p>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Status */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Engine Status</div>
            <div className={`text-sm font-mono font-bold ${hardwareReady ? 'text-green-400' : 'text-gray-500'}`}>
              {hardwareReady ? 'HARDWARE READY' : 'STANDBY'}
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Recording</div>
            <div className={`text-sm font-mono font-bold flex items-center justify-end gap-2 ${isRecording ? 'text-red-400' : 'text-gray-500'}`}>
              {isRecording && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
              {isRecording ? 'ACTIVE' : 'IDLE'}
            </div>
          </div>
        </div>

        {/* Manual dispatch controls */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">Dispatch Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => dispatch('INIT_HARDWARE')}
              className="py-3 rounded-lg text-sm font-bold bg-blue-800 hover:bg-blue-700 transition-all"
            >
              Init Hardware
            </button>
            <button
              onClick={() => dispatch('START_RECORDING')}
              disabled={isRecording}
              className="py-3 rounded-lg text-sm font-bold bg-green-700 hover:bg-green-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start Recording
            </button>
            <button
              onClick={() => dispatch('STOP_RECORDING')}
              disabled={!isRecording}
              className="py-3 rounded-lg text-sm font-bold bg-red-700 hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Stop &amp; Save
            </button>
          </div>
          <p className="text-xs text-gray-600 font-mono">
            These buttons fire <code>window.dispatchEvent(new CustomEvent('GLIMR_ACTION', ...))</code> — any part of the app can trigger the same events.
          </p>
        </div>

        {/* Event log */}
        <div className="bg-black rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">
            Event Stream
          </h2>
          <div className="space-y-1 font-mono text-xs">
            {eventLog.map((entry, i) => (
              <div
                key={i}
                style={{ opacity: Math.max(0.3, 1 - i * 0.1) }}
                className="text-green-400 leading-5"
              >
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

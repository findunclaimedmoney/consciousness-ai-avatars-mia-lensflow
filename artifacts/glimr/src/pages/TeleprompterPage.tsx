import React, { useState, useRef, useEffect, useCallback } from 'react';

const DEFAULT_SCRIPT = `Welcome to Glimr. The studio built for people who have something real to say.

Every word you speak here is recorded in the highest quality your device can deliver. No compression. No shortcuts.

Glimr is designed for the moments that matter — birthdays, farewells, proposals, apologies, declarations. The things you need to get right.

Your script scrolls at your pace. Your face stays front and centre. The camera never lies, and neither should you.

When you're ready, hit record. Say it like you mean it.`;

export default function TeleprompterPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number>(0);
  const posRef = useRef<number>(0);

  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [editing, setEditing] = useState(false);
  const [speed, setSpeed] = useState(1.2);
  const [fontSize, setFontSize] = useState(36);
  const [isRunning, setIsRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [mirror, setMirror] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<'1080p' | '720p' | '4K'>('1080p');

  const QUALITY_MAP = {
    '4K':   { width: 3840, height: 2160 },
    '1080p':{ width: 1920, height: 1080 },
    '720p': { width: 1280, height: 720  },
  };

  const startCamera = async () => {
    const q = QUALITY_MAP[quality];
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: q.width }, height: { ideal: q.height }, frameRate: { ideal: 30 } },
      audio: true,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setCameraOn(true);
    }
  };

  const scroll = useCallback(() => {
    if (!scrollRef.current || !isRunning) return;
    posRef.current += speed * 0.4;
    scrollRef.current.scrollTop = posRef.current;
    if (posRef.current >= scrollRef.current.scrollHeight - scrollRef.current.clientHeight) {
      setIsRunning(false);
      return;
    }
    rafRef.current = requestAnimationFrame(scroll);
  }, [isRunning, speed]);

  useEffect(() => {
    if (isRunning) { rafRef.current = requestAnimationFrame(scroll); }
    else cancelAnimationFrame(rafRef.current);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, scroll]);

  const handleReset = () => {
    setIsRunning(false);
    posRef.current = 0;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const handleRecord = async () => {
    if (!cameraOn) await startCamera();
    const stream = (videoRef.current?.srcObject as MediaStream);
    if (!stream) return;

    if (!isRecording) {
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoUrl(URL.createObjectURL(blob));
      };
      mr.start();
      recorderRef.current = mr;
      setIsRecording(true);
      setIsRunning(true);
    } else {
      recorderRef.current?.stop();
      setIsRecording(false);
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 bg-[#0e0e0e] border-b border-[#1c1c1c] flex-wrap">
        <span className="text-[11px] tracking-[3px] text-orange-500 uppercase font-semibold mr-2">
          Glimr Teleprompter
        </span>

        <div className="flex items-center gap-2 ml-auto">
          {/* Quality */}
          {(['4K','1080p','720p'] as const).map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`px-3 py-1.5 text-xs rounded border font-mono transition-colors ${
                quality === q ? 'border-orange-600 text-orange-400 bg-orange-950/30' : 'border-[#222] text-gray-500 hover:border-[#444]'
              }`}
            >
              {q}
            </button>
          ))}

          <div className="w-px h-5 bg-[#222] mx-1" />

          {/* Mirror */}
          <button
            onClick={() => setMirror(!mirror)}
            className={`px-3 py-1.5 text-xs rounded border transition-colors ${
              mirror ? 'border-blue-700 text-blue-400' : 'border-[#222] text-gray-500'
            }`}
          >
            Mirror
          </button>

          {/* Camera */}
          {!cameraOn && (
            <button
              onClick={startCamera}
              className="px-3 py-1.5 text-xs rounded border border-[#333] text-gray-400 hover:border-gray-600 transition-colors"
            >
              Enable Camera
            </button>
          )}

          {/* Record */}
          <button
            onClick={handleRecord}
            className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${
              isRecording ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white'
            }`}
          >
            {isRecording ? 'Stop' : 'Record'}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video feed — left/main */}
        <div className="relative flex-1 bg-black overflow-hidden">
          {/* HUD frame — corner accents */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Corners */}
            {[
              'top-0 left-0 border-t-2 border-l-2 rounded-tl',
              'top-0 right-0 border-t-2 border-r-2 rounded-tr',
              'bottom-0 left-0 border-b-2 border-l-2 rounded-bl',
              'bottom-0 right-0 border-b-2 border-r-2 rounded-br',
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-10 h-10 border-orange-500/60 ${cls}`}
              />
            ))}
            {/* Top info bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
              {isRecording && (
                <div className="flex items-center gap-2 bg-black/70 border border-red-700/50 px-3 py-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-red-400 tracking-widest">REC {quality}</span>
                </div>
              )}
              {!isRecording && cameraOn && (
                <div className="flex items-center gap-2 bg-black/60 border border-[#2a2a2a] px-3 py-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] font-mono text-gray-400 tracking-widest">LIVE PREVIEW {quality}</span>
                </div>
              )}
            </div>
          </div>

          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ transform: mirror ? 'scaleX(-1)' : 'none' }}
            muted
            playsInline
          />

          {!cameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-px bg-orange-600/40" />
              <p className="text-[11px] tracking-[3px] text-gray-600 uppercase">Camera offline</p>
              <button
                onClick={startCamera}
                className="mt-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Enable Camera
              </button>
            </div>
          )}
        </div>

        {/* Teleprompter panel — right */}
        <div className="w-[420px] flex flex-col bg-[#0a0a0a] border-l border-[#1c1c1c]">
          {/* Scroll area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-hidden px-8 py-6"
            style={{ scrollBehavior: 'auto' }}
          >
            {editing ? (
              <textarea
                className="w-full h-full bg-transparent text-white outline-none resize-none leading-relaxed"
                style={{ fontSize: `${Math.max(16, fontSize * 0.55)}px` }}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                autoFocus
              />
            ) : (
              <p
                className="text-white leading-relaxed whitespace-pre-wrap"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
              >
                {script}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="border-t border-[#1c1c1c] p-4 space-y-3">
            {/* Speed */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[2px] text-gray-600 uppercase">Speed</span>
              <div className="flex items-center gap-2">
                <input
                  type="range" min={0.3} max={4} step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-24 accent-orange-500"
                />
                <span className="text-xs font-mono text-orange-400 w-6">{speed.toFixed(1)}x</span>
              </div>
            </div>

            {/* Font size */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[2px] text-gray-600 uppercase">Text Size</span>
              <div className="flex items-center gap-2">
                <input
                  type="range" min={20} max={72} step={2}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-24 accent-orange-500"
                />
                <span className="text-xs font-mono text-orange-400 w-8">{fontSize}px</span>
              </div>
            </div>

            {/* Playback */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(!editing)}
                className={`flex-1 py-2 text-xs rounded border transition-colors font-semibold ${
                  editing ? 'border-orange-600 text-orange-400 bg-orange-950/20' : 'border-[#2a2a2a] text-gray-500 hover:border-[#444]'
                }`}
              >
                {editing ? 'Done' : 'Edit Script'}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 text-xs rounded border border-[#2a2a2a] text-gray-500 hover:border-[#444] transition-colors font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 py-2 text-xs rounded font-bold transition-colors ${
                  isRunning ? 'bg-yellow-700 hover:bg-yellow-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isRunning ? 'Pause' : 'Scroll'}
              </button>
            </div>

            {videoUrl && (
              <a
                href={videoUrl}
                download="glimr-teleprompter.webm"
                className="block w-full text-center py-2 text-xs font-bold rounded bg-orange-600 hover:bg-orange-500 text-white transition-colors"
              >
                Download Recording
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

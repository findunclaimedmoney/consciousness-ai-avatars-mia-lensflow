import React, { useRef, useState, useEffect, useCallback } from 'react';

const FILTERS = [
  {
    id: 'studio',
    label: 'Studio',
    css: 'contrast(1.1) saturate(1.15) brightness(1.05)',
    svg: null,
  },
  {
    id: 'noir',
    label: 'Noir',
    css: 'grayscale(1) contrast(1.4) brightness(0.85)',
    svg: null,
  },
  {
    id: 'cinema',
    label: 'Cinema',
    css: 'contrast(1.2) saturate(0.85) brightness(0.92) sepia(0.08)',
    svg: null,
  },
  {
    id: 'haze',
    label: 'Haze',
    css: 'contrast(0.9) saturate(0.7) brightness(1.1) blur(0px) sepia(0.15)',
    svg: null,
  },
  {
    id: 'vivid',
    label: 'Vivid',
    css: 'contrast(1.3) saturate(1.8) brightness(1.05)',
    svg: null,
  },
  {
    id: 'frost',
    label: 'Frost',
    css: 'grayscale(0.3) contrast(1.05) brightness(1.15) saturate(0.6)',
    svg: null,
  },
];

export default function CartoonModePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number>(0);

  const [activeFilter, setActiveFilter] = useState('studio');
  const [cameraOn, setCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const filter = FILTERS.find((f) => f.id === activeFilter) ?? FILTERS[0];

  const computedFilter = `${filter.css} brightness(${brightness / 100}) contrast(${contrast / 100}) saturate(${saturation / 100})`;

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
      audio: true,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setCameraOn(true);
    }
  };

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(drawFrame);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    ctx.filter = computedFilter;
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    rafRef.current = requestAnimationFrame(drawFrame);
  }, [computedFilter]);

  useEffect(() => {
    if (cameraOn) rafRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cameraOn, drawFrame]);

  const handleRecord = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isRecording) {
      chunksRef.current = [];
      const stream = canvas.captureStream(30);
      // Mix in audio from camera
      const videoStream = videoRef.current?.srcObject as MediaStream;
      videoStream?.getAudioTracks().forEach((t) => stream.addTrack(t));
      const mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoUrl(URL.createObjectURL(blob));
      };
      mr.start();
      recorderRef.current = mr;
      setIsRecording(true);
    } else {
      recorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-8 font-sans">
      <header className="mb-8">
        <p className="text-[11px] tracking-[3px] text-orange-500 uppercase mb-2">Feature 04</p>
        <h1 className="text-4xl font-bold tracking-tight">Live Filter Mode</h1>
        <p className="text-gray-500 text-sm mt-2">
          Professional real-time colour grading on your camera feed. Record with the filter baked in.
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
        {/* Camera preview */}
        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            {!cameraOn ? (
              <button
                onClick={startCamera}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-sm font-semibold rounded-lg transition-colors"
              >
                Enable Camera
              </button>
            ) : (
              <button
                onClick={handleRecord}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${
                  isRecording ? 'bg-red-700 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Record'}
              </button>
            )}
            {isRecording && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-400 font-mono tracking-widest">REC</span>
              </div>
            )}
          </div>

          <div className="relative rounded-xl overflow-hidden border border-[#222] bg-black aspect-video">
            {cameraOn ? (
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-sm tracking-widest uppercase">
                Camera offline
              </div>
            )}
            {/* Filter label overlay */}
            {cameraOn && (
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 border border-[#333] rounded text-[10px] tracking-[2px] uppercase text-gray-400">
                {filter.label}
              </div>
            )}
          </div>
          <video ref={videoRef} className="hidden" muted playsInline />

          {videoUrl && (
            <a
              href={videoUrl}
              download="glimr-filter.webm"
              className="block w-full text-center py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-sm font-bold transition-colors"
            >
              Download Recording
            </a>
          )}
        </div>

        {/* Filter controls */}
        <div className="space-y-4">
          <div className="bg-[#141414] rounded-xl border border-[#222] p-5">
            <p className="text-[10px] tracking-[2px] text-gray-600 uppercase mb-3">Preset</p>
            <div className="grid grid-cols-2 gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    activeFilter === f.id
                      ? 'border-orange-600 text-orange-400 bg-orange-950/20'
                      : 'border-[#2a2a2a] text-gray-500 hover:border-[#444]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#141414] rounded-xl border border-[#222] p-5 space-y-4">
            <p className="text-[10px] tracking-[2px] text-gray-600 uppercase">Fine Tune</p>
            {[
              { label: 'Brightness', value: brightness, set: setBrightness, min: 60, max: 160 },
              { label: 'Contrast', value: contrast, set: setContrast, min: 60, max: 180 },
              { label: 'Saturation', value: saturation, set: setSaturation, min: 0, max: 200 },
            ].map(({ label, value, set, min, max }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-mono text-orange-400">{value}%</span>
                </div>
                <input
                  type="range" min={min} max={max} value={value}
                  onChange={(e) => set(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
            ))}
            <button
              onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); }}
              className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 border border-[#222] rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

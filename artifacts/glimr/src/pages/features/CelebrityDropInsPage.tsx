import React, { useState, useRef, useEffect, useCallback } from 'react';

const AVATARS = [
  { id: 1, src: '/drop-ins/avatar-01.png', label: 'Editorial' },
  { id: 2, src: '/drop-ins/avatar-02.png', label: 'Cinematic' },
  { id: 3, src: '/drop-ins/avatar-03.png', label: 'Natural' },
  { id: 4, src: '/drop-ins/avatar-04.png', label: 'Executive' },
  { id: 5, src: '/drop-ins/avatar-05.png', label: 'Cyber' },
  { id: 6, src: '/drop-ins/avatar-06.png', label: 'Metallic' },
  { id: 7, src: '/drop-ins/avatar-07.png', label: 'Luxe' },
  { id: 8, src: '/drop-ins/avatar-08.png', label: 'Sculptural' },
];

interface Overlay {
  id: number;
  src: string;
  label: string;
  x: number;
  y: number;
  size: number;
}

export default function CelebrityDropInsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [dragging, setDragging] = useState<{ id: number; ox: number; oy: number } | null>(null);
  const imgCache = useRef<Record<string, HTMLImageElement>>({});
  const rafRef = useRef<number>(0);

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((res) => {
      if (imgCache.current[src]) return res(imgCache.current[src]);
      const img = new Image();
      img.src = src;
      img.onload = () => { imgCache.current[src] = img; res(img); };
    });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch {}
  };

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (cameraActive && video && video.readyState >= 2) {
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = '14px "Helvetica Neue", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Enable camera or drop an avatar below', canvas.width / 2, canvas.height / 2);
      ctx.textAlign = 'left';
    }

    for (const ov of overlays) {
      const img = await loadImage(ov.src);
      const h = (img.naturalHeight / img.naturalWidth) * ov.size;
      ctx.save();
      if (ov.id === selected) {
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 16;
      }
      ctx.drawImage(img, ov.x, ov.y, ov.size, h);
      if (ov.id === selected) {
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.strokeRect(ov.x, ov.y, ov.size, h);
      }
      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [overlays, selected, cameraActive]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  const addOverlay = (av: typeof AVATARS[0]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newOv: Overlay = { id: Date.now(), src: av.src, label: av.label, x: 40, y: 40, size: 180 };
    setOverlays((prev) => [...prev, newOv]);
    setSelected(newOv.id);
  };

  const getCanvasPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e);
    for (let i = overlays.length - 1; i >= 0; i--) {
      const ov = overlays[i];
      const img = imgCache.current[ov.src];
      const h = img ? (img.naturalHeight / img.naturalWidth) * ov.size : ov.size;
      if (pos.x >= ov.x && pos.x <= ov.x + ov.size && pos.y >= ov.y && pos.y <= ov.y + h) {
        setSelected(ov.id);
        setDragging({ id: ov.id, ox: pos.x - ov.x, oy: pos.y - ov.y });
        return;
      }
    }
    setSelected(null);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const pos = getCanvasPos(e);
    setOverlays((prev) =>
      prev.map((ov) =>
        ov.id === dragging.id ? { ...ov, x: pos.x - dragging.ox, y: pos.y - dragging.oy } : ov
      )
    );
  };

  const onMouseUp = () => setDragging(null);

  const resizeSelected = (delta: number) => {
    setOverlays((prev) =>
      prev.map((ov) => (ov.id === selected ? { ...ov, size: Math.max(60, ov.size + delta) } : ov))
    );
  };

  const removeSelected = () => {
    setOverlays((prev) => prev.filter((ov) => ov.id !== selected));
    setSelected(null);
  };

  const downloadComposite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'glimr-drop-in.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-8 font-sans">
      <header className="mb-8">
        <p className="text-[11px] tracking-[3px] text-orange-500 uppercase mb-2">Feature 03</p>
        <h1 className="text-4xl font-bold tracking-tight">Celebrity Drop-Ins</h1>
        <p className="text-gray-500 text-sm mt-2">
          Drop a portrait into your booth frame. Drag to position, resize, download.
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
        {/* Canvas */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={startCamera}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${cameraActive ? 'border-green-700 text-green-400 bg-green-950' : 'border-[#2a2a2a] text-gray-400 hover:border-gray-600'}`}
            >
              {cameraActive ? 'Camera Active' : 'Enable Camera'}
            </button>
            {selected && (
              <>
                <button onClick={() => resizeSelected(20)} className="px-3 py-2 text-xs border border-[#2a2a2a] rounded-lg text-gray-400 hover:border-gray-600">
                  Larger
                </button>
                <button onClick={() => resizeSelected(-20)} className="px-3 py-2 text-xs border border-[#2a2a2a] rounded-lg text-gray-400 hover:border-gray-600">
                  Smaller
                </button>
                <button onClick={removeSelected} className="px-3 py-2 text-xs border border-red-900 rounded-lg text-red-400 hover:bg-red-950">
                  Remove
                </button>
              </>
            )}
            <button
              onClick={downloadComposite}
              className="ml-auto px-4 py-2 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-500 transition-colors"
            >
              Download
            </button>
          </div>

          <div ref={containerRef} className="rounded-xl overflow-hidden border border-[#222]">
            <canvas
              ref={canvasRef}
              width={900}
              height={600}
              className="w-full h-auto cursor-crosshair"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
          </div>
          <video ref={videoRef} className="hidden" muted playsInline />
        </div>

        {/* Avatar grid */}
        <div className="space-y-3">
          <p className="text-[11px] tracking-[2px] text-gray-500 uppercase">Portraits — click to add</p>
          <div className="grid grid-cols-2 gap-3">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                onClick={() => addOverlay(av)}
                className="group relative rounded-xl overflow-hidden border border-[#222] hover:border-orange-600 transition-colors aspect-[3/4]"
              >
                <img
                  src={av.src}
                  alt={av.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent py-2 px-2">
                  <span className="text-[10px] tracking-widest uppercase text-gray-300">{av.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

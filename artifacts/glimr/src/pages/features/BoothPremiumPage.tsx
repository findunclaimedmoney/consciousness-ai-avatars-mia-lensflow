import React, { useRef, useState, useCallback, useEffect } from 'react';
import QRCode from 'qrcode';

const THEMES = [
  { id: 'noir',    label: 'Noir',    bg: '#0a0a0a', strip: '#111',   border: '#2a2a2a', text: '#ffffff', accent: '#888' },
  { id: 'gold',    label: 'Gold',    bg: '#0d0900', strip: '#120f00',border: '#92400e', text: '#fef3c7', accent: '#d97706' },
  { id: 'ice',     label: 'Ice',     bg: '#040810', strip: '#080f1a',border: '#1e3a5f', text: '#e0f2fe', accent: '#38bdf8' },
  { id: 'rose',    label: 'Rose',    bg: '#0d0507', strip: '#130809',border: '#881337', text: '#ffe4e6', accent: '#f43f5e' },
];

const FRAMES = 4;

export default function BoothPremiumPage() {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);
  const stripRef   = useRef<HTMLCanvasElement>(null);
  const qrRef      = useRef<HTMLCanvasElement>(null);

  const [theme, setTheme] = useState(THEMES[0]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [qrUrl, setQrUrl] = useState('https://glimr.com.au');
  const [stripReady, setStripReady] = useState(false);
  const rafRef = useRef<number>(0);

  const drawPreview = useCallback(() => {
    const canvas = captureRef.current;
    const video  = videoRef.current;
    if (!canvas || !video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(drawPreview);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    rafRef.current = requestAnimationFrame(drawPreview);
  }, []);

  useEffect(() => {
    if (cameraOn) rafRef.current = requestAnimationFrame(drawPreview);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cameraOn, drawPreview]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
      audio: false,
    });
    if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); setCameraOn(true); }
  };

  const capturePhoto = (): string => {
    const canvas = captureRef.current;
    if (!canvas) return '';
    const out = document.createElement('canvas');
    out.width  = canvas.width;
    out.height = canvas.height;
    out.getContext('2d')!.drawImage(canvas, 0, 0);
    return out.toDataURL('image/jpeg', 0.95);
  };

  const runSequence = async () => {
    if (!cameraOn) await startCamera();
    const taken: string[] = [];
    for (let i = 0; i < FRAMES; i++) {
      for (let c = 3; c >= 1; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(0);
      await new Promise(r => setTimeout(r, 120));
      taken.push(capturePhoto());
      setPhotos([...taken]);
      setCountdown(null);
      if (i < FRAMES - 1) await new Promise(r => setTimeout(r, 800));
    }
    setStripReady(false);
  };

  const buildStrip = useCallback(async () => {
    if (photos.length < FRAMES) return;
    const canvas = stripRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 600, PH = 450, PAD = 20, HEADER = 70, FOOTER = 90;
    const H = HEADER + FRAMES * (PH + PAD) + PAD + FOOTER;
    canvas.width = W; canvas.height = H;

    // Background
    ctx.fillStyle = theme.strip;
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, W - 16, H - 16);

    // Header label
    ctx.fillStyle = theme.accent;
    ctx.font = `bold 13px "Helvetica Neue", sans-serif`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4px';
    ctx.fillText((customLabel || 'GLIMR BOOTH STRIP').toUpperCase(), W / 2, HEADER / 2 + 5);

    // Photos
    for (let i = 0; i < photos.length; i++) {
      const img = await new Promise<HTMLImageElement>((res) => {
        const im = new Image(); im.src = photos[i]; im.onload = () => res(im);
      });
      const y = HEADER + i * (PH + PAD) + PAD;
      // Photo frame
      ctx.fillStyle = theme.border;
      ctx.fillRect(PAD - 4, y - 4, W - PAD * 2 + 8, PH + 8);
      ctx.drawImage(img, PAD, y, W - PAD * 2, PH);
      // Frame number
      ctx.fillStyle = theme.accent + '99';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.letterSpacing = '0px';
      ctx.fillText(`0${i + 1}`, W - PAD - 4, y + PH - 6);
    }

    // Footer
    const footerY = HEADER + FRAMES * (PH + PAD) + PAD;
    ctx.strokeStyle = theme.accent + '44';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(PAD, footerY); ctx.lineTo(W - PAD, footerY); ctx.stroke();

    // QR code
    const qrDataUrl = await QRCode.toDataURL(qrUrl || 'https://glimr.com.au', {
      width: 64, margin: 1,
      color: { dark: theme.text, light: '#00000000' },
    });
    const qrImg = await new Promise<HTMLImageElement>((res) => {
      const im = new Image(); im.src = qrDataUrl; im.onload = () => res(im);
    });
    ctx.drawImage(qrImg, PAD, footerY + 14, 58, 58);

    // Footer text
    ctx.textAlign = 'right';
    ctx.fillStyle = theme.text + 'aa';
    ctx.font = 'bold 12px "Helvetica Neue", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('GLIMR.COM.AU', W - PAD, footerY + 36);
    ctx.font = '10px monospace';
    ctx.fillStyle = theme.accent + '66';
    ctx.fillText(new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase(), W - PAD, footerY + 54);

    setStripReady(true);
  }, [photos, theme, customLabel, qrUrl]);

  useEffect(() => { if (photos.length === FRAMES) buildStrip(); }, [photos, buildStrip]);

  const downloadStrip = () => {
    const canvas = stripRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'glimr-booth-premium.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-8 font-sans">
      <header className="mb-8">
        <p className="text-[11px] tracking-[3px] text-orange-500 uppercase mb-2">Feature 06</p>
        <h1 className="text-4xl font-bold tracking-tight">Booth Premium</h1>
        <p className="text-gray-500 text-sm mt-2">
          4-frame photo strip with custom theme, branded footer, and QR code. Download as a high-res PNG.
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        {/* Left — camera + capture */}
        <div className="space-y-4">
          {/* Camera preview */}
          <div className="relative bg-black rounded-xl overflow-hidden border border-[#222] aspect-video">
            {cameraOn ? (
              <canvas ref={captureRef} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={startCamera} className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-sm font-semibold rounded-xl transition-colors">
                  Enable Camera
                </button>
              </div>
            )}
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-[120px] font-black text-white/90 leading-none">{countdown}</span>
              </div>
            )}
            {countdown === 0 && (
              <div className="absolute inset-0 bg-white/40 pointer-events-none" />
            )}
            <video ref={videoRef} className="hidden" muted playsInline />
          </div>

          {/* Captured frames preview */}
          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.map((p, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-[#222] aspect-video">
                  <img src={p} alt={`Frame ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {Array.from({ length: FRAMES - photos.length }).map((_, i) => (
                <div key={`empty-${i}`} className="rounded-lg border border-dashed border-[#2a2a2a] aspect-video flex items-center justify-center">
                  <span className="text-xs text-gray-700">{photos.length + i + 1}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={runSequence}
              disabled={countdown !== null}
              className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors"
            >
              {photos.length === FRAMES ? 'Retake Strip' : `Take ${FRAMES} Photos`}
            </button>
            {stripReady && (
              <button
                onClick={downloadStrip}
                className="flex-1 py-3 rounded-xl border border-orange-600 text-orange-400 hover:bg-orange-950/30 font-bold transition-colors"
              >
                Download Strip
              </button>
            )}
          </div>
        </div>

        {/* Right — settings + strip preview */}
        <div className="space-y-4">
          {/* Theme */}
          <div className="bg-[#141414] rounded-xl border border-[#222] p-5">
            <p className="text-[10px] tracking-[2px] text-gray-600 uppercase mb-3">Theme</p>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t)}
                  style={{ background: t.strip, borderColor: theme.id === t.id ? t.accent : '#2a2a2a', color: t.accent }}
                  className="py-2.5 rounded-lg text-xs font-semibold border transition-all tracking-widest"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Label + QR */}
          <div className="bg-[#141414] rounded-xl border border-[#222] p-5 space-y-3">
            <p className="text-[10px] tracking-[2px] text-gray-600 uppercase">Branding</p>
            <label className="block">
              <span className="text-xs text-gray-500">Strip Label</span>
              <input
                className="mt-1 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-orange-600 transition-colors"
                placeholder="GLIMR BOOTH STRIP"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500">QR Code URL</span>
              <input
                className="mt-1 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-orange-600 transition-colors"
                placeholder="https://glimr.com.au"
                value={qrUrl}
                onChange={(e) => setQrUrl(e.target.value)}
              />
            </label>
          </div>

          {/* Strip preview */}
          {stripReady && (
            <div className="space-y-2">
              <p className="text-[10px] tracking-[2px] text-gray-600 uppercase">Strip Preview</p>
              <div className="rounded-xl overflow-hidden border border-[#222] shadow-2xl">
                <canvas ref={stripRef} className="w-full h-auto" />
              </div>
            </div>
          )}
          {!stripReady && <canvas ref={stripRef} className="hidden" />}
          <canvas ref={qrRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}

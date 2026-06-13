import React, { useState, useRef, useEffect } from 'react';

const CARD_STYLES = [
  { label: 'Golden', bg: '#120f00', accent: '#d97706', text: '#fef3c7', sub: '#92400e' },
  { label: 'Midnight', bg: '#06060f', accent: '#6366f1', text: '#e0e7ff', sub: '#312e81' },
  { label: 'Mono', bg: '#0a0a0a', accent: '#e5e5e5', text: '#ffffff', sub: '#404040' },
];

export default function MagicRecapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [styleIdx, setStyleIdx] = useState(0);

  const style = CARD_STYLES[styleIdx];

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 900;
    canvas.height = 500;

    ctx.fillStyle = style.bg;
    ctx.fillRect(0, 0, 900, 500);

    // Left accent bar
    ctx.fillStyle = style.accent;
    ctx.fillRect(0, 0, 4, 500);

    // Top label
    ctx.fillStyle = style.accent;
    ctx.font = '600 11px "Helvetica Neue", Arial, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('GLIMR MEMORY CARD', 48, 52);

    // Thin rule
    ctx.strokeStyle = style.sub;
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(48, 64); ctx.lineTo(852, 64); ctx.stroke();

    // Name
    ctx.fillStyle = style.text;
    ctx.font = `bold 44px Georgia, serif`;
    ctx.letterSpacing = '-1px';
    ctx.fillText(name || 'Untitled Memory', 48, 130);

    // Message — word wrap
    ctx.font = '20px Georgia, serif';
    ctx.fillStyle = style.text + 'bb';
    ctx.letterSpacing = '0px';
    const words = (message || 'Your memory will appear here.').split(' ');
    let line = '';
    let y = 180;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > 780 && line) {
        ctx.fillText(line.trim(), 48, y);
        line = word + ' ';
        y += 34;
        if (y > 390) { ctx.fillText('...', 48, y); break; }
      } else {
        line = test;
      }
    }
    if (y <= 390) ctx.fillText(line.trim(), 48, y);

    // Bottom rule
    ctx.strokeStyle = style.sub;
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(48, 440); ctx.lineTo(852, 440); ctx.stroke();

    // Date
    const d = new Date(date + 'T12:00:00').toLocaleDateString('en-AU', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    ctx.font = '12px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = style.accent + 'aa';
    ctx.letterSpacing = '1px';
    ctx.fillText(d.toUpperCase(), 48, 468);
    ctx.fillText('GLIMR.COM.AU', 760, 468);
  };

  useEffect(() => { drawCard(); }, [name, message, date, styleIdx]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `glimr-recap-${(name || 'memory').replace(/\s+/g, '-').toLowerCase()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-8 font-sans">
      <header className="mb-10">
        <p className="text-[11px] tracking-[3px] text-orange-500 uppercase mb-2">Feature 01</p>
        <h1 className="text-4xl font-bold tracking-tight">Magic Recap</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-md">
          Auto-generate a shareable memory card. Add a name, message, and date — download as a print-ready PNG.
        </p>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-[#141414] rounded-xl border border-[#222] p-5 space-y-4">
            <label className="block">
              <span className="text-[11px] tracking-[2px] text-gray-500 uppercase">Name / Title</span>
              <input
                className="mt-1.5 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-orange-600 transition-colors"
                placeholder="Sarah's 30th Birthday"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[11px] tracking-[2px] text-gray-500 uppercase">Memory / Message</span>
              <textarea
                className="mt-1.5 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-orange-600 transition-colors resize-none h-32"
                placeholder="Write the memory or caption for this Glimr..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[11px] tracking-[2px] text-gray-500 uppercase">Date</span>
              <input
                type="date"
                className="mt-1.5 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-orange-600 transition-colors"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>

          <div className="bg-[#141414] rounded-xl border border-[#222] p-5">
            <p className="text-[11px] tracking-[2px] text-gray-500 uppercase mb-3">Card Style</p>
            <div className="flex gap-2">
              {CARD_STYLES.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setStyleIdx(i)}
                  style={{ background: s.bg, borderColor: styleIdx === i ? s.accent : '#2a2a2a', color: s.accent }}
                  className="flex-1 py-2.5 rounded-lg text-xs font-semibold border tracking-widest uppercase transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-colors tracking-wide"
          >
            Download Card
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] tracking-[2px] text-gray-500 uppercase">Live Preview</p>
          <div className="rounded-xl overflow-hidden border border-[#222] shadow-2xl">
            <canvas ref={canvasRef} className="w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

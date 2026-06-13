import React from 'react';
import { Link } from 'wouter';

interface Feature {
  release: string;
  category: string;
  title: string;
  description: string;
  href: string;
  built: boolean;
}

const FEATURES: Feature[] = [
  {
    release: 'LIVE',
    category: 'AI SUBTITLES + MEMORY CARDS',
    title: 'Magic Recap',
    description: 'Every Glimr you send auto-generates a beautiful text recap and shareable memory card — so the feeling lands even with the sound off.',
    href: '/features/magic-recap',
    built: true,
  },
  {
    release: 'LIVE',
    category: 'OPEN AT THE RIGHT MOMENT',
    title: 'Birthday Time-Lock',
    description: "Set your Glimr to unlock at midnight on their birthday. No peeking. The moment they wake up, your face is the first thing they see.",
    href: '/features/time-lock',
    built: true,
  },
  {
    release: 'LIVE',
    category: 'PORTRAIT DROP-INS FOR YOUR BOOTH',
    title: 'Celebrity Drop-Ins',
    description: 'Drop a licensed portrait or 3D avatar into your Booth frame. Drag, resize, composite, and download the final shot.',
    href: '/features/drop-ins',
    built: true,
  },
  {
    release: 'LIVE',
    category: 'REAL-TIME COLOUR GRADING',
    title: 'Live Filter Mode',
    description: 'Professional colour grade presets applied live to your camera feed. Record with the filter baked directly into the video.',
    href: '/features/filter-mode',
    built: true,
  },
  {
    release: 'LIVE',
    category: 'LAND IN THEIR INBOX, BEAUTIFULLY',
    title: 'SMS + iMessage Delivery',
    description: "Preview exactly how your Glimr link lands in the recipient's messages app — rich preview card, sender name, caption.",
    href: '/features/sms-delivery',
    built: true,
  },
  {
    release: 'LIVE',
    category: '4K STRIPS · BRANDED · DOWNLOADABLE',
    title: 'Booth Premium',
    description: '4-frame photo strip with custom theme, QR code footer, branded label, and high-res PNG download.',
    href: '/features/booth-premium',
    built: true,
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Link href={feature.href}>
      <div className="group bg-[#1c1a17] border border-[#2e2b25] rounded-2xl p-6 flex flex-col gap-4 hover:border-orange-600/50 hover:bg-[#1f1d19] transition-all cursor-pointer h-full">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold tracking-widest uppercase px-2 py-1 rounded ${
            feature.built
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'text-[#5a5548]'
          }`}>
            {feature.release}
          </span>
          <span className="text-[11px] text-[#3a3530] group-hover:text-[#5a5548] transition-colors font-mono">
            Open →
          </span>
        </div>

        <p className="text-[10px] uppercase tracking-widest font-semibold text-[#5a5040]">
          {feature.category}
        </p>

        <h2 className="text-white text-2xl font-bold leading-tight tracking-tight">{feature.title}</h2>

        <p className="text-[#7a7060] text-sm leading-relaxed flex-1">{feature.description}</p>

        <div className={`w-full py-2.5 rounded-xl text-center text-xs font-bold tracking-wide transition-colors ${
          feature.built
            ? 'bg-orange-600 group-hover:bg-orange-500 text-white'
            : 'bg-[#1a1814] text-[#3a3530] border border-[#2a2820]'
        }`}>
          {feature.built ? 'Open Feature' : 'Coming Soon'}
        </div>
      </div>
    </Link>
  );
}

export default function SoonPage() {
  const builtCount = FEATURES.filter((f) => f.built).length;

  return (
    <div className="min-h-screen bg-[#111009] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="mb-12 text-center">
          <p className="text-orange-500 text-[11px] font-bold tracking-[4px] uppercase mb-3">
            Glimr Features
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Built for Christmas
          </h1>
          <p className="text-[#7a7060] text-base max-w-lg mx-auto mb-6">
            All {builtCount} features are live and ready to test. Click any card to open it.
          </p>
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-xs text-orange-400 font-semibold">{builtCount} of {FEATURES.length} features live</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        <footer className="mt-16 text-center text-[#3a3530] text-xs">
          Glimr · Built for the moments that matter
        </footer>
      </div>
    </div>
  );
}

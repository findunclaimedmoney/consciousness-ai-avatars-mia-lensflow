import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video/hooks';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = { 
  intro: 6000, 
  hardWay: 10000, 
  smartWay: 8000, 
  features: 10000, 
  outro: 10000 
};

const bgPositions = [
  { background: 'radial-gradient(circle at 50% 50%, rgba(6,24,38,1) 0%, rgba(0,0,0,1) 100%)' },
  { background: 'radial-gradient(circle at 80% 20%, rgba(11,42,61,1) 0%, rgba(6,24,38,1) 100%)' },
  { background: 'radial-gradient(circle at 20% 80%, rgba(0,193,213,0.15) 0%, rgba(6,24,38,1) 100%)' },
  { background: 'radial-gradient(circle at 50% 50%, rgba(0,193,213,0.1) 0%, rgba(6,24,38,1) 100%)' },
  { background: 'radial-gradient(circle at 50% 100%, rgba(245,185,66,0.15) 0%, rgba(6,24,38,1) 100%)' }
];

const NARRATION = [
  "Did you know Australians have over 2.6 billion dollars in unclaimed money? Banks, the ATO, and ASIC are holding it right now — and some of it could be yours.",
  "The hard way: manually scroll through hundreds of pages on MoneySmart. Then search the ATO. Then every state register. Hours of work — and most people give up before they find anything.",
  "Or try the Mia way. Submit your name and details — Mia automatically searches every Australian database for you. And it's completely free to start.",
  "Mia scans MoneySmart, the ATO, all 8 state registers, Computershare, Fair Work, and more. If she finds money in your name, you only pay a small percentage. No find, no fee.",
  "Visit MissingCash dot com dot au. Search your name for free right now. Your missing cash is waiting — let Mia find it for you.",
];

async function fetchAudio(text: string): Promise<HTMLAudioElement | null> {
  try {
    const res = await fetch('/api/mia/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.preload = 'auto';
    return audio;
  } catch {
    return null;
  }
}

export default function VideoTemplate() {
  const [audioReady, setAudioReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const audioRef = useRef<(HTMLAudioElement | null)[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const clips: (HTMLAudioElement | null)[] = [];
      for (let i = 0; i < NARRATION.length; i++) {
        if (cancelled) return;
        const audio = await fetchAudio(NARRATION[i]!);
        clips.push(audio);
        setLoadingProgress(Math.round(((i + 1) / NARRATION.length) * 100));
      }
      if (!cancelled) {
        audioRef.current = clips;
        setAudioReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { currentScene } = useVideoPlayer({ durations: audioReady ? SCENE_DURATIONS : {} });

  useEffect(() => {
    if (!audioReady) return;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    const clip = audioRef.current[currentScene];
    if (clip) {
      clip.currentTime = 0;
      clip.play().catch(() => {});
      currentAudioRef.current = clip;
    }
  }, [currentScene, audioReady]);

  if (!audioReady) {
    return (
      <div className="w-full h-screen bg-[#061826] flex flex-col items-center justify-center text-white">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-[#00C1D5]/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-[#00C1D5]/40 animate-pulse" />
          <div className="relative rounded-full bg-[#00C1D5]/10 border-2 border-[#00C1D5] w-16 h-16 flex items-center justify-center mx-auto mt-1">
            <span className="text-[#00C1D5] text-xl font-bold">♪</span>
          </div>
        </div>
        <p className="text-white font-heading tracking-widest text-xl mb-3">LOADING MIA'S VOICE</p>
        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#00C1D5] rounded-full"
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-white/40 text-sm mt-3">{loadingProgress}%</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#061826] text-white">
      <motion.div 
        className="absolute inset-0 z-0"
        animate={bgPositions[currentScene]}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute rounded-full mix-blend-screen filter blur-[80px]"
        animate={{
          x: ['-20vw', '10vw', '60vw', '40vw', '50vw'][currentScene],
          y: ['-20vh', '40vh', '10vh', '60vh', '50vh'][currentScene],
          width: ['60vw', '70vw', '50vw', '80vw', '40vw'][currentScene],
          height: ['60vw', '70vw', '50vw', '80vw', '40vw'][currentScene],
          backgroundColor: currentScene >= 2 ? 'rgba(0,193,213,0.15)' : 'rgba(245,185,66,0.08)',
        }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ transform: 'translate(-50%, -50%)' }}
      />

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="intro" />}
        {currentScene === 1 && <Scene2 key="hardWay" />}
        {currentScene === 2 && <Scene3 key="smartWay" />}
        {currentScene === 3 && <Scene4 key="features" />}
        {currentScene === 4 && <Scene5 key="outro" />}
      </AnimatePresence>
    </div>
  );
}

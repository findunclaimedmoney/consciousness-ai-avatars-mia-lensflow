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

// Background positions per scene
const bgPositions = [
  { background: 'radial-gradient(circle at 50% 50%, rgba(6,24,38,1) 0%, rgba(0,0,0,1) 100%)' },
  { background: 'radial-gradient(circle at 80% 20%, rgba(11,42,61,1) 0%, rgba(6,24,38,1) 100%)' },
  { background: 'radial-gradient(circle at 20% 80%, rgba(0,193,213,0.15) 0%, rgba(6,24,38,1) 100%)' },
  { background: 'radial-gradient(circle at 50% 50%, rgba(0,193,213,0.1) 0%, rgba(6,24,38,1) 100%)' },
  { background: 'radial-gradient(circle at 50% 100%, rgba(245,185,66,0.15) 0%, rgba(6,24,38,1) 100%)' }
];

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#061826] text-white">
      {/* Persistent Background Layer */}
      <motion.div 
        className="absolute inset-0 z-0"
        animate={bgPositions[currentScene]}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      
      {/* Drifting subtle particles */}
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

      {/* Persistent Shapes that move across scenes */}
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

      {/* Scene Content */}
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

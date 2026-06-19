import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = { intro: 5000, studio: 6000, moments: 6000, express: 6000, outro: 5000 };

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950 font-sans">
      {/* Background layer */}
      <div className="absolute inset-0">
        <motion.div className="absolute w-[80vw] h-[80vw] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #f43f5e, transparent)' }}
          animate={{ 
            x: ['-20%', '40%', '10%'], 
            y: ['10%', '60%', '20%'], 
            scale: [1, 1.2, 0.9],
            opacity: [0.1, 0.2, 0.15]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} 
        />
        <motion.div className="absolute w-[60vw] h-[60vw] rounded-full opacity-15 blur-[100px] right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
          animate={{ 
            x: ['20%', '-30%', '10%'], 
            y: ['-10%', '-40%', '-10%'],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} 
        />
      </div>

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="intro" />}
        {currentScene === 1 && <Scene2 key="studio" />}
        {currentScene === 2 && <Scene3 key="moments" />}
        {currentScene === 3 && <Scene4 key="express" />}
        {currentScene === 4 && <Scene5 key="outro" />}
      </AnimatePresence>
    </div>
  );
}

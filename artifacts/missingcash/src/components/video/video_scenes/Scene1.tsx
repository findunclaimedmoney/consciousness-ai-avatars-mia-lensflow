import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 5000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center relative">
        <motion.div
          className="absolute -inset-20 bg-gradient-to-r from-transparent via-[#f5b942]/10 to-transparent -rotate-45 blur-2xl"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
        />
        
        <motion.h1 
          className="text-[6vw] font-heading font-black tracking-tight text-white gold-glow"
          initial={{ y: 50, opacity: 0, rotateX: 30 }}
          animate={phase >= 1 ? { y: 0, opacity: 1, rotateX: 0 } : {}}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          style={{ perspective: 1000 }}
        >
          Unclaimed Money
        </motion.h1>

        <motion.h2 
          className="text-[3vw] font-sans font-light text-white/70 mt-4"
          initial={{ y: 30, opacity: 0 }}
          animate={phase >= 2 ? { y: 0, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          Two paths to find yours.
        </motion.h2>

        <motion.div
          className="mt-16 py-4 px-12 border border-[#ef4444]/30 bg-[#ef4444]/10 rounded-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={phase >= 3 ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <span className="text-[1.5vw] font-bold text-[#ef4444] uppercase tracking-widest">
            Path 1: The Hard Way
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

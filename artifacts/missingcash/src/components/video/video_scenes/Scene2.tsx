import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 6000),
      setTimeout(() => setPhase(5), 9000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-between px-[10vw] z-10"
      initial={{ opacity: 0, x: '10vw' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-10vw', filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-1/2">
        <motion.h2 
          className="text-[4vw] font-heading font-bold text-white leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Manual Search<br/>
          <span className="text-[#ef4444]">on MoneySmart</span>
        </motion.h2>

        <ul className="mt-12 space-y-8">
          {[
            "100+ pages of results to scroll through",
            "Takes hours, people give up after page 3",
            "Frustrating, exhausting, no guarantee"
          ].map((text, i) => (
            <motion.li 
              key={i}
              className="text-[1.8vw] text-white/80 flex items-center gap-6"
              initial={{ opacity: 0, x: -30 }}
              animate={phase >= i + 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <div className="w-4 h-4 bg-[#ef4444] rounded-sm rotate-45 flex-shrink-0" />
              {text}
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="w-[35vw] h-[60vh] relative perspective-1000">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-[#0b2a3d] to-transparent border border-white/10 rounded-xl overflow-hidden shadow-2xl"
          initial={{ rotateY: -20, opacity: 0, z: -100 }}
          animate={phase >= 1 ? { rotateY: -10, opacity: 1, z: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Mock scrolling list */}
          <motion.div 
            className="w-full flex flex-col gap-4 p-6"
            animate={{ y: [0, -1000] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-full h-16 bg-white/5 rounded flex items-center px-4 gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/2 h-3 bg-white/20 rounded" />
                  <div className="w-1/3 h-2 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Red gradient overlay for frustration */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-[#ef4444]/20 to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 2 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

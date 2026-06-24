import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 5000),
      setTimeout(() => setPhase(4), 9000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="flex flex-col items-center max-w-[70vw] text-center">
        
        {/* PDF Report Icon Animation */}
        <motion.div 
          className="relative w-32 h-40 bg-white rounded-lg shadow-[0_0_50px_rgba(255,255,255,0.2)] mb-12 flex flex-col p-4 border border-white/20"
          initial={{ y: 100, opacity: 0, rotateZ: -10 }}
          animate={phase >= 1 ? { y: 0, opacity: 1, rotateZ: 0 } : {}}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <div className="w-1/2 h-3 bg-[#f5b942] rounded mb-4" />
          <div className="w-full h-2 bg-gray-200 rounded mb-2" />
          <div className="w-5/6 h-2 bg-gray-200 rounded mb-2" />
          <div className="w-full h-2 bg-gray-200 rounded mb-2" />
          <div className="w-2/3 h-2 bg-gray-200 rounded mb-2" />
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-[#00C1D5] rounded-full flex items-center justify-center shadow-lg border-2 border-[#061826]">
            <svg className="w-6 h-6 text-[#061826]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>

        <motion.h2 
          className="text-[4vw] font-heading font-bold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Personalised PDF Report
        </motion.h2>

        <motion.p 
          className="text-[2vw] text-white/80 font-light mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Delivered in minutes. <span className="text-[#f5b942] font-semibold">Zero effort.</span>
        </motion.p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={phase >= 3 ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative"
        >
          <div className="absolute -inset-8 bg-[#f5b942]/20 blur-xl rounded-full" />
          <h3 className="text-[3vw] font-sans font-bold text-white tracking-wide relative z-10">
            MissingCash.com.au
          </h3>
        </motion.div>
      </div>
    </motion.div>
  );
}

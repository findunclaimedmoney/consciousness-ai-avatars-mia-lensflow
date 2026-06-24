import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
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

  const databases = ["ATO", "ASIC", "State Offices", "Share Registries", "Fair Work", "Rental Bonds", "Lotteries"];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-between px-[8vw] z-10"
      initial={{ opacity: 0, y: '10vh' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[45%]">
        <motion.div 
          className="text-[4vw] font-heading font-bold text-white leading-tight mb-8"
          initial={{ opacity: 0, x: -30 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Scans 100+ pages in <span className="text-[#00C1D5]">under a minute</span>
        </motion.div>

        <motion.p 
          className="text-[1.8vw] text-white/80"
          initial={{ opacity: 0, x: -30 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.6 }}
        >
          Searches 10+ databases simultaneously
        </motion.p>

        <div className="mt-8 flex flex-wrap gap-4">
          {databases.map((db, i) => (
            <motion.div
              key={db}
              className="px-6 py-3 bg-[#0d2e45] border border-[#00C1D5]/40 rounded-full text-[1.2vw] text-white shadow-[0_0_15px_rgba(0,193,213,0.1)]"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={phase >= 3 ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.1 }}
            >
              {db}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-[40%] h-[70vh] relative flex items-center justify-center">
        {/* Radar/Scan animation */}
        <motion.div
          className="absolute w-[35vw] h-[35vw] rounded-full border border-[#00C1D5]/20"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="absolute top-0 bottom-1/2 left-1/2 right-1/2 border-l-2 border-[#00C1D5] origin-bottom shadow-[0_0_20px_#00C1D5]"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00C1D5]/0 via-[#00C1D5]/20 to-[#00C1D5]/0"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Center node */}
        <motion.div 
          className="w-24 h-24 bg-[#00C1D5] rounded-full shadow-[0_0_40px_#00C1D5] z-10 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={phase >= 1 ? { scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
        >
          <span className="text-[#061826] font-bold text-[1.5vw]">MIA</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

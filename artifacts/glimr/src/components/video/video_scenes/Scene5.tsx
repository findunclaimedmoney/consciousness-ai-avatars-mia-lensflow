import { motion } from 'framer-motion';

export function Scene5() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)" }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="w-32 h-32 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 shadow-2xl flex items-center justify-center mb-10"
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", delay: 0.3 }}
      >
        <div className="w-16 h-16 rounded-full border-4 border-white/80" />
      </motion.div>
      
      <motion.h1 
        className="text-[7vw] font-black text-white tracking-tighter"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        Glimr Studio
      </motion.h1>
      
      <motion.p 
        className="text-[2.5vw] text-white/60 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        Send a Glimr.
      </motion.p>
    </motion.div>
  );
}

import { motion } from 'framer-motion';

export function Scene2() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, x: '100vw' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-100vw' }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="text-center mb-12">
        <motion.h2 
          className="text-[4vw] font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          The Studio
        </motion.h2>
        <motion.p 
          className="text-[1.5vw] text-rose-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Pro recording. Built-in Teleprompter.
        </motion.p>
      </div>
      
      <motion.div 
        className="w-[60vw] h-[35vw] rounded-3xl border border-white/10 bg-black/50 overflow-hidden relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="absolute top-8 w-full flex justify-center z-20">
          <motion.div 
            className="px-6 py-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/90 text-[1.2vw]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            "I just wanted to say how much you mean to me..."
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

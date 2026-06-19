import { motion } from 'framer-motion';

export function Scene3() {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
      transition={{ duration: 1 }}
    >
      <div className="flex flex-col items-center">
        <motion.h2 
          className="text-[5vw] font-black text-white mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Magical Moments
        </motion.h2>
        
        <div className="flex gap-8">
          <motion.div 
            className="w-[25vw] h-[35vw] rounded-2xl bg-gradient-to-b from-indigo-500/20 to-purple-900/40 border border-white/20 p-8 flex flex-col justify-end"
            initial={{ opacity: 0, y: 50, rotateX: 45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <h3 className="text-white text-[2vw] font-bold">Magic Recap</h3>
            <p className="text-white/60 text-[1.2vw]">Turn memories into cinematic cards.</p>
          </motion.div>
          
          <motion.div 
            className="w-[25vw] h-[35vw] rounded-2xl bg-gradient-to-b from-rose-500/20 to-orange-900/40 border border-white/20 p-8 flex flex-col justify-end"
            initial={{ opacity: 0, y: 50, rotateX: 45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.8, type: "spring" }}
          >
            <h3 className="text-white text-[2vw] font-bold">Time-Lock</h3>
            <p className="text-white/60 text-[1.2vw]">Deliver exactly on their birthday.</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

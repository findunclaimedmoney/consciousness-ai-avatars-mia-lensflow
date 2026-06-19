import { motion } from 'framer-motion';

export function Scene4() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2 
        className="text-[4vw] font-bold text-white mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Express Yourself
      </motion.h2>

      <div className="flex gap-6 items-center">
        {[
          { title: "Photo Booth", delay: 0.5, color: "from-blue-500" },
          { title: "Celebrity Drop-ins", delay: 0.7, color: "from-emerald-500" },
          { title: "Live Filters", delay: 0.9, color: "from-pink-500" }
        ].map((item, i) => (
          <motion.div 
            key={i}
            className={`w-[20vw] h-[20vw] rounded-full bg-gradient-to-br ${item.color} to-transparent border border-white/10 flex items-center justify-center p-6 text-center`}
            initial={{ opacity: 0, scale: 0, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: item.delay, type: "spring", stiffness: 100 }}
          >
            <span className="text-white text-[1.8vw] font-medium leading-tight">{item.title}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

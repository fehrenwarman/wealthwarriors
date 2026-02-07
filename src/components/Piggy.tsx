import { motion } from 'framer-motion';

interface PiggyProps {
  level: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

export function Piggy({ level, size = 'lg', animate = true }: PiggyProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const warriorEmojis = {
    1: '🛡️',
    2: '⚔️',
    3: '🏆',
    4: '👑',
  };

  const textSizes = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-7xl',
    xl: 'text-9xl',
  };

  return (
    <motion.div
      className={`relative flex items-center justify-center ${sizeClasses[size]}`}
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Background glow */}
      <motion.div
        className={`absolute inset-0 rounded-full ${
          level === 1 ? 'bg-slate-300' :
          level === 2 ? 'bg-blue-400' :
          level === 3 ? 'bg-amber-400' :
          'bg-gradient-to-br from-yellow-400 to-amber-500'
        }`}
        animate={animate ? {
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.7, 0.4],
        } : undefined}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main warrior icon */}
      <motion.div
        className={`relative z-10 ${textSizes[size]}`}
        animate={animate ? {
          y: [0, -5, 0],
          rotate: level === 4 ? [0, 5, -5, 0] : [0, 2, -2, 0],
        } : undefined}
        transition={{
          duration: level === 4 ? 1 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {warriorEmojis[level as keyof typeof warriorEmojis]}
      </motion.div>

      {/* Crown for level 4 */}
      {level === 4 && (
        <motion.div
          className="absolute -top-4 z-20 text-3xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          💎
        </motion.div>
      )}

      {/* Stars for level 3+ */}
      {level >= 3 && (
        <>
          <motion.div
            className="absolute -left-2 top-0 text-lg"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ⭐
          </motion.div>
          <motion.div
            className="absolute -right-2 top-0 text-lg"
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            ⭐
          </motion.div>
        </>
      )}

      {/* Coins for level 4 */}
      {level === 4 && (
        <>
          <motion.div
            className="absolute -left-4 bottom-0 text-xl"
            animate={{ y: [0, -5, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          >
            🪙
          </motion.div>
          <motion.div
            className="absolute -right-4 bottom-0 text-xl"
            animate={{ y: [0, -5, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          >
            🪙
          </motion.div>
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 -bottom-2 text-xl"
            animate={{ y: [0, -3, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          >
            🪙
          </motion.div>
        </>
      )}

      {/* Sparkles for level 2+ */}
      {level >= 2 && (
        <motion.div
          className="absolute -right-1 -top-1 text-sm"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ✨
        </motion.div>
      )}
    </motion.div>
  );
}

export function PiggyLevelUpAnimation({ newLevel }: { newLevel: number }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 text-center shadow-2xl"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Rank Up!</h2>
          <Piggy level={newLevel} size="xl" />
          <p className="mt-4 text-xl text-gray-700">
            You are now{' '}
            <span className="font-bold text-amber-600">
              {newLevel === 2 ? 'a Guardian!' :
               newLevel === 3 ? 'a Champion!' :
               'a Legend!'}
            </span>
          </p>
        </motion.div>
        <motion.div
          className="mt-6 flex justify-center gap-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.span
              key={i}
              animate={{
                y: [0, -20, 0],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            >
              ⚔️
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

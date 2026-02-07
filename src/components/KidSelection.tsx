import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Piggy } from './Piggy';

export function KidSelection() {
  const { state, switchMode, selectKid } = useApp();

  if (!state.family) return null;

  const handleSelectKid = (kidId: string) => {
    selectKid(kidId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Piggy level={4} size="sm" animate={false} />
            <div>
              <h1 className="text-2xl font-bold text-amber-400">Wealth Warriors</h1>
              <p className="text-sm text-slate-400">{state.family.name}</p>
            </div>
          </div>
          <motion.button
            onClick={() => switchMode('parent')}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold rounded-full shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Command Center
          </motion.button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.h2
          className="text-4xl font-bold text-center text-amber-400 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Choose Your Warrior
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {state.family.kids.map((kid, index) => (
            <motion.button
              key={kid.id}
              onClick={() => handleSelectKid(kid.id)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800 border border-slate-700 rounded-3xl shadow-xl p-6 text-center hover:shadow-2xl hover:border-amber-500/50 transition-all relative overflow-hidden group"
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Content */}
              <div className="relative z-10">
                {/* Avatar */}
                <motion.div
                  className="text-7xl mb-4"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {kid.avatar}
                </motion.div>

                {/* Name */}
                <h3 className="text-2xl font-bold text-white mb-2">{kid.name}</h3>

                {/* Piggy Level */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Piggy level={kid.piggyLevel} size="sm" animate={false} />
                </div>

                {/* Quick Balance */}
                <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 border border-emerald-500/30 rounded-xl py-2 px-4 inline-block">
                  <span className="text-emerald-400 font-bold">
                    ${(kid.buckets.save.balance + kid.buckets.spend.balance + kid.buckets.share.balance).toFixed(2)}
                  </span>
                </div>

                {/* Pending notification */}
                {kid.pendingAllocation && kid.pendingAllocation > 0 && (
                  <motion.div
                    className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 rounded-full px-3 py-1 font-bold text-sm shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    New! ${kid.pendingAllocation.toFixed(2)}
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {state.family.kids.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">⚔️</div>
            <p className="text-xl text-slate-400">No warriors enlisted yet!</p>
            <p className="text-slate-500">Visit the Command Center to add warriors</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}

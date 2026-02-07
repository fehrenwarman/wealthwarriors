import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Piggy } from './Piggy';
import { getPiggyLevelName, getNextLevelThreshold, getPreviousLevelThreshold } from '../types';

interface SaveBucketScreenProps {
  onBack: () => void;
}

export function SaveBucketScreen({ onBack }: SaveBucketScreenProps) {
  const { getSelectedKid } = useApp();
  const kid = getSelectedKid();

  if (!kid) return null;

  const { save } = kid.buckets;
  const nextThreshold = getNextLevelThreshold(kid.piggyLevel);
  const prevThreshold = getPreviousLevelThreshold(kid.piggyLevel);
  const progressToNext = kid.piggyLevel < 4
    ? ((save.balance - prevThreshold) / (nextThreshold - prevThreshold)) * 100
    : 100;

  const monthlyInterest = (save.balance * save.interestRate / 100 / 12);

  const saveTransactions = kid.transactions.filter(t => t.bucket === 'save');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
          <h1 className="text-lg font-semibold text-white">Save</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Warrior Display */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-6">
            <Piggy level={kid.piggyLevel} size="lg" />
            <div className="flex-1">
              <p className="text-slate-400 text-sm font-medium">Savings Balance</p>
              <p className="text-4xl font-bold text-white">${save.balance.toFixed(2)}</p>
              <p className="text-amber-400 font-medium mt-1">{getPiggyLevelName(kid.piggyLevel)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {kid.piggyLevel < 4 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Rank {kid.piggyLevel}</span>
                <span>Rank {kid.piggyLevel + 1} at ${nextThreshold}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, progressToNext))}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-sm text-slate-400 mt-2 text-center">
                Save <span className="font-semibold text-amber-400">${(nextThreshold - save.balance).toFixed(2)}</span> more to rank up
              </p>
            </div>
          )}

          {kid.piggyLevel === 4 && (
            <div className="mt-4 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-xl p-4 text-center">
              <span className="text-xl mr-2">👑</span>
              <span className="font-semibold text-amber-400">Maximum Rank Achieved!</span>
            </div>
          )}
        </motion.div>

        {/* Interest Info */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Interest</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Annual Rate (APR)</p>
              <p className="text-2xl font-bold text-amber-400">{save.interestRate}%</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Monthly Interest</p>
              <p className="text-2xl font-bold text-emerald-400">+${monthlyInterest.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-blue-300 text-sm">
              <span className="font-semibold">How it works:</span> Your money earns interest just for being saved. The more you save, the more you earn each month.
            </p>
          </div>
        </motion.div>

        {/* Warrior Ranks Guide */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Warrior Ranks</h3>

          <div className="space-y-2">
            {[
              { level: 1, name: 'Recruit', min: 0, max: 24.99 },
              { level: 2, name: 'Guardian', min: 25, max: 49.99 },
              { level: 3, name: 'Champion', min: 50, max: 99.99 },
              { level: 4, name: 'Legend', min: 100, max: null },
            ].map((tier) => (
              <div
                key={tier.level}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                  kid.piggyLevel === tier.level
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'bg-slate-900/50'
                }`}
              >
                <Piggy level={tier.level} size="sm" animate={kid.piggyLevel === tier.level} />
                <div className="flex-1">
                  <p className={`font-semibold ${kid.piggyLevel === tier.level ? 'text-amber-400' : 'text-slate-300'}`}>
                    {tier.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    ${tier.min} - {tier.max ? `$${tier.max}` : 'Unlimited'}
                  </p>
                </div>
                {kid.piggyLevel === tier.level && (
                  <span className="text-amber-400 text-sm font-medium">Current</span>
                )}
                {kid.piggyLevel > tier.level && (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">History</h3>

          {saveTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {saveTransactions.slice(0, 10).map((tx) => (
                <motion.div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div>
                    <p className="font-medium text-slate-300 text-sm">{tx.description}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-semibold text-sm ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}${tx.amount.toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

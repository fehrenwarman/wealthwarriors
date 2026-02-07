import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { CAUSES, SHARE_BADGES } from '../types';

interface ShareBucketScreenProps {
  onBack: () => void;
}

export function ShareBucketScreen({ onBack }: ShareBucketScreenProps) {
  const { getSelectedKid, donate } = useApp();
  const kid = getSelectedKid();
  const [selectedCause, setSelectedCause] = useState<typeof CAUSES[0] | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [newBadge, setNewBadge] = useState<typeof SHARE_BADGES[0] | null>(null);

  if (!kid) return null;

  const { share } = kid.buckets;

  const handleDonate = () => {
    if (!selectedCause || !donationAmount) return;
    const amount = parseFloat(donationAmount);
    if (amount <= 0 || amount > share.balance) return;

    const oldTotalGiven = share.totalGiven;
    donate(kid.id, amount, selectedCause.name);

    // Check for new badge
    const newTotalGiven = oldTotalGiven + amount;
    const earnedBadge = SHARE_BADGES.find(
      (b) => newTotalGiven >= b.threshold && oldTotalGiven < b.threshold
    );

    if (earnedBadge) {
      setNewBadge(earnedBadge);
    }

    setShowCelebration(true);
    setDonationAmount('');
    setSelectedCause(null);
    setTimeout(() => {
      setShowCelebration(false);
      setNewBadge(null);
    }, 3000);
  };

  const shareTransactions = kid.transactions.filter(t => t.bucket === 'share');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-rose-400 font-semibold hover:text-rose-300 transition-colors"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
          <h1 className="text-lg font-semibold text-white">Share</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Balance Card */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Available to Share</p>
              <p className="text-4xl font-bold text-white mt-1">${share.balance.toFixed(2)}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500/20 to-rose-600/20 border border-rose-500/30 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">❤️</span>
            </div>
          </div>

          <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl py-3 px-4 flex items-center justify-between">
            <span className="text-rose-400 font-medium">Total Donated</span>
            <span className="text-xl font-bold text-rose-400">${share.totalGiven.toFixed(2)}</span>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Achievements</h3>

          <div className="grid grid-cols-4 gap-3">
            {SHARE_BADGES.map((badge) => {
              const earned = kid.badges.some((b) => b.type === badge.type);

              return (
                <motion.div
                  key={badge.type}
                  className={`rounded-xl p-3 text-center ${
                    earned
                      ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/30'
                      : 'bg-slate-900/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`text-3xl ${!earned && 'grayscale opacity-40'}`}>
                    {badge.emoji}
                  </div>
                  <p className={`text-xs font-medium mt-1 ${earned ? 'text-amber-400' : 'text-slate-500'}`}>
                    {badge.name}
                  </p>
                  <p className={`text-xs ${earned ? 'text-amber-500' : 'text-slate-600'}`}>
                    ${badge.threshold}+
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Progress to next badge */}
          {share.totalGiven < 100 && (
            <div className="mt-4 bg-slate-900/50 rounded-xl p-4">
              {(() => {
                const nextBadge = SHARE_BADGES.find((b) => b.threshold > share.totalGiven);
                if (!nextBadge) return null;
                const prevThreshold = SHARE_BADGES.filter((b) => b.threshold <= share.totalGiven).pop()?.threshold || 0;
                const progress = ((share.totalGiven - prevThreshold) / (nextBadge.threshold - prevThreshold)) * 100;

                return (
                  <>
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>${prevThreshold}</span>
                      <span>{nextBadge.name}: ${nextBadge.threshold}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-slate-400 mt-2 text-center">
                      Give ${(nextBadge.threshold - share.totalGiven).toFixed(2)} more to earn {nextBadge.emoji}
                    </p>
                  </>
                );
              })()}
            </div>
          )}
        </motion.div>

        {/* Causes */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Choose a Cause</h3>

          <div className="grid grid-cols-3 gap-3">
            {CAUSES.map((cause) => (
              <motion.button
                key={cause.id}
                onClick={() => setSelectedCause(cause)}
                className={`rounded-xl p-4 text-center transition-all ${
                  selectedCause?.id === cause.id
                    ? 'bg-rose-500/10 border-2 border-rose-500/50 shadow-md'
                    : 'bg-slate-900/50 border-2 border-transparent hover:bg-slate-700'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-3xl mb-2">{cause.emoji}</div>
                <p className="font-medium text-slate-300 text-sm">{cause.name}</p>
              </motion.button>
            ))}
          </div>

          {/* Donation Input */}
          <AnimatePresence>
            {selectedCause && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5"
              >
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{selectedCause.emoji}</span>
                    <div>
                      <p className="font-semibold text-white">{selectedCause.name}</p>
                      <p className="text-sm text-slate-400">{selectedCause.description}</p>
                    </div>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">Donation amount</span>
                    <div className="relative mt-1.5">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="5.00"
                        min="0.01"
                        max={share.balance}
                        step="0.01"
                        className="block w-full pl-8 pr-4 py-3 border border-slate-600 bg-slate-900 text-white rounded-xl focus:border-rose-400 focus:ring focus:ring-rose-500/20 transition-all"
                      />
                    </div>
                  </label>

                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-3">
                    {[1, 2, 5].filter(amt => amt <= share.balance).map((amt) => (
                      <motion.button
                        key={amt}
                        onClick={() => setDonationAmount(amt.toString())}
                        className="flex-1 py-2 bg-slate-800 text-rose-400 font-medium rounded-lg border border-slate-600 hover:border-rose-400 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ${amt}
                      </motion.button>
                    ))}
                    {share.balance > 0 && (
                      <motion.button
                        onClick={() => setDonationAmount(share.balance.toFixed(2))}
                        className="flex-1 py-2 bg-slate-800 text-rose-400 font-medium rounded-lg border border-slate-600 hover:border-rose-400 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        All
                      </motion.button>
                    )}
                  </div>

                  <motion.button
                    onClick={handleDonate}
                    disabled={
                      !donationAmount ||
                      parseFloat(donationAmount) <= 0 ||
                      parseFloat(donationAmount) > share.balance
                    }
                    className="w-full mt-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>❤️</span>
                    Donate ${donationAmount || '0.00'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Donation History</h3>

          {shareTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No donations yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {shareTransactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-300 text-sm">{tx.description}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-semibold text-sm ${tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}${tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <span className="text-7xl">💖</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-white mt-4">
                Thank You!
              </h2>
              <p className="text-slate-300 mt-2">
                You made a difference today
              </p>

              {newBadge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="mt-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl p-4"
                >
                  <p className="text-amber-400 font-semibold">New Badge Earned!</p>
                  <div className="text-4xl mt-2">{newBadge.emoji}</div>
                  <p className="font-bold text-amber-400 mt-1">{newBadge.name}</p>
                </motion.div>
              )}

              <motion.button
                onClick={() => setShowCelebration(false)}
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Victory!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

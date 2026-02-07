import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Piggy } from './Piggy';
import { AllocationScreen } from './AllocationScreen';
import { SaveBucketScreen } from './SaveBucketScreen';
import { SpendBucketScreen } from './SpendBucketScreen';
import { ShareBucketScreen } from './ShareBucketScreen';
import { PinLock } from './PinLock';
import { getPiggyLevelName, getNextLevelThreshold, getPreviousLevelThreshold } from '../types';

type Screen = 'dashboard' | 'allocation' | 'save' | 'spend' | 'share';

export function KidDashboard() {
  const { getSelectedKid, selectKid, switchMode, state } = useApp();
  const kid = getSelectedKid();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showPinLock, setShowPinLock] = useState(false);

  if (!kid) {
    selectKid(null);
    return null;
  }

  // Check if there's pending allocation
  if (kid.pendingAllocation && kid.pendingAllocation > 0 && currentScreen === 'dashboard') {
    return (
      <AllocationScreen
        onComplete={() => {
          setCurrentScreen('dashboard');
        }}
      />
    );
  }

  const totalBalance = kid.buckets.save.balance + kid.buckets.spend.balance + kid.buckets.share.balance;
  const nextThreshold = getNextLevelThreshold(kid.piggyLevel);
  const prevThreshold = getPreviousLevelThreshold(kid.piggyLevel);
  const progressToNext = kid.piggyLevel < 4
    ? ((kid.buckets.save.balance - prevThreshold) / (nextThreshold - prevThreshold)) * 100
    : 100;

  const handleParentModeClick = () => {
    if (state.family?.settings?.parentPin) {
      setShowPinLock(true);
    } else {
      switchMode('parent');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'save':
        return <SaveBucketScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'spend':
        return <SpendBucketScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'share':
        return <ShareBucketScreen onBack={() => setCurrentScreen('dashboard')} />;
      default:
        return null;
    }
  };

  if (currentScreen !== 'dashboard') {
    return renderScreen();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            onClick={() => selectKid(null)}
            className="flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{kid.avatar}</span>
            <span className="font-semibold text-white">{kid.name}</span>
          </div>
          <motion.button
            onClick={handleParentModeClick}
            className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Command
          </motion.button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Hero Balance Card */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Total Balance</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent mt-1">
              ${totalBalance.toFixed(2)}
            </p>
          </div>

          {/* Warrior Progress - Compact */}
          <div className="mt-6 flex items-center gap-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4">
            <Piggy level={kid.piggyLevel} size="sm" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{getPiggyLevelName(kid.piggyLevel)}</span>
                {kid.piggyLevel < 4 && (
                  <span className="text-xs text-slate-400">
                    ${(nextThreshold - kid.buckets.save.balance).toFixed(2)} to next rank
                  </span>
                )}
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, progressToNext))}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bucket Cards - Modern Design */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Save Bucket */}
          <motion.button
            onClick={() => setCurrentScreen('save')}
            className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-5 text-left hover:shadow-xl hover:border-amber-500/50 transition-all group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">💰</span>
              </div>
              <svg className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Save</h3>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              ${kid.buckets.save.balance.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {kid.buckets.save.interestRate}% APR
            </p>
          </motion.button>

          {/* Spend Bucket */}
          <motion.button
            onClick={() => setCurrentScreen('spend')}
            className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-5 text-left hover:shadow-xl hover:border-blue-500/50 transition-all group relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎯</span>
              </div>
              <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Spend</h3>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              ${kid.buckets.spend.balance.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {kid.buckets.spend.goals.filter(g => !g.purchased).length} active goal{kid.buckets.spend.goals.filter(g => !g.purchased).length !== 1 ? 's' : ''}
            </p>
            {kid.buckets.spend.goals.some(g => kid.buckets.spend.balance >= g.targetAmount && !g.purchased) && (
              <motion.div
                className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs font-semibold shadow-md"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Ready!
              </motion.div>
            )}
          </motion.button>

          {/* Share Bucket */}
          <motion.button
            onClick={() => setCurrentScreen('share')}
            className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-5 text-left hover:shadow-xl hover:border-rose-500/50 transition-all group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500/20 to-rose-600/20 border border-rose-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">❤️</span>
              </div>
              <svg className="w-5 h-5 text-slate-600 group-hover:text-rose-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Share</h3>
            <p className="text-2xl font-bold text-rose-400 mt-1">
              ${kid.buckets.share.balance.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ${kid.buckets.share.totalGiven.toFixed(2)} donated
            </p>
          </motion.button>
        </div>

        {/* Badges Preview */}
        {kid.badges.length > 0 && (
          <motion.div
            className="mt-6 bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Achievements</h3>
            <div className="flex flex-wrap gap-3">
              {kid.badges.map((badge) => (
                <motion.div
                  key={badge.type}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-full px-4 py-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-xl">
                    {badge.type === 'first-share' ? '🥉' :
                     badge.type === 'generous-giver' ? '🥈' :
                     badge.type === 'super-sharer' ? '🥇' : '👑'}
                  </span>
                  <span className="text-sm font-medium text-amber-400">{badge.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* PIN Lock Modal */}
      <AnimatePresence>
        {showPinLock && (
          <PinLock
            onSuccess={() => {
              setShowPinLock(false);
              switchMode('parent');
            }}
            onCancel={() => setShowPinLock(false)}
          />
        )}
      </AnimatePresence>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowLevelUp(false)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Rank Up!</h2>
              <Piggy level={kid.piggyLevel} size="lg" />
              <p className="mt-4 text-slate-300">
                You are now a <span className="font-bold text-amber-400">{getPiggyLevelName(kid.piggyLevel)}</span>!
              </p>
              <motion.button
                onClick={() => setShowLevelUp(false)}
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

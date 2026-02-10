import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { AllocationScreen } from './AllocationScreen';
import { SaveBucketScreen } from './SaveBucketScreen';
import { SpendBucketScreen } from './SpendBucketScreen';
import { ShareBucketScreen } from './ShareBucketScreen';
import { PinLock } from './PinLock';
import {
  getWarriorRankInfo,
  getNextRankXP,
  getCurrentRankMinXP,
  getPetEmoji,
  getPetLevelName,
  PET_OPTIONS,
  AVATAR_OPTIONS
} from '../types';

type Screen = 'dashboard' | 'allocation' | 'save' | 'spend' | 'share';

export function KidDashboard() {
  const { getSelectedKid, selectKid, switchMode, state, updateKid } = useApp();
  const kid = getSelectedKid();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showPinLock, setShowPinLock] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

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

  // Warrior XP progress
  const warriorInfo = getWarriorRankInfo(kid.warriorRank);
  const nextRankXP = getNextRankXP(kid.warriorRank);
  const currentRankMinXP = getCurrentRankMinXP(kid.warriorRank);
  const xpInCurrentRank = kid.totalXP - currentRankMinXP;
  const xpNeededForNextRank = nextRankXP - currentRankMinXP;
  const xpProgress = kid.warriorRank >= 7 ? 100 : (xpInCurrentRank / xpNeededForNextRank) * 100;

  // Pet info
  const petEmoji = kid.currentPet ? getPetEmoji(kid.currentPet.type, kid.currentPet.level) : '🥚';
  const petLevelName = kid.currentPet ? getPetLevelName(kid.currentPet.level) : 'No Pet';

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
          <motion.button
            onClick={() => {
              setEditName(kid.name);
              setEditAvatar(kid.avatar);
              setShowEditProfile(true);
            }}
            className="flex items-center gap-3 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl">{kid.avatar}</span>
            <span className="font-semibold text-white">{kid.name}</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </motion.button>
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
        {/* Warrior Rank Card - Hero Section */}
        <motion.div
          className="bg-gradient-to-r from-amber-500/10 via-slate-800 to-amber-500/10 rounded-2xl shadow-lg border border-amber-500/30 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="text-5xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {warriorInfo.emoji}
              </motion.div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Warrior Rank</p>
                <p className="text-2xl font-bold text-amber-400">{warriorInfo.name}</p>
                <p className="text-slate-500 text-sm">{warriorInfo.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Total XP</p>
              <p className="text-3xl font-bold text-white">{kid.totalXP.toLocaleString()}</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Rank {kid.warriorRank}</span>
              {kid.warriorRank < 7 && (
                <span>{nextRankXP - kid.totalXP} XP to Rank {kid.warriorRank + 1}</span>
              )}
              {kid.warriorRank >= 7 && (
                <span className="text-amber-400">Max Rank!</span>
              )}
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, xpProgress))}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Balance + Pet Row */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Total Balance Card */}
          <motion.div
            className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Total Balance</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent mt-1">
              ${totalBalance.toFixed(2)}
            </p>
          </motion.div>

          {/* Pet Companion Card */}
          <motion.button
            onClick={() => setCurrentScreen('save')}
            className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 text-left hover:border-amber-500/50 transition-all group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Companion</p>
                {kid.currentPet ? (
                  <>
                    <p className="text-xl font-bold text-white">{kid.currentPet.name}</p>
                    <p className="text-amber-400 text-sm">{petLevelName} {PET_OPTIONS.find(p => p.type === kid.currentPet?.type)?.name}</p>
                  </>
                ) : (
                  <p className="text-xl font-bold text-slate-500">No pet yet</p>
                )}
              </div>
              <motion.div
                className="text-5xl"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {petEmoji}
              </motion.div>
            </div>
            <p className="text-xs text-slate-500 mt-2 group-hover:text-amber-400 transition-colors">
              Tap to view pet details →
            </p>
          </motion.button>
        </div>

        {/* Bucket Cards - Modern Design */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Save Bucket */}
          <motion.button
            onClick={() => setCurrentScreen('save')}
            className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-5 text-left hover:shadow-xl hover:border-amber-500/50 transition-all group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
            transition={{ delay: 0.3 }}
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
            transition={{ delay: 0.4 }}
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

        {/* Pet Stable Preview */}
        {kid.petStable.length > 0 && (
          <motion.div
            className="mt-6 bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Pet Stable</h3>
            <div className="flex flex-wrap gap-3">
              {kid.petStable.map((pet) => (
                <motion.div
                  key={pet.id}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-full px-4 py-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-xl">👑{PET_OPTIONS.find(p => p.type === pet.type)?.emoji}</span>
                  <span className="text-sm font-medium text-amber-400">{pet.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Badges Preview */}
        {kid.badges.length > 0 && (
          <motion.div
            className="mt-6 bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>

              {/* Avatar Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-3">Choose Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <motion.button
                      key={avatar}
                      onClick={() => setEditAvatar(avatar)}
                      className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all ${
                        editAvatar === avatar
                          ? 'bg-amber-500/30 border-2 border-amber-500 ring-2 ring-amber-500/50'
                          : 'bg-slate-700 border border-slate-600 hover:border-slate-500'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {avatar}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={async () => {
                    if (editName.trim() && kid) {
                      await updateKid(kid.id, { name: editName.trim(), avatar: editAvatar });
                      setShowEditProfile(false);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
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
              <div className="text-6xl mb-4">{warriorInfo.emoji}</div>
              <p className="mt-4 text-slate-300">
                You are now a <span className="font-bold text-amber-400">{warriorInfo.name}</span>!
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

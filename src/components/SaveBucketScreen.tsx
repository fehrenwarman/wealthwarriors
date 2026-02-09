import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  getPetEmoji,
  getPetLevelName,
  getNextPetLevelThreshold,
  PET_OPTIONS,
  PET_LEVELS,
  type PetType
} from '../types';

interface SaveBucketScreenProps {
  onBack: () => void;
}

export function SaveBucketScreen({ onBack }: SaveBucketScreenProps) {
  const { getSelectedKid, hatchNewPet } = useApp();
  const kid = getSelectedKid();
  const [showNewPetModal, setShowNewPetModal] = useState(false);
  const [newPetType, setNewPetType] = useState<PetType>('dragon');
  const [newPetName, setNewPetName] = useState('');

  if (!kid) return null;

  const { save } = kid.buckets;
  const pet = kid.currentPet;

  // Pet progress
  const currentLevel = pet?.level ?? 0;
  const nextLevelThreshold = getNextPetLevelThreshold(currentLevel);
  const currentLevelThreshold = PET_LEVELS[currentLevel]?.minBalance ?? 0;
  const progressRange = nextLevelThreshold - currentLevelThreshold;
  const progressAmount = save.balance - currentLevelThreshold;
  const progressPercent = currentLevel >= 5 ? 100 : Math.min(100, Math.max(0, (progressAmount / progressRange) * 100));

  const monthlyInterest = (save.balance * save.interestRate / 100 / 12);

  const saveTransactions = kid.transactions.filter(t => t.bucket === 'save');

  const petEmoji = pet ? getPetEmoji(pet.type, pet.level) : '🥚';
  const petLevelName = pet ? getPetLevelName(pet.level) : 'No Pet';

  const handleHatchNewPet = () => {
    if (newPetName.trim() && kid) {
      hatchNewPet(kid.id, newPetType, newPetName.trim());
      setShowNewPetModal(false);
      setNewPetName('');
    }
  };

  // Check if pet is Elder and can hatch new pet
  const canHatchNew = pet && pet.level === 5;

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
          <h1 className="text-lg font-semibold text-white">Save & Pet</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Pet Companion Display */}
        <motion.div
          className="bg-gradient-to-br from-amber-500/10 via-slate-800 to-amber-500/10 rounded-2xl shadow-lg border border-amber-500/30 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            {/* Pet Display */}
            <motion.div
              className="text-8xl mb-4"
              animate={{
                scale: [1, 1.05, 1],
                y: [0, -10, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {petEmoji}
            </motion.div>

            {pet ? (
              <>
                <h2 className="text-2xl font-bold text-white">{pet.name}</h2>
                <p className="text-amber-400 font-medium">
                  {petLevelName} {PET_OPTIONS.find(p => p.type === pet.type)?.name}
                </p>
              </>
            ) : (
              <p className="text-slate-400">No companion yet</p>
            )}
          </div>

          {/* Savings Balance */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">Savings Balance</p>
            <p className="text-4xl font-bold text-white">${save.balance.toFixed(2)}</p>
          </div>

          {/* Pet Growth Progress */}
          {pet && pet.level < 5 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>{petLevelName}</span>
                <span>{getPetLevelName(currentLevel + 1)} at ${nextLevelThreshold}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>
              <p className="text-sm text-slate-400 mt-2 text-center">
                Save <span className="font-semibold text-amber-400">${(nextLevelThreshold - save.balance).toFixed(2)}</span> more to evolve
              </p>
            </div>
          )}

          {/* Elder Pet - Can Hatch New */}
          {canHatchNew && (
            <motion.div
              className="mt-6 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-xl p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center">
                <span className="text-2xl mr-2">👑</span>
                <span className="font-semibold text-amber-400">Your pet reached Elder status!</span>
              </div>
              <p className="text-slate-400 text-sm text-center mt-2">
                {pet.name} will move to your Pet Stable and you can adopt a new companion!
              </p>
              <motion.button
                onClick={() => setShowNewPetModal(true)}
                className="w-full mt-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Hatch New Companion
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Pet Evolution Guide */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Evolution Path</h3>

          <div className="space-y-2">
            {PET_LEVELS.map((level) => (
              <div
                key={level.level}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                  currentLevel === level.level
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'bg-slate-900/50'
                }`}
              >
                <div className={`text-3xl ${currentLevel < level.level ? 'grayscale opacity-50' : ''}`}>
                  {level.level === 0 ? '🥚' :
                   level.level === 5 ? `👑${pet ? PET_OPTIONS.find(p => p.type === pet.type)?.emoji : '🐉'}` :
                   pet ? PET_OPTIONS.find(p => p.type === pet.type)?.emoji : '🐉'}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${currentLevel === level.level ? 'text-amber-400' : 'text-slate-300'}`}>
                    {level.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    ${level.minBalance}+
                  </p>
                </div>
                {currentLevel === level.level && (
                  <span className="text-amber-400 text-sm font-medium">Current</span>
                )}
                {currentLevel > level.level && (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pet Stable */}
        {kid.petStable.length > 0 && (
          <motion.div
            className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Pet Stable</h3>
              <span className="text-amber-400 text-sm font-medium">{kid.petStable.length} Elder{kid.petStable.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {kid.petStable.map((stablePet) => (
                <motion.div
                  key={stablePet.id}
                  className="bg-gradient-to-br from-amber-500/10 to-slate-800 border border-amber-500/30 rounded-xl p-4 text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-4xl mb-2">👑{PET_OPTIONS.find(p => p.type === stablePet.type)?.emoji}</div>
                  <p className="font-semibold text-white text-sm">{stablePet.name}</p>
                  <p className="text-xs text-amber-400">{PET_OPTIONS.find(p => p.type === stablePet.type)?.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(stablePet.raisedToElderAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Interest Info */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
              <span className="font-semibold">How it works:</span> Your savings earn interest, and your pet grows as your balance increases. Save more to evolve your companion!
            </p>
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
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-500">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </p>
                      {tx.xpEarned && tx.xpEarned > 0 && (
                        <span className="text-xs text-amber-400">+{tx.xpEarned} XP</span>
                      )}
                    </div>
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

      {/* New Pet Modal */}
      <AnimatePresence>
        {showNewPetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewPetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-amber-400 text-center mb-2">Choose Your New Companion</h2>
              <p className="text-slate-400 text-center mb-6">
                {pet?.name} will be retired to your Pet Stable
              </p>

              {/* Pet Selection Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {PET_OPTIONS.map((petOption) => (
                  <motion.button
                    key={petOption.type}
                    onClick={() => setNewPetType(petOption.type)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      newPetType === petOption.type
                        ? 'bg-amber-500/20 border-amber-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-3xl mb-2">{petOption.emoji}</div>
                    <div className="font-semibold text-white text-sm">{petOption.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{petOption.description}</div>
                  </motion.button>
                ))}
              </div>

              {/* Pet Name Input */}
              <div className="mb-6">
                <label className="block">
                  <span className="text-slate-300 font-medium">Name Your Companion</span>
                  <input
                    type="text"
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    placeholder={`My ${PET_OPTIONS.find(p => p.type === newPetType)?.name}`}
                    className="mt-2 block w-full px-4 py-3 border-2 border-slate-600 bg-slate-900 text-white rounded-xl focus:border-amber-500 focus:ring focus:ring-amber-500/20 transition-all"
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowNewPetModal(false)}
                  className="flex-1 py-3 bg-slate-700 text-white font-semibold rounded-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleHatchNewPet}
                  disabled={!newPetName.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl disabled:opacity-50"
                  whileHover={{ scale: newPetName.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: newPetName.trim() ? 0.98 : 1 }}
                >
                  Adopt!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

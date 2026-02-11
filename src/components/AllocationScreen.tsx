import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { XP_REWARDS, getPetEmoji, getPetLevel } from '../types';

interface AllocationScreenProps {
  onComplete: () => void;
}

export function AllocationScreen({ onComplete }: AllocationScreenProps) {
  const { getSelectedKid, allocateMoney } = useApp();
  const kid = getSelectedKid();

  const amount = kid?.pendingAllocation || 0;

  const [saveAmount, setSaveAmount] = useState(0);
  const [spendAmount, setSpendAmount] = useState(0);
  const [shareAmount, setShareAmount] = useState(0);

  // Initialize with a default split when component mounts
  useEffect(() => {
    if (amount > 0) {
      // Default 40-50-10 split
      const save = Math.round(amount * 0.4 * 100) / 100;
      const spend = Math.round(amount * 0.5 * 100) / 100;
      const share = Math.round((amount - save - spend) * 100) / 100;
      setSaveAmount(save);
      setSpendAmount(spend);
      setShareAmount(share);
    }
  }, [amount]);

  // Auto-adjust share when save or spend changes
  useEffect(() => {
    const remaining = Math.round((amount - saveAmount - spendAmount) * 100) / 100;
    if (remaining >= 0) {
      setShareAmount(remaining);
    }
  }, [saveAmount, spendAmount, amount]);

  if (!kid || !kid.pendingAllocation) {
    return null;
  }

  const totalAllocated = Math.round((saveAmount + spendAmount + shareAmount) * 100) / 100;
  const isValid = Math.abs(totalAllocated - amount) < 0.01;

  // Calculate percentages for display
  const savePercent = amount > 0 ? Math.round((saveAmount / amount) * 100) : 0;
  const spendPercent = amount > 0 ? Math.round((spendAmount / amount) * 100) : 0;
  const sharePercent = amount > 0 ? Math.round((shareAmount / amount) * 100) : 0;

  // Calculate XP preview (action-based: 1 XP per bucket)
  let xpPreview = 0;
  if (saveAmount > 0) xpPreview += XP_REWARDS.ALLOCATE_TO_BUCKET;
  if (spendAmount > 0) xpPreview += XP_REWARDS.ALLOCATE_TO_BUCKET;
  if (shareAmount > 0) xpPreview += XP_REWARDS.ALLOCATE_TO_BUCKET;

  // Check if pet will level up
  const baseline = kid.buckets.save.baseline || 0;
  const currentSaveBalance = kid.buckets.save.balance;
  const newSaveBalance = currentSaveBalance + saveAmount;
  const currentPetLevel = kid.currentPet?.level || 0;
  const newPetLevel = getPetLevel(newSaveBalance, baseline);
  const willLevelUp = newPetLevel > currentPetLevel;
  if (willLevelUp) xpPreview += XP_REWARDS.PET_LEVEL_UP;

  // Pet info
  const petEmoji = kid.currentPet ? getPetEmoji(kid.currentPet.type, kid.currentPet.level) : '🥚';

  const handleQuickSplit = (saveRatio: number, spendRatio: number) => {
    const save = Math.round(amount * saveRatio * 100) / 100;
    const spend = Math.round(amount * spendRatio * 100) / 100;
    const share = Math.round((amount - save - spend) * 100) / 100;
    setSaveAmount(save);
    setSpendAmount(spend);
    setShareAmount(share);
  };

  const handleSaveChange = (value: number) => {
    const newSave = Math.min(value, amount);
    setSaveAmount(newSave);
    // Adjust spend if needed
    if (newSave + spendAmount > amount) {
      setSpendAmount(Math.max(0, amount - newSave));
    }
  };

  const handleSpendChange = (value: number) => {
    const maxSpend = amount - saveAmount;
    const newSpend = Math.min(value, maxSpend);
    setSpendAmount(newSpend);
  };

  const handleConfirm = () => {
    if (isValid) {
      allocateMoney(kid.id, saveAmount, spendAmount, shareAmount);
      onComplete();
    }
  };

  // For dollar input handling
  const formatDollarInput = (value: string): number => {
    const num = parseFloat(value) || 0;
    return Math.round(Math.max(0, Math.min(num, amount)) * 100) / 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center mb-4"
          >
            <motion.div
              className="text-6xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {petEmoji}
            </motion.div>
          </motion.div>
          <motion.h2
            className="text-xl font-bold text-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            New funds to deploy!
          </motion.h2>

          {/* Animated amount display */}
          <motion.div
            className="mt-3 relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              ${amount.toFixed(2)}
            </div>
          </motion.div>
        </div>

        {/* XP Preview */}
        <motion.div
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚔️</span>
              <span className="text-sm text-slate-300">XP you'll earn:</span>
            </div>
            <motion.span
              className="text-lg font-bold text-amber-400"
              key={xpPreview}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              +{xpPreview} XP
            </motion.span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {saveAmount > 0 && '+1 Save'}{spendAmount > 0 && ' +1 Spend'}{shareAmount > 0 && ' +1 Share'}{willLevelUp && ' +10 Pet Level Up!'}
          </p>
        </motion.div>

        {/* Quick Split Buttons */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          <motion.button
            onClick={() => handleQuickSplit(0.4, 0.5)}
            className="px-3 py-1.5 bg-slate-700 text-slate-300 font-medium rounded-lg text-sm hover:bg-slate-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            40-50-10
          </motion.button>
          <motion.button
            onClick={() => handleQuickSplit(0.5, 0.3)}
            className="px-3 py-1.5 bg-slate-700 text-slate-300 font-medium rounded-lg text-sm hover:bg-slate-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            50-30-20
          </motion.button>
          <motion.button
            onClick={() => handleQuickSplit(0.334, 0.333)}
            className="px-3 py-1.5 bg-slate-700 text-slate-300 font-medium rounded-lg text-sm hover:bg-slate-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Equal
          </motion.button>
          <motion.button
            onClick={() => handleQuickSplit(1, 0)}
            className="px-3 py-1.5 bg-amber-500/20 text-amber-400 font-medium rounded-lg text-sm hover:bg-amber-500/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All Save
          </motion.button>
        </div>

        {/* Allocation Inputs */}
        <div className="space-y-4">
          {/* Save */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
                <span className="font-semibold text-white">Save</span>
                {willLevelUp && <span className="text-xs text-amber-400 ml-1">🎉 Pet levels up!</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">$</span>
                <input
                  type="number"
                  value={saveAmount || ''}
                  onChange={(e) => handleSaveChange(formatDollarInput(e.target.value))}
                  step="0.01"
                  min="0"
                  max={amount}
                  className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-right text-amber-400 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <input
              type="range"
              value={saveAmount}
              onChange={(e) => handleSaveChange(parseFloat(e.target.value))}
              min={0}
              max={amount}
              step={0.01}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>$0</span>
              <span className="text-amber-400">{savePercent}%</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Spend */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🎯</span>
                </div>
                <span className="font-semibold text-white">Spend</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">$</span>
                <input
                  type="number"
                  value={spendAmount || ''}
                  onChange={(e) => handleSpendChange(formatDollarInput(e.target.value))}
                  step="0.01"
                  min="0"
                  max={amount - saveAmount}
                  className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-right text-blue-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <input
              type="range"
              value={spendAmount}
              onChange={(e) => handleSpendChange(parseFloat(e.target.value))}
              min={0}
              max={Math.max(0, amount - saveAmount)}
              step={0.01}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>$0</span>
              <span className="text-blue-400">{spendPercent}%</span>
              <span>${Math.max(0, amount - saveAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Share (auto-calculated remainder) */}
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">❤️</span>
                </div>
                <span className="font-semibold text-white">Share</span>
                <span className="text-xs text-slate-400 ml-1">(remainder)</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-rose-400">
                  ${shareAmount.toFixed(2)}
                </span>
                <span className="text-sm text-slate-500 ml-2">
                  ({sharePercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Check */}
        <div className={`mt-5 text-center py-2.5 rounded-xl font-medium ${
          isValid ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {isValid ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Ready to deploy ${totalAllocated.toFixed(2)}
            </span>
          ) : (
            <span>Total: ${totalAllocated.toFixed(2)} / ${amount.toFixed(2)}</span>
          )}
        </div>

        {/* Confirm Button */}
        <motion.button
          onClick={handleConfirm}
          disabled={!isValid}
          className="w-full mt-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isValid ? 1.02 : 1 }}
          whileTap={{ scale: isValid ? 0.98 : 1 }}
        >
          Deploy Funds (+{xpPreview} XP)
        </motion.button>
      </motion.div>
    </div>
  );
}

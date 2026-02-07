import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Piggy } from './Piggy';

interface AllocationScreenProps {
  onComplete: () => void;
}

const QUICK_SPLITS = [
  { name: '40-50-10', save: 40, spend: 50, share: 10 },
  { name: '50-30-20', save: 50, spend: 30, share: 20 },
  { name: 'Equal', save: 33.34, spend: 33.33, share: 33.33 },
];

export function AllocationScreen({ onComplete }: AllocationScreenProps) {
  const { getSelectedKid, allocateMoney } = useApp();
  const kid = getSelectedKid();

  const [savePercent, setSavePercent] = useState(40);
  const [spendPercent, setSpendPercent] = useState(50);
  const [sharePercent, setSharePercent] = useState(10);

  const totalPercent = savePercent + spendPercent + sharePercent;
  const isValid = Math.abs(totalPercent - 100) < 0.01;

  useEffect(() => {
    // Auto-adjust share when save or spend changes
    const remaining = 100 - savePercent - spendPercent;
    if (remaining >= 0 && remaining <= 100) {
      setSharePercent(remaining);
    }
  }, [savePercent, spendPercent]);

  if (!kid || !kid.pendingAllocation) {
    return null;
  }

  const amount = kid.pendingAllocation;
  const saveAmount = (amount * savePercent) / 100;
  const spendAmount = (amount * spendPercent) / 100;
  const shareAmount = (amount * sharePercent) / 100;
  const allocatedAmount = saveAmount + spendAmount + shareAmount;
  const remainingAmount = amount - allocatedAmount;

  const handleQuickSplit = (split: typeof QUICK_SPLITS[0]) => {
    setSavePercent(split.save);
    setSpendPercent(split.spend);
    setSharePercent(split.share);
  };

  const handleConfirm = () => {
    if (isValid) {
      allocateMoney(kid.id, saveAmount, spendAmount, shareAmount);
      onComplete();
    }
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
            <Piggy level={kid.piggyLevel} size="md" />
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
            {remainingAmount > 0.01 && (
              <motion.div
                className="text-sm text-slate-400 mt-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ${remainingAmount.toFixed(2)} left to allocate
              </motion.div>
            )}
            {remainingAmount <= 0.01 && isValid && (
              <motion.div
                className="text-sm text-emerald-400 font-medium mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                All allocated!
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Quick Split Buttons */}
        <div className="flex gap-2 mb-6 justify-center">
          {QUICK_SPLITS.map((split) => (
            <motion.button
              key={split.name}
              onClick={() => handleQuickSplit(split)}
              className="px-3 py-1.5 bg-slate-700 text-slate-300 font-medium rounded-lg text-sm hover:bg-slate-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {split.name}
            </motion.button>
          ))}
        </div>

        {/* Allocation Sliders */}
        <div className="space-y-5">
          {/* Save Slider */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
                <span className="font-semibold text-white">Save</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-amber-400">
                  ${saveAmount.toFixed(2)}
                </span>
                <span className="text-sm text-slate-500 ml-1">
                  ({savePercent}%)
                </span>
              </div>
            </div>
            <input
              type="range"
              value={savePercent}
              onChange={(e) => setSavePercent(parseInt(e.target.value))}
              min={0}
              max={100}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Spend Slider */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🎯</span>
                </div>
                <span className="font-semibold text-white">Spend</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-blue-400">
                  ${spendAmount.toFixed(2)}
                </span>
                <span className="text-sm text-slate-500 ml-1">
                  ({spendPercent}%)
                </span>
              </div>
            </div>
            <input
              type="range"
              value={spendPercent}
              onChange={(e) => setSpendPercent(parseInt(e.target.value))}
              min={0}
              max={100}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Share Slider */}
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">❤️</span>
                </div>
                <span className="font-semibold text-white">Share</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-rose-400">
                  ${shareAmount.toFixed(2)}
                </span>
                <span className="text-sm text-slate-500 ml-1">
                  ({sharePercent}%)
                </span>
              </div>
            </div>
            <input
              type="range"
              value={sharePercent}
              onChange={(e) => setSharePercent(parseInt(e.target.value))}
              min={0}
              max={100}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-rose-500"
            />
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
              Ready to deploy
            </span>
          ) : (
            <span>Total: {totalPercent.toFixed(0)}% (must equal 100%)</span>
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
          Deploy Funds
        </motion.button>
      </motion.div>
    </div>
  );
}

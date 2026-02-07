import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { GOAL_ICONS } from '../types';

interface SpendBucketScreenProps {
  onBack: () => void;
}

export function SpendBucketScreen({ onBack }: SpendBucketScreenProps) {
  const { getSelectedKid, addGoal, purchaseGoal } = useApp();
  const kid = getSelectedKid();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalIcon, setGoalIcon] = useState('🎮');
  const [showCelebration, setShowCelebration] = useState(false);
  const [purchasedGoalName, setPurchasedGoalName] = useState('');

  if (!kid) return null;

  const { spend } = kid.buckets;
  const activeGoals = spend.goals.filter(g => !g.purchased);
  const completedGoals = spend.goals.filter(g => g.purchased);

  const handleAddGoal = () => {
    if (goalName.trim() && parseFloat(goalAmount) > 0) {
      addGoal(kid.id, goalName.trim(), parseFloat(goalAmount), goalIcon);
      setGoalName('');
      setGoalAmount('');
      setGoalIcon('🎮');
      setShowAddGoal(false);
    }
  };

  const handlePurchase = (goalId: string, goalName: string) => {
    purchaseGoal(kid.id, goalId);
    setPurchasedGoalName(goalName);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const spendTransactions = kid.transactions.filter(t => t.bucket === 'spend');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
          <h1 className="text-lg font-semibold text-white">Spend</h1>
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
              <p className="text-slate-400 text-sm font-medium">Available Balance</p>
              <p className="text-4xl font-bold text-white mt-1">${spend.balance.toFixed(2)}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🎯</span>
            </div>
          </div>

          <motion.button
            onClick={() => setShowAddGoal(true)}
            className="w-full mt-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Mission
          </motion.button>
        </motion.div>

        {/* Active Goals */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Active Missions</h3>

          {activeGoals.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl opacity-50">🎯</span>
              </div>
              <p className="text-slate-400">No missions yet</p>
              <p className="text-slate-500 text-sm">Add a mission to start saving for something</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((goal) => {
                const progress = (spend.balance / goal.targetAmount) * 100;
                const canPurchase = spend.balance >= goal.targetAmount;

                return (
                  <motion.div
                    key={goal.id}
                    className={`rounded-xl p-4 border-2 transition-colors ${
                      canPurchase
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-slate-600 bg-slate-900/50'
                    }`}
                    layout
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        canPurchase ? 'bg-emerald-500/20' : 'bg-slate-700'
                      }`}>
                        <span className="text-2xl">{goal.icon || '🎯'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-white">{goal.name}</h4>
                          <span className="font-bold text-slate-300">
                            ${goal.targetAmount.toFixed(2)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mb-2">
                          <motion.div
                            className={`h-full rounded-full ${
                              canPurchase
                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                : 'bg-gradient-to-r from-blue-400 to-blue-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, progress)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">
                            ${Math.min(spend.balance, goal.targetAmount).toFixed(2)} of ${goal.targetAmount.toFixed(2)}
                          </span>
                          <span className={`font-semibold ${canPurchase ? 'text-emerald-400' : 'text-blue-400'}`}>
                            {Math.min(100, progress).toFixed(0)}%
                          </span>
                        </div>

                        {canPurchase && (
                          <motion.button
                            onClick={() => handlePurchase(goal.id, goal.name)}
                            className="w-full mt-3 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Complete Mission
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <motion.div
            className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Completed</h3>

            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center gap-4 bg-slate-900/50 rounded-xl p-3"
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{goal.icon || '✅'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-300">{goal.name}</p>
                    <p className="text-xs text-slate-500">
                      {goal.purchasedAt
                        ? new Date(goal.purchasedAt).toLocaleDateString()
                        : 'Purchased'}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-400">
                    ${goal.targetAmount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Transaction History */}
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">History</h3>

          {spendTransactions.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {spendTransactions.slice(0, 10).map((tx) => (
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
                  <span className={`font-semibold text-sm ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}${tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddGoal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-5">New Mission</h3>

              {/* Icon Selection */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">Choose an icon</label>
                <div className="grid grid-cols-8 gap-2">
                  {GOAL_ICONS.map((icon) => (
                    <motion.button
                      key={icon.emoji}
                      onClick={() => setGoalIcon(icon.emoji)}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors ${
                        goalIcon === icon.emoji
                          ? 'bg-blue-500/20 ring-2 ring-blue-400'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={icon.label}
                    >
                      {icon.emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">What's your mission?</span>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="New headphones, video game..."
                    className="mt-1.5 block w-full px-4 py-3 border border-slate-600 bg-slate-900 text-white rounded-xl focus:border-blue-400 focus:ring focus:ring-blue-500/20 transition-all"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Target amount</span>
                  <div className="relative mt-1.5">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      placeholder="50.00"
                      min="0.01"
                      step="0.01"
                      className="block w-full pl-8 pr-4 py-3 border border-slate-600 bg-slate-900 text-white rounded-xl focus:border-blue-400 focus:ring focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </label>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={() => setShowAddGoal(false)}
                    className="flex-1 py-3 border border-slate-600 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleAddGoal}
                    disabled={!goalName.trim() || !goalAmount || parseFloat(goalAmount) <= 0}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Mission
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <span className="text-7xl">🏆</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-white mt-4">
                Mission Complete!
              </h2>
              <p className="text-slate-300 mt-2">
                You conquered <span className="font-bold text-amber-400">{purchasedGoalName}</span>
              </p>
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

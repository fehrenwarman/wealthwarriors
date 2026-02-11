import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { AVATAR_OPTIONS, getWarriorRankInfo, getPetEmoji } from '../types';
import type { Kid } from '../types';
import { PinSetup } from './PinLock';

export function ParentDashboard() {
  const { state, switchMode, grantMoney, setInterestRate, setBaseline, addKid, applyInterest, setParentPin } = useApp();
  const [showGrantModal, setShowGrantModal] = useState<string | null>(null);
  const [showAddKidModal, setShowAddKidModal] = useState(false);
  const [showKidDetails, setShowKidDetails] = useState<string | null>(null);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [grantAmount, setGrantAmount] = useState('');
  const [grantDescription, setGrantDescription] = useState('');
  const [newKidName, setNewKidName] = useState('');
  const [newKidAge, setNewKidAge] = useState(8);
  const [newKidAvatar, setNewKidAvatar] = useState('⚔️');

  if (!state.family) return null;

  const handleGrant = (kidId: string) => {
    const amount = parseFloat(grantAmount);
    if (amount > 0) {
      grantMoney(kidId, amount, grantDescription || 'Allowance');
      setGrantAmount('');
      setGrantDescription('');
      setShowGrantModal(null);
    }
  };

  const handleAddKid = () => {
    if (newKidName.trim()) {
      addKid(newKidName.trim(), newKidAge, newKidAvatar);
      setNewKidName('');
      setNewKidAge(8);
      setNewKidAvatar('⚔️');
      setShowAddKidModal(false);
    }
  };

  const getTotalBalance = (kid: Kid) => {
    return kid.buckets.save.balance + kid.buckets.spend.balance + kid.buckets.share.balance;
  };

  const hasPin = !!state.family.settings?.parentPin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <span className="text-slate-900 text-lg">⚔️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-400">Wealth Warriors</h1>
              <p className="text-xs text-slate-400">{state.family.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowPinSetup(true)}
              className={`p-2 rounded-lg transition-colors ${hasPin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={hasPin ? 'PIN enabled' : 'Set parent PIN'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </motion.button>
            <motion.button
              onClick={() => switchMode('kid')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl shadow-md text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Warrior Mode
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Command Center</h2>
          <motion.button
            onClick={() => setShowAddKidModal(true)}
            className="px-4 py-2 bg-emerald-500 text-white font-semibold rounded-xl shadow-md text-sm flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Warrior
          </motion.button>
        </div>

        {/* Kids Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {state.family.kids.map((kid, index) => {
            const warriorInfo = getWarriorRankInfo(kid.warriorRank);
            const petEmoji = kid.currentPet ? getPetEmoji(kid.currentPet.type, kid.currentPet.level) : '🥚';

            return (
              <motion.div
                key={kid.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden"
              >
                {/* Kid Header */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-3xl">{kid.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900">{kid.name}</h3>
                      <div className="flex items-center gap-2 text-slate-800/70 text-sm">
                        <span>{warriorInfo.emoji}</span>
                        <span>{warriorInfo.name}</span>
                      </div>
                    </div>
                    <div className="text-3xl">{petEmoji}</div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="px-5 py-3 bg-slate-900/50 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">XP</p>
                      <p className="text-sm font-bold text-amber-400">{kid.totalXP.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Rank</p>
                      <p className="text-sm font-bold text-white">{kid.warriorRank}</p>
                    </div>
                    {kid.currentPet && (
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Pet</p>
                        <p className="text-sm font-bold text-white">{kid.currentPet.name}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Stable</p>
                    <p className="text-sm font-bold text-amber-400">{kid.petStable.length} Elder{kid.petStable.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Balances */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between bg-slate-900/50 rounded-xl p-4">
                    <span className="text-slate-400 font-medium">Total Balance</span>
                    <span className="text-2xl font-bold text-white">
                      ${getTotalBalance(kid).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                      <div className="text-lg">💰</div>
                      <div className="text-xs text-slate-400 mt-1">Save</div>
                      <div className="font-bold text-amber-400">
                        ${kid.buckets.save.balance.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                      <div className="text-lg">🎯</div>
                      <div className="text-xs text-slate-400 mt-1">Spend</div>
                      <div className="font-bold text-blue-400">
                        ${kid.buckets.spend.balance.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
                      <div className="text-lg">❤️</div>
                      <div className="text-xs text-slate-400 mt-1">Share</div>
                      <div className="font-bold text-rose-400">
                        ${kid.buckets.share.balance.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {kid.pendingAllocation && kid.pendingAllocation > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
                      <span className="text-amber-400 font-medium text-sm">
                        ${kid.pendingAllocation.toFixed(2)} pending allocation
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setShowGrantModal(kid.id)}
                      className="flex-1 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl shadow-sm text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Grant Funds
                    </motion.button>
                    <motion.button
                      onClick={() => setShowKidDetails(kid.id)}
                      className="flex-1 py-2.5 bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Settings
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {state.family.kids.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl opacity-50">⚔️</span>
            </div>
            <p className="text-lg text-slate-400">No warriors enlisted yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first warrior to begin</p>
          </motion.div>
        )}
      </main>

      {/* Grant Money Modal */}
      <AnimatePresence>
        {showGrantModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowGrantModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-5">Grant Funds</h3>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Amount</span>
                  <div className="relative mt-1.5">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={grantAmount}
                      onChange={(e) => setGrantAmount(e.target.value)}
                      placeholder="10.00"
                      min="0.01"
                      step="0.01"
                      className="block w-full pl-8 pr-4 py-3 border border-slate-600 bg-slate-900 text-white rounded-xl focus:border-amber-500 focus:ring focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Description (optional)</span>
                  <input
                    type="text"
                    value={grantDescription}
                    onChange={(e) => setGrantDescription(e.target.value)}
                    placeholder="Weekly allowance"
                    className="mt-1.5 block w-full px-4 py-3 border border-slate-600 bg-slate-900 text-white rounded-xl focus:border-amber-500 focus:ring focus:ring-amber-500/20 transition-all"
                  />
                </label>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={() => setShowGrantModal(null)}
                    className="flex-1 py-3 border border-slate-600 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={() => handleGrant(showGrantModal)}
                    disabled={!grantAmount || parseFloat(grantAmount) <= 0}
                    className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Grant
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Kid Modal */}
      <AnimatePresence>
        {showAddKidModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddKidModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-5">Add Warrior</h3>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Name</span>
                  <input
                    type="text"
                    value={newKidName}
                    onChange={(e) => setNewKidName(e.target.value)}
                    placeholder="Alex"
                    className="mt-1.5 block w-full px-4 py-3 border border-slate-600 bg-slate-900 text-white rounded-xl focus:border-amber-500 focus:ring focus:ring-amber-500/20 transition-all"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Age</span>
                  <input
                    type="number"
                    value={newKidAge}
                    onChange={(e) => setNewKidAge(parseInt(e.target.value) || 8)}
                    min={5}
                    max={18}
                    className="mt-1.5 block w-full px-4 py-3 border border-slate-600 bg-slate-900 text-white rounded-xl focus:border-amber-500 focus:ring focus:ring-amber-500/20 transition-all"
                  />
                </label>
                <div>
                  <span className="text-sm font-medium text-slate-300">Emblem</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.map((emoji) => (
                      <motion.button
                        key={emoji}
                        onClick={() => setNewKidAvatar(emoji)}
                        className={`text-2xl p-2 rounded-xl transition-all ${
                          newKidAvatar === emoji
                            ? 'bg-amber-500/20 ring-2 ring-amber-500'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={() => setShowAddKidModal(false)}
                    className="flex-1 py-3 border border-slate-600 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleAddKid}
                    disabled={!newKidName.trim()}
                    className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Enlist
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kid Details Modal */}
      <AnimatePresence>
        {showKidDetails && (
          <KidDetailsModal
            kidId={showKidDetails}
            onClose={() => setShowKidDetails(null)}
            onSetInterestRate={setInterestRate}
            onSetBaseline={setBaseline}
            onApplyInterest={applyInterest}
          />
        )}
      </AnimatePresence>

      {/* PIN Setup Modal */}
      <AnimatePresence>
        {showPinSetup && (
          <PinSetup
            onComplete={(pin) => {
              setParentPin(pin);
              setShowPinSetup(false);
            }}
            onSkip={() => setShowPinSetup(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function KidDetailsModal({
  kidId,
  onClose,
  onSetInterestRate,
  onSetBaseline,
  onApplyInterest,
}: {
  kidId: string;
  onClose: () => void;
  onSetInterestRate: (kidId: string, rate: number) => void;
  onSetBaseline: (kidId: string, baseline: number) => void;
  onApplyInterest: (kidId: string) => void;
}) {
  const { state } = useApp();
  const kid = state.family?.kids.find((k) => k.id === kidId);
  const [interestRate, setInterestRate] = useState(kid?.buckets.save.interestRate || 5);
  const [baseline, setBaseline] = useState(kid?.buckets.save.baseline || 0);

  if (!kid) return null;

  const handleSaveInterestRate = () => {
    onSetInterestRate(kidId, interestRate);
  };

  const handleSaveBaseline = () => {
    onSetBaseline(kidId, baseline);
  };

  const monthlyInterest = (kid.buckets.save.balance * interestRate / 100 / 12);
  const warriorInfo = getWarriorRankInfo(kid.warriorRank);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{kid.avatar}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{kid.name}'s Settings</h3>
              <p className="text-sm text-amber-400">{warriorInfo.emoji} {warriorInfo.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="bg-slate-900/50 rounded-xl p-4 mb-5 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-500">Total XP</p>
            <p className="text-lg font-bold text-amber-400">{kid.totalXP.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Rank</p>
            <p className="text-lg font-bold text-white">{kid.warriorRank}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Stable</p>
            <p className="text-lg font-bold text-white">{kid.petStable.length}</p>
          </div>
        </div>

        {/* Interest Rate Setting */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-5">
          <h4 className="font-semibold text-white mb-3">Interest Rate (APR)</h4>
          <p className="text-sm text-slate-400 mb-3">
            Interest is calculated yearly but paid monthly. Current monthly payment: <span className="font-semibold text-amber-400">${monthlyInterest.toFixed(2)}</span>
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={interestRate}
              onChange={(e) => setInterestRate(parseInt(e.target.value))}
              min={1}
              max={20}
              className="flex-1"
            />
            <span className="text-xl font-bold text-amber-400 w-14 text-right">
              {interestRate}%
            </span>
          </div>
          <div className="flex gap-2 mt-4">
            <motion.button
              onClick={handleSaveInterestRate}
              className="flex-1 py-2.5 bg-amber-500 text-slate-900 font-semibold rounded-lg text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Save Rate
            </motion.button>
            <motion.button
              onClick={() => onApplyInterest(kidId)}
              className="flex-1 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Apply Interest Now
            </motion.button>
          </div>
        </div>

        {/* Baseline Setting */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-5">
          <h4 className="font-semibold text-white mb-3">Pet Growth Baseline</h4>
          <p className="text-sm text-slate-400 mb-3">
            Initial lump sum that doesn't count toward pet evolution. Pet level is based on savings above this amount.
            {baseline > 0 && (
              <span className="block mt-1">
                Current effective savings for pet: <span className="font-semibold text-blue-400">${Math.max(0, kid.buckets.save.balance - baseline).toFixed(2)}</span>
              </span>
            )}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">$</span>
            <input
              type="number"
              value={baseline || ''}
              onChange={(e) => setBaseline(parseFloat(e.target.value) || 0)}
              min={0}
              step={1}
              placeholder="0"
              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              onClick={handleSaveBaseline}
              className="px-4 py-2.5 bg-blue-500 text-white font-semibold rounded-lg text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Save Baseline
            </motion.button>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h4 className="font-semibold text-white mb-3">Transaction History</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {kid.transactions.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No transactions yet</p>
            ) : (
              kid.transactions.slice(0, 20).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3"
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
                  <span
                    className={`font-semibold text-sm ${
                      tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {tx.amount >= 0 ? '+' : ''}${tx.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <motion.button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-600 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

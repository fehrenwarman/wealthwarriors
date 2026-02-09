import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { AVATAR_OPTIONS, PET_OPTIONS, type PetType } from '../types';

type SetupStep = 'welcome' | 'family' | 'kids' | 'pet' | 'done';

export function SetupScreen() {
  const { createFamily, addKid, setPet, state } = useApp();
  const [step, setStep] = useState<SetupStep>('welcome');
  const [familyName, setFamilyName] = useState('');
  const [kidName, setKidName] = useState('');
  const [kidAge, setKidAge] = useState(8);
  const [kidAvatar, setKidAvatar] = useState('⚔️');
  const [pendingKidId, setPendingKidId] = useState<string | null>(null);
  const [selectedPetType, setSelectedPetType] = useState<PetType>('dragon');
  const [petName, setPetName] = useState('');

  const handleCreateFamily = () => {
    if (familyName.trim()) {
      createFamily(familyName.trim());
      setStep('kids');
    }
  };

  const handleAddKid = () => {
    if (kidName.trim()) {
      addKid(kidName.trim(), kidAge, kidAvatar);
      setKidName('');
      setKidAge(8);
      setKidAvatar('⚔️');
    }
  };

  const handleContinueToPetSelection = () => {
    if (state.family && state.family.kids.length > 0) {
      // Set pending kid to the first kid without a pet
      const kidWithoutPet = state.family.kids.find(k => !k.currentPet);
      if (kidWithoutPet) {
        setPendingKidId(kidWithoutPet.id);
        setPetName('');
        setSelectedPetType('dragon');
        setStep('pet');
      } else {
        setStep('done');
      }
    }
  };

  const handleSelectPet = () => {
    if (pendingKidId && petName.trim()) {
      setPet(pendingKidId, selectedPetType, petName.trim());
      // Check if there are more kids without pets
      const nextKidWithoutPet = state.family?.kids.find(k => k.id !== pendingKidId && !k.currentPet);
      if (nextKidWithoutPet) {
        setPendingKidId(nextKidWithoutPet.id);
        setPetName('');
        setSelectedPetType('dragon');
      } else {
        setStep('done');
      }
    }
  };

  const currentKidForPet = state.family?.kids.find(k => k.id === pendingKidId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-8xl"
            >
              ⚔️
            </motion.div>
            <motion.h1
              className="mt-8 text-5xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Wealth Warriors
            </motion.h1>
            <motion.p
              className="mt-4 text-xl text-slate-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Master your money. Raise your companion. Build your future.
            </motion.p>
            <motion.button
              onClick={() => setStep('family')}
              className="mt-8 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-xl font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Begin Your Journey
            </motion.button>
          </motion.div>
        )}

        {step === 'family' && (
          <motion.div
            key="family"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-8 w-full max-w-md"
          >
            <h2 className="text-3xl font-bold text-amber-400 text-center mb-6">
              Create Your Clan
            </h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-slate-300 font-medium">Clan Name</span>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="The Smith Clan"
                  className="mt-2 block w-full px-4 py-3 border-2 border-slate-600 bg-slate-900 text-white rounded-xl focus:border-amber-500 focus:ring focus:ring-amber-500/20 transition-all text-lg"
                />
              </label>
              <motion.button
                onClick={handleCreateFamily}
                disabled={!familyName.trim()}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-xl font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: familyName.trim() ? 1.02 : 1 }}
                whileTap={{ scale: familyName.trim() ? 0.98 : 1 }}
              >
                Next: Add Warriors
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'kids' && (
          <motion.div
            key="kids"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-8 w-full max-w-md"
          >
            <h2 className="text-3xl font-bold text-amber-400 text-center mb-2">
              Add Warriors
            </h2>
            <p className="text-center text-slate-400 mb-6">
              {state.family?.kids.length || 0} warrior(s) enlisted
            </p>

            {/* Show added kids */}
            {state.family && state.family.kids.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2 justify-center">
                {state.family.kids.map((kid) => (
                  <motion.div
                    key={kid.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-r from-slate-700 to-slate-600 px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    <span className="text-2xl">{kid.avatar}</span>
                    <span className="font-medium text-amber-400">{kid.name}</span>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <label className="block">
                <span className="text-slate-300 font-medium">Warrior Name</span>
                <input
                  type="text"
                  value={kidName}
                  onChange={(e) => setKidName(e.target.value)}
                  placeholder="Alex"
                  className="mt-2 block w-full px-4 py-3 border-2 border-slate-600 bg-slate-900 text-white rounded-xl focus:border-amber-500 focus:ring focus:ring-amber-500/20 transition-all text-lg"
                />
              </label>

              <label className="block">
                <span className="text-slate-300 font-medium">Age</span>
                <input
                  type="number"
                  value={kidAge}
                  onChange={(e) => setKidAge(parseInt(e.target.value) || 8)}
                  min={5}
                  max={18}
                  className="mt-2 block w-full px-4 py-3 border-2 border-slate-600 bg-slate-900 text-white rounded-xl focus:border-amber-500 focus:ring focus:ring-amber-500/20 transition-all text-lg"
                />
              </label>

              <div>
                <span className="text-slate-300 font-medium">Choose Your Emblem</span>
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      onClick={() => setKidAvatar(emoji)}
                      className={`text-3xl p-2 rounded-xl transition-all ${
                        kidAvatar === emoji
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

              <motion.button
                onClick={handleAddKid}
                disabled={!kidName.trim()}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xl font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: kidName.trim() ? 1.02 : 1 }}
                whileTap={{ scale: kidName.trim() ? 0.98 : 1 }}
              >
                + Enlist Warrior
              </motion.button>

              {state.family && state.family.kids.length > 0 && (
                <motion.button
                  onClick={handleContinueToPetSelection}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-xl font-bold rounded-xl shadow-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next: Choose Companions
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {step === 'pet' && currentKidForPet && (
          <motion.div
            key="pet"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-8 w-full max-w-lg"
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">{currentKidForPet.avatar}</span>
                <span className="text-xl font-bold text-white">{currentKidForPet.name}</span>
              </div>
              <h2 className="text-2xl font-bold text-amber-400">
                Choose Your Companion
              </h2>
              <p className="text-slate-400 mt-2">
                Your companion will grow with your savings!
              </p>
            </div>

            {/* Pet Selection Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {PET_OPTIONS.map((pet) => (
                <motion.button
                  key={pet.type}
                  onClick={() => setSelectedPetType(pet.type)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPetType === pet.type
                      ? 'bg-amber-500/20 border-amber-500'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-4xl mb-2">{pet.emoji}</div>
                  <div className="font-semibold text-white">{pet.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{pet.description}</div>
                </motion.button>
              ))}
            </div>

            {/* Pet Name Input */}
            <div className="mb-6">
              <label className="block">
                <span className="text-slate-300 font-medium">Name Your Companion</span>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder={`My ${PET_OPTIONS.find(p => p.type === selectedPetType)?.name}`}
                  className="mt-2 block w-full px-4 py-3 border-2 border-slate-600 bg-slate-900 text-white rounded-xl focus:border-amber-500 focus:ring focus:ring-amber-500/20 transition-all text-lg"
                />
              </label>
            </div>

            {/* Pet Preview */}
            <div className="bg-slate-900/50 rounded-xl p-4 mb-6 text-center">
              <motion.div
                className="text-6xl mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🥚
              </motion.div>
              <p className="text-slate-400 text-sm">
                Your {PET_OPTIONS.find(p => p.type === selectedPetType)?.name} egg will hatch as you save money!
              </p>
            </div>

            <motion.button
              onClick={handleSelectPet}
              disabled={!petName.trim()}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-xl font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: petName.trim() ? 1.02 : 1 }}
              whileTap={{ scale: petName.trim() ? 0.98 : 1 }}
            >
              Adopt {petName || 'Companion'}!
            </motion.button>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              className="text-8xl"
              animate={{
                rotate: [0, 10, -10, 0],
                y: [0, -10, 0],
              }}
              transition={{ duration: 1, repeat: 2 }}
            >
              ⚔️
            </motion.div>
            <motion.h1
              className="mt-8 text-4xl font-bold text-amber-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Your Clan is Ready!
            </motion.h1>
            <motion.p
              className="mt-4 text-slate-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Time to start your wealth journey!
            </motion.p>
            <motion.div
              className="mt-4 flex justify-center gap-2 text-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {state.family?.kids.map(kid => (
                <span key={kid.id}>{kid.currentPet ? PET_OPTIONS.find(p => p.type === kid.currentPet?.type)?.emoji : '🥚'}</span>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

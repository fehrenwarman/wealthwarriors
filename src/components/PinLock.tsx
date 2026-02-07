import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

interface PinLockProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinLock({ onSuccess, onCancel }: PinLockProps) {
  const { state } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === state.family?.settings?.parentPin) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-xs shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Enter Command PIN</h3>
          <p className="text-sm text-slate-400 mt-1">4-digit PIN required</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-colors ${
                error
                  ? 'border-red-400 bg-red-500/10'
                  : pin.length > i
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-slate-600 bg-slate-900'
              }`}
              animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <span className="text-white">{pin.length > i && '•'}</span>
            </motion.div>
          ))}
        </div>

        {error && (
          <p className="text-center text-red-400 text-sm mb-4">Incorrect PIN</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'].map((key) => (
            <motion.button
              key={key}
              onClick={() => {
                if (key === '←') handleDelete();
                else if (key) handleDigit(key);
              }}
              className={`h-14 rounded-xl text-xl font-semibold transition-colors ${
                key === ''
                  ? 'invisible'
                  : key === '←'
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
              whileHover={{ scale: key ? 1.05 : 1 }}
              whileTap={{ scale: key ? 0.95 : 1 }}
              disabled={!key}
            >
              {key}
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={onCancel}
          className="w-full mt-4 py-2.5 text-slate-400 font-medium hover:text-slate-200 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cancel
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

interface PinSetupProps {
  onComplete: (pin: string) => void;
  onSkip: () => void;
}

export function PinSetup({ onComplete, onSkip }: PinSetupProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    const currentPin = step === 'enter' ? pin : confirmPin;
    const setCurrentPin = step === 'enter' ? setPin : setConfirmPin;

    if (currentPin.length < 4) {
      const newPin = currentPin + digit;
      setCurrentPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (step === 'enter') {
          setTimeout(() => setStep('confirm'), 300);
        } else {
          if (newPin === pin) {
            onComplete(pin);
          } else {
            setError(true);
            setTimeout(() => {
              setConfirmPin('');
              setError(false);
            }, 500);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 'enter') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
    setError(false);
  };

  const currentPin = step === 'enter' ? pin : confirmPin;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-xs shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">
            {step === 'enter' ? 'Set Command PIN' : 'Confirm PIN'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {step === 'enter' ? 'Enter a 4-digit PIN' : 'Enter the PIN again'}
          </p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-colors ${
                error
                  ? 'border-red-400 bg-red-500/10'
                  : currentPin.length > i
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-slate-600 bg-slate-900'
              }`}
              animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <span className="text-white">{currentPin.length > i && '•'}</span>
            </motion.div>
          ))}
        </div>

        {error && (
          <p className="text-center text-red-400 text-sm mb-4">PINs don't match</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'].map((key) => (
            <motion.button
              key={key}
              onClick={() => {
                if (key === '←') handleDelete();
                else if (key) handleDigit(key);
              }}
              className={`h-14 rounded-xl text-xl font-semibold transition-colors ${
                key === ''
                  ? 'invisible'
                  : key === '←'
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
              whileHover={{ scale: key ? 1.05 : 1 }}
              whileTap={{ scale: key ? 0.95 : 1 }}
              disabled={!key}
            >
              {key}
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={onSkip}
          className="w-full mt-4 py-2.5 text-slate-400 font-medium hover:text-slate-200 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Skip for now
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

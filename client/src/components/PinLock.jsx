import { useState } from 'react';
import { api } from '../utils/api.js';

/**
 * PIN entry screen. Shows on app load if no valid PIN in localStorage.
 * On success, stores PIN in localStorage and calls onUnlock().
 */
export default function PinLock({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleDigit = (digit) => {
    if (pin.length >= 8) return;
    const next = pin + digit;
    setPin(next);
    setError('');

    // Auto-submit at 4 digits
    if (next.length === 4) {
      submitPin(next);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const submitPin = async (value) => {
    setChecking(true);
    try {
      const result = await api.verifyPin(value);
      if (result.valid) {
        localStorage.setItem('dinomom_pin', value);
        onUnlock();
      } else {
        setError('PIN incorrecto');
        setPin('');
      }
    } catch {
      setError('Error de conexion');
      setPin('');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-8">
      {/* Mascot */}
      <img
        src="/assets/dino-pink.png"
        alt="DinoMom"
        className="w-24 h-24 object-contain mb-6 animate-[bob_3.5s_ease-in-out_infinite]"
      />

      <h1 className="font-fredoka text-2xl font-bold text-text-dark mb-1">DinoMom</h1>
      <p className="text-sm text-text-mid mb-8">Ingresa tu PIN para continuar</p>

      {/* PIN dots */}
      <div className="flex gap-3 mb-6">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all ${
              i < pin.length
                ? 'bg-blush-deep scale-110'
                : 'bg-blush/50 border-2 border-blush-deep/30'
            }`}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 font-semibold mb-4 animate-pulse">{error}</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) => {
          if (key === null) return <div key={i} />;
          if (key === 'del') {
            return (
              <button
                key={i}
                onClick={handleDelete}
                className="h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
              >
                <svg className="w-5 h-5 text-text-mid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(String(key))}
              disabled={checking}
              className="h-14 rounded-2xl bg-white font-fredoka text-xl font-bold text-text-dark shadow-sm active:scale-95 active:bg-blush/30 transition-all disabled:opacity-50"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

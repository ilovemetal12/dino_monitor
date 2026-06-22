import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';

export default function NewReading() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    position: 'sentada',
    arm: 'izquierdo',
    notes: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const systolic = Number(form.systolic);
    const diastolic = Number(form.diastolic);

    if (!systolic || !diastolic) {
      setError('Sistólica y diastólica son requeridas');
      return;
    }
    if (systolic < 60 || systolic > 250) {
      setError('Sistólica debe estar entre 60 y 250');
      return;
    }
    if (diastolic < 30 || diastolic > 150) {
      setError('Diastólica debe estar entre 30 y 150');
      return;
    }

    setSaving(true);
    try {
      await api.createReading({
        systolic,
        diastolic,
        pulse: form.pulse ? Number(form.pulse) : null,
        position: form.position,
        arm: form.arm,
        notes: form.notes || null
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 pt-5">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-text-mid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="font-fredoka text-xl font-bold text-text-dark">Nuevo Registro</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* BP Values */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-fredoka text-sm font-bold text-text-dark mb-4">Presión Arterial</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-[0.68rem] text-text-light font-semibold block mb-1">Sistólica</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.systolic}
                onChange={(e) => handleChange('systolic', e.target.value)}
                placeholder="120"
                className="w-full bg-cream rounded-xl px-4 py-3 text-center text-2xl font-fredoka font-bold text-text-dark outline-none focus:ring-2 focus:ring-blush-deep/30"
              />
            </div>
            <span className="text-2xl text-blush-deep font-fredoka pb-3">/</span>
            <div className="flex-1">
              <label className="text-[0.68rem] text-text-light font-semibold block mb-1">Diastólica</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.diastolic}
                onChange={(e) => handleChange('diastolic', e.target.value)}
                placeholder="80"
                className="w-full bg-cream rounded-xl px-4 py-3 text-center text-2xl font-fredoka font-bold text-text-dark outline-none focus:ring-2 focus:ring-blush-deep/30"
              />
            </div>
          </div>
        </div>

        {/* Pulse */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <label className="text-[0.68rem] text-text-light font-semibold block mb-1">Pulso (opcional)</label>
          <input
            type="number"
            inputMode="numeric"
            value={form.pulse}
            onChange={(e) => handleChange('pulse', e.target.value)}
            placeholder="72"
            className="w-full bg-cream rounded-xl px-4 py-3 text-lg font-semibold text-text-dark outline-none focus:ring-2 focus:ring-blush-deep/30"
          />
        </div>

        {/* Position & Arm */}
        <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <label className="text-[0.68rem] text-text-light font-semibold block mb-2">Posición</label>
            <div className="flex gap-2">
              {['sentada', 'acostada', 'de pie'].map(pos => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => handleChange('position', pos)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    form.position === pos
                      ? 'bg-blush-deep text-white shadow-sm'
                      : 'bg-cream text-text-mid'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[0.68rem] text-text-light font-semibold block mb-2">Brazo</label>
            <div className="flex gap-2">
              {['izquierdo', 'derecho'].map(arm => (
                <button
                  key={arm}
                  type="button"
                  onClick={() => handleChange('arm', arm)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    form.arm === arm
                      ? 'bg-blush-deep text-white shadow-sm'
                      : 'bg-cream text-text-mid'
                  }`}
                >
                  {arm}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <label className="text-[0.68rem] text-text-light font-semibold block mb-1">Notas (opcional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Ej: despues de caminar, con estres..."
            rows="2"
            className="w-full bg-cream rounded-xl px-4 py-3 text-sm text-text-dark outline-none resize-none focus:ring-2 focus:ring-blush-deep/30"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-semibold">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gradient-to-r from-blush-deep to-pink-deep text-white font-bold py-4 rounded-2xl shadow-lg shadow-blush-deep/30 hover:shadow-xl transition-all disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Registro'}
        </button>
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';

export default function History() {
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReadings({ limit: 100 })
      .then(data => setReadings(data.readings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este registro?')) return;
    try {
      await api.deleteReading(id);
      setReadings(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Group by date
  const grouped = readings.reduce((acc, r) => {
    // Normalize date: could be Date object, ISO string, or 'YYYY-MM-DD'
    const date = String(r.date).split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(r);
    return acc;
  }, {});

  return (
    <div className="px-5 pt-5">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-text-mid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="font-fredoka text-xl font-bold text-text-dark">Historial</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-3 border-blush-deep border-t-transparent rounded-full animate-spin" />
        </div>
      ) : readings.length === 0 ? (
        <div className="text-center py-16">
          <img src="/assets/dino-pink.png" alt="" className="w-20 mx-auto mb-4 opacity-50" />
          <p className="text-sm text-text-mid">Aun no tienes registros.</p>
          <p className="text-xs text-text-light mt-1">Registra tu primera lectura!</p>
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-xs font-bold text-text-light uppercase tracking-wide mb-2">
                {formatDate(date)}
              </h3>
              <div className="space-y-2">
                {items.map(reading => (
                  <div key={reading.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1">
                        <span className="font-fredoka text-xl font-bold text-text-dark">{reading.systolic}</span>
                        <span className="text-blush-deep font-fredoka">/</span>
                        <span className="font-fredoka text-lg text-text-mid">{reading.diastolic}</span>
                        <span className="text-[0.6rem] text-text-light ml-1">mmHg</span>
                      </div>
                      <div className="flex gap-3 mt-1 text-[0.68rem] text-text-light">
                        <span>{formatTime(reading.created_at)}</span>
                        {reading.pulse && <span>{reading.pulse} bpm</span>}
                        <span className="capitalize">{reading.position}</span>
                      </div>
                    </div>
                    <div className={`w-2 h-8 rounded-full ${getBarColor(reading.systolic, reading.diastolic)}`} />
                    <button onClick={() => handleDelete(reading.id)} className="text-text-light hover:text-red-400 transition-colors p-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getBarColor(sys, dia) {
  if (sys >= 160 || dia >= 110) return 'bg-red-600';
  if (sys >= 140 || dia >= 90) return 'bg-red-400';
  if (sys >= 130 || dia >= 80) return 'bg-yellow-400';
  if (sys < 90 || dia < 60) return 'bg-sky-deep';
  return 'bg-mint-deep';
}

function formatDate(dateStr) {
  if (!dateStr) return 'Fecha desconocida';
  // Handle both 'YYYY-MM-DD' and ISO formats
  const cleaned = String(dateStr).split('T')[0];
  const [year, month, day] = cleaned.split('-').map(Number);
  if (!year || !month || !day) return 'Fecha desconocida';
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  // Try parsing as-is first
  let date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // Fallback: extract HH:MM directly from string
    const match = String(dateStr).match(/(\d{2}):(\d{2})/);
    if (match) return `${match[1]}:${match[2]}`;
    return '';
  }
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

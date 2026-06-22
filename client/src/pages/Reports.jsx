import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';

export default function Reports() {
  const navigate = useNavigate();
  const [range, setRange] = useState('week');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [generating, setGenerating] = useState(false);

  const getDateRange = () => {
    const today = new Date();
    const to = today.toISOString().split('T')[0];

    if (range === 'day') {
      return { from: to, to };
    }
    if (range === 'week') {
      const from = new Date(today);
      from.setDate(from.getDate() - 7);
      return { from: from.toISOString().split('T')[0], to };
    }
    if (range === 'month') {
      const from = new Date(today);
      from.setMonth(from.getMonth() - 1);
      return { from: from.toISOString().split('T')[0], to };
    }
    return { from: customFrom, to: customTo };
  };

  const handleDownload = () => {
    const { from, to } = getDateRange();
    if (!from || !to) {
      alert('Selecciona las fechas del rango');
      return;
    }
    setGenerating(true);
    const url = api.getReportUrl(from, to);
    window.open(url, '_blank');
    setTimeout(() => setGenerating(false), 1000);
  };

  const handleWhatsApp = () => {
    const { from, to } = getDateRange();
    if (!from || !to) {
      alert('Selecciona las fechas del rango');
      return;
    }
    const url = `${window.location.origin}${api.getReportUrl(from, to)}`;
    const text = encodeURIComponent(`Reporte de presion arterial DinoMom (${from} a ${to}): ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="px-5 pt-5">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-text-mid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="font-fredoka text-xl font-bold text-text-dark">Reportes</h1>
      </header>

      {/* Range Selection */}
      <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
        <h3 className="font-fredoka text-sm font-bold text-text-dark mb-3">Periodo del Reporte</h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { key: 'day', label: 'Hoy' },
            { key: 'week', label: 'Semana' },
            { key: 'month', label: 'Mes' },
            { key: 'custom', label: 'Otro' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                range === key
                  ? 'bg-blush-deep text-white shadow-sm'
                  : 'bg-cream text-text-mid'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {range === 'custom' && (
          <div className="flex gap-3 mt-3">
            <div className="flex-1">
              <label className="text-[0.65rem] text-text-light font-semibold block mb-1">Desde</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full bg-cream rounded-xl px-3 py-2 text-xs text-text-dark outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-[0.65rem] text-text-light font-semibold block mb-1">Hasta</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full bg-cream rounded-xl px-3 py-2 text-xs text-text-dark outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleDownload}
          disabled={generating}
          className="w-full bg-gradient-to-r from-blush-deep to-pink-deep text-white font-bold py-4 rounded-2xl shadow-lg shadow-blush-deep/30 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {generating ? 'Generando...' : 'Descargar PDF'}
        </button>

        <button
          onClick={handleWhatsApp}
          className="w-full bg-[#25d366] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#25d366]/30 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
          Compartir por WhatsApp
        </button>
      </div>

      {/* Info */}
      <p className="text-center text-[0.68rem] text-text-light mt-4">
        El PDF incluye un resumen y el detalle de todos los registros en el periodo seleccionado.
      </p>
    </div>
  );
}

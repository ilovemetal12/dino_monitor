import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import BpCard from '../components/BpCard.jsx';
import WeekTracker from '../components/WeekTracker.jsx';
import TrendChart from '../components/TrendChart.jsx';
import TodayStatus from '../components/TodayStatus.jsx';

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSummary(), api.getCurrentWeek()])
      .then(([summaryData, weekData]) => {
        setSummary(summaryData);
        setWeek(weekData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blush-deep border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-5">
      {/* Header */}
      <header className="flex justify-between items-center mb-5">
        <div>
          <h2 className="font-fredoka text-xl font-bold text-text-dark">Hola, Dinomamá</h2>
          <p className="text-xs text-text-light">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <img src="/assets/dino-pink.png" alt="DinoMom" className="w-11 h-11 object-contain" />
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#fff0f5] via-[#fce4ec] to-[#fff8e1] rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden border border-blush/30 mb-5">
        <img
          src="/assets/dino-pink.png"
          alt="DinoMom"
          className="w-20 h-20 object-contain drop-shadow-lg animate-[bob_3.5s_ease-in-out_infinite]"
        />
        <div className="flex-1 relative z-10">
          <h1 className="font-fredoka text-lg font-bold text-text-dark leading-tight">
            {getGreeting()}
          </h1>
          <p className="text-xs text-text-mid mt-1 leading-relaxed">
            {getMotivation(summary)}
          </p>
        </div>
      </section>

      {/* Today Status */}
      <TodayStatus summary={summary} />

      {/* BP Card */}
      {summary?.last_reading && <BpCard reading={summary.last_reading} classification={summary.classification} />}

      {/* Week Tracker */}
      {week && <WeekTracker week={week} />}

      {/* Trend Chart */}
      {summary?.daily_readings?.length > 0 && <TrendChart data={summary.daily_readings} />}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mt-5 mb-5">
        <Link to="/nueva" className="bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="w-11 h-11 rounded-xl bg-blush flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-pink-deep" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <h4 className="font-fredoka text-sm text-text-dark">Nuevo Registro</h4>
          <p className="text-[0.68rem] text-text-light">Registrar PA ahora</p>
        </Link>
        <Link to="/reportes" className="bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="w-11 h-11 rounded-xl bg-mint flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <h4 className="font-fredoka text-sm text-text-dark">Reportes</h4>
          <p className="text-[0.68rem] text-text-light">Exportar PDF</p>
        </Link>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días, Dinomamá!';
  if (hour < 18) return 'Buenas tardes, Dinomamá!';
  return 'Buenas noches, Dinomamá!';
}

function getMotivation(summary) {
  if (!summary?.last_reading) return 'Registra tu primera lectura del día para empezar.';
  if (summary.classification === 'normal') return 'Tus lecturas van muy bien esta semana. Sigue así!';
  if (summary.classification === 'elevada') return 'Tu presión está un poco elevada. Recuerda descansar y hablar con tu doctor.';
  if (summary.classification === 'alta') return 'Tu presión está alta. Por favor contacta a tu médico lo antes posible.';
  return 'Recuerda tomar tus lecturas hoy.';
}

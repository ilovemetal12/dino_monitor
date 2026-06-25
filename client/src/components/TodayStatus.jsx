import { Link } from 'react-router-dom';

export default function TodayStatus({ summary }) {
  const count = summary?.today?.count || 0;
  const minimum = 3;
  const isComplete = count >= minimum;

  return (
    <div className={`rounded-2xl p-4 flex items-center gap-3 mb-2 ${isComplete ? 'bg-mint/50 border border-mint-deep/30' : 'bg-blush/50 border border-blush-deep/30'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete ? 'bg-mint-deep/20' : 'bg-blush-deep/20'}`}>
        {isComplete ? (
          <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-pink-deep" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-text-dark">
          {isComplete ? 'Meta del dia cumplida!' : `Registros hoy: ${count}/${minimum}`}
        </p>
        <p className="text-[0.68rem] text-text-mid">
          {isComplete
            ? `${count} registros hoy. Excelente, Dinomamá!`
            : `Te faltan ${minimum - count} registro(s) para hoy.`
          }
        </p>
      </div>
      {!isComplete && (
        <Link to="/nueva" className="bg-blush-deep text-white text-[0.68rem] font-bold px-3 py-1.5 rounded-xl">
          Registrar
        </Link>
      )}
    </div>
  );
}

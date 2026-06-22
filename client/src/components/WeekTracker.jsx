export default function WeekTracker({ week }) {
  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm mt-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-fredoka text-base font-bold text-text-dark">Tu Viaje</h3>
        <span className="text-[0.7rem] text-white bg-gradient-to-r from-blush-deep to-pink-deep px-2.5 py-1 rounded-xl font-bold">
          Semana {week.week}
        </span>
      </div>

      {/* Progress bar */}
      <div className="bg-blush rounded-xl h-3.5 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blush-deep via-pink-deep to-blush-deep rounded-xl relative"
          style={{ width: `${week.progress}%` }}
        >
          <div className="absolute top-1 left-2 right-2 h-1 bg-white/40 rounded" />
        </div>
      </div>

      <div className="flex justify-between mt-2 text-[0.68rem] text-text-light">
        <span>1er Trimestre</span>
        <span className="font-bold text-text-dark">Trimestre {week.trimester}</span>
        <span>Fecha parto</span>
      </div>

      {/* Baby size comparison */}
      <div className="mt-4 p-3 bg-peach rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
            <ellipse cx="20" cy="22" rx="12" ry="14" fill="#fff8e1" stroke="#ffcc80" strokeWidth="1.5" />
            <ellipse cx="20" cy="22" rx="8" ry="10" fill="none" stroke="#ffcc80" strokeWidth="0.8" strokeDasharray="3 2" />
            <circle cx="17" cy="19" r="1.5" fill="#8d6e63" />
            <circle cx="23" cy="19" r="1.5" fill="#8d6e63" />
            <path d="M18 24 Q20 26 22 24" stroke="#8d6e63" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-mid leading-relaxed">
            Tu bebito dino mide <strong className="text-text-dark">{week.baby.size}</strong> — como{' '}
            <strong className="text-text-dark">{week.baby.comparison}</strong>
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-text-mid mt-3 leading-relaxed italic">
        {week.baby.description}
      </p>

      {/* Days remaining */}
      <div className="mt-3 text-center">
        <span className="text-[0.7rem] text-text-light">
          Faltan <strong className="text-text-dark">{week.days_remaining} días</strong> para conocer a tu dino bebé
        </span>
      </div>
    </section>
  );
}

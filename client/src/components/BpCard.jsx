export default function BpCard({ reading, classification }) {
  const classLabels = {
    normal: { text: 'Normal', bg: 'bg-mint', color: 'text-green-600', dot: 'bg-mint-deep' },
    elevada: { text: 'Elevada', bg: 'bg-yellow-50', color: 'text-yellow-700', dot: 'bg-yellow-400' },
    alta: { text: 'Alta', bg: 'bg-red-50', color: 'text-red-600', dot: 'bg-red-400' },
    baja: { text: 'Baja', bg: 'bg-sky', color: 'text-blue-600', dot: 'bg-sky-deep' },
  };

  const badge = classLabels[classification] || classLabels.normal;

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm relative overflow-hidden mt-5">
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mint-deep via-blush-deep to-sky-deep rounded-t-3xl" />

      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-text-light font-semibold">Última Lectura</span>
        <div className={`flex items-center gap-1.5 ${badge.bg} px-3 py-1 rounded-full`}>
          <div className={`w-2 h-2 ${badge.dot} rounded-full animate-pulse`} />
          <span className={`text-[0.7rem] font-bold ${badge.color}`}>{badge.text}</span>
        </div>
      </div>

      <div className="text-center my-3">
        <div className="font-fredoka text-5xl font-bold text-text-dark leading-none">
          {reading.systolic}
          <span className="text-blush-deep font-normal mx-0.5">/</span>
          <span className="text-3xl text-text-mid font-semibold">{reading.diastolic}</span>
        </div>
        <p className="text-[0.7rem] text-text-light mt-2 uppercase tracking-wider">mmHg</p>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-cream -mx-6 -mb-6 px-6 py-4 rounded-b-3xl mt-4">
        <Detail icon="heart" label="Pulso" value={reading.pulse ? `${reading.pulse} bpm` : '--'} bgColor="bg-blush" iconColor="text-pink-deep" />
        <Detail icon="clock" label="Hora" value={formatTime(reading.created_at)} bgColor="bg-sky" iconColor="text-sky-deep" />
        <Detail icon="position" label="Posición" value={reading.position || '--'} bgColor="bg-mint" iconColor="text-green-500" />
      </div>
    </section>
  );
}

function Detail({ icon, label, value, bgColor, iconColor }) {
  return (
    <div className="text-center">
      <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center mx-auto mb-1`}>
        <DetailIcon icon={icon} className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className="text-[0.6rem] text-text-light uppercase tracking-wide">{label}</p>
      <p className="text-xs font-bold text-text-dark">{value}</p>
    </div>
  );
}

function DetailIcon({ icon, className }) {
  if (icon === 'heart') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  if (icon === 'clock') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

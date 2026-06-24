export default function TrendChart({ data }) {
  if (!data || data.length === 0) return null;

  // Scale values to fit SVG viewbox
  const width = 300;
  const height = 100;
  const padding = 10;
  const chartWidth = width - padding * 2;
  const chartHeight = height - 30;

  // Get min/max for scaling
  const allSystolic = data.map(d => d.avg_systolic);
  const allDiastolic = data.map(d => d.avg_diastolic);
  const maxVal = Math.max(...allSystolic, 140);
  const minVal = Math.min(...allDiastolic, 60);
  const range = maxVal - minVal || 1;

  const scaleY = (val) => chartHeight - ((val - minVal) / range) * (chartHeight - 10) + 5;
  const scaleX = (i) => padding + (i / Math.max(data.length - 1, 1)) * chartWidth;

  const systolicPoints = data.map((d, i) => `${scaleX(i)},${scaleY(d.avg_systolic)}`).join(' ');
  const diastolicPoints = data.map((d, i) => `${scaleX(i)},${scaleY(d.avg_diastolic)}`).join(' ');

  // Create smooth path
  const makePath = (points) => {
    const pts = points.split(' ').map(p => p.split(',').map(Number));
    if (pts.length < 2) return `M${pts[0][0]},${pts[0][1]}`;
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const cp1x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) / 3;
      const cp2x = pts[i][0] - (pts[i][0] - pts[i - 1][0]) / 3;
      d += ` C${cp1x},${pts[i - 1][1]} ${cp2x},${pts[i][1]} ${pts[i][0]},${pts[i][1]}`;
    }
    return d;
  };

  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm mt-5">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-fredoka text-base font-bold text-text-dark">Tendencia Semanal</h3>
        <div className="flex gap-1.5">
          <span className="text-[0.6rem] px-2 py-0.5 rounded-lg font-bold bg-blush text-text-dark">7D</span>
        </div>
      </div>

      <div className="flex gap-3 mt-2 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blush-deep" />
          <span className="text-[0.65rem] text-text-light">Sistólica</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-mint-deep" />
          <span className="text-[0.65rem] text-text-light">Diastólica</span>
        </div>
      </div>

      <div className="h-[120px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1={padding} y1={scaleY(120)} x2={width - padding} y2={scaleY(120)} stroke="#fce4ec" strokeWidth="0.8" />
          <line x1={padding} y1={scaleY(90)} x2={width - padding} y2={scaleY(90)} stroke="#fce4ec" strokeWidth="0.8" />

          {/* Lines */}
          <path d={makePath(systolicPoints)} fill="none" stroke="#ffb6c8" strokeWidth="2.5" strokeLinecap="round" />
          <path d={makePath(diastolicPoints)} fill="none" stroke="#a8e6cf" strokeWidth="2.5" strokeLinecap="round" />

          {/* Points */}
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={scaleX(i)} cy={scaleY(d.avg_systolic)} r="3.5" fill="#ffb6c8" />
              <circle cx={scaleX(i)} cy={scaleY(d.avg_diastolic)} r="3.5" fill="#a8e6cf" />
            </g>
          ))}

          {/* Day labels */}
          {data.map((d, i) => (
            <text key={i} x={scaleX(i)} y={height - 2} fill="#b89a9d" fontSize="8" textAnchor="middle" fontFamily="Nunito">
              {(() => {
                const cleaned = String(d.date).split('T')[0];
                const [y, m, day] = cleaned.split('-').map(Number);
                const dateObj = new Date(y, m - 1, day);
                return days[dateObj.getDay()] || days[i % 7];
              })()}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}

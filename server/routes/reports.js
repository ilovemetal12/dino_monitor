/**
 * PDF report generation routes.
 * Generates themed blood pressure reports for a given date range.
 */

import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

/** DinoMom color palette */
const C = {
  pink: '#ffb6c8',
  pinkDark: '#ff8fab',
  pinkLight: '#fff0f5',
  blush: '#ffe4ec',
  mint: '#a8e6cf',
  cream: '#fffcf7',
  textDark: '#3d2c2e',
  textMid: '#7a6062',
  textLight: '#b89a9d',
  white: '#ffffff',
  rowAlt: '#fef9f5'
};

/** BP classification */
function classifyReading(sys, dia) {
  if (sys >= 160 || dia >= 110) return 'muy_alta';
  if (sys >= 140 || dia >= 90) return 'alta';
  if (sys >= 130 || dia >= 80) return 'elevada';
  if (sys < 90 || dia < 60) return 'baja';
  return 'normal';
}

const STATUS = {
  muy_alta: { label: 'Muy Alta', color: '#dc2626', rowBg: '#fee2e2' },
  alta: { label: 'Alta', color: '#ef4444', rowBg: '#fef2f2' },
  elevada: { label: 'Elevada', color: '#ca8a04', rowBg: '#fefce8' },
  normal: { label: 'Normal', color: '#16a34a', rowBg: null },
  baja: { label: 'Baja', color: '#2563eb', rowBg: '#eff6ff' }
};

export default function reportsRouter(db) {
  const router = Router();

  router.get('/pdf', async (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Se requieren fechas "from" y "to"' });
    }

    const { rows: readings } = await db.query(
      'SELECT * FROM readings WHERE date >= $1 AND date <= $2 ORDER BY created_at ASC',
      [from, to]
    );

    const { rows: [stats] } = await db.query(`
      SELECT ROUND(AVG(systolic)::numeric,1) as avg_systolic, ROUND(AVG(diastolic)::numeric,1) as avg_diastolic,
             ROUND(AVG(pulse)::numeric,1) as avg_pulse, MAX(systolic) as max_systolic,
             MIN(systolic) as min_systolic, MAX(diastolic) as max_diastolic,
             MIN(diastolic) as min_diastolic, COUNT(*)::int as total
      FROM readings WHERE date >= $1 AND date <= $2
    `, [from, to]);

    // Get pregnancy week
    const { rows: settingsRows } = await db.query("SELECT value FROM settings WHERE key = 'due_date'");
    const dueDate = settingsRows[0]?.value || '2027-01-29';
    const daysRemaining = Math.floor((parseISO(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor((280 - daysRemaining) / 7);

    // --- Build PDF ---
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=dinomom-reporte-${from}-${to}.pdf`);
    doc.pipe(res);

    const pw = doc.page.width;
    const cw = pw - 80; // content width

    // ===== HEADER =====
    doc.rect(0, 0, pw, 125).fill(C.pinkLight);
    doc.rect(0, 0, pw, 4).fill(C.pinkDark);

    doc.fontSize(26).font('Helvetica-Bold').fillColor(C.textDark).text('DinoMom', 50, 28);
    doc.fontSize(10).font('Helvetica').fillColor(C.textMid).text('Reporte de Presión Arterial', 50, 58);

    const fromFmt = format(parseISO(from), "d 'de' MMMM yyyy", { locale: es });
    const toFmt = format(parseISO(to), "d 'de' MMMM yyyy", { locale: es });
    doc.fontSize(9).fillColor(C.textMid);
    doc.text(`Período: ${fromFmt} — ${toFmt}`, 50, 78);
    doc.text(`Generado: ${formatInTimeZone(new Date(), 'America/Mexico_City', "d 'de' MMMM yyyy, HH:mm", { locale: es })}`, 50, 92);
    doc.text(`Semana ${currentWeek} de embarazo`, 50, 106);

    // ===== SUMMARY =====
    let y = 145;
    doc.rect(40, y, cw, 100).fill(C.white);
    doc.rect(40, y, cw, 100).lineWidth(1).stroke(C.blush);
    doc.rect(40, y, 4, 100).fill(C.pinkDark);

    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.textDark).text('Resumen del Período', 56, y + 12);

    if (stats.total > 0) {
      doc.fontSize(9).font('Helvetica').fillColor(C.textMid);
      doc.text(`Total de registros: ${stats.total}`, 56, y + 32);
      doc.text(`Sistólica promedio: ${stats.avg_systolic} mmHg  (mín: ${stats.min_systolic} / máx: ${stats.max_systolic})`, 56, y + 48);
      doc.text(`Diastólica promedio: ${stats.avg_diastolic} mmHg  (mín: ${stats.min_diastolic} / máx: ${stats.max_diastolic})`, 56, y + 64);
      doc.text(`Pulso promedio: ${stats.avg_pulse || 'N/A'} bpm`, 56, y + 80);
    } else {
      doc.fontSize(9).font('Helvetica').fillColor(C.textMid).text('No hay registros en este período.', 56, y + 32);
    }

    // ===== LEGEND =====
    y += 115;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(C.textDark).text('Clasificación:', 40, y);
    let lx = 115;
    doc.font('Helvetica').fontSize(7);
    for (const [, { label, color }] of Object.entries(STATUS)) {
      doc.circle(lx + 3, y + 4, 3).fill(color);
      doc.fillColor(C.textMid).text(label, lx + 9, y);
      lx += 75;
    }

    // ===== TABLE =====
    if (readings.length > 0) {
      y += 22;
      doc.fontSize(11).font('Helvetica-Bold').fillColor(C.textDark).text('Detalle de Registros', 40, y);
      y += 20;

      const drawHeader = (yPos) => {
        doc.rect(40, yPos, cw, 22).fill(C.blush);
        doc.fontSize(8).font('Helvetica-Bold').fillColor(C.textDark);
        doc.text('Fecha', 50, yPos + 7);
        doc.text('Hora', 125, yPos + 7);
        doc.text('Sist.', 190, yPos + 7);
        doc.text('Diast.', 240, yPos + 7);
        doc.text('Pulso', 300, yPos + 7);
        doc.text('Brazo', 360, yPos + 7);
        doc.text('Posición', 420, yPos + 7);
        doc.text('Estado', 490, yPos + 7);
        return yPos + 22;
      };

      y = drawHeader(y);

      doc.font('Helvetica').fontSize(8);
      for (let i = 0; i < readings.length; i++) {
        if (y > doc.page.height - 50) {
          doc.addPage();
          y = 40;
          y = drawHeader(y);
          doc.font('Helvetica').fontSize(8);
        }

        const r = readings[i];
        const cls = classifyReading(r.systolic, r.diastolic);
        const st = STATUS[cls];
        const bg = st.rowBg || (i % 2 === 0 ? C.white : C.rowAlt);

        doc.rect(40, y, cw, 19).fill(bg);

        // Parse time safely
        let rDate = '--';
        let rTime = '--';
        try {
          const dt = new Date(r.created_at);
          if (!isNaN(dt.getTime())) {
            rDate = formatInTimeZone(dt, 'America/Mexico_City', 'dd/MM/yyyy');
            rTime = formatInTimeZone(dt, 'America/Mexico_City', 'HH:mm');
          }
        } catch { /* fallback to -- */ }

        doc.fillColor(C.textMid);
        doc.text(rDate, 50, y + 5);
        doc.text(rTime, 125, y + 5);

        // Color-code BP values if abnormal
        doc.fillColor(cls === 'normal' ? C.textDark : st.color);
        doc.text(`${r.systolic}`, 190, y + 5);
        doc.text(`${r.diastolic}`, 240, y + 5);

        doc.fillColor(C.textMid);
        doc.text(`${r.pulse || '—'}`, 300, y + 5);
        doc.text(r.arm || '—', 360, y + 5);
        doc.text(r.position || '—', 420, y + 5);

        // Status dot + label
        doc.circle(494, y + 10, 3).fill(st.color);
        doc.fillColor(C.textMid).fontSize(7).text(st.label, 500, y + 6);
        doc.fontSize(8);

        y += 19;
      }
    }

    // ===== FOOTER =====
    const fy = doc.page.height - 25;
    doc.fontSize(7).fillColor(C.textLight).text(
      'DinoMom — Monitor de Presión Arterial para Embarazo',
      40, fy, { align: 'center', width: cw }
    );

    doc.end();
  });

  return router;
}

/**
 * PDF report generation routes.
 * Generates themed blood pressure reports for a given date range.
 * Reports include summary statistics and a detailed readings table.
 */

import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/** DinoMom color palette for PDF theming */
const COLORS = {
  pink: '#ffb6c8',
  pinkDark: '#ff8fab',
  pinkLight: '#fff0f5',
  blush: '#ffe4ec',
  mint: '#a8e6cf',
  mintLight: '#e8faf0',
  cream: '#fffcf7',
  peach: '#fff0e8',
  textDark: '#3d2c2e',
  textMid: '#7a6062',
  textLight: '#b89a9d',
  white: '#ffffff',
  rowAlt: '#fef9f5',
  redBg: '#fff5f5',
  yellowBg: '#fffde7',
  greenBg: '#f0fdf4'
};

/**
 * Classifies a reading for color-coding in the PDF table.
 */
function classifyReading(systolic, diastolic) {
  if (systolic >= 160 || diastolic >= 110) return 'muy_alta';
  if (systolic >= 140 || diastolic >= 90) return 'alta';
  if (systolic >= 130 || diastolic >= 80) return 'elevada';
  if (systolic < 90 || diastolic < 60) return 'baja';
  return 'normal';
}

function getRowBg(classification, index) {
  switch (classification) {
    case 'muy_alta': return '#ffe0e0';
    case 'alta': return '#fff0f0';
    case 'elevada': return '#fffde7';
    case 'baja': return '#e8f4fd';
    default: return index % 2 === 0 ? COLORS.white : COLORS.rowAlt;
  }
}

export default function reportsRouter(db) {
  const router = Router();

  /**
   * GET /pdf - Generate a PDF report for a date range.
   * Query params: from (YYYY-MM-DD), to (YYYY-MM-DD)
   */
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

    // Get week info for context
    const { rows: settingsRows } = await db.query("SELECT value FROM settings WHERE key = 'due_date'");
    const dueDate = settingsRows[0]?.value || '2027-01-29';
    const dueDateObj = parseISO(dueDate);
    const today = new Date();
    const daysRemaining = Math.floor((dueDateObj - today) / (1000 * 60 * 60 * 24));
    const daysElapsed = 280 - daysRemaining;
    const currentWeek = Math.floor(daysElapsed / 7);

    // --- Build PDF ---
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      info: { Title: 'DinoMom - Reporte de Presión Arterial', Author: 'DinoMom App' }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=dinomom-reporte-${from}-${to}.pdf`);
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - 80;

    // ==========================================
    // HEADER - Gradient-style banner
    // ==========================================
    doc.rect(0, 0, pageWidth, 130).fill(COLORS.pinkLight);
    // Decorative circles
    doc.circle(pageWidth - 40, 30, 60).fill('rgba(255,182,200,0.2)');
    doc.circle(60, 100, 40).fill('rgba(168,230,207,0.15)');

    // Top accent bar
    doc.rect(0, 0, pageWidth, 4).fill(COLORS.pinkDark);

    // Title
    doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.textDark).text('DinoMom', 50, 30);
    doc.fontSize(11).font('Helvetica').fillColor(COLORS.textMid).text('Reporte de Presión Arterial', 50, 62);

    // Date info
    const fromFmt = format(parseISO(from), "d 'de' MMMM, yyyy", { locale: es });
    const toFmt = format(parseISO(to), "d 'de' MMMM, yyyy", { locale: es });
    doc.fontSize(9).fillColor(COLORS.textMid);
    doc.text(`Período: ${fromFmt} — ${toFmt}`, 50, 85);
    doc.text(`Generado: ${format(new Date(), "d 'de' MMMM, yyyy — HH:mm", { locale: es })}`, 50, 99);
    doc.text(`Semana ${currentWeek} de embarazo`, 50, 113);

    // ==========================================
    // SUMMARY SECTION
    // ==========================================
    const summaryY = 150;
    doc.roundedRect(40, summaryY, contentWidth, 105, 14).fill(COLORS.white).stroke(COLORS.blush);

    // Section title with pink accent
    doc.rect(40, summaryY, 5, 105).fill(COLORS.pinkDark);
    doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.textDark).text('Resumen del Período', 60, summaryY + 14);

    if (stats.total > 0) {
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.textMid);
      doc.text(`Total de registros: ${stats.total}`, 60, summaryY + 36);
      doc.text(`Sistólica promedio: ${stats.avg_systolic} mmHg  (mín: ${stats.min_systolic} / máx: ${stats.max_systolic})`, 60, summaryY + 52);
      doc.text(`Diastólica promedio: ${stats.avg_diastolic} mmHg  (mín: ${stats.min_diastolic} / máx: ${stats.max_diastolic})`, 60, summaryY + 68);
      doc.text(`Pulso promedio: ${stats.avg_pulse || 'N/A'} bpm`, 60, summaryY + 84);
    } else {
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.textMid).text('No hay registros en este período.', 60, summaryY + 36);
    }

    // ==========================================
    // CLASSIFICATION LEGEND
    // ==========================================
    const legendY = summaryY + 120;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.textDark).text('Clasificación:', 40, legendY);
    doc.font('Helvetica').fontSize(7).fillColor(COLORS.textMid);

    const legends = [
      { color: '#dc2626', label: 'Muy Alta (≥160/≥110)' },
      { color: '#ef4444', label: 'Alta (≥140/≥90)' },
      { color: '#eab308', label: 'Elevada (≥130/≥80)' },
      { color: '#22c55e', label: 'Normal (90-129/60-79)' },
      { color: '#3b82f6', label: 'Baja (<90/<60)' },
    ];

    let legendX = 120;
    for (const { color, label } of legends) {
      doc.circle(legendX, legendY + 4, 3).fill(color);
      doc.fillColor(COLORS.textMid).text(label, legendX + 6, legendY, { continued: false });
      legendX += 95;
    }

    // ==========================================
    // READINGS TABLE
    // ==========================================
    if (readings.length > 0) {
      let y = legendY + 25;

      // Section title
      doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.textDark).text('Detalle de Registros', 40, y);
      y += 22;

      // Table header
      doc.roundedRect(40, y, contentWidth, 24, 6).fill(COLORS.blush);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.textDark);
      doc.text('Fecha', 52, y + 7);
      doc.text('Hora', 130, y + 7);
      doc.text('Sist.', 200, y + 7);
      doc.text('Diast.', 260, y + 7);
      doc.text('Pulso', 330, y + 7);
      doc.text('Posición', 400, y + 7);
      doc.text('Estado', 470, y + 7);
      y += 24;

      // Table rows
      doc.font('Helvetica').fontSize(8);
      for (let i = 0; i < readings.length; i++) {
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = 40;
          // Repeat header on new page
          doc.roundedRect(40, y, contentWidth, 24, 6).fill(COLORS.blush);
          doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.textDark);
          doc.text('Fecha', 52, y + 7);
          doc.text('Hora', 130, y + 7);
          doc.text('Sist.', 200, y + 7);
          doc.text('Diast.', 260, y + 7);
          doc.text('Pulso', 330, y + 7);
          doc.text('Posición', 400, y + 7);
          doc.text('Estado', 470, y + 7);
          y += 24;
          doc.font('Helvetica').fontSize(8);
        }

        const reading = readings[i];
        const classification = classifyReading(reading.systolic, reading.diastolic);
        const rowBg = getRowBg(classification, i);

        doc.rect(40, y, contentWidth, 20).fill(rowBg);
        doc.fillColor(COLORS.textMid);

        const createdAt = reading.created_at instanceof Date ? reading.created_at : new Date(reading.created_at);
        const rDate = format(createdAt, 'dd/MM/yyyy', { locale: es });
        const rTime = format(createdAt, 'HH:mm', { locale: es });

        doc.text(rDate, 52, y + 6);
        doc.text(rTime, 130, y + 6);

        // Color-code the values based on classification
        if (classification === 'muy_alta' || classification === 'alta') {
          doc.fillColor('#dc2626');
        } else if (classification === 'elevada') {
          doc.fillColor('#b45309');
        } else if (classification === 'baja') {
          doc.fillColor('#2563eb');
        } else {
          doc.fillColor(COLORS.textDark);
        }
        doc.text(`${reading.systolic}`, 200, y + 6);
        doc.text(`${reading.diastolic}`, 260, y + 6);

        doc.fillColor(COLORS.textMid);
        doc.text(`${reading.pulse || '—'}`, 330, y + 6);
        doc.text(reading.position || '—', 400, y + 6);

        // Status indicator
        const statusLabels = {
          muy_alta: 'Muy Alta',
          alta: 'Alta',
          elevada: 'Elevada',
          normal: 'Normal',
          baja: 'Baja'
        };
        const statusColors = {
          muy_alta: '#dc2626',
          alta: '#ef4444',
          elevada: '#eab308',
          normal: '#22c55e',
          baja: '#3b82f6'
        };
        doc.circle(472, y + 10, 3).fill(statusColors[classification]);
        doc.fillColor(COLORS.textMid).text(statusLabels[classification], 478, y + 6);

        y += 20;
      }
    }

    // ==========================================
    // FOOTER - Branding
    // ==========================================
    const footerY = doc.page.height - 30;
    doc.fontSize(7).fillColor(COLORS.textLight).text(
      'DinoMom — Monitor de Presión Arterial para Embarazo',
      40, footerY,
      { align: 'center', width: contentWidth }
    );

    doc.end();
  });

  return router;
}

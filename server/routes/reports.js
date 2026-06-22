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
  headerBg: '#fff0f5',
  rowAlt: '#fef9f5',
  textDark: '#3d2c2e',
  textMid: '#7a6062'
};

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

    // --- Build PDF ---
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: { Title: 'DinoMom - Reporte de Presion Arterial', Author: 'DinoMom App' }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=dinomom-reporte-${from}-${to}.pdf`);
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 120).fill(COLORS.headerBg);
    doc.fontSize(24).font('Helvetica-Bold').fillColor(COLORS.textDark).text('DinoMom', 50, 35);
    doc.fontSize(10).font('Helvetica').fillColor(COLORS.textMid).text('Reporte de Presion Arterial', 50, 62);

    const fromFmt = format(parseISO(from), "d 'de' MMMM, yyyy", { locale: es });
    const toFmt = format(parseISO(to), "d 'de' MMMM, yyyy", { locale: es });
    doc.fontSize(9).text(`Periodo: ${fromFmt} - ${toFmt}`, 50, 80);
    doc.text(`Generado: ${format(new Date(), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}`, 50, 94);

    // Summary box
    doc.roundedRect(50, 140, doc.page.width - 100, 90, 12).fill('#ffffff').stroke(COLORS.pink);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.textDark).text('Resumen', 70, 155);

    if (stats.total > 0) {
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.textMid);
      doc.text(`Total de registros: ${stats.total}`, 70, 175);
      doc.text(`Sistolica promedio: ${stats.avg_systolic} mmHg (min: ${stats.min_systolic}, max: ${stats.max_systolic})`, 70, 190);
      doc.text(`Diastolica promedio: ${stats.avg_diastolic} mmHg (min: ${stats.min_diastolic}, max: ${stats.max_diastolic})`, 70, 205);
      doc.text(`Pulso promedio: ${stats.avg_pulse || 'N/A'} bpm`, 70, 220);
    } else {
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.textMid).text('No hay registros en este periodo.', 70, 175);
    }

    // Readings table
    if (readings.length > 0) {
      let y = 260;
      doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.textDark).text('Detalle de Registros', 50, y);
      y += 25;

      // Table header
      doc.rect(50, y, doc.page.width - 100, 22).fill(COLORS.headerBg);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.textDark);
      doc.text('Fecha', 60, y + 6);
      doc.text('Hora', 150, y + 6);
      doc.text('Sistolica', 220, y + 6);
      doc.text('Diastolica', 290, y + 6);
      doc.text('Pulso', 370, y + 6);
      doc.text('Posicion', 430, y + 6);
      y += 22;

      // Table rows
      doc.font('Helvetica').fontSize(8).fillColor(COLORS.textMid);
      for (let i = 0; i < readings.length; i++) {
        if (y > doc.page.height - 80) { doc.addPage(); y = 50; }

        const reading = readings[i];
        doc.rect(50, y, doc.page.width - 100, 18).fill(i % 2 === 0 ? '#ffffff' : COLORS.rowAlt);
        doc.fillColor(COLORS.textMid);

        const createdAt = reading.created_at instanceof Date ? reading.created_at : new Date(reading.created_at);
        const rDate = format(createdAt, 'dd/MM/yyyy', { locale: es });
        const rTime = format(createdAt, 'HH:mm', { locale: es });

        doc.text(rDate, 60, y + 5);
        doc.text(rTime, 150, y + 5);
        doc.text(`${reading.systolic}`, 220, y + 5);
        doc.text(`${reading.diastolic}`, 290, y + 5);
        doc.text(`${reading.pulse || '-'}`, 370, y + 5);
        doc.text(reading.position || '-', 430, y + 5);
        y += 18;
      }
    }

    // Footer
    doc.fontSize(7).fillColor(COLORS.textMid).text(
      'Este reporte es solo informativo. Consulte siempre a su medico para interpretar los resultados.',
      50, doc.page.height - 40,
      { align: 'center', width: doc.page.width - 100 }
    );

    doc.end();
  });

  return router;
}

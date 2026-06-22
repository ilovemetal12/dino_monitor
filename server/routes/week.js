/**
 * Pregnancy week tracking routes.
 * Calculates gestational age from the stored due date and provides
 * baby size comparisons in Spanish with dino-themed descriptions.
 */

import { Router } from 'express';
import { differenceInDays, parseISO } from 'date-fns';

/** Total pregnancy duration in days (40 weeks) */
const PREGNANCY_DAYS = 280;

/**
 * Baby size data per week.
 * Each entry has: size (cm), comparison (fruit/veggie), description (dino-themed, Spanish).
 */
const BABY_SIZES = {
  4: { size: '0.1 cm', comparison: 'una semilla de amapola', description: 'Tu bebito dino apenas es un puntito, como una semillita que empieza a crecer.' },
  5: { size: '0.2 cm', comparison: 'una semilla de sesamo', description: 'Tu pequeno dino ya tiene el tamano de una semilla de sesamo. El corazoncito empieza a formarse.' },
  6: { size: '0.4 cm', comparison: 'una lenteja', description: 'Tu bebito dino es como una lentejita. Su corazon ya late rapidito.' },
  7: { size: '1 cm', comparison: 'un arandano', description: 'Tu dino bebe ya mide como un arandano. Se estan formando sus bracitos y piernitas.' },
  8: { size: '1.6 cm', comparison: 'una frambuesa', description: 'Tu bebito dino es del tamano de una frambuesa. Ya se mueve aunque todavia no lo sientas.' },
  9: { size: '2.3 cm', comparison: 'una aceituna', description: 'Tu pequeno dino mide como una aceituna. Sus deditos empiezan a formarse.' },
  10: { size: '3.1 cm', comparison: 'una fresa', description: 'Tu dino bebe tiene el tamano de una fresa. Ya tiene todos sus organos principales.' },
  11: { size: '4.1 cm', comparison: 'un higo', description: 'Tu bebito dino mide como un higo. Sus huesitos se estan endureciendo.' },
  12: { size: '5.4 cm', comparison: 'un limon', description: 'Tu pequeno dino es como un limon. Ya puede abrir y cerrar sus manitas.' },
  13: { size: '7.4 cm', comparison: 'un durazno', description: 'Tu dino bebe mide como un durazno. Sus cuerdas vocales se estan desarrollando.' },
  14: { size: '8.7 cm', comparison: 'una manzana', description: 'Tu bebito dino tiene el tamano de una manzana. Ya puede fruncir el ceno.' },
  15: { size: '10.1 cm', comparison: 'una naranja', description: 'Tu pequeno dino es como una naranja. Puede sentir la luz a traves de tus paredes.' },
  16: { size: '11.6 cm', comparison: 'un aguacate', description: 'Tu dino bebe mide como un aguacate. Sus piernitas ya son mas largas que sus bracitos.' },
  17: { size: '13 cm', comparison: 'una pera', description: 'Tu bebito dino es del tamano de una pera. Su esqueleto se endurece cada dia mas.' },
  18: { size: '14.2 cm', comparison: 'un pimiento', description: 'Tu pequeno dino mide como un pimiento. Ya puede bostezar e hipo.' },
  19: { size: '15.3 cm', comparison: 'un mango', description: 'Tu dino bebe tiene el tamano de un mango. Sus sentidos se desarrollan rapidamente.' },
  20: { size: '16.4 cm', comparison: 'un platano', description: 'Tu bebito dino mide como un platano. Ya estas a la mitad del camino, mama.' },
  21: { size: '26.7 cm', comparison: 'una zanahoria grande', description: 'Tu pequeno dino es como una zanahoria grande. Sus cejas y parpados ya estan formados.' },
  22: { size: '27.8 cm', comparison: 'una papaya pequena', description: 'Tu dino bebe mide como una papaya pequena. Ya puede oir tu voz.' },
  23: { size: '28.9 cm', comparison: 'un mango grande', description: 'Tu bebito dino tiene el tamano de un mango grande. Su piel se vuelve menos transparente.' },
  24: { size: '30 cm', comparison: 'un elote', description: 'Tu pequeno dino mide como un elote. Sus pulmones se preparan para respirar.' },
  25: { size: '34.6 cm', comparison: 'una coliflor', description: 'Tu dino bebe es como una coliflor. Ya responde a los sonidos familiares.' },
  26: { size: '35.6 cm', comparison: 'una lechuga', description: 'Tu bebito dino tiene el tamano de una lechuga. Sus ojos se abren por primera vez.' },
  27: { size: '36.6 cm', comparison: 'un brocoli', description: 'Tu pequeno dino mide como un brocoli. Su cerebro se desarrolla a toda velocidad.' },
  28: { size: '37.6 cm', comparison: 'una berenjena', description: 'Tu dino bebe es como una berenjena. Ya puede sonar mientras duerme.' },
  29: { size: '38.6 cm', comparison: 'una calabaza pequena', description: 'Tu bebito dino mide como una calabacita. Puede ver la luz que entra por tu pancita.' },
  30: { size: '39.9 cm', comparison: 'un repollo', description: 'Tu pequeno dino es como un repollo. Sus unas de las manos estan completamente formadas.' },
  31: { size: '41.1 cm', comparison: 'un coco', description: 'Tu dino bebe tiene el tamano de un coco. Sube de peso rapido ahora.' },
  32: { size: '42.4 cm', comparison: 'una jicama', description: 'Tu bebito dino mide como una jicama. Practica respirar tragando liquido amniotico.' },
  33: { size: '43.7 cm', comparison: 'una pina', description: 'Tu pequeno dino es como una pina. Sus huesitos se siguen endureciendo.' },
  34: { size: '45 cm', comparison: 'un melon', description: 'Tu dino bebe mide como un melon. Su sistema inmune se fortalece.' },
  35: { size: '46.2 cm', comparison: 'un melon honeydew', description: 'Tu bebito dino tiene el tamano de un melon honeydew. Ya casi no tiene espacio para moverse.' },
  36: { size: '47.4 cm', comparison: 'una papaya grande', description: 'Tu pequeno dino es como una papaya grande. Sus pulmones ya estan casi maduros.' },
  37: { size: '48.6 cm', comparison: 'una acelga suiza', description: 'Tu dino bebe mide como un manojo de acelgas. Ya se considera a termino temprano.' },
  38: { size: '49.8 cm', comparison: 'un puerro grande', description: 'Tu bebito dino tiene el tamano de un puerro grande. Su cerebro y pulmones siguen madurando.' },
  39: { size: '50.7 cm', comparison: 'una sandia pequena', description: 'Tu pequeno dino es como una sandia pequena. Esta listo para conocerte pronto.' },
  40: { size: '51.2 cm', comparison: 'una sandia', description: 'Tu dino bebe tiene el tamano de una sandia. Ya esta listo para salir del cascaron, mama.' }
};

/**
 * Returns the due date from settings or the default.
 */
async function getDueDate(db) {
  const { rows } = await db.query("SELECT value FROM settings WHERE key = 'due_date'");
  return rows[0]?.value || '2027-01-29';
}

export default function weekRouter(db) {
  const router = Router();

  /** GET /current - Current gestational week, baby size, trimester, progress. */
  router.get('/current', async (_req, res) => {
    const dueDateStr = await getDueDate(db);
    const dueDate = parseISO(dueDateStr);
    const today = new Date();

    const daysRemaining = differenceInDays(dueDate, today);
    const daysElapsed = PREGNANCY_DAYS - daysRemaining;
    const weeksElapsed = Math.floor(daysElapsed / 7);
    const daysExtra = daysElapsed % 7;

    // Determine trimester
    let trimester = 1;
    if (weeksElapsed >= 28) trimester = 3;
    else if (weeksElapsed >= 13) trimester = 2;

    // Clamp week to available data range (4-40)
    const weekClamped = Math.max(4, Math.min(40, weeksElapsed));
    const babySize = BABY_SIZES[weekClamped] || BABY_SIZES[40];

    const progress = Math.min(100, Math.round((daysElapsed / PREGNANCY_DAYS) * 100));

    res.json({
      week: weeksElapsed,
      day: daysExtra,
      trimester,
      progress,
      days_remaining: Math.max(0, daysRemaining),
      due_date: dueDateStr,
      baby: babySize,
      label: `Semana ${weeksElapsed} + ${daysExtra} dias`
    });
  });

  /** GET /sizes - Full reference of all week sizes. */
  router.get('/sizes', (_req, res) => {
    res.json(BABY_SIZES);
  });

  return router;
}

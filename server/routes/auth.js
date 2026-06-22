/**
 * Authentication routes.
 * Simple PIN-based access control. No accounts, no sessions on server.
 * The client stores the PIN in localStorage after successful verification.
 */

import { Router } from 'express';

export default function authRouter(db) {
  const router = Router();

  /** POST /verify - Verify a PIN. Returns { valid: true/false }. */
  router.post('/verify', async (req, res) => {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ valid: false, error: 'PIN requerido' });
    }

    const { rows } = await db.query("SELECT value FROM settings WHERE key = 'pin'");
    const storedPin = rows[0]?.value || '2604';

    res.json({ valid: pin === storedPin });
  });

  /** PUT /change - Change the PIN (requires current PIN for verification). */
  router.put('/change', async (req, res) => {
    const { current, newPin } = req.body;

    if (!current || !newPin) {
      return res.status(400).json({ error: 'PIN actual y nuevo son requeridos' });
    }
    if (newPin.length < 4 || newPin.length > 8) {
      return res.status(400).json({ error: 'El PIN debe tener entre 4 y 8 digitos' });
    }

    const { rows } = await db.query("SELECT value FROM settings WHERE key = 'pin'");
    const storedPin = rows[0]?.value || '2604';

    if (current !== storedPin) {
      return res.status(401).json({ error: 'PIN actual incorrecto' });
    }

    await db.query(
      "INSERT INTO settings (key, value) VALUES ('pin', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
      [newPin]
    );
    res.json({ success: true });
  });

  return router;
}

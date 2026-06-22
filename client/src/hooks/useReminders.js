import { useEffect } from 'react';
import { api } from '../utils/api.js';

export function useReminders() {
  useEffect(() => {
    // Check permission and set up interval
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const checkReminders = async () => {
      try {
        const settings = await api.getSettings();
        const times = settings.reminder_times || ['08:00', '20:00'];
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Check if current time matches any reminder (within 1 minute window)
        const isReminderTime = times.some(time => {
          return currentTime === time;
        });

        if (isReminderTime) {
          // Check if minimum readings done
          const summary = await api.getSummary();
          if (summary.today.count < 2) {
            new Notification('DinoMom - Recordatorio', {
              body: `Hola Dinomamá! Es hora de registrar tu presión arterial. Llevas ${summary.today.count} de 2 registros mínimos hoy.`,
              icon: '/assets/dino-pink.png',
              tag: 'bp-reminder'
            });
          }
        }
      } catch (err) {
        console.error('Reminder check failed:', err);
      }
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    // Also check on load
    checkReminders();

    return () => clearInterval(interval);
  }, []);
}

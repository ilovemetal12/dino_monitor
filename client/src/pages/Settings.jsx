import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (key, value) => {
    try {
      await api.updateSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('DinoMom', {
        body: 'Las notificaciones estan activadas! Te recordaremos tomar tus lecturas.',
        icon: '/assets/dino-pink.png'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blush-deep border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-5">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-text-mid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="font-fredoka text-xl font-bold text-text-dark">Ajustes</h1>
      </header>

      <div className="space-y-4">
        {/* Name */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <label className="text-[0.68rem] text-text-light font-semibold block mb-2">Nombre</label>
          <input
            type="text"
            value={settings?.mama_name || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, mama_name: e.target.value }))}
            onBlur={(e) => handleSave('mama_name', e.target.value)}
            className="w-full bg-cream rounded-xl px-4 py-3 text-sm font-semibold text-text-dark outline-none focus:ring-2 focus:ring-blush-deep/30"
          />
        </div>

        {/* Baby name */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <label className="text-[0.68rem] text-text-light font-semibold block mb-2">Nombre del Bebito Dino</label>
          <input
            type="text"
            value={settings?.baby_name || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, baby_name: e.target.value }))}
            onBlur={(e) => handleSave('baby_name', e.target.value)}
            className="w-full bg-cream rounded-xl px-4 py-3 text-sm font-semibold text-text-dark outline-none focus:ring-2 focus:ring-blush-deep/30"
          />
        </div>

        {/* Due date */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <label className="text-[0.68rem] text-text-light font-semibold block mb-2">Fecha Probable de Parto</label>
          <input
            type="date"
            value={settings?.due_date || ''}
            onChange={(e) => {
              setSettings(prev => ({ ...prev, due_date: e.target.value }));
              handleSave('due_date', e.target.value);
            }}
            className="w-full bg-cream rounded-xl px-4 py-3 text-sm font-semibold text-text-dark outline-none focus:ring-2 focus:ring-blush-deep/30"
          />
        </div>

        {/* Reminder times */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <label className="text-[0.68rem] text-text-light font-semibold block mb-2">Recordatorios</label>
          <p className="text-xs text-text-mid mb-3">Minimo 2 lecturas diarias. Configura tus horarios:</p>
          {(settings?.reminder_times || ['08:00', '20:00']).map((time, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                type="time"
                value={time}
                onChange={(e) => {
                  const times = [...(settings?.reminder_times || ['08:00', '20:00'])];
                  times[i] = e.target.value;
                  setSettings(prev => ({ ...prev, reminder_times: times }));
                  handleSave('reminder_times', times);
                }}
                className="flex-1 bg-cream rounded-xl px-4 py-2 text-sm text-text-dark outline-none"
              />
              {i > 1 && (
                <button
                  onClick={() => {
                    const times = (settings?.reminder_times || []).filter((_, idx) => idx !== i);
                    setSettings(prev => ({ ...prev, reminder_times: times }));
                    handleSave('reminder_times', times);
                  }}
                  className="text-red-400 text-xs font-bold"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => {
              const times = [...(settings?.reminder_times || ['08:00', '20:00']), '14:00'];
              setSettings(prev => ({ ...prev, reminder_times: times }));
              handleSave('reminder_times', times);
            }}
            className="text-xs text-blush-deep font-bold mt-2"
          >
            + Agregar recordatorio
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-fredoka text-sm font-bold text-text-dark mb-2">Notificaciones</h3>
          <p className="text-xs text-text-mid mb-3">Activa las notificaciones para recibir recordatorios.</p>
          <button
            onClick={handleNotificationPermission}
            className="w-full bg-cream text-text-dark font-bold py-3 rounded-xl text-sm hover:bg-blush/50 transition-colors"
          >
            Activar Notificaciones
          </button>
        </div>

        {/* Security */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-fredoka text-sm font-bold text-text-dark mb-2">Seguridad</h3>
          <button
            onClick={() => {
              localStorage.removeItem('dinomom_pin');
              window.location.reload();
            }}
            className="w-full bg-cream text-text-dark font-bold py-3 rounded-xl text-sm hover:bg-blush/50 transition-colors mb-2"
          >
            Bloquear App
          </button>
          <p className="text-[0.65rem] text-text-light text-center">
            Cierra la sesion y pide el PIN de nuevo al entrar.
          </p>
        </div>
      </div>

      {saved && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-mint-deep text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-bounce">
          Guardado!
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import PinLock from './components/PinLock.jsx';
import Home from './pages/Home.jsx';
import NewReading from './pages/NewReading.jsx';
import History from './pages/History.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import { useReminders } from './hooks/useReminders.js';
import { api } from './utils/api.js';

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  useReminders();

  // On mount, check if stored PIN is still valid
  useEffect(() => {
    const storedPin = localStorage.getItem('dinomom_pin');
    if (!storedPin) {
      setChecking(false);
      return;
    }

    api.verifyPin(storedPin)
      .then(result => {
        if (result.valid) setUnlocked(true);
        else localStorage.removeItem('dinomom_pin');
      })
      .catch(() => {
        // If server unreachable, trust localStorage for offline access
        setUnlocked(true);
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-cream">
        <div className="w-10 h-10 border-4 border-blush-deep border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="nueva" element={<NewReading />} />
        <Route path="historial" element={<History />} />
        <Route path="reportes" element={<Reports />} />
        <Route path="ajustes" element={<Settings />} />
      </Route>
    </Routes>
  );
}

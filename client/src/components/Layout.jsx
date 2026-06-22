import { Outlet, NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Inicio', icon: HomeIcon },
  { path: '/historial', label: 'Historial', icon: ChartIcon },
  { path: '/nueva', label: '', icon: PlusIcon, isCenter: true },
  { path: '/reportes', label: 'Reportes', icon: FileIcon },
  { path: '/ajustes', label: 'Ajustes', icon: GearIcon },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="max-w-[430px] mx-auto min-h-screen pb-24 relative">
      <Outlet />
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-white rounded-t-3xl px-4 pt-3 pb-6 flex justify-around items-center shadow-[0_-4px_24px_rgba(61,44,46,0.06)] z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          if (item.isCenter) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="w-[52px] h-[52px] bg-gradient-to-br from-blush-deep to-pink-deep rounded-full flex items-center justify-center -mt-7 shadow-[0_6px_20px_rgba(255,143,171,0.4)] hover:scale-110 transition-transform"
              >
                <item.icon className="w-6 h-6 text-white" />
              </NavLink>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[0.6rem] font-bold text-text-dark">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

function HomeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ChartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function FileIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function GearIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

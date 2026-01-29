import { NavLink, Outlet } from 'react-router-dom';
import { Home, Dumbbell, History, BarChart3 } from 'lucide-react';

export default function Layout() {
  const navItems = [
    { to: '/', icon: Home, label: 'HOME' },
    { to: '/workout', icon: Dumbbell, label: 'LIFT' },
    { to: '/history', icon: History, label: 'LOG' },
    { to: '/stats', icon: BarChart3, label: 'STATS' },
  ];

  return (
    <div className="min-h-screen text-white flex flex-col">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        {/* Gradient fade above nav */}
        <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

        <div className="bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-[#252525]">
          <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? 'text-[#c8ff00]'
                      : 'text-[#737373] hover:text-[#fafafa]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute inset-0 bg-[#c8ff00]/10 rounded-xl" />
                    )}
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`relative z-10 transition-transform duration-200 ${isActive ? 'drop-shadow-[0_0_8px_rgba(200,255,0,0.5)]' : 'group-hover:scale-110'}`}
                    />
                    <span className={`text-[10px] font-semibold tracking-wider relative z-10 ${isActive ? 'font-bold' : ''}`}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

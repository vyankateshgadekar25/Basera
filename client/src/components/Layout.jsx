import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Home, LayoutDashboard, User, LogOut, Menu, X } from 'lucide-react';
import { useState, useLayoutEffect, useRef, useEffect } from 'react';

/* Animated underline indicator that slides between active nav links. */
function NavWithIndicator({ items }) {
  const containerRef = useRef(null);
  const [indicator, setIndicator] = useState({ x: 0, w: 0, visible: false });

  const updateIndicator = (target) => {
    if (!containerRef.current || !target) return setIndicator((s) => ({ ...s, visible: false }));
    const cRect = containerRef.current.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    setIndicator({ x: tRect.left - cRect.left, w: tRect.width, visible: true });
  };

  useLayoutEffect(() => {
    const active = containerRef.current?.querySelector('[data-active="true"]');
    updateIndicator(active);
  }, [items]);

  useEffect(() => {
    const handler = () => {
      const active = containerRef.current?.querySelector('[data-active="true"]');
      updateIndicator(active);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative hidden md:flex items-center gap-1"
      onMouseLeave={() => {
        const active = containerRef.current?.querySelector('[data-active="true"]');
        updateIndicator(active);
      }}
    >
      {items.map((it) => (
        <Link
          key={it.to}
          to={it.to}
          data-active={it.active}
          onMouseEnter={(e) => updateIndicator(e.currentTarget)}
          className={`sidebar-link relative ${it.active ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
          data-testid={`nav-link-${it.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <it.icon className="w-4 h-4" /> {it.label}
        </Link>
      ))}
      <span
        aria-hidden
        className="absolute bottom-0 h-[2px] bg-accent-600 rounded-full pointer-events-none"
        style={{
          width: indicator.w,
          transform: `translateX(${indicator.x}px)`,
          opacity: indicator.visible ? 1 : 0,
          transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), width 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease-out',
        }}
      />
    </div>
  );
}

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const navItems = [
    { to: '/', label: 'Search', icon: Home, active: isActive('/'), show: true },
    { to: '/owner', label: 'Dashboard', icon: LayoutDashboard, active: isActive('/owner'), show: isAuthenticated && user?.role === 'owner' },
    { to: '/renter', label: 'My Stay', icon: User, active: isActive('/renter'), show: isAuthenticated && user?.role === 'renter' },
  ].filter((i) => i.show);

  // Lock body scroll while mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen">
      {/* Top Nav — chrome, no entry animation */}
      <nav className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-ink-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group" data-testid="brand-home-link">
                <div className="w-9 h-9 rounded-xl bg-ink-900 flex items-center justify-center relative overflow-hidden">
                  <span className="font-display text-cream-50 text-lg font-semibold">B</span>
                  <span className="absolute -bottom-1 right-1 w-2 h-2 rounded-full bg-accent-400" />
                </div>
                <span className="font-display text-xl font-semibold text-ink-900 tracking-tight">Basera</span>
              </Link>

              <NavWithIndicator items={navItems} />
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="hidden sm:block text-sm text-ink-800 font-medium">{user?.name}</span>
                  <button onClick={handleLogout} className="btn-ghost text-sm" data-testid="logout-button">
                    <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-2 px-4" data-testid="login-link">Login</Link>
              )}
              <button
                className="md:hidden btn-ghost"
                onClick={() => setMobileMenuOpen((s) => !s)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle menu"
                data-testid="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu — backdrop fade + panel slide */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute top-0 right-0 h-full w-[78%] max-w-sm bg-white shadow-2xl animate-slide-in flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-ink-900/5">
              <span className="font-display text-lg font-semibold text-ink-900">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="btn-ghost" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((it) => (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium ${
                    it.active ? 'bg-accent-50 text-accent-700' : 'text-ink-800 hover:bg-cream-100'
                  } transition-colors duration-150`}
                >
                  <it.icon className="w-5 h-5" /> {it.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-ink-900/5">
              {isAuthenticated ? (
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn-secondary w-full">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full">
                  Login
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
}

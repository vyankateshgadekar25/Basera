// Legacy Navbar — kept for any direct usage; main app uses Layout.jsx.
// Re-skinned to match the new accent palette.
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-white/80 backdrop-blur border-b border-ink-900/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-display text-xl font-semibold text-ink-900">Basera</Link>
            <Link to="/" className="text-ink-700 hover:text-accent-700 hidden sm:block transition-colors">Search</Link>
            {isAuthenticated && user?.role === 'owner' && (
              <Link to="/owner" className="text-ink-700 hover:text-accent-700 transition-colors">Dashboard</Link>
            )}
            {isAuthenticated && user?.role === 'renter' && (
              <Link to="/renter" className="text-ink-700 hover:text-accent-700 transition-colors">My Stay</Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-ink-800">{user?.name}</span>
                <button onClick={handleLogout} className="btn-secondary text-sm">Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

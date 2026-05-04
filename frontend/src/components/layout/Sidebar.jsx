import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  LogOut,
  X,
  Zap,
  ChevronRight,
} from 'lucide-react';
import useStore from '../../store/useStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
];

const Sidebar = ({ onClose }) => {
  const { user, logout: storeLogout, sidebarOpen } = useStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // ignore
    }
    storeLogout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="flex flex-col w-64 h-screen bg-bg-secondary border-r border-slate-700/50 fixed left-0 top-0 z-40 animate-slide-in">
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow-sm">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">TaskFlow</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
          Menu
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
            <ChevronRight size={14} className="ml-auto opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* ── User Profile ──────────────────────────────────────── */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-accent flex items-center justify-center text-white text-sm font-bold shadow-glow-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-100 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

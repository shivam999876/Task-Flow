import { Menu, Bell } from 'lucide-react';
import useStore from '../../store/useStore';

const Navbar = ({ onMenuClick, title }) => {
  const user = useStore((s) => s.user);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="h-16 bg-bg-secondary/80 backdrop-blur-sm border-b border-slate-700/50 flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-slate-100 transition-colors"
      >
        <Menu size={22} />
      </button>

      <h1 className="text-lg font-semibold text-slate-100 flex-1">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span className="hidden sm:inline-flex badge bg-accent/20 text-accent-light border border-accent/30">
          {user?.role || 'Member'}
        </span>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

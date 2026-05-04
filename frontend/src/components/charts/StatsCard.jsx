const StatsCard = ({ icon: Icon, label, value, color = 'accent', trend }) => {
  const colorMap = {
    accent: 'bg-accent/20 text-accent-light',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    red: 'bg-red-500/20 text-red-400',
    violet: 'bg-violet/20 text-violet',
  };

  return (
    <div className="stat-card group cursor-default">
      <div className={`w-12 h-12 rounded-xl ${colorMap[color]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5">{value ?? '—'}</p>
        {trend !== undefined && (
          <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)} vs last week
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

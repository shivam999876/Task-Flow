/** Priority badge colors */
const PRIORITY_STYLES = {
  Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
};

/** Status badge colors */
const STATUS_STYLES = {
  'To Do': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  'In Progress': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Done': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const Badge = ({ type = 'custom', value, className = '' }) => {
  const style =
    type === 'priority'
      ? PRIORITY_STYLES[value]
      : type === 'status'
      ? STATUS_STYLES[value]
      : '';

  return (
    <span className={`badge border ${style} ${className}`}>
      {value}
    </span>
  );
};

export default Badge;

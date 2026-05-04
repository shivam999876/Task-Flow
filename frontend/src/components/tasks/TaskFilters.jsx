import { Filter, X } from 'lucide-react';

const TaskFilters = ({ filters, onChange, members = [], isAdmin }) => {
  const hasActiveFilters = filters.status || filters.priority || filters.assignedTo;

  const handleClear = () =>
    onChange({ status: '', priority: '', assignedTo: '' });

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 glass-card mb-4">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Filter size={15} />
        <span className="text-sm font-medium">Filters</span>
      </div>

      {/* Status filter */}
      <select
        id="filter-status"
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="bg-bg-primary border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
      >
        <option value="">All Statuses</option>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>

      {/* Priority filter */}
      <select
        id="filter-priority"
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className="bg-bg-primary border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
      >
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      {/* Assignee filter (admin only) */}
      {isAdmin && members.length > 0 && (
        <select
          id="filter-assignee"
          value={filters.assignedTo}
          onChange={(e) => onChange({ ...filters, assignedTo: e.target.value })}
          className="bg-bg-primary border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All Assignees</option>
          {members.map((m) => (
            <option key={m.user._id} value={m.user._id}>
              {m.user.name}
            </option>
          ))}
        </select>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          <X size={13} />
          Clear
        </button>
      )}
    </div>
  );
};

export default TaskFilters;

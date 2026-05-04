import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const COLUMN_CONFIG = {
  'To Do': {
    headerBg: 'bg-slate-500/20',
    headerText: 'text-slate-400',
    dot: 'bg-slate-400',
    border: 'border-slate-700/50',
    droppingBg: 'bg-slate-800/50',
  },
  'In Progress': {
    headerBg: 'bg-amber-500/20',
    headerText: 'text-amber-400',
    dot: 'bg-amber-400',
    border: 'border-amber-500/30',
    droppingBg: 'bg-amber-900/20',
  },
  'Done': {
    headerBg: 'bg-emerald-500/20',
    headerText: 'text-emerald-400',
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/30',
    droppingBg: 'bg-emerald-900/20',
  },
};

const TaskColumn = ({ status, tasks, onAddTask, isAdmin }) => {
  const config = COLUMN_CONFIG[status];

  return (
    <div className={`flex flex-col rounded-xl border ${config.border} bg-bg-primary/60 min-w-[300px] w-80 flex-shrink-0`}>
      {/* ── Column Header ──────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${config.headerBg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-sm font-semibold ${config.headerText}`}>{status}</span>
          <span className="bg-bg-tertiary text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        {isAdmin && (
          <button
            onClick={() => onAddTask(status)}
            className="text-slate-500 hover:text-slate-300 hover:bg-bg-secondary rounded p-1 transition-all"
            aria-label={`Add task to ${status}`}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* ── Droppable Area ─────────────────────────────────────── */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-3 p-3 flex-1 min-h-[200px] rounded-b-xl transition-colors duration-150
              ${snapshot.isDraggingOver ? config.droppingBg : ''}`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task._id} task={task} index={index} />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-slate-600 text-center py-8">
                  Drop tasks here
                </p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskColumn;

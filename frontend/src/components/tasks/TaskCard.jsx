import { Calendar, User, Trash2, AlertCircle } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import useStore from '../../store/useStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const TaskCard = ({ task, index }) => {
  const { isAdmin, removeTask } = useStore();

  const isOverdue =
    task.dueDate && task.status !== 'Done' && new Date() > new Date(task.dueDate);

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      removeTask(task._id);
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`glass-card p-4 cursor-grab active:cursor-grabbing transition-all duration-150
            ${snapshot.isDragging ? 'shadow-glow rotate-1 scale-105' : 'hover:border-slate-600'}
            ${isOverdue ? 'border-red-500/50' : ''}
          `}
        >
          {/* ── Header ───────────────────────────────────── */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <p className={`text-sm font-medium leading-snug ${isOverdue ? 'text-red-300' : 'text-slate-100'}`}>
              {task.title}
            </p>
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 p-0.5"
                aria-label="Delete task"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* ── Description ──────────────────────────────── */}
          {task.description && (
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
          )}

          {/* ── Badges ──────────────────────────────────── */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge type="priority" value={task.priority} />
            {task.tags?.map((tag) => (
              <span key={tag} className="badge bg-bg-tertiary text-slate-400 border border-slate-600/50">
                {tag}
              </span>
            ))}
          </div>

          {/* ── Footer ──────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {isOverdue && (
                <AlertCircle size={12} className="text-red-400" />
              )}
              {task.dueDate && (
                <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                  <Calendar size={11} />
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>
            {task.assignedTo ? (
              <Avatar name={task.assignedTo.name} size="sm" />
            ) : (
              <User size={14} className="text-slate-600" />
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;

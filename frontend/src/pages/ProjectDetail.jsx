import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, UserPlus, ArrowLeft, Crown, X, Activity } from 'lucide-react';
import api from '../api/axios';
import useStore from '../store/useStore';
import TaskColumn from '../components/tasks/TaskColumn';
import TaskFilters from '../components/tasks/TaskFilters';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

const STATUSES = ['To Do', 'In Progress', 'Done'];

// ── Create Task Modal ────────────────────────────────────────────────────────
const CreateTaskModal = ({ isOpen, onClose, onCreated, members, defaultStatus }) => {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'Medium', status: defaultStatus || 'To Do',
    dueDate: '', assignedTo: '',
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => { setForm((f) => ({ ...f, status: defaultStatus || 'To Do' })); }, [defaultStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      const payload = { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null };
      const { data } = await api.post(`/projects/${id}/tasks`, payload);
      onCreated(data.task);
      toast.success('Task created!');
      onClose();
      setForm({ title: '', description: '', priority: 'Medium', status: 'To Do', dueDate: '', assignedTo: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input className="input" placeholder="Task title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none h-20" placeholder="Optional details"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input" value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Assign To</label>
            <select className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Spinner size="sm" /> : <Plus size={16} />} Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Add Member Modal ─────────────────────────────────────────────────────────
const AddMemberModal = ({ isOpen, onClose, onAdded, projectId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/members`, { email, role });
      onAdded(data.project);
      toast.success('Member added!');
      onClose();
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email address</label>
          <input type="email" className="input" placeholder="teammate@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Spinner size="sm" /> : <UserPlus size={16} />} Add Member
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, setTasks, addTask, updateTask, isAdmin, setCurrentProject, user } = useStore();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', assignedTo: '' });
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('To Do');
  const [activity, setActivity] = useState([]);
  const [showActivity, setShowActivity] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
      ]);
      setProject(projRes.data.project);
      setCurrentProject(projRes.data.project, projRes.data.isAdmin);
      setTasks(taskRes.data.tasks);
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchActivity = async () => {
    try {
      const { data } = await api.get(`/projects/${id}/activity`);
      setActivity(data.activities);
    } catch (_) {}
  };

  const handleShowActivity = () => {
    setShowActivity(true);
    fetchActivity();
  };

  // Filter tasks for display
  const filteredTasks = tasks.filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.assignedTo && t.assignedTo?._id !== filters.assignedTo) return false;
    return true;
  });

  const tasksByStatus = (status) => filteredTasks.filter((t) => t.status === status)
    .sort((a, b) => a.position - b.position);

  // Drag and drop handler
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId;
    const newPosition = destination.index;

    // Optimistic update
    updateTask(draggableId, { status: newStatus, position: newPosition });

    try {
      await api.patch(`/tasks/${draggableId}/move`, { status: newStatus, position: newPosition });
    } catch (err) {
      toast.error('Failed to move task');
      fetchData(); // revert on failure
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      setProject((p) => ({ ...p, members: p.members.filter((m) => m.user._id !== userId) }));
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 flex-wrap">
        <button onClick={() => navigate('/projects')} className="text-slate-400 hover:text-slate-100 mt-1 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project?.color || '#6366F1' }} />
            <h2 className="page-title truncate">{project?.title}</h2>
            {isAdmin && <Badge type="custom" value="Admin" className="bg-amber-500/20 text-amber-400 border border-amber-500/30" />}
          </div>
          {project?.description && <p className="text-slate-400 text-sm mt-1 ml-7">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleShowActivity} className="btn-ghost flex items-center gap-2 text-sm py-2">
            <Activity size={15} /> Activity
          </button>
          {isAdmin && (
            <button id="add-member-btn" onClick={() => setShowAddMember(true)} className="btn-ghost flex items-center gap-2 text-sm py-2">
              <UserPlus size={15} /> Add Member
            </button>
          )}
          {isAdmin && (
            <button id="add-task-btn" onClick={() => { setDefaultStatus('To Do'); setShowCreateTask(true); }}
              className="btn-primary flex items-center gap-2 text-sm py-2">
              <Plus size={15} /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* ── Members strip ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap px-1">
        {project?.members?.map((m) => (
          <div key={m.user._id} className="flex items-center gap-1.5 bg-bg-secondary border border-slate-700/50 rounded-full pl-1 pr-3 py-1 group">
            <Avatar name={m.user.name} size="sm" />
            <span className="text-xs text-slate-300">{m.user.name}</span>
            {m.role === 'Admin' && <Crown size={11} className="text-amber-400" />}
            {isAdmin && m.user._id !== project.createdBy?._id && (
              <button onClick={() => handleRemoveMember(m.user._id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 ml-1 transition-all">
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <TaskFilters filters={filters} onChange={setFilters} members={project?.members || []} isAdmin={isAdmin} />

      {/* ── Kanban Board ────────────────────────────────────────── */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {STATUSES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasksByStatus(status)}
              isAdmin={isAdmin}
              onAddTask={(s) => { setDefaultStatus(s); setShowCreateTask(true); }}
            />
          ))}
        </div>
      </DragDropContext>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onCreated={addTask}
        members={project?.members || []}
        defaultStatus={defaultStatus}
      />
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAdded={(p) => setProject(p)}
        projectId={id}
      />

      {/* ── Activity Drawer ─────────────────────────────────────── */}
      {showActivity && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowActivity(false)}>
          <div className="w-full max-w-sm bg-bg-secondary border-l border-slate-700/50 h-full flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <Activity size={16} className="text-accent" /> Activity Log
              </h3>
              <button onClick={() => setShowActivity(false)} className="text-slate-400 hover:text-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activity.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No activity yet</p>
              ) : activity.map((a) => (
                <div key={a._id} className="flex gap-3">
                  <Avatar name={a.user?.name} size="sm" className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-300">{a.action}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {a.user?.name} · {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;

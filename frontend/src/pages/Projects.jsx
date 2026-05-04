import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Users, Trash2, Crown } from 'lucide-react';
import api from '../api/axios';
import useStore from '../store/useStore';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const PROJECT_COLORS = ['#6366F1','#8B5CF6','#EC4899','#10B981','#F59E0B','#3B82F6','#EF4444','#14B8A6'];

const CreateProjectModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', description: '', color: PROJECT_COLORS[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      onCreated(data.project);
      toast.success('Project created!');
      onClose();
      setForm({ title: '', description: '', color: PROJECT_COLORS[0] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Project Title *</label>
          <input className="input" placeholder="e.g. Website Redesign"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none h-24" placeholder="What is this project about?"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="label">Accent Color</label>
          <div className="flex gap-2 flex-wrap">
            {PROJECT_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Spinner size="sm" /> : <Plus size={16} />}
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const { projects, setProjects, addProject, removeProject, projectsLoading, setProjectsLoading, user } = useStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    setProjectsLoading(true);
    api.get('/projects')
      .then(({ data }) => setProjects(data.projects))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setProjectsLoading(false));
  }, []);

  const handleDelete = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      removeProject(projectId);
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (projectsLoading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Projects</h2>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="create-project-btn" onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FolderKanban size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No projects yet</h3>
          <p className="text-slate-500 text-sm mb-6">Create your first project to get started</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => {
            const myMembership = project.members?.find((m) => m.user?._id === user?._id || m.user === user?._id);
            const isAdmin = myMembership?.role === 'Admin';
            return (
              <div key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="glass-card p-5 cursor-pointer hover:border-slate-600 hover:shadow-glow transition-all duration-200 group relative"
              >
                {/* Color accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: project.color || '#6366F1' }} />

                <div className="flex items-start justify-between mb-3 mt-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${project.color || '#6366F1'}20` }}>
                    <FolderKanban size={20} style={{ color: project.color || '#6366F1' }} />
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && <Crown size={14} className="text-amber-400" />}
                    {isAdmin && (
                      <button onClick={(e) => handleDelete(e, project._id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 p-1 rounded transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-slate-100 mb-1 line-clamp-1">{project.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{project.description || 'No description'}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Users size={13} />
                    {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex -space-x-2">
                    {project.members?.slice(0, 4).map((m, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-bg-secondary flex items-center justify-center text-xs font-semibold text-white"
                        style={{ backgroundColor: `hsl(${(m.user?.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 65%, 45%)` }}>
                        {(m.user?.name || '?')[0].toUpperCase()}
                      </div>
                    ))}
                    {project.members?.length > 4 && (
                      <div className="w-6 h-6 rounded-full border-2 border-bg-secondary bg-bg-tertiary flex items-center justify-center text-xs text-slate-400">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>
                {project.taskCount !== undefined && (
                  <p className="text-xs text-slate-600 mt-2">{project.taskCount} task{project.taskCount !== 1 ? 's' : ''}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={addProject} />
    </div>
  );
};

export default Projects;

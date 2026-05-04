import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import api from "../api/axios";
import useStore from "../store/useStore";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";

const RECOMMENDED_CATEGORIES = [
  "Home Help",
  "Plan an event",
  "Return a package",
  "Send a gift",
  "Schedule appointment",
  "Get a passport",
  "Find a kids activity",
  "Plan a trip",
];

const CONTROL_ITEMS = [
  { label: "Filter", icon: Filter },
  { label: "Sort", icon: SlidersHorizontal },
  { label: "Hide", icon: Search },
];

const buildTaskPreview = (task, index) => {
  const baseProgress =
    task.status === "Done"
      ? 100
      : task.priority === "High"
        ? 72
        : task.priority === "Medium"
          ? 50
          : 30;
  const progress = Math.min(100, baseProgress + index * 6);
  return {
    id: task._id,
    title: task.title,
    project: task.project?.title || "General task",
    status: task.status || "In Progress",
    priority: task.priority || "Medium",
    comments: 3 + index * 2,
    due: `${5 + index * 2} days left`,
    progress,
  };
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useStore((s) => s.user);
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";

  useEffect(() => {
    api
      .get("/dashboard")
      .then(({ data }) => setStats(data.stats))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const tasks = useMemo(() => {
    if (!stats?.recentTasks?.length) return [];
    return stats.recentTasks.slice(0, 5).map(buildTaskPreview);
  }, [stats]);

  const activeProjects = useMemo(() => {
    if (!stats?.recentTasks?.length) return [];
    return stats.recentTasks.slice(0, 3).map((task, index) => ({
      id: task._id,
      title: task.project?.title || "Project plan",
      subtitle: task.title,
      status: task.status || "In Progress",
      priority: task.priority || "Medium",
      progress: 40 + index * 20,
    }));
  }, [stats]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="dashboard-panel p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 mb-2">
                My Task
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-100">
                Good {greeting},{" "}
                <span className="gradient-text">
                  {user?.name?.split(" ")[0]}
                </span>
              </h1>
              <p className="text-slate-500 mt-3">
                Plan your week, manage priorities, and keep everything in one
                polished workspace.
              </p>
            </div>
            <div className="relative w-full max-w-xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="search"
                placeholder="Search or type a command"
                className="input input-search w-full pl-12"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-8">
            {RECOMMENDED_CATEGORIES.slice(0, 8).map((category) => (
              <button key={category} type="button" className="pill">
                {category}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 mt-8">
            {CONTROL_ITEMS.map(({ label, icon: Icon }) => (
              <button key={label} type="button" className="pill !px-4 !py-2">
                <Icon size={16} /> {label}
              </button>
            ))}
            <button
              type="button"
              className="btn-primary ml-auto flex items-center gap-2"
            >
              <Plus size={16} /> New Project
            </button>
          </div>
        </div>

        <div className="dashboard-panel p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Productivity</p>
              <h2 className="text-2xl font-semibold text-slate-100">
                Weekly snapshot
              </h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 inline-flex items-center gap-2">
              <Sparkles size={16} /> Best day
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Tasks
              </p>
              <p className="text-3xl font-semibold text-slate-100 mt-3">
                {stats?.totalTasks ?? 0}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Overview of all active work items.
              </p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Projects
              </p>
              <p className="text-3xl font-semibold text-slate-100 mt-3">
                {stats?.totalProjects ?? 0}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Current initiatives in progress.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                In progress
              </p>
              <p className="text-3xl font-semibold text-slate-100 mt-3">
                {stats?.tasksByStatus?.find((s) => s._id === "In Progress")
                  ?.count ?? 0}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Tasks currently being worked on.
              </p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Overdue
              </p>
              <p className="text-3xl font-semibold text-slate-100 mt-3">
                {stats?.overdueTasks ?? 0}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Tasks that need your immediate attention.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="dashboard-panel p-6 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">To do</p>
              <h2 className="text-2xl font-semibold text-slate-100">
                Upcoming tasks
              </h2>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {tasks.length} tasks
            </span>
          </div>

          <div className="grid gap-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-100 truncate">
                        {task.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 truncate">
                        {task.project}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        type="status"
                        value={task.status}
                        className="text-xs py-1 px-2"
                      />
                      <Badge
                        type="priority"
                        value={task.priority}
                        className="text-xs py-1 px-2"
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,auto)_minmax(0,auto)_1fr] items-center">
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-xs text-slate-400">
                      <Clock size={14} /> {task.due}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-xs text-slate-400">
                      {task.comments} comments
                    </span>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-right text-xs text-slate-400 sm:col-span-3">
                      {task.progress}% completed
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-bg-secondary/70 p-6 text-slate-500 text-sm">
                No tasks available yet. Start by creating a new project or
                adding task details.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="dashboard-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">Active Projects</p>
                <h2 className="text-xl font-semibold text-slate-100">
                  Focus board
                </h2>
              </div>
              <span className="badge bg-slate-700/60 text-slate-100 border-transparent text-xs">
                Live
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {activeProjects.length > 0 ? (
                activeProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100 truncate">
                          {project.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {project.subtitle}
                        </p>
                      </div>
                      <Badge
                        type="status"
                        value={project.status}
                        className="text-[11px] py-1 px-2"
                      />
                    </div>
                    <div className="mt-4">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                        <span>{project.priority} priority</span>
                        <span>{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">
                  No active projects yet.
                </p>
              )}
            </div>
          </div>

          <div className="dashboard-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">Quick win</p>
                <h2 className="text-xl font-semibold text-slate-100">
                  Upgrade plan
                </h2>
              </div>
              <ArrowRight size={18} className="text-slate-400" />
            </div>
            <p className="mt-4 text-slate-500 text-sm">
              Your trial ends in 12 days. Unlock more insights, team analytics,
              and priority workflows.
            </p>
            <button type="button" className="btn-primary mt-6 w-full">
              See plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

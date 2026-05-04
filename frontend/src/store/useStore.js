import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Zustand global store.
 * Auth slice persisted to localStorage (token + user).
 * Projects/tasks are transient (re-fetched on mount).
 */
const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────────────────────
      accessToken: null,
      user: null,
      isAuthenticated: false,

      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: (accessToken, user) =>
        set({ accessToken, user, isAuthenticated: true }),

      logout: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),

      // ── Projects ─────────────────────────────────────────────────────────
      projects: [],
      projectsLoading: false,

      setProjects: (projects) => set({ projects }),
      setProjectsLoading: (loading) => set({ projectsLoading: loading }),

      addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),

      updateProject: (id, data) =>
        set((state) => ({
          projects: state.projects.map((p) => (p._id === id ? { ...p, ...data } : p)),
        })),

      removeProject: (id) =>
        set((state) => ({ projects: state.projects.filter((p) => p._id !== id) })),

      // ── Current Project ───────────────────────────────────────────────────
      currentProject: null,
      isAdmin: false,
      setCurrentProject: (project, isAdmin) =>
        set({ currentProject: project, isAdmin }),

      // ── Tasks ─────────────────────────────────────────────────────────────
      tasks: [],
      tasksLoading: false,

      setTasks: (tasks) => set({ tasks }),
      setTasksLoading: (loading) => set({ tasksLoading: loading }),

      addTask: (task) =>
        set((state) => ({ tasks: [task, ...state.tasks] })),

      updateTask: (id, data) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t._id === id ? { ...t, ...data } : t)),
        })),

      removeTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) })),

      // ── UI ────────────────────────────────────────────────────────────────
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'taskflow-storage',
      // Only persist auth data — everything else re-fetched
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useStore;

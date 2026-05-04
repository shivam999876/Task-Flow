import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import NotFound from './pages/NotFound';

// Page titles for the navbar
const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
};

// Layout wrapper for authenticated pages
const AppLayout = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const title = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/projects/') ? 'Project Board' : 'TaskFlow');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* ── Mobile Sidebar overlay ───────────────────────────── */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <Sidebar onClose={() => setMobileSidebarOpen(false)} />
          <div className="flex-1 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar
          title={title}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    {/* Toast notifications */}
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1E293B',
          color: '#E2E8F0',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '12px',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#10B981', secondary: '#0F172A' } },
        error: { iconTheme: { primary: '#EF4444', secondary: '#0F172A' } },
      }}
    />

    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;

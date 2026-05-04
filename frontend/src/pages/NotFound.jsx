import { Link } from 'react-router-dom';
import { Zap, Home } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
    <div className="text-center animate-fade-in">
      <div className="text-8xl font-black gradient-text mb-4">404</div>
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Page not found</h1>
      <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
        <Home size={16} /> Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;

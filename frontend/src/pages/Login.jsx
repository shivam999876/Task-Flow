import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Zap, Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import api from "../api/axios";
import useStore from "../store/useStore";
import toast from "react-hot-toast";
import Spinner from "../components/ui/Spinner";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useStore((s) => s.login);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.accessToken, data.user);
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      const fieldErrors = err.response?.data?.errors || [];
      if (fieldErrors.length) {
        const map = {};
        fieldErrors.forEach((e) => (map[e.field] = e.message));
        setErrors(map);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-44 -right-28 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-44 -left-24 h-96 w-96 rounded-full bg-violet/15 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-[420px_1fr]">
          <div className="hidden rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-card lg:flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/70 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-300">
                <ShieldCheck size={14} /> Secure access
              </div>
              <h1 className="mt-8 text-4xl font-semibold text-slate-100">
                Welcome back
              </h1>
              <p className="mt-4 text-slate-400">
                Sign in to access your task dashboard, personalized changes, and
                productivity insights.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                <p className="font-semibold text-slate-100">
                  Everything in one place
                </p>
                <p className="mt-2 text-slate-400">
                  Quickly jump into projects, tasks, and team updates.
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                <p className="font-semibold text-slate-100">
                  Modern collaboration
                </p>
                <p className="mt-2 text-slate-400">
                  Organize work with smart categories and status tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 shadow-glow">
            <div className="mb-8 space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-accent text-white shadow-glow-sm">
                <Zap size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-slate-100">
                  Sign in
                </h2>
                <p className="text-slate-500 mt-2">
                  Login to your account to continue planning and tracking your
                  work.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="login-email" className="label">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`input ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                  autoComplete="email"
                  required
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`input pr-10 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {loading ? <Spinner size="sm" /> : <LogIn size={16} />}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-6">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-accent-light hover:underline font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

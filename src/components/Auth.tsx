import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wallet } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        setError(error);
      } else if (!isLogin) {
        setError('Account created! Please log in.');
        setIsLogin(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="auth-container"
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8" data-testid="auth-card">
          <div className="flex items-center justify-center mb-8" data-testid="auth-logo">
            <div className="bg-emerald-500 p-3 rounded-xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-slate-800 mb-2" data-testid="auth-title">
            Expense Tracker
          </h1>
          <p className="text-center text-slate-600 mb-8" data-testid="auth-subtitle">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="auth-form">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                data-testid="auth-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                data-testid="auth-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                data-testid="auth-error-message"
                className={`p-4 rounded-lg text-sm ${error.includes('created')
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-red-50 text-red-800'
                  }`}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              data-testid="auth-submit-button"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid="auth-toggle-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

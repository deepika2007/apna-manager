import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';
import api from '../api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', {
        name,
        email,
        password
      });
      
      // Auto login after successful registration could be done here,
      // but requiring login validates the user workflow.
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass p-10 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-600 rounded-full blur-[90px] -z-10 opacity-30 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600 rounded-full blur-[90px] -z-10 opacity-20 pointer-events-none" />
        
        <div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Start managing your tasks and expenses today.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm transition-all">
              {error}
            </div>
          )}
          <div className="space-y-4">
             <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="input-field pl-10"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field pl-10"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input-field pl-10"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center py-3 text-base shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-500 hover:text-brand-400 transition-colors">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

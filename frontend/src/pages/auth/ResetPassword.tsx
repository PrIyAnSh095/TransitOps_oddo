import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, Terminal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiCall } from '../../services/api';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword || !token) return;

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    setStatus('loading');
    try {
      const res = await apiCall<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password }),
      });
      setStatus('success');
      setMessage(res.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-4 text-[#e5e2e1] font-sans selection:bg-[#404040]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 bg-[#171717] px-4 py-2 rounded-md border border-[#262626] shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <Terminal size={20} className="text-white" />
            <span className="font-semibold tracking-tight text-xl text-white font-mono">TransitOps</span>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg shadow-2xl p-8 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2 font-sans">
              Create New Password
            </h1>
            <p className="text-sm text-[#A3A3A3]">
              Enter your new password below
            </p>
          </div>

          {status === 'success' ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center text-green-500 mb-4">
                <CheckCircle2 size={48} />
              </div>
              <p className="text-[#c4c7c8] text-sm">{message}</p>
              <Link to="/login" className="block w-full py-2.5 px-4 border border-[#262626] rounded-md text-sm font-medium text-white hover:bg-[#111] transition-all">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="bg-[#1f1111] border border-[#4a1c1c] text-[#ffb4ab] px-4 py-3 rounded text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{message}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5d5f5f]">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded-md text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors text-sm font-mono"
                      placeholder="••••••••"
                      disabled={!token}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5d5f5f]">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded-md text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors text-sm font-mono"
                      placeholder="••••••••"
                      disabled={!token}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || !token}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-[#e5e2e1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

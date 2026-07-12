import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../schemas/auth';
import type { LoginFormValues } from '../../schemas/auth';
import { useAuthStore } from '../../store/authStore';
import { KeyRound, Mail, AlertCircle, Terminal, Lock, Eye, EyeOff } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { GoogleLogin } from '@react-oauth/google';
import { apiCall } from '../../services/api';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [requireCaptcha, setRequireCaptcha] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>();
  const [lockoutMsg, setLockoutMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      setLockoutMsg(null);
      
      if (requireCaptcha && !turnstileToken) {
        setError('Please complete the CAPTCHA');
        return;
      }
      
      await login(data.email, data.password, turnstileToken);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      if (err.remainingTimeMinutes) {
        setLockoutMsg(`Account locked due to too many failed attempts. Try again in ${err.remainingTimeMinutes} minutes.`);
      } else if (err.requireCaptcha) {
        setRequireCaptcha(true);
        setError(err.message || 'Invalid credentials');
      } else {
        setError(err.message || 'Invalid credentials');
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError(null);
      const res = await apiCall<{ token: string; user: any }>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      localStorage.setItem('transitops_token', res.token);
      useAuthStore.setState({ user: res.user, token: res.token });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      if (err.code === 'GOOGLE_USER_NOT_FOUND') {
        navigate('/auth/google-error');
      } else {
        setError(err.message || 'Google Auth Failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-4 text-[#e5e2e1] font-sans selection:bg-[#404040]">
      {/* Abstract Background pattern */}
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
              Sign in to TransitOps
            </h1>
            <p className="text-sm text-[#A3A3A3]">
              Enter your operational credentials below
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {lockoutMsg && (
              <div className="bg-[#1f1111] border border-[#4a1c1c] text-[#ffb4ab] px-4 py-3 rounded text-sm flex items-start gap-3">
                <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{lockoutMsg}</p>
              </div>
            )}

            {!lockoutMsg && error && (
              <div className="bg-[#1f1111] border border-[#4a1c1c] text-[#ffb4ab] px-4 py-3 rounded text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5d5f5f]">
                    <Mail size={16} />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    disabled={!!lockoutMsg}
                    className="block w-full pl-10 pr-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded-md text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors text-sm font-mono disabled:opacity-50"
                    placeholder="role@test.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-[#ffb4ab] text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Password</label>
                  <Link to="/auth/forgot-password" className="text-xs text-[#A3A3A3] hover:text-white transition-colors">Forgot password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5d5f5f]">
                    <KeyRound size={16} />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    disabled={!!lockoutMsg}
                    className="block w-full pl-10 pr-10 py-2 bg-[#050505] border border-[#1F1F1F] rounded-md text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors text-sm font-mono disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5d5f5f] hover:text-white transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[#ffb4ab] text-xs mt-1">{errors.password.message}</p>
                )}
              </div>
              
              {requireCaptcha && !lockoutMsg && (
                <div className="flex justify-center my-4">
                  <Turnstile 
                    siteKey="1x00000000000000000000AA"
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!lockoutMsg}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-[#e5e2e1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <span className="text-sm text-[#5d5f5f] bg-[#0A0A0A] px-2">Or continue with</span>
          </div>

          <div className="mt-4 flex justify-center w-full overflow-hidden rounded-md border border-[#262626]">
             <GoogleLogin
               onSuccess={handleGoogleSuccess}
               onError={() => setError('Google Login Failed')}
               theme="filled_black"
               shape="rectangular"
               text="continue_with"
               width="100%"
             />
          </div>
        </div>
      </div>
    </div>
  );
}

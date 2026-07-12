import { Link } from 'react-router-dom';
import { Terminal, AlertTriangle, ArrowLeft } from 'lucide-react';

export function GoogleOAuthError() {
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

        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg shadow-2xl p-8 backdrop-blur-xl text-center">
          <div className="flex justify-center text-amber-500 mb-6">
            <AlertTriangle size={48} />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-white mb-4 font-sans">
            Authentication Denied
          </h1>
          
          <p className="text-sm text-[#c4c7c8] mb-8 leading-relaxed">
            No user account was found for this Google account. Please contact your administrator to be added as a user.
          </p>

          <Link
            to="/login"
            className="w-full flex items-center justify-center py-2.5 px-4 border border-[#262626] rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#111] transition-all"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

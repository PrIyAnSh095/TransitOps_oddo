import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-[#e5e2e1] font-sans selection:bg-[#404040]">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-[#131313] border border-[#1F1F1F] rounded-full flex items-center justify-center mb-6">
          <FileQuestion className="w-8 h-8 text-[#5d5f5f]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-sans">
          404 Not Found
        </h1>
        <p className="text-sm text-[#A3A3A3] mb-8">
          The requested coordinate or module could not be located within the system.
        </p>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="mx-auto flex justify-center items-center gap-2 py-2 px-6 border border-[#262626] rounded-md shadow-sm text-sm font-medium text-white bg-[#0A0A0A] hover:bg-[#131313] hover:border-[#404040] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-[#0A0A0A] transition-all font-mono"
        >
          <ArrowLeft size={16} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

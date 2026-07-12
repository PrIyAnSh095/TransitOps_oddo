import { useState } from 'react';
import { User, Moon, Sun, Bell, Shield, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Settings() {
  const { user } = useAuthStore();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const handleSave = () => {
    if (theme === 'light') {
      alert('Light Mode is currently a stub for v2! Reverting to Dark Mode.');
      setTheme('dark');
    } else {
      alert('Settings saved successfully!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Settings</h2>
        <p className="text-sm text-[#8e9192]">Manage your account preferences and system configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 bg-[#131313] text-white rounded-lg border border-[#1F1F1F] text-sm font-medium transition-colors">
            <User size={18} className="text-[#48ddbc]" /> Account Profile
          </button>
          <button className="flex items-center gap-3 px-4 py-3 bg-transparent text-[#8e9192] hover:text-white hover:bg-[#0A0A0A] rounded-lg text-sm font-medium transition-colors">
            <Moon size={18} className="text-[#558ded]" /> Appearance
          </button>
          <button className="flex items-center gap-3 px-4 py-3 bg-transparent text-[#8e9192] hover:text-white hover:bg-[#0A0A0A] rounded-lg text-sm font-medium transition-colors">
            <Bell size={18} className="text-[#ffc633]" /> Notifications
          </button>
          <button className="flex items-center gap-3 px-4 py-3 bg-transparent text-[#8e9192] hover:text-white hover:bg-[#0A0A0A] rounded-lg text-sm font-medium transition-colors">
            <Shield size={18} className="text-[#ff6b6b]" /> Security
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-[#1F1F1F] pb-4">Profile Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  disabled 
                  value={user?.name || ''} 
                  className="w-full bg-[#131313] border border-[#1F1F1F] rounded px-3 py-2 text-white text-sm cursor-not-allowed opacity-70"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  type="email" 
                  disabled 
                  value={user?.email || ''} 
                  className="w-full bg-[#131313] border border-[#1F1F1F] rounded px-3 py-2 text-white text-sm cursor-not-allowed opacity-70"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-1">Role</label>
                <input 
                  type="text" 
                  disabled 
                  value={user?.role || ''} 
                  className="w-full bg-[#131313] border border-[#1F1F1F] rounded px-3 py-2 text-[#48ddbc] font-mono text-sm cursor-not-allowed opacity-70"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-[#1F1F1F] pb-4">Appearance</h3>
            
            <div>
              <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Theme Preference</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${theme === 'dark' ? 'border-[#48ddbc] bg-[#002019]' : 'border-[#1F1F1F] bg-[#131313] hover:border-[#404040]'}`}
                >
                  <Moon size={24} className={theme === 'dark' ? 'text-[#48ddbc]' : 'text-[#5d5f5f]'} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-[#48ddbc]' : 'text-[#8e9192]'}`}>Dark Mode</span>
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${theme === 'light' ? 'border-[#48ddbc] bg-[#002019]' : 'border-[#1F1F1F] bg-[#131313] hover:border-[#404040]'}`}
                >
                  <Sun size={24} className={theme === 'light' ? 'text-[#48ddbc]' : 'text-[#5d5f5f]'} />
                  <span className={`text-sm font-medium ${theme === 'light' ? 'text-[#48ddbc]' : 'text-[#8e9192]'}`}>Light Mode</span>
                </button>
              </div>
              <p className="text-xs text-[#5d5f5f] mt-3">Light mode is currently in beta. True dark mode is recommended for optimal contrast.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e2e1] transition-colors"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

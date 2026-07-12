import { useState } from 'react';
import { User, Moon, Sun, Bell, Shield, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Settings() {
  const { user } = useAuthStore();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'security'>('profile');

  const handleSave = () => {
    if (activeTab === 'appearance' && theme === 'light') {
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
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
              activeTab === 'profile' 
                ? 'bg-[#131313] text-white border-[#1F1F1F]' 
                : 'bg-transparent text-[#8e9192] border-transparent hover:text-white hover:bg-[#0A0A0A]'
            }`}
          >
            <User size={18} className={activeTab === 'profile' ? 'text-[#48ddbc]' : ''} /> Account Profile
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
              activeTab === 'appearance' 
                ? 'bg-[#131313] text-white border-[#1F1F1F]' 
                : 'bg-transparent text-[#8e9192] border-transparent hover:text-white hover:bg-[#0A0A0A]'
            }`}
          >
            <Moon size={18} className={activeTab === 'appearance' ? 'text-[#558ded]' : ''} /> Appearance
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
              activeTab === 'notifications' 
                ? 'bg-[#131313] text-white border-[#1F1F1F]' 
                : 'bg-transparent text-[#8e9192] border-transparent hover:text-white hover:bg-[#0A0A0A]'
            }`}
          >
            <Bell size={18} className={activeTab === 'notifications' ? 'text-[#ffc633]' : ''} /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
              activeTab === 'security' 
                ? 'bg-[#131313] text-white border-[#1F1F1F]' 
                : 'bg-transparent text-[#8e9192] border-transparent hover:text-white hover:bg-[#0A0A0A]'
            }`}
          >
            <Shield size={18} className={activeTab === 'security' ? 'text-[#ff6b6b]' : ''} /> Security
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'profile' && (
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-[#1F1F1F] pb-4">Profile Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-1">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.name || ''} 
                    className="w-full bg-[#050505] border border-[#1F1F1F] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
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
          )}

          {activeTab === 'appearance' && (
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
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-[#1F1F1F] pb-4">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">Email Alerts</h4>
                    <p className="text-xs text-[#8e9192]">Receive daily summaries and critical alerts via email.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#48ddbc] bg-[#050505] border-[#1F1F1F]" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#1F1F1F]">
                  <div>
                    <h4 className="text-sm font-medium text-white">Maintenance Reminders</h4>
                    <p className="text-xs text-[#8e9192]">Get notified when vehicles are due for service.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#48ddbc] bg-[#050505] border-[#1F1F1F]" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#1F1F1F]">
                  <div>
                    <h4 className="text-sm font-medium text-white">Driver Expiry Warnings</h4>
                    <p className="text-xs text-[#8e9192]">Alerts for licenses expiring within 30 days.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#48ddbc] bg-[#050505] border-[#1F1F1F]" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-[#1F1F1F] pb-4">Security Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-1">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-[#050505] border border-[#1F1F1F] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-1">New Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password"
                    className="w-full bg-[#050505] border border-[#1F1F1F] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
                  />
                </div>
                
                <div className="pt-4 border-t border-[#1F1F1F] mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">Two-Factor Authentication (2FA)</h4>
                      <p className="text-xs text-[#8e9192]">Require a security key or authenticator app.</p>
                    </div>
                    <button className="px-3 py-1.5 bg-[#131313] border border-[#1F1F1F] text-white text-xs rounded hover:bg-[#1a1a1a]">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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

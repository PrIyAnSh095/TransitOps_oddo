import { useState } from 'react';
import { User, UserPlus, Bell, Shield, Save, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { createUser } from '../../services/users';
import { requestPasswordChange } from '../../services/auth';
import type { UserRole } from '../../types';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'FleetManager', label: 'Fleet Manager' },
  { value: 'Dispatcher', label: 'Dispatcher' },
  { value: 'SafetyOfficer', label: 'Safety Officer' },
  { value: 'FinancialAnalyst', label: 'Financial Analyst' },
];

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'notifications' | 'security'>('profile');

  // --- Profile tab state ---
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Add User tab state ---
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Dispatcher' as UserRole, password: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Security tab state ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    if (activeTab === 'profile') {
      if (!name.trim()) {
        setSaveMsg({ type: 'error', text: 'Name cannot be empty.' });
        return;
      }
      try {
        setIsSaving(true);
        setSaveMsg(null);
        await updateUser({ name: name.trim() });
        setSaveMsg({ type: 'success', text: 'Profile updated successfully!' });
      } catch (err: any) {
        setSaveMsg({ type: 'error', text: err?.message || 'Failed to save changes.' });
      } finally {
        setIsSaving(false);
      }
    } else {
      setSaveMsg({ type: 'success', text: 'Settings saved!' });
    }
  };

  const handleCreateUser = async () => {
    const { name: uName, email, role, password } = newUser;
    if (!uName.trim() || !email.trim() || !password.trim()) {
      setCreateMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setCreateMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 6) {
      setCreateMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    try {
      setIsCreating(true);
      setCreateMsg(null);
      await createUser({ name: uName.trim(), email: email.trim(), role, password });
      setCreateMsg({ type: 'success', text: `User "${uName.trim()}" created successfully!` });
      setNewUser({ name: '', email: '', role: 'Dispatcher', password: '' });
    } catch (err: any) {
      setCreateMsg({ type: 'error', text: err?.message || 'Failed to create user.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRequestPasswordChange = async () => {
    if (!currentPassword.trim()) {
      setSecurityMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    try {
      setIsSendingReset(true);
      setSecurityMsg(null);
      const res = await requestPasswordChange(currentPassword);
      setSecurityMsg({ type: 'success', text: res.message });
      setCurrentPassword('');
    } catch (err: any) {
      setSecurityMsg({ type: 'error', text: err?.message || 'Failed to send reset link.' });
    } finally {
      setIsSendingReset(false);
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
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-[#131313] text-white border-[#1F1F1F]'
                : 'bg-transparent text-[#8e9192] border-transparent hover:text-white hover:bg-[#0A0A0A]'
            }`}
          >
            <UserPlus size={18} className={activeTab === 'users' ? 'text-[#558ded]' : ''} /> Add User
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

          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-[#1F1F1F] pb-4">Profile Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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

          {/* ── Add User Tab ── */}
          {activeTab === 'users' && (
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-[#1F1F1F] pb-4">Add New User</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full bg-[#050505] border border-[#1F1F1F] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@transitops.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-[#050505] border border-[#1F1F1F] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    className="w-full bg-[#050505] border border-[#1F1F1F] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white appearance-none"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-1">Temporary Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full bg-[#050505] border border-[#1F1F1F] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-2">
                {createMsg && (
                  <span className={`text-sm font-medium ${createMsg.type === 'success' ? 'text-[#48ddbc]' : 'text-[#ff6b6b]'}`}>
                    {createMsg.text}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCreateUser}
                  disabled={isCreating}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e2e1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus size={16} /> {isCreating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications Tab ── */}
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

          {/* ── Security Tab ── */}
          {activeTab === 'security' && (
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-[#1F1F1F] pb-4">Security Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9192] uppercase tracking-wider mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1F1F1F] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
                  />
                  <p className="mt-2 text-xs text-[#8e9192]">
                    Enter your current password and we'll send a reset link to <span className="text-white font-medium">{user?.email}</span>.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-4">
                  {securityMsg && (
                    <span className={`text-sm font-medium ${securityMsg.type === 'success' ? 'text-[#48ddbc]' : 'text-[#ff6b6b]'}`}>
                      {securityMsg.text}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleRequestPasswordChange}
                    disabled={isSendingReset}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e2e1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail size={16} /> {isSendingReset ? 'Sending...' : 'Send Reset Link'}
                  </button>
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

          {/* ── Save Button (profile & notifications tabs only) ── */}
          {activeTab !== 'users' && activeTab !== 'security' && (
            <div className="flex items-center justify-end gap-4">
              {saveMsg && (
                <span className={`text-sm font-medium ${saveMsg.type === 'success' ? 'text-[#48ddbc]' : 'text-[#ff6b6b]'}`}>
                  {saveMsg.text}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e2e1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

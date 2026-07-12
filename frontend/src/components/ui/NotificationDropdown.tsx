import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { getAlerts, type AlertItem } from '../../services/dashboard';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    getAlerts().then(res => {
      if (mounted) setAlerts(res);
    }).catch(console.error);
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <ShieldAlert size={16} className="text-[#ff6b6b]" />;
      case 'medium': return <AlertTriangle size={16} className="text-[#ffc633]" />;
      default: return <Info size={16} className="text-[#558ded]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#c4c7c8] hover:text-white hover:bg-[#1c1b1b] rounded-full transition-colors"
      >
        <Bell size={20} />
        {alerts.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff6b6b] rounded-full border-2 border-[#131313]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#131313] border border-[#262626] rounded-lg shadow-xl shadow-black/50 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#262626] flex items-center justify-between bg-[#171717]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h3>
            <span className="text-xs bg-[#201f1f] text-[#8e9192] px-2 py-0.5 rounded-full font-mono">{alerts.length}</span>
          </div>
          
          <div className="max-h-96 overflow-y-auto scrollbar-hide">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-[#8e9192] text-sm">No new notifications</div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="p-4 border-b border-[#1F1F1F] hover:bg-[#1a1a1a] transition-colors flex gap-3">
                  <div className="mt-0.5">{getIcon(alert.severity)}</div>
                  <div>
                    <p className="text-xs font-bold text-[#c4c7c8] uppercase tracking-wider mb-1">{alert.type}</p>
                    <p className="text-sm text-white leading-tight">{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {alerts.length > 0 && (
            <button 
              onClick={() => setAlerts([])}
              className="w-full p-3 text-xs text-center text-[#8e9192] hover:text-white hover:bg-[#1c1b1b] transition-colors border-t border-[#262626]"
            >
              Mark all as read
            </button>
          )}
        </div>
      )}
    </div>
  );
}

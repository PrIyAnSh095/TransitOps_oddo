import { useState, useEffect } from 'react';
import { Plus, Fuel, DollarSign, Calculator, AlertTriangle } from 'lucide-react';
import { getFuelLogs, getExpenses, getExpensesSummary } from '../../services/expenses.ts';
import { getMaintenanceLogs } from '../../services/maintenance.ts';
import { getVehicles, type SummaryData } from '../../services/vehicles.ts';
import type { FuelLog, Expense, MaintenanceLog, Vehicle } from '../../types';
import { LoadingBuffer } from '../../components/ui/Loading.tsx';
import { SummaryCard } from '../../components/ui/SummaryCard.tsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FuelLogModal } from './FuelLogModal.tsx';
import { ExpenseModal } from './ExpenseModal.tsx';

export default function Expenses() {
  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses' | 'costs'>('fuel');
  
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [period, setPeriod] = useState('monthly');

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters = { period };
      const [fData, eData, mData, vData, sData] = await Promise.all([
        getFuelLogs(),
        getExpenses(filters),
        getMaintenanceLogs(),
        getVehicles(),
        getExpensesSummary(filters)
      ]);
      setFuelLogs(fData);
      setExpenses(eData);
      setMaintenance(mData);
      setVehicles(vData);
      setSummary(sData);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  if (error) throw error;
  if (loading && !expenses.length) return <LoadingBuffer message="Loading Financial Data..." />;

  // Calculate live operational costs per vehicle
  const operationalCosts = vehicles.map(v => {
    const vFuelLogs = fuelLogs.filter(f => f.vehicleId === v.id);
    const vMaintenanceLogs = maintenance.filter(m => m.vehicleId === v.id);
    const vExpenses = expenses.filter(e => e.vehicleId === v.id);

    const totalFuel = vFuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalMaintenance = vMaintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const totalMisc = vExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      vehicle: v,
      totalFuel,
      totalMaintenance,
      totalMisc,
      total: totalFuel + totalMaintenance + totalMisc
    };
  }).sort((a, b) => b.total - a.total); // Sort by highest cost first

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Fuel & Expenses</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e2e1] transition-colors"
          >
            <Fuel size={16} /> Add Fuel Log
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#262626] text-white text-sm font-medium rounded hover:bg-[#131313] transition-colors"
          >
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[#1F1F1F]">
        <button
          onClick={() => setActiveTab('fuel')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'fuel' ? 'border-white text-white' : 'border-transparent text-[#5d5f5f] hover:text-[#c4c7c8]'
          }`}
        >
          <div className="flex items-center gap-2"><Fuel size={16} /> Fuel Logs</div>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'expenses' ? 'border-white text-white' : 'border-transparent text-[#5d5f5f] hover:text-[#c4c7c8]'
          }`}
        >
          <div className="flex items-center gap-2"><DollarSign size={16} /> General Expenses</div>
        </button>
        <button
          onClick={() => setActiveTab('costs')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'costs' ? 'border-white text-white' : 'border-transparent text-[#5d5f5f] hover:text-[#c4c7c8]'
          }`}
        >
          <div className="flex items-center gap-2"><Calculator size={16} /> Operational Costs</div>
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {loading && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-[#ffc633] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8]">Expense Trend</h3>
              <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-[#131313] border border-[#262626] text-[#c4c7c8] text-xs px-2 py-1 rounded focus:outline-none"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.chartData}>
                  <defs>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffc633" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ffc633" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                  <XAxis dataKey="name" stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#131313', border: '1px solid #262626', borderRadius: '4px' }} />
                  <Area type="monotone" dataKey="value" stroke="#ffc633" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-1">
            <SummaryCard title="Expense Summary" stats={summary.stats.map(s => ({ label: s.label, value: s.value, color: s.color }))} />
          </div>
        </div>
      )}

      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-x-auto">
        {activeTab === 'fuel' && (
          <table className="w-full text-left text-sm text-[#c4c7c8]">
            <thead className="bg-[#131313] border-b border-[#1F1F1F] text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Date</th>
                <th className="p-4">Liters</th>
                <th className="p-4">Cost</th>
                <th className="p-4">Trip (Opt)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {fuelLogs.map(log => {
                const vehicle = vehicles.find(v => v.id === log.vehicleId);
                return (
                  <tr key={log.id} className="hover:bg-[#131313] transition-colors">
                    <td className="p-4">
                      {vehicle ? (
                        <div>
                          <span className="text-white font-medium">{vehicle.registrationNumber}</span>
                          <div className="text-xs text-[#5d5f5f]">{vehicle.name}</div>
                        </div>
                      ) : (
                        <span className="text-[#5d5f5f]">Unknown</span>
                      )}
                    </td>
                    <td className="p-4 font-mono">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="p-4 font-mono">{log.liters.toFixed(1)} L</td>
                    <td className="p-4 font-mono text-white">₹{log.cost.toFixed(2)}</td>
                    <td className="p-4 text-[#5d5f5f]">{log.tripId || '-'}</td>
                  </tr>
                );
              })}
              {fuelLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#5d5f5f]">
                    <AlertTriangle className="mx-auto mb-2 text-[#5d5f5f]" size={24} />
                    No fuel logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'expenses' && (
          <table className="w-full text-left text-sm text-[#c4c7c8]">
            <thead className="bg-[#131313] border-b border-[#1F1F1F] text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Vehicle (Opt)</th>
                <th className="p-4">Trip (Opt)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {expenses.map(exp => {
                const vehicle = vehicles.find(v => v.id === exp.vehicleId);
                return (
                  <tr key={exp.id} className="hover:bg-[#131313] transition-colors">
                    <td className="p-4 text-white font-medium">{exp.type}</td>
                    <td className="p-4 font-mono">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="p-4 font-mono text-white">₹{exp.amount.toFixed(2)}</td>
                    <td className="p-4 text-[#5d5f5f]">{vehicle ? vehicle.registrationNumber : '-'}</td>
                    <td className="p-4 text-[#5d5f5f]">{exp.tripId || '-'}</td>
                  </tr>
                );
              })}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#5d5f5f]">
                    <AlertTriangle className="mx-auto mb-2 text-[#5d5f5f]" size={24} />
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'costs' && (
          <table className="w-full text-left text-sm text-[#c4c7c8]">
            <thead className="bg-[#131313] border-b border-[#1F1F1F] text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Total Fuel</th>
                <th className="p-4">Total Maintenance</th>
                <th className="p-4">Other Expenses</th>
                <th className="p-4 font-bold text-white">Total Operational Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {operationalCosts.map(row => (
                <tr key={row.vehicle.id} className="hover:bg-[#131313] transition-colors">
                  <td className="p-4">
                    <span className="text-white font-medium">{row.vehicle.registrationNumber}</span>
                    <div className="text-xs text-[#5d5f5f]">{row.vehicle.name}</div>
                  </td>
                  <td className="p-4 font-mono">₹{row.totalFuel.toFixed(2)}</td>
                  <td className="p-4 font-mono">₹{row.totalMaintenance.toFixed(2)}</td>
                  <td className="p-4 font-mono">₹{row.totalMisc.toFixed(2)}</td>
                  <td className="p-4 font-mono text-[#48ddbc] font-bold">
                    ₹{row.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              {operationalCosts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#5d5f5f]">
                    <AlertTriangle className="mx-auto mb-2 text-[#5d5f5f]" size={24} />
                    No vehicles found to compute costs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <FuelLogModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        onSaved={(log) => setFuelLogs(prev => [log, ...prev])}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSaved={(exp) => setExpenses(prev => [exp, ...prev])}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Plus, Fuel, DollarSign, Calculator, AlertTriangle } from 'lucide-react';
import { getFuelLogs, getExpenses } from '../../services/expenses.ts';
import { getMaintenanceLogs } from '../../services/maintenance.ts';
import { getVehicles } from '../../services/vehicles.ts';
import type { FuelLog, Expense, MaintenanceLog, Vehicle } from '../../types';
import { LoadingBuffer } from '../../components/ui/Loading.tsx';
import { FuelLogModal } from './FuelLogModal.tsx';
import { ExpenseModal } from './ExpenseModal.tsx';

export default function Expenses() {
  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses' | 'costs'>('fuel');
  
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fData, eData, mData, vData] = await Promise.all([
        getFuelLogs(),
        getExpenses(),
        getMaintenanceLogs(),
        getVehicles()
      ]);
      setFuelLogs(fData);
      setExpenses(eData);
      setMaintenance(mData);
      setVehicles(vData);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) throw error;
  if (loading) return <LoadingBuffer message="Loading Financial Data..." />;

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
                    <td className="p-4 font-mono text-white">${log.cost.toFixed(2)}</td>
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
                    <td className="p-4 font-mono text-white">${exp.amount.toFixed(2)}</td>
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
                  <td className="p-4 font-mono">${row.totalFuel.toFixed(2)}</td>
                  <td className="p-4 font-mono">${row.totalMaintenance.toFixed(2)}</td>
                  <td className="p-4 font-mono">${row.totalMisc.toFixed(2)}</td>
                  <td className="p-4 font-mono text-[#48ddbc] font-bold">
                    ${row.total.toFixed(2)}
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

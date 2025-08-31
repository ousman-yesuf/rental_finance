import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchBuildings } from '../features/buildingsSlice';
import { fetchSummary } from '../features/summarySlice';
import { FaDollarSign, FaChartPie, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector((state) => state.buildings.buildings);
  const summary = useAppSelector((state) => state.summary.summary);
  const status = useAppSelector((state) => state.summary.status);
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchBuildings());
  }, [dispatch]);

  useEffect(() => {
    if (buildings.length > 0 && !selectedBuilding) {
      setSelectedBuilding(buildings[0].id);
    }
  }, [buildings, selectedBuilding]);

  useEffect(() => {
    if (selectedBuilding) {
      dispatch(fetchSummary(selectedBuilding));
    }
  }, [selectedBuilding, dispatch]);
 

  const formatCurrency = (val: number) =>
    `$${val?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const cards = [
    { title: 'Total Rent Collected', value: summary.totalRent, icon: <FaDollarSign />, color: 'bg-green-50 text-green-800' },
    { title: 'Total Expenses', value: summary.totalExpenses, icon: <FaMoneyBillWave />, color: 'bg-red-50 text-red-800' },
    { title: 'Total Payroll', value: summary.totalPayroll, icon: <FaMoneyBillWave />, color: 'bg-yellow-50 text-yellow-800' },
    { title: 'Total VAT', value: summary.totalVAT, icon: <FaChartPie />, color: 'bg-purple-50 text-purple-800' },
    { title: 'Outstanding Rent', value: summary.outstandingRent, icon: <FaDollarSign />, color: 'bg-orange-50 text-orange-800' },
    { title: 'Units / Tenants', value: `${summary.numUnits || 0} / ${summary.numTenants || 0}`, icon: <FaUsers />, color: 'bg-blue-50 text-blue-800' },
  ];

  const chartData = [
    { name: 'Rent', amount: summary.totalRent || 0 },
    { name: 'Expenses', amount: summary.totalExpenses || 0 },
    { name: 'Payroll', amount: summary.totalPayroll || 0 },
    { name: 'VAT', amount: summary.totalVAT || 0 },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Summary</h2>

      <div className="w-full md:w-1/4">
        <label className="block mb-2 font-medium text-gray-700">Select Building:</label>
        <select
          onChange={(e) => setSelectedBuilding(Number(e.target.value))}
          className="w-full p-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">-- Select Building --</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {status === 'loading' && <p className="text-gray-600">Loading summary...</p>}
      {status === 'failed' && <p className="text-red-600">Error loading summary</p>}

      {selectedBuilding && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {cards.map((card, idx) => (
              <div
                key={idx}
                className={`flex items-center p-6 rounded-xl shadow hover:shadow-lg transition transform hover:scale-105 ${card.color}`}
              >
                <div className="text-4xl mr-4">{card.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg">{card.title}</h3>
                  <p className="text-2xl font-bold mt-1">
                    {typeof card.value === 'number' ? formatCurrency(card.value) : card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Rent vs Expenses Chart */}
          <div className="bg-white p-6 rounded-xl shadow mb-8">
            <h3 className="text-xl font-semibold mb-4">Financial Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Payments */}
          <div className="bg-white p-6 rounded-xl shadow mb-8 overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4">Recent Payments</h3>
            <table className="min-w-full border rounded-lg">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-3 border text-left">Unit</th>
                  <th className="p-3 border text-left">Tenant</th>
                  <th className="p-3 border text-left">Amount</th>
                  <th className="p-3 border text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentPayments?.map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 even:bg-gray-50/50">
                    <td className="p-3 border">{p.unitNumber}</td>
                    <td className="p-3 border">{p.tenantName}</td>
                    <td className="p-3 border">{formatCurrency(p.amount)}</td>
                    <td className="p-3 border">{new Date(p.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Tenants */}
          <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4">Top Tenants by Rent</h3>
            <table className="min-w-full border rounded-lg">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-3 border text-left">Tenant</th>
                  <th className="p-3 border text-left">Unit</th>
                  <th className="p-3 border text-left">Rent</th>
                </tr>
              </thead>
              <tbody>
                {summary.topTenants?.map((t, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 even:bg-gray-50/50">
                    <td className="p-3 border">{t.tenantName}</td>
                    <td className="p-3 border">{t.unitNumber}</td>
                    <td className="p-3 border">{formatCurrency(t.rentAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchBuildings } from '../features/buildingsSlice';
import { fetchVatReport } from '../features/vatReportSlice';

function VatReports() {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector((state: RootState) => state.buildings.buildings);
  const report = useAppSelector((state: RootState) => state.vatReport.report);
  const status = useAppSelector((state: RootState) => state.vatReport.status);
  const error = useAppSelector((state: RootState) => state.vatReport.error);

  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

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
      dispatch(fetchVatReport(selectedBuilding));
    }
  }, [selectedBuilding, dispatch]);

  // Filter data by date
  const filterByDate = (items: any[]) => {
    return items.filter(item => {
      const itemDate = new Date(item.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      return (!from || itemDate >= from) && (!to || itemDate <= to);
    });
  };

  const filteredExpenses = filterByDate(report.expensesVAT || []);
  const filteredPayrolls = filterByDate(report.payrollsVAT || []);

  const handleAdd = () => {
    // Add button logic
    console.log('Add clicked');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">VAT Reports</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md shadow">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      {status === 'loading' && <p className="text-gray-600">Loading VAT report...</p>}

      {selectedBuilding && (
        <>
          {/* Top Controls Row */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            

            {/* Building Selector */}
            <div className="w-full md:w-1/4">
              <label className="block mb-1 font-medium text-gray-700">Building:</label>
              <select
                value={selectedBuilding ?? ''}
                onChange={(e) => setSelectedBuilding(Number(e.target.value) || null)}
                className="w-full p-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Select Building --</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Total VAT Card */}
          <div className="bg-white shadow-md rounded-xl p-6 mb-8 flex justify-between items-center">
            <span className="text-gray-700 font-semibold text-lg">Total VAT Collected:</span>
            <span className="text-green-600 font-bold text-xl">
              ${(
                filteredExpenses.reduce((sum, e) => sum + (e.vat || 0), 0) +
                filteredPayrolls.reduce((sum, p) => sum + (p.vat || 0), 0)
              ).toFixed(2)}
            </span>
          </div>

          {/* Expenses Table */}
          <div className="bg-white shadow-md rounded-xl p-6 mb-8 overflow-x-auto">
            <h3 className="text-gray-700 font-semibold text-lg mb-4">Expenses VAT</h3>
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">VAT</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length ? (
                  filteredExpenses.map(exp => (
                    <tr key={exp.id} className="odd:bg-gray-50 hover:bg-gray-100 transition">
                      <td className="p-3">{exp.description}</td>
                      <td className="p-3 text-right">${(exp.amount || 0).toFixed(2)}</td>
                      <td className="p-3 text-right">${(exp.vat || 0).toFixed(2)}</td>
                      <td className="p-3">{new Date(exp.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-gray-500">No expenses found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payrolls Table */}
          <div className="bg-white shadow-md rounded-xl p-6 mb-8 overflow-x-auto">
            <h3 className="text-gray-700 font-semibold text-lg mb-4">Payrolls VAT</h3>
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3 text-right">Salary</th>
                  <th className="p-3 text-right">VAT</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.length ? (
                  filteredPayrolls.map(pay => (
                    <tr key={pay.id} className="odd:bg-gray-50 hover:bg-gray-100 transition">
                      <td className="p-3">{pay.employeeName}</td>
                      <td className="p-3 text-right">${(pay.salary || 0).toFixed(2)}</td>
                      <td className="p-3 text-right">${(pay.vat || 0).toFixed(2)}</td>
                      <td className="p-3">{new Date(pay.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-gray-500">No payroll records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default VatReports;

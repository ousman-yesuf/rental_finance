import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  fetchBuildings,
} from '../features/buildingsSlice';
import {
  fetchPayrolls,
  createPayroll,
  updatePayroll,
  deletePayroll,
} from '../features/payrollSlice';
import { payrollSchema } from '../schemas';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const VAT_RATE = 0.1; // 10% VAT

function Payroll() {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector((state: RootState) => state.buildings.buildings);
  const payrolls = useAppSelector((state: RootState) => state.payroll.payrolls);
  const status = useAppSelector((state: RootState) => state.payroll.status);
  const error = useAppSelector((state: RootState) => state.payroll.error);

  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [formData, setFormData] = useState({
    employeeName: '',
    salary: '',
    date: '',
    deductions: '',
    vat: '',
  });
  const [errors, setErrors] = useState<any>({});

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
      dispatch(fetchPayrolls(selectedBuilding));
    }
  }, [selectedBuilding, dispatch]);

  // Reset form
  const resetForm = () => {
    setFormData({ employeeName: '', salary: '', date: '', deductions: '', vat: '' });
    setErrors({});
    setEditId(null);
    setShowForm(false);
  };

  // Calculate VAT automatically
  const calculateVat = (salary: number, deductions: number) => {
    return Math.max((salary - deductions) * VAT_RATE, 0);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = payrollSchema.parse({
        buildingId: Number(selectedBuilding),
        employeeName: formData.employeeName,
        salary: formData.salary ? Number(formData.salary) : undefined,
        date: formData.date ? new Date(formData.date) : undefined,
        deductions: formData.deductions ? Number(formData.deductions) : undefined,
        vat: formData.vat ? Number(formData.vat) : 0,
      });

      if (editId) {
        await dispatch(updatePayroll({ id: editId, data: validatedData })).unwrap();
      } else {
        await dispatch(createPayroll(validatedData)).unwrap();
      }

      if (selectedBuilding) dispatch(fetchPayrolls(selectedBuilding));
      resetForm();
    } catch (err: any) {
      setErrors(err.formErrors?.fieldErrors || {});
    }
  };

  // Edit payroll
  const handleEdit = (pay: any) => {
    setEditId(pay.id);
    setFormData({
      employeeName: pay.employeeName,
      salary: pay.salary.toString(),
      date: new Date(pay.date).toISOString().split('T')[0],
      deductions: pay.deductions.toString(),
      vat: pay.vat.toString(),
    });
    setShowForm(true);
  };

  // Delete payroll
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this payroll?')) {
      await dispatch(deletePayroll(id)).unwrap();
      if (selectedBuilding) dispatch(fetchPayrolls(selectedBuilding));
    }
  };

  // Filter payrolls by date
  const filteredPayrolls = payrolls.filter((p) => {
    const pDate = new Date(p.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    return (!from || pDate >= from) && (!to || pDate <= to);
  });

  // Summary totals
  const totalSalary = filteredPayrolls.reduce((sum, p) => sum + (p.salary || 0), 0);
  const totalDeductions = filteredPayrolls.reduce((sum, p) => sum + (p.deductions || 0), 0);
  const totalVAT = filteredPayrolls.reduce((sum, p) => sum + (p.vat || calculateVat(p.salary || 0, p.deductions || 0)), 0);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Payroll Management</h2>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md shadow">{error}</div>}
      {status === 'loading' && <p className="text-gray-600">Loading payrolls...</p>}

      {/* Building Select */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block mb-2 font-medium text-gray-700">Select Building:</label>
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
        <div className="flex gap-4">
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

        {/* Add Button */}
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus size={16} className="inline mr-1" /> Add Payroll
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8 flex justify-between items-center">
        <div>
          <p className="text-gray-700 font-semibold">Total Salary: ${totalSalary.toFixed(2)}</p>
          <p className="text-gray-700 font-semibold">Total Deductions: ${totalDeductions.toFixed(2)}</p>
        </div>
        <p className="text-green-600 font-bold text-xl">Total VAT: ${totalVAT.toFixed(2)}</p>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4">Payroll Records</h3>
        {filteredPayrolls.length === 0 ? (
          <p className="text-gray-500">No payroll records found for this building and date range.</p>
        ) : (
          <table className="w-full text-gray-700">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Salary</th>
                <th className="p-3 text-left">Deductions</th>
                <th className="p-3 text-left">VAT</th>
                <th className="p-3 text-left">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayrolls.map((pay, idx) => (
                <tr key={pay.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3">{pay.employeeName}</td>
                  <td className="p-3">${(pay.salary || 0).toFixed(2)}</td>
                  <td className="p-3">${(pay.deductions || 0).toFixed(2)}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium">
                      ${(pay.vat || calculateVat(pay.salary || 0, pay.deductions || 0)).toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3">{new Date(pay.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <button onClick={() => handleEdit(pay)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <Edit size={16} /> Edit
                    </button>
                    <button onClick={() => handleDelete(pay.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payroll Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">{editId ? 'Edit Payroll' : 'Add Payroll'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Employee Name</label>
                <input
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.employeeName && <p className="text-red-600 text-sm mt-1">{errors.employeeName[0]}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Salary</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => {
                    const salary = e.target.value;
                    const deductions = formData.deductions || '0';
                    const vat = calculateVat(Number(salary), Number(deductions));
                    setFormData({ ...formData, salary, vat: vat.toFixed(2) });
                  }}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.salary && <p className="text-red-600 text-sm mt-1">{errors.salary[0]}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Deductions</label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => {
                    const deductions = e.target.value;
                    const salary = formData.salary || '0';
                    const vat = calculateVat(Number(salary), Number(deductions));
                    setFormData({ ...formData, deductions, vat: vat.toFixed(2) });
                  }}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.deductions && <p className="text-red-600 text-sm mt-1">{errors.deductions[0]}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">VAT</label>
                <input
                  type="number"
                  value={formData.vat}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date[0]}</p>}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {editId ? 'Update Payroll' : 'Add Payroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payroll;

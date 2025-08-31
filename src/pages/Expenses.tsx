import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchBuildings } from '../features/buildingsSlice';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '../features/expensesSlice';
import { expenseSchema } from '../schemas';

import { Plus, Edit, Trash2, X } from "lucide-react";

function Expenses() {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector((state: RootState) => state.buildings.buildings);
  const expenses = useAppSelector((state: RootState) => state.expenses.expenses);
  const status = useAppSelector((state: RootState) => state.expenses.status);
  const error = useAppSelector((state: RootState) => state.expenses.error);

  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    buildingId: '',
    description: '',
    amount: '',
    date: '',
    category: '',
    vat: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<number | null>(null);
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
      dispatch(fetchExpenses(selectedBuilding));
    }
  }, [selectedBuilding, dispatch]);
 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = expenseSchema.parse({
        buildingId: formData.buildingId ? Number(formData.buildingId) : undefined,
        description: formData.description || undefined,
        amount: formData.amount ? Number(formData.amount) : undefined,
        date: formData.date ? new Date(formData.date) : undefined,
        category: formData.category || undefined,
        vat: formData.vat ? Number(formData.vat) : undefined,
      });

      if (editMode && editExpenseId !== null) {
        dispatch(updateExpense({ id: editExpenseId, data: validatedData }));
      } else {
        dispatch(createExpense(validatedData));
      }
      setFormData({ buildingId: '', description: '', amount: '', date: '', category: '', vat: '' });
      setIsModalOpen(false);
      setEditMode(false);
      setEditExpenseId(null);
      setErrors({});
    } catch (error: any) {
      setErrors(error.formErrors?.fieldErrors || {});
    }
  };

  const handleAdd = () => {
    setFormData({
      buildingId: selectedBuilding?.toString() || '',
      description: '',
      amount: '',
      date: '',
      category: '',
      vat: '',
    });
    setEditMode(false);
    setEditExpenseId(null);
    setIsModalOpen(true);
    setErrors({});
  };

  const handleEdit = (expense: any) => {
    setFormData({
      buildingId: expense.buildingId.toString(),
      description: expense.description,
      amount: expense.amount.toString(),
      date: new Date(expense.date).toISOString().split('T')[0],
      category: expense.category,
      vat: expense.vat.toString(),
    });
    setEditMode(true);
    setEditExpenseId(expense.id);
    setIsModalOpen(true);
    setErrors({});
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      dispatch(deleteExpense(id));
    }
  };

  const handleCancel = () => {
    setFormData({ buildingId: '', description: '', amount: '', date: '', category: '', vat: '' });
    setIsModalOpen(false);
    setEditMode(false);
    setEditExpenseId(null);
    setErrors({});
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalVAT = expenses.reduce((sum, e) => sum + e.vat, 0);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Expense Management</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <label htmlFor="buildingSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Building
          </label>
          <select
            id="buildingSelect"
            value={selectedBuilding?.toString() || ''}
            onChange={(e) => {
              const value = Number(e.target.value) || null;
              setSelectedBuilding(value);
              setFormData((prev) => ({ ...prev, buildingId: value ? value.toString() : '' }));
            }}
            className="w-full max-w-xs px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Building</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        {selectedBuilding && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Expense
          </button>
        )}
      </div>

      {selectedBuilding && (
        <>
          {status === 'loading' && <p className="text-gray-600">Loading...</p>}

          <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Description</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">VAT</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No expenses found for this building.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp, i) => (
                    <tr key={exp.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-3 font-medium text-gray-900">{exp.description}</td>
                      <td className="px-6 py-3 text-gray-700">${exp.amount.toFixed(2)}</td>
                      <td className="px-6 py-3 text-gray-700">${exp.vat.toFixed(2)}</td>
                      <td className="px-6 py-3 text-gray-700">{exp.category}</td>
                      <td className="px-6 py-3 text-gray-700">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-3">
                        <button
                          onClick={() => handleEdit(exp)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                       <Edit size={16} />   Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                         <Trash2 size={16} />  Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {expenses.length > 0 && (
                <tfoot className="bg-gray-50 font-semibold text-gray-800">
                  <tr>
                    <td className="px-6 py-3">Total</td>
                    <td className="px-6 py-3">${totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-3">${totalVAT.toFixed(2)}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {editMode ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Building */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Building</label>
                <select
                  value={formData.buildingId}
                  onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Building</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.buildingId && <p className="text-red-600 text-sm">{errors.buildingId[0]}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {errors.description && <p className="text-red-600 text-sm">{errors.description[0]}</p>}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {errors.amount && <p className="text-red-600 text-sm">{errors.amount[0]}</p>}
              </div>

              {/* VAT */}
              <div>
                <label className="block text-sm font-medium text-gray-700">VAT</label>
                <input
                  type="number"
                  value={formData.vat}
                  onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {errors.vat && <p className="text-red-600 text-sm">{errors.vat[0]}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {errors.category && <p className="text-red-600 text-sm">{errors.category[0]}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {errors.date && <p className="text-red-600 text-sm">{errors.date[0]}</p>}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editMode ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;

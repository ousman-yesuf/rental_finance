import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchBuildings, createBuilding } from "../features/buildingsSlice";
import { buildingSchema } from "../schemas";
import { Plus, Edit2, Trash2 } from "lucide-react";

function Buildings() {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector((state: RootState) => state.buildings.buildings);
  const status = useAppSelector((state: RootState) => state.buildings.status);
  const error = useAppSelector((state: RootState) => state.buildings.error);

  const [formData, setFormData] = useState({ name: "", address: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    dispatch(fetchBuildings());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = buildingSchema.parse(formData);
      dispatch(createBuilding(validatedData));
      setFormData({ name: "", address: "" });
      setIsModalOpen(false);
      setErrors({});
    } catch (error: any) {
      setErrors(error.formErrors?.fieldErrors || {});
    }
  };

  const handleAdd = () => {
    setFormData({ name: "", address: "" });
    setIsModalOpen(true);
    setErrors({});
  };

  const handleCancel = () => {
    setFormData({ name: "", address: "" });
    setIsModalOpen(false);
    setErrors({});
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">🏢 Building Management</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Add Building
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-sm">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      {/* Loading / Error */}
      {status === "loading" && <p className="text-gray-600">Loading buildings...</p>}
      {status === "failed" && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-sm">
          <p className="font-medium">Error loading buildings: {error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">Address</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {buildings.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-6 text-center text-gray-500">
                  No buildings found.
                </td>
              </tr>
            ) : (
              buildings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{b.name}</td>
                  <td className="px-6 py-4 text-gray-600">{b.address}</td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <button
                      disabled
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      disabled
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Building</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
                <input
                  type="text"
                  placeholder="e.g., Main Tower"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g., 123 Main St"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address[0]}</p>}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                  Add Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Buildings;

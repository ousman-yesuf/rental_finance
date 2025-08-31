import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchBuildings,
} from "../features/buildingsSlice";
import {
  fetchRentalUnits,
  createRentalUnit,
  updateRentalUnit,
  deleteRentalUnit,
} from "../features/rentalUnitsSlice";
import { tenantSchema } from "../schemas";
import { Plus, Edit, Trash2, X } from "lucide-react";


function Tenants() {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector((state: RootState) => state.buildings.buildings);
  const units = useAppSelector((state: RootState) => state.rentalUnits.units);
  const status = useAppSelector((state: RootState) => state.rentalUnits.status);
  const error = useAppSelector((state: RootState) => state.rentalUnits.error);

  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    id: null as number | null,
    buildingId: "",
    unitNumber: "",
    tenantName: "",
    rentAmount: 0,
    dueDate: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      dispatch(fetchRentalUnits(selectedBuilding));
    }
  }, [selectedBuilding, dispatch]);
 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...dataToValidate } = formData;
      const validatedData = tenantSchema.parse({
        ...dataToValidate,
        buildingId: formData.buildingId ? Number(formData.buildingId) : undefined,
        rentAmount: formData.rentAmount ? Number(formData.rentAmount) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });

      if (isEdit && formData.id) {
        dispatch(
          updateRentalUnit({
            id: formData.id,
            data: {
              tenantName: validatedData.tenantName,
              rentAmount: validatedData.rentAmount,
              dueDate: validatedData.dueDate,
            },
          })
        );
      } else {
        dispatch(
          createRentalUnit({
            buildingId: validatedData.buildingId,
            unitNumber: validatedData.unitNumber,
            tenantName: validatedData.tenantName,
            rentAmount: validatedData.rentAmount,
            dueDate: validatedData.dueDate,
          })
        );
      }

      setFormData({ id: null, buildingId: "", unitNumber: "", tenantName: "", rentAmount: 0, dueDate: "" });
      setIsEdit(false);
      setIsModalOpen(false);
      setErrors({});
    } catch (error: any) {
      setErrors(error.formErrors?.fieldErrors || {});
    }
  };

  const handleEdit = (unit: any) => {
    setFormData({
      id: unit.id,
      buildingId: unit.buildingId.toString(),
      unitNumber: unit.unitNumber,
      tenantName: unit.tenantName || "",
      rentAmount: unit.rentAmount,
      dueDate: unit.dueDate ? unit.dueDate.slice(0, 10) : "",
    });
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      id: null,
      buildingId: selectedBuilding?.toString() || "",
      unitNumber: "",
      tenantName: "",
      rentAmount: 0,
      dueDate: "",
    });
    setIsEdit(false);
    setIsModalOpen(true);
    setErrors({});
  };

  const handleCancel = () => {
    setFormData({ id: null, buildingId: "", unitNumber: "", tenantName: "", rentAmount: 0, dueDate: "" });
    setIsEdit(false);
    setIsModalOpen(false);
    setErrors({});
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🏢 Tenant Management</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <label htmlFor="buildingSelect" className="block text-sm font-medium text-gray-700 mb-2">
            Select Building
          </label>
          <select
            id="buildingSelect"
            value={selectedBuilding?.toString() || ""}
            onChange={(e) => setSelectedBuilding(Number(e.target.value))}
            className="w-64 px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose...</option>
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <Plus size={18} /> Add Tenant
          </button>
        )}
      </div>

      {selectedBuilding && (
        <>
          {status === "loading" && <p className="text-gray-600">Loading tenants...</p>}

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th className="px-6 py-3">Unit Number</th>
                  <th className="px-6 py-3">Tenant</th>
                  <th className="px-6 py-3">Rent</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No tenants found for this building.
                    </td>
                  </tr>
                ) : (
                  units.map((unit) => (
                    <tr key={unit.id} className="odd:bg-gray-50 hover:bg-gray-100 transition">
                      <td className="px-6 py-4 font-medium">{unit.unitNumber}</td>
                      <td className="px-6 py-4">{unit.tenantName || "—"}</td>
                      <td className="px-6 py-4">${unit.rentAmount.toFixed(2)}</td>
                      <td className="px-6 py-4">{new Date(unit.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-3">
                        <button
                          onClick={() => handleEdit(unit)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button
                          onClick={() => dispatch(deleteRentalUnit(unit.id))}
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
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md transform transition-all scale-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {isEdit ? "Edit Tenant" : "Add Tenant"}
              </h3>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Building */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                <select
                  value={formData.buildingId}
                  onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                  disabled={isEdit}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">Select</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.buildingId && <p className="text-red-600 text-sm">{errors.buildingId[0]}</p>}
              </div>

              {/* Unit Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
                <input
                  value={formData.unitNumber}
                  onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                  disabled={isEdit}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="e.g., 101"
                />
                {errors.unitNumber && <p className="text-red-600 text-sm">{errors.unitNumber[0]}</p>}
              </div>

              {/* Tenant Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
                <input
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
                {errors.tenantName && <p className="text-red-600 text-sm">{errors.tenantName[0]}</p>}
              </div>

              {/* Rent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rent Amount</label>
                <input
                  type="number"
                  value={formData.rentAmount || ""}
                  onChange={(e) => setFormData({ ...formData, rentAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1000"
                />
                {errors.rentAmount && <p className="text-red-600 text-sm">{errors.rentAmount[0]}</p>}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.dueDate && <p className="text-red-600 text-sm">{errors.dueDate[0]}</p>}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
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
                  {isEdit ? "Update" : "Add Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tenants;

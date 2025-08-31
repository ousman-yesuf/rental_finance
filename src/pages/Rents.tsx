import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchBuildings } from '../features/buildingsSlice';
import { fetchRentalUnits } from '../features/rentalUnitsSlice';
import { fetchPayments, createPayment } from '../features/paymentsSlice';
import { paymentSchema } from '../schemas';

function Rents() {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector(state => state.buildings.buildings);
  const units = useAppSelector(state => state.rentalUnits.units);
  const payments = useAppSelector(state => state.payments.payments);

  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [formData, setFormData] = useState({ rentalUnitId: '', amount: 0, date: '', method: '', vat: 0 });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    dispatch(fetchBuildings());
  }, [dispatch]);

  useEffect(() => {
    if (selectedBuilding) {
      dispatch(fetchRentalUnits(selectedBuilding));
    }
  }, [selectedBuilding, dispatch]);

  useEffect(() => {
    if (selectedUnit) {
      dispatch(fetchPayments(selectedUnit));
      setFormData(prev => ({ ...prev, rentalUnitId: selectedUnit.toString() }));
    }
  }, [selectedUnit, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      paymentSchema.parse({
        ...formData,
        amount: Number(formData.amount),
        date: new Date(formData.date),
        vat: Number(formData.vat)
      });

      dispatch(createPayment({
        ...formData,
        rentalUnitId: Number(formData.rentalUnitId),
        amount: Number(formData.amount),
        vat: Number(formData.vat)
      }));

      setFormData({ rentalUnitId: '', amount: 0, date: '', method: '', vat: 0 });
      setErrors({});
    } catch (error: any) {
      setErrors(error.formErrors?.fieldErrors || {});
    }
  };

  const getPaymentStatus = (unit: any) => {
    const totalPaid = unit.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    return totalPaid >= unit.rentAmount ? 'Paid' : `Due: $${(unit.rentAmount - totalPaid).toFixed(2)}`;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Rent Collection</h2>
      <select onChange={e => setSelectedBuilding(Number(e.target.value))} className="mb-4 p-2 border rounded">
        <option>Select Building</option>
        {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      {selectedBuilding && (
        <>
          <ul className="space-y-2 mb-8">
            {units.map(unit => (
              <li key={unit.id} className="flex justify-between items-center border p-2">
                <span>{unit.unitNumber} - {unit.tenantName} - {getPaymentStatus(unit)}</span>
                <button onClick={() => setSelectedUnit(unit.id)} className="bg-blue-500 text-white p-1 rounded">
                  Collect Rent
                </button>
              </li>
            ))}
          </ul>

          {selectedUnit && (
            <>
              <form onSubmit={handleSubmit} className="space-y-4 mb-4">
                <div>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="p-2 border rounded w-full"
                  />
                  {errors.amount && <p className="text-red-500">{errors.amount[0]}</p>}
                </div>
                <div>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="p-2 border rounded w-full"
                  />
                  {errors.date && <p className="text-red-500">{errors.date[0]}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Method (e.g., Cash)"
                    value={formData.method}
                    onChange={e => setFormData({ ...formData, method: e.target.value })}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="VAT"
                    value={formData.vat}
                    onChange={e => setFormData({ ...formData, vat: Number(e.target.value) })}
                    className="p-2 border rounded w-full"
                  />
                  {errors.vat && <p className="text-red-500">{errors.vat[0]}</p>}
                </div>
                <button type="submit" className="bg-green-500 text-white p-2 rounded">Add Payment</button>
              </form>

              <h3>Payments for Unit</h3>
              <ul className="space-y-2">
                {payments.map(p => (
                  <li key={p.id} className="border p-2">
                    ${p.amount.toFixed(2)} on {new Date(p.date).toLocaleDateString()} (VAT: ${p.vat.toFixed(2)}) - {p.method || 'N/A'}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Rents;

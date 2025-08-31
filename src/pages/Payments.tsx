import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchBuildings } from '../features/buildingsSlice';
import { fetchRentalUnits } from '../features/rentalUnitsSlice';
import { fetchPayments, createPayment } from '../features/paymentsSlice';
import { paymentSchema } from '../schemas';

function Payments() {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector(state => state.buildings.buildings);
  const units = useAppSelector(state => state.rentalUnits.units);
  const payments = useAppSelector(state => state.payments.payments);

  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(0); // 0 = All Buildings
  const [monthsToPay, setMonthsToPay] = useState<number>(1);
  const [formData, setFormData] = useState({ rentalUnitId: '', amount: 0, date: '', method: '', vat: 0 });
  const [errors, setErrors] = useState<any>({});
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch buildings and all units by default
  useEffect(() => {
    dispatch(fetchBuildings());
    dispatch(fetchRentalUnits(0));
  }, [dispatch]);

  // Fetch units for selected building (0 = all)
  useEffect(() => {
    dispatch(fetchRentalUnits(selectedBuilding || 0));
  }, [selectedBuilding, dispatch]);

  // Fetch payments for all units
  useEffect(() => {
    units.forEach(unit => dispatch(fetchPayments(unit.id)));
  }, [units, dispatch]);

  // Notifications for tenants with overdue payments
  useEffect(() => {
    if (units.length > 0) {
      const dueUnits = units.filter(u => {
        const unitPayments = payments.filter(p => p.rentalUnitId === u.id);
        const totalPaid = unitPayments.reduce((sum, p) => sum + p.amount, 0);
        return totalPaid < u.rentAmount;
      });
      setNotifications(dueUnits);
    }
  }, [units, payments]);

  const handleSubmit = (unit: any, e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalAmount = (unit.rentAmount || 0) * monthsToPay;
      const totalVAT = totalAmount * 0.15;

      paymentSchema.parse({ ...formData, amount: totalAmount, vat: totalVAT, date: new Date(formData.date) });

      dispatch(createPayment({
        ...formData,
        rentalUnitId: unit.id,
        amount: totalAmount,
        vat: totalVAT
      }));

      setFormData({ rentalUnitId: '', amount: 0, date: '', method: '', vat: 0 });
      setMonthsToPay(1);
      setErrors({});
    } catch (err: any) {
      setErrors(err.formErrors?.fieldErrors || {});
    }
  };

  const filteredUnits = units.filter(u =>
    u.tenantName.toLowerCase().includes(search.toLowerCase()) ||
    u.unitNumber.toString().includes(search)
  );

  const getPaymentStatus = (unit: any) => {
    const unitPayments = payments.filter(p => p.rentalUnitId === unit.id);
    const totalPaid = unitPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    return totalPaid >= unit.rentAmount ? 'Paid' : `Due: $${(unit.rentAmount - totalPaid).toFixed(2)}`;
  };

  // Card statistics
  const totalTenants = units.length;
  const dueTenants = notifications.length;
  const totalDueAmount = notifications.reduce((sum, u) => {
    const unitPayments = payments.filter(p => p.rentalUnitId === u.id);
    const totalPaid = unitPayments.reduce((s, p) => s + p.amount, 0);
    return sum + (u.rentAmount - totalPaid);
  }, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Rent Payments</h2>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Tenants</h3>
          <p className="text-2xl font-bold">{totalTenants}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-red-600">Tenants with Due Payments</h3>
          <p className="text-2xl font-bold">{dueTenants}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-yellow-600">Total Due Amount</h3>
          <p className="text-2xl font-bold">${totalDueAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Building Selector */}
      <select
        value={selectedBuilding ?? 0}
        onChange={e => setSelectedBuilding(Number(e.target.value))}
        className="mb-4 p-3 border rounded w-full bg-white"
      >
        <option value={0}>All Buildings</option>
        {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tenant or unit..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>

      {/* Tenants List */}
      <div className="space-y-4">
        {filteredUnits.map(unit => {
          const unitPayments = payments.filter(p => p.rentalUnitId === unit.id);
          const totalPaid = unitPayments.reduce((sum, p) => sum + p.amount, 0);
          const dueAmount = unit.rentAmount - totalPaid;

          return (
            <div key={unit.id} className="bg-white p-4 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-2 md:mb-0">
                <p className="font-semibold">{unit.tenantName} - Unit {unit.unitNumber}</p>
                <p>Status: <span className={dueAmount > 0 ? 'text-red-600' : 'text-green-600'}>{getPaymentStatus(unit)}</span></p>
                <p>Rent Amount: ${unit.rentAmount}</p>
              </div>

              {/* Payment Form */}
              {dueAmount > 0 && (
                <form onSubmit={(e) => handleSubmit(unit, e)} className="flex flex-col md:flex-row items-start md:items-center gap-2">
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="p-2 border rounded"
                  />
                  <select
                    value={monthsToPay}
                    onChange={e => setMonthsToPay(Number(e.target.value))}
                    className="p-2 border rounded"
                  >
                    {[1, 3, 6, 12].map(m => <option key={m} value={m}>{m} month(s)</option>)}
                  </select>
                  <input
                    type="text"
                    placeholder="Cash, Card..."
                    value={formData.method}
                    onChange={e => setFormData({ ...formData, method: e.target.value })}
                    className="p-2 border rounded"
                  />
                  <button type="submit" className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition">
                    Pay
                  </button>
                </form>
              )}
            </div>
          );
        })}
        {filteredUnits.length === 0 && <p className="text-gray-500">No tenants found.</p>}
      </div>
    </div>
  );
}

export default Payments;

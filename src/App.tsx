import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import Expenses from './pages/Expenses';
import Payments from './pages/Payments';
import Payroll from './pages/Payroll';
import Tenants from './pages/Tenants';
import Rents from './pages/Rents';
import Audits from './pages/Audits';
import VatReports from './pages/VatReports';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Redirect root to dashboard */}
        <Route index element={<Navigate to="/dashboard" />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="buildings" element={<Buildings />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="rents" element={<Rents />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="payments" element={<Payments />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="audits" element={<Audits />} />
        <Route path="vat-reports" element={<VatReports />} />

        {/* Catch all unmatched routes */}
        <Route
          path="*"
          element={
            <div className="p-8 text-center text-2xl text-red-600">
              404 - Page Not Found
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

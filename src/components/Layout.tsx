import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { FaBars, FaTachometerAlt, FaUsers, FaBuilding, FaDollarSign, FaUserTie, FaFileInvoiceDollar, FaChartPie, FaClipboardList } from 'react-icons/fa';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  const links: [string, string, JSX.Element][] = [
    ['dashboard', 'Dashboard', <FaTachometerAlt />],
    ['tenants', 'Tenants', <FaUsers />],
    ['buildings', 'Properties', <FaBuilding />],
    ['expenses', 'Expenses', <FaDollarSign />],
    ['payments', 'Payments', <FaUserTie />],
    ['payroll', 'Payroll', <FaFileInvoiceDollar />],
    ['vat-reports', 'VAT', <FaChartPie />],
    ['audits', 'Audit', <FaClipboardList />],
    
  ];

  const linkClasses = (isActive: boolean) =>
    `flex items-center px-4 py-2 rounded hover:bg-gray-200 transition ${
      isActive ? 'bg-violet-500 text-white font-semibold' : 'text-gray-700'
    }`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r shadow-md transition-all duration-300 ${
            collapsed ? 'w-20' : 'w-60'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            {!collapsed && <span className="font-bold text-lg">Menu</span>}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded hover:bg-gray-200 transition"
            >
              <FaBars />
            </button>
          </div>

          <nav className="mt-4 space-y-1">
            {links.map(([to, label, icon]) => (
              <NavLink
                key={to}
                to={`/${to}`}
                className={({ isActive }) => linkClasses(isActive)}
              >
                <span className="text-lg mr-3">{icon}</span>
                {!collapsed && label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}

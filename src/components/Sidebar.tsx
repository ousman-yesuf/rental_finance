import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaBuilding, FaMoneyBillWave, FaFileInvoiceDollar, FaChartBar, FaClipboardList } from 'react-icons/fa';
import Header from './Header';
import Footer from './Footer';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const links: { to: string; label: string; icon: JSX.Element }[] = [
    { to: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { to: '/tenants', label: 'Tenants', icon: <FaUsers /> },
    { to: '/properties', label: 'Properties', icon: <FaBuilding /> },
    { to: '/expenses', label: 'Expenses', icon: <FaMoneyBillWave /> },
    { to: '/employee', label: 'Employee', icon: <FaUsers /> },
    { to: '/payroll', label: 'Payroll', icon: <FaMoneyBillWave /> },
    { to: '/vat', label: 'VAT', icon: <FaFileInvoiceDollar /> },
    { to: '/audits', label: 'Audit', icon: <FaClipboardList /> },
    { to: '/reports', label: 'Reports', icon: <FaChartBar /> },
  ];

  const baseLink = 'flex items-center p-2 rounded hover:bg-gray-200 transition-all duration-200';
  const activeLink = 'bg-violet-500 text-white font-semibold';

  return (
    <div className="flex flex-col min-h-screen">
      <Header>
        {/* Sidebar toggle button */}
        <button
          className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          onClick={() => setCollapsed(!collapsed)}
        >
          ☰
        </button>
      </Header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r transition-all duration-300 ${
            collapsed ? 'w-16' : 'w-60'
          } flex flex-col`}
        >
          <nav className="flex-1 flex flex-col mt-4 space-y-2">
            {links.map((linkItem) => (
              <NavLink
                key={linkItem.to}
                to={linkItem.to}
                className={({ isActive }) =>
                  `${baseLink} ${isActive ? activeLink : 'text-gray-700'}`
                }
              >
                <span className="text-lg">{linkItem.icon}</span>
                {!collapsed && <span className="ml-3">{linkItem.label}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 bg-gray-100 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}

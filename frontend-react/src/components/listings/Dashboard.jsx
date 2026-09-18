import { FaHome, FaList, FaPlus, FaMoon, FaSun, FaBed, FaCalendarCheck, FaComments, FaHeart, FaWallet, FaEnvelope, FaClock } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from '../../api/api';
import AddListing from './AddListing';
import ManageListings from './ManageListings';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('Dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/dashboard-stats')
      .then(response => setStats(response.data))
      .catch(() => setError('Could not load your statistics.'));
  }, []);

  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: FaHome },
    { id: 'Listings', label: 'My Listings', icon: FaList },
    { id: 'AddListing', label: 'Add Listing', icon: FaPlus },
  ];

  const pickView = (id) => {
    setCurrentView(id);
    setMenuOpen(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'Dashboard':
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back 👋</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your listings and bookings efficiently from one place.</p>

            {error && <p className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</p>}

            {stats ? (
              <>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { icon: FaHome, label: 'Published listings', value: stats.listings_count, color: '#4f46e5' },
                    { icon: FaCalendarCheck, label: 'Total reservations', value: stats.reservations_count, color: '#7c3aed' },
                    { icon: FaClock, label: 'Pending reservations', value: stats.pending_reservations, color: '#d97706' },
                    { icon: FaBed, label: 'Paid reservations', value: stats.paid_reservations, color: '#059669' },
                    { icon: FaComments, label: 'Comments on listings', value: stats.comments_count, color: '#0891b2' },
                    { icon: FaHeart, label: 'Total saves (wishlist)', value: stats.wishlist_count, color: '#e11d48' },
                    { icon: FaWallet, label: 'Total revenue (MAD)', value: formatNum(stats.total_revenue), color: '#65a30d' },
                    { icon: FaEnvelope, label: 'Unread messages', value: stats.unread_messages, color: '#db2777' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="p-5 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl text-white" style={{ backgroundColor: color }}>
                        <Icon />
                      </div>
                      <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">My bookings (student)</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.my_reservations_count}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Reservations you made on other listings.</p>
                  </div>
                  <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Revenue split</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNum(stats.total_revenue)} <span className="text-sm font-medium text-gray-500">MAD</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Only counts confirmed payments via Stripe.</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-8 flex items-center justify-center min-h-[30vh]">
                <span className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        );
      case 'Listings':
        return <ManageListings />;
      case 'AddListing':
        return <AddListing />;
      default:
        return null;
    }
  };

  const formatNum = (n) => {
    const num = Number(n) || 0;
    return num % 1 === 0 ? num.toLocaleString() : num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="lg:flex min-h-screen">
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Rental <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Dashboard</span>
            </h1>
            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Sidebar */}
          <aside className={`${menuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shrink-0`}>
            <div className="p-6">
              <h1 className="hidden lg:block text-xl font-bold text-gray-900 dark:text-white">
                Rental <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Dashboard</span>
              </h1>
              <button
                className="mt-4 flex items-center gap-2 w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? (
                  <FaSun className="text-amber-500" />
                ) : (
                  <FaMoon className="text-gray-700" />
                )}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <nav className="mt-6 space-y-1.5">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <div
                    key={id}
                    onClick={() => pickView(id)}
                    className={`flex items-center gap-3 py-2.5 px-4 rounded-xl cursor-pointer transition-all ${
                      currentView === id
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className={currentView === id ? '' : 'text-gray-400 dark:text-gray-300'} />
                    {label}
                  </div>
                ))}
              </nav>
            </div>
          </aside>
          <main className="flex-1 p-4 sm:p-6 lg:p-10">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
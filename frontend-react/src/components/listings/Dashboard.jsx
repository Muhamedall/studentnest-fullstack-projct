import { FaHome, FaList, FaPlus, FaMoon, FaSun } from 'react-icons/fa';
import { useState } from 'react';
import AddListing from './AddListing';
import ManageListings from './ManageListings';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('Dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'Dashboard':
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome to your Dashboard</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Manage your listings and bookings efficiently.</p>
          </>
        );
      case 'Listings':
        return (
          <>
           <ManageListings/>
          </>
        );
      case 'AddListing':
        return (
          <>
            <AddListing/>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <aside className="w-64 bg-white dark:bg-gray-800">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Rental Dashboard</h1>
            <button
              className="mt-4 flex items-center justify-center w-full p-2 dark:text-white font-bold bg-gray-200 dark:bg-gray-700 rounded"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-800" />}
              <span className="ml-2">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <nav className="mt-6">
              <div
                onClick={() => setCurrentView('Dashboard')}
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white dark:font-bold cursor-pointer"
              >
                <FaHome className="inline mr-3 " /> Dashboard
              </div>
              <div
                onClick={() => setCurrentView('Listings')}
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer dark:text-white dark:font-bold"
              >
                <FaList className="inline mr-3  " /> Listings
              </div>
              <div
                onClick={() => setCurrentView('AddListing')}
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white dark:font-bold cursor-pointer"
              >
                <FaPlus className="inline mr-3" /> Add Listing
              </div>
            </nav>
          </div>
        </aside>
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

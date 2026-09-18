import { useState, useEffect } from 'react';
import axios from '../../api/api';
import { FaEdit, FaTrash, FaComments, FaCalendarAlt } from 'react-icons/fa';
import { formatPrice } from '../../utils/formatPrice';
import EditListing from './EditListing';
import ViewComments from './ViewComments';
import ViewReservations from './ViewReservations';

const ManageListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [reservationsModalOpen, setReservationsModalOpen] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get('/api/my-listings');
        setListings(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/listings/${id}`);
      setListings(listings.filter(listing => listing.id !== id));
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const handleEdit = (listing) => {
    setSelectedListing(listing);
    setEditModalOpen(true);
  };

  const handleViewComments = (listing) => {
    setSelectedListing(listing);
    setCommentsModalOpen(true);
  };

  const handleViewReservations = (listing) => {
    setSelectedListing(listing);
    setReservationsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Listings</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Edit, delete or view details of your published listings.</p>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">You don&apos;t have any listings yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300">Title</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300">Location</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300">Price</th>
                <th className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => (
                <tr key={listing.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-800 dark:text-white">{listing.title}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{listing.location}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {formatPrice(listing.price)} MAD
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(listing)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => handleViewComments(listing)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                        title="Comments"
                      >
                        <FaComments />
                      </button>
                      <button
                        onClick={() => handleViewReservations(listing)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-colors"
                        title="Reservations"
                      >
                        <FaCalendarAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editModalOpen && (
        <EditListing listing={selectedListing} onClose={() => setEditModalOpen(false)} />
      )}
      {commentsModalOpen && (
        <ViewComments listing={selectedListing} onClose={() => setCommentsModalOpen(false)} />
      )}
      {reservationsModalOpen && (
        <ViewReservations listing={selectedListing} onClose={() => setReservationsModalOpen(false)} />
      )}
    </div>
  );
};

export default ManageListings;
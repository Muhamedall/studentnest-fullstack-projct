import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaComments, FaCalendarAlt } from 'react-icons/fa';
import EditListing from './EditListing';
import ViewComments from './ViewComments';
import ViewReservations from './ViewReservations';
import { useSelector } from 'react-redux';

const ManageListings = () => {
  const user = useSelector((state) => state.users.user);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [reservationsModalOpen, setReservationsModalOpen] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Fetch all listings
        const response = await axios.get('http://localhost:8000/api/dataListings');
        
        // Filter listings by the logged-in user's ID
        const userSpecificListings = response.data.filter(listing => listing.user_id === user.id);

        setListings(userSpecificListings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setLoading(false);
      }
    };

    fetchListings();
  }, [user.id]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/listings/${id}`);
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
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Listings</h2>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading listings...</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr>
                <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-left text-gray-600 dark:text-white">Title</th>
                <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-left text-gray-600 dark:text-white">Location</th>
                <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-left text-gray-600 dark:text-white">Price</th>
                <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-left text-gray-600 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => (
                <tr key={listing.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2 px-4 text-gray-800 dark:text-white">{listing.title}</td>
                  <td className="py-2 px-4 text-gray-800 dark:text-white">{listing.location}</td>
                  <td className="py-2 px-4 text-gray-800 dark:text-white">{listing.price} MAD</td>
                  <td className="py-2 px-4 text-gray-800 dark:text-white">
                    <button
                      onClick={() => handleEdit(listing)}
                      className="mr-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="mr-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => handleViewComments(listing)}
                      className="mr-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                    >
                      <FaComments />
                    </button>
                    <button
                      onClick={() => handleViewReservations(listing)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-700"
                    >
                      <FaCalendarAlt />
                    </button>
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

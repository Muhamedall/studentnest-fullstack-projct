import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from '../../api/api';
import PropTypes from 'prop-types';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const EditListing = ({ listing, onClose }) => {
  const [title, setTitle] = useState(listing.title);
  const [location, setLocation] = useState(listing.location);
  const [price, setPrice] = useState(listing.price);
  const [selectedDateDebut, setSelectedDateDebut] = useState(new Date(listing.date_debut));
  const [selectedDateFin, setSelectedDateFin] = useState(new Date(listing.date_fin));
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`api/listings/${listing.id}`, {
        title,
        location,
        price,
        date_debut: selectedDateDebut.toISOString().split('T')[0],
        date_fin: selectedDateFin.toISOString().split('T')[0],
      });
      onClose();
    } catch (error) {
      setError('Failed to update listing. Please try again.');
    }
  };

  const inputBase = "w-full p-2.5 mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Edit Listing</h2>
            <p className="text-sm text-indigo-100 mt-0.5">{title}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors" aria-label="Close">
            <FontAwesomeIcon icon={faXmark} className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-gray-700 dark:text-white font-bold text-sm">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-gray-700 dark:text-white font-bold text-sm">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-gray-700 dark:text-white font-bold text-sm">Price (MAD)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-white font-bold text-sm">Availability</label>
            <div className="mt-2 grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
              <DatePicker
                selected={selectedDateDebut}
                onChange={(date) => setSelectedDateDebut(date)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                dateFormat="yyyy-MM-dd"
              />
              <span className="text-gray-500 dark:text-white text-sm font-semibold text-center">to</span>
              <DatePicker
                selected={selectedDateFin}
                onChange={(date) => setSelectedDateFin(date)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl transition-all font-semibold shadow-lg"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditListing.propTypes = {
  listing: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    date_debut: PropTypes.string.isRequired,
    date_fin: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditListing;
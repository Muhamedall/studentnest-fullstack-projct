import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from '../../api/api';

const EditListing = ({ listing, onClose }) => {
  const [title, setTitle] = useState(listing.title);
  const [location, setLocation] = useState(listing.location);
  const [price, setPrice] = useState(listing.price);
  const [selectedDateDebut, setSelectedDateDebut] = useState(new Date(listing.date_debut));
  const [selectedDateFin, setSelectedDateFin] = useState(new Date(listing.date_fin));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`api/listings/${listing.id}`, {
        title,
        location,
        price,
        date_debut: selectedDateDebut.toISOString().split('T')[0],
        date_fin: selectedDateFin.toISOString().split('T')[0],
      });
      console.log('Listing updated:', response.data);
      onClose();
    } catch (error) {
      console.error('Error updating listing:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Edit Listing</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 dark:text-white font-bold">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 mt-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="location" className="block text-gray-700 dark:text-white font-bold">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 mt-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-gray-700 dark:text-white font-bold">Price (MAD)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 mt-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-white font-bold">Availability</label>
            <div className="flex flex-row">
              <DatePicker
                selected={selectedDateDebut}
                onChange={(date) => setSelectedDateDebut(date)}
                className="w-full p-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded"
                dateFormat="yyyy-MM-dd"
              />
              <span className="mx-4 text-gray-500 dark:text-white">to</span>
              <DatePicker
                selected={selectedDateFin}
                onChange={(date) => setSelectedDateFin(date)}
                className="w-full p-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;

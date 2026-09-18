import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faLocationDot, faMoneyBill, faImage, faUsers, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from '../../api/api';
import { useNavigate } from 'react-router';

const AddListing = () => {
  const [selectedDateDebut, setSelectedDateDebut] = useState(null);
  const [selectedDateFin, setSelectedDateFin] = useState(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState(0);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [people, setPeople] = useState(0);
  const [rooms, setRooms] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('location', location);
    formData.append('price', price);
    formData.append('date_debut', selectedDateDebut ? selectedDateDebut.toISOString().split('T')[0] : '');
    formData.append('date_fin', selectedDateFin ? selectedDateFin.toISOString().split('T')[0] : '');
    formData.append('people', people);
    formData.append('rooms', rooms);
    images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    try {
      await axios.post('api/listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAlert({ show: true, message: 'Listing added successfully!', type: 'success' });

      setTitle('');
      setLocation('');
      setPrice(0);
      setImages([]);
      setImagePreviews([]);
      setPeople(0);
      setRooms(0);
      setSelectedDateDebut(null);
      setSelectedDateFin(null);

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error adding listing:', error.response ? error.response.data : error.message);
      setAlert({ show: true, message: 'Error adding listing. Please try again.', type: 'error' });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const handleRangeChange = (e) => {
    setPrice(e.target.value);
  };

  const decrementPeople = (e) => {
    e.preventDefault();
    setPeople(prevValue => Math.max(1, prevValue - 1));
  };

  const incrementPeople = (e) => {
    e.preventDefault();
    setPeople(prevValue => prevValue + 1);
  };

  const decrementRooms = (e) => {
    e.preventDefault();
    setRooms(prevValue => Math.max(1, prevValue - 1));
  };

  const incrementRooms = (e) => {
    e.preventDefault();
    setRooms(prevValue => prevValue + 1);
  };

  const inputBase = "w-full mt-2 p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

  return (
    <div className="max-w-3xl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Listing</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fill in the details of your student room.</p>

        {alert.show && (
          <div className={`mt-5 p-4 rounded-xl ${
            alert.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="flex items-center gap-2 text-gray-700 dark:text-white font-bold">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputBase}
                placeholder="e.g. Cozy studio near campus"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="flex items-center gap-2 text-gray-700 dark:text-white font-bold">
                <FontAwesomeIcon icon={faLocationDot} className="text-indigo-500" /> Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputBase}
                placeholder="e.g. Agdal, Rabat"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="price" className="flex items-center gap-2 text-gray-700 dark:text-white font-bold">
              <FontAwesomeIcon icon={faMoneyBill} className="text-emerald-500" /> Price (MAD)
            </label>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">0 MAD</span>
              <input
                type="range"
                id="priceRange"
                min="0"
                max="5000"
                value={price}
                onChange={handleRangeChange}
                className="flex-1 h-2 cursor-pointer appearance-none rounded-full bg-neutral-200 dark:bg-neutral-600 accent-indigo-600"
              />
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{price} MAD</span>
            </div>
            <input
              type="text"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputBase}
              placeholder="Price in MAD"
              required
            />
          </div>

          <div>
            <label htmlFor="images" className="flex items-center gap-2 text-gray-700 dark:text-white font-bold">
              <FontAwesomeIcon icon={faImage} className="text-violet-500" /> Images
            </label>
            <input
              type="file"
              id="images"
              onChange={handleImageChange}
              className="mt-2 w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold hover:file:bg-indigo-100 transition-all cursor-pointer"
              multiple
              required
            />
          </div>

          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((preview, index) => (
                <img key={index} src={preview} alt={`Image ${index}`} className="h-20 w-20 object-cover rounded-xl border border-gray-200 shadow-sm" />
              ))}
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-white font-bold">
              <FontAwesomeIcon icon={faCalendarDays} className="text-amber-500" /> Availability
            </label>
            <div className="mt-3 grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
              <DatePicker
                selected={selectedDateDebut}
                onChange={(date) => setSelectedDateDebut(date)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholderText="Start date"
                name="date-debut"
                required
              />
              <span className="text-center text-sm font-semibold text-gray-500 dark:text-white">to</span>
              <DatePicker
                selected={selectedDateFin}
                onChange={(date) => setSelectedDateFin(date)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholderText="End date"
                name="date-fin"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-white font-bold">
                <FontAwesomeIcon icon={faUsers} className="text-sky-500" /> Number of people
              </label>
              <div className="mt-2 flex h-12 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                <button
                  data-action="decrement"
                  onClick={decrementPeople}
                  className="w-16 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-2xl font-light"
                  type="button"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  className="flex-1 text-center bg-gray-50 dark:bg-gray-800 font-semibold text-gray-700 dark:text-white outline-none"
                  name="custom-input-number"
                  value={people}
                  readOnly
                />
                <button
                  data-action="increment"
                  onClick={incrementPeople}
                  className="w-16 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-2xl font-light"
                  type="button"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-white font-bold">
                <FontAwesomeIcon icon={faDoorOpen} className="text-rose-500" /> Number of rooms
              </label>
              <div className="mt-2 flex h-12 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                <button
                  data-action="decrement"
                  onClick={decrementRooms}
                  className="w-16 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-2xl font-light"
                  type="button"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  className="flex-1 text-center bg-gray-50 dark:bg-gray-800 font-semibold text-gray-700 dark:text-white outline-none"
                  name="custom-input-number"
                  value={rooms}
                  readOnly
                />
                <button
                  data-action="increment"
                  onClick={incrementRooms}
                  className="w-16 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-2xl font-light"
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-lg transition-all"
          >
            Add Listing
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddListing;
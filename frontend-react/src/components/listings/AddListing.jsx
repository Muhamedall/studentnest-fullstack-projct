import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from '../../api/api';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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
  const [alert, setAlert] = useState({ show: false, message: '', type: '' }); // Alert state
  const user = useSelector((state) => state.users.user);
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
      const response = await axios.post('api/listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Listing added:', response.data);

      // Show success alert
      setAlert({ show: true, message: 'Listing added successfully!', type: 'success' });

      // Clear form inputs
      setTitle('');
      setLocation('');
      setPrice(0);
      setImages([]);
      setImagePreviews([]);
      setPeople(0);
      setRooms(0);
      setSelectedDateDebut(null);
      setSelectedDateFin(null);

      // Redirect to home page after 2 seconds
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

  return (
    <div className="">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Listing</h2>

        {/* Alert */}
        {alert.show && (
          <div
            className={`mt-4 p-4 rounded ${
              alert.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}
          >
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4">
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 dark:text-white font-bold">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 mt-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded"
              required
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
              required
            />
          </div>

        
          <div className="mb-4">
            <label htmlFor="price" className="block text-gray-700 dark:text-white font-bold">Price (MAD)</label>
            <span className='mr-2 dark:text-white'>0 MAD</span>
            <input
              type="range"
              id="priceRange"
              min="0"
              max="5000"
              value={price}
              onChange={handleRangeChange}
              className="transparent h-4 cursor-pointer appearance-none border-transparent dark:text-white bg-neutral-200 dark:bg-neutral-600"
            />
            <span className='ml-2 dark:text-white'>{price} MAD</span>
            <input
              type="text"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 mt-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded"
              required
            />
          </div>

        
          <div className="mb-4">
            <label htmlFor="images" className="block text-gray-700 dark:text-white font-bold">Images</label>
            <input
              type="file"
              id="images"
              onChange={handleImageChange}
              className="w-full p-2 mt-2 bg-gray-200 dark:bg-gray-600 rounded dark:text-white"
              multiple
              required
            />
          </div>

        
          <div className="flex flex-wrap">
            {imagePreviews.map((preview, index) => (
              <img key={index} src={preview} alt={`Image ${index}`} className="w-20 h-20 object-cover m-2" />
            ))}
          </div>

        
          <label className="block text-gray-700 dark:text-white font-bold">Availability</label>
          <div className="static flex flex-row">
            <div>
              <FontAwesomeIcon icon={faCalendarDays} className="absolute z-40 mt-3 ml-2" />
              <DatePicker
                selected={selectedDateDebut}
                onChange={(date) => setSelectedDateDebut(date)}
                className="bg-gray-50 border border-gray-300 text-gray-950 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholderText="Select start date"
                name="date-debut"
                required
              />
            </div>
            <span className="mx-4 text-gray-500 dark:text-white">to</span>
            <div>
              <FontAwesomeIcon icon={faCalendarDays} className="absolute z-40 mt-3 ml-2" />
              <DatePicker
                selected={selectedDateFin}
                onChange={(date) => setSelectedDateFin(date)}
                className="bg-gray-50 border border-gray-300 text-gray-950 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholderText="Select end date"
                name="date-fin"
                required
              />
            </div>
          </div>

        
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-white font-bold">Number of people</label>
            <div className="flex flex-row h-10 w-full rounded-lg relative bg-transparent mt-1">
              <button
                data-action="decrement"
                onClick={decrementPeople}
                className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none"
              >
                <span className="m-auto text-2xl font-thin">−</span>
              </button>
              <input
                type="number"
                min="1"
                className="outline-none focus:outline-none text-center bg-gray-300 font-semibold text-md hover:text-black focus:text-black md:text-base cursor-default flex items-center text-gray-700"
                name="custom-input-number"
                value={people}
                readOnly
              />
              <button
                data-action="increment"
                onClick={incrementPeople}
                className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer"
              >
                <span className="m-auto text-2xl font-thin">+</span>
              </button>
            </div>
          </div>

     
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-white font-bold">Number of rooms</label>
            <div className="flex flex-row h-10 w-full rounded-lg relative bg-transparent mt-1">
              <button
                data-action="decrement"
                onClick={decrementRooms}
                className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none"
              >
                <span className="m-auto text-2xl font-thin">−</span>
              </button>
              <input
                type="number"
                min="1"
                className="outline-none focus:outline-none text-center bg-gray-300 font-semibold text-md hover:text-black focus:text-black md:text-base cursor-default flex items-center text-gray-700"
                name="custom-input-number"
                value={rooms}
                readOnly
              />
              <button
                data-action="increment"
                onClick={incrementRooms}
                className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer"
              >
                <span className="m-auto text-2xl font-thin">+</span>
              </button>
            </div>
          </div>

         
          <button type="submit" className="mt-4 px-4 py-2 bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold rounded">
            Add Listing
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddListing;
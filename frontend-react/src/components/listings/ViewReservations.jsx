import { useState, useEffect } from 'react';
import axios from '../../api/api';
import PropTypes from 'prop-types';
import { faXmark, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ViewReservations = ({ listing, onClose }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(`api/listings/${listing.id}/reservations`);
        setReservations(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setLoading(false);
      }
    };

    fetchReservations();
  }, [listing.id]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faCalendarCheck} className="h-5 w-5" />
            <div>
              <h2 className="text-xl font-bold">Reservations</h2>
              <p className="text-sm text-amber-100 mt-0.5">{listing.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors" aria-label="Close">
            <FontAwesomeIcon icon={faXmark} className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
              {reservations.length > 0 ? (
                reservations.map(reservation => (
                  <div key={reservation.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold">
                        {(reservation.user_name || 'U').charAt(0).toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{reservation.user_name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(reservation.start_date).toLocaleDateString()} → {new Date(reservation.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No reservations available.</p>
              )}
            </div>
          )}
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ViewReservations.propTypes = {
  listing: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ViewReservations;
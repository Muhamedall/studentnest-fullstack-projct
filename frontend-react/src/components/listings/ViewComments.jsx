import { useState, useEffect } from 'react';
import axios from '../../api/api';

const ViewComments = ({ listing, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`api/listings/${listing.id}/comments`);
        setComments(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setLoading(false);
      }
    };

    fetchComments();
  }, [listing.id]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Comments for {listing.title}</h2>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading comments...</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-800 dark:text-white">{comment.text}</p>
                  <p className="text-gray-500 dark:text-gray-300 text-sm">By {comment.user_name} on {new Date(comment.created_at).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-300">No comments available.</p>
            )}
          </div>
        )}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewComments;

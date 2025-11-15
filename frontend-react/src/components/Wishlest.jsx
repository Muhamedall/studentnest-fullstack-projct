import { useSelector, useDispatch } from 'react-redux';
import { removeWishlest, initializeWishlest } from './Redux/wishlestSlice';
import { useEffect } from 'react';

const Wishlest = () => {
    const dispatch = useDispatch();
    const favories = useSelector((state) => state.wishlests.favories);
    const userId = useSelector((state) => state.users.user?.id); // Assuming you have a user ID in your Redux store

    // Load wishlist from local storage when the component mounts
    useEffect(() => {
        if (userId) {
            dispatch(initializeWishlest(userId));
        }
    }, [dispatch, userId]);

    const handleRemove = (item) => {
        if (userId) {
            dispatch(removeWishlest({ userId, itemId: item.id }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Your Wishlist</h1>

                {favories.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400 text-lg">No items in your wishlist.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favories.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105"
                            >
                                <img
                                    src={item.image}
                                    alt={`Listing ${item.id}`}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {item.title}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">{item.location}</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                                        {item.price} MAD
                                    </p>
                                    <button
                                        onClick={() => handleRemove(item)}
                                        className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlest;
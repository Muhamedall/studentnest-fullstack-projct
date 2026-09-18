import { useSelector, useDispatch } from 'react-redux';
import { removeWishlistItem, fetchWishlist } from './Redux/wishlestSlice';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { STORAGE_URL } from '../api/api';
import { formatPrice } from '../utils/formatPrice';
import { FaHeart, FaTrash } from 'react-icons/fa';

const Wishlest = () => {
    const dispatch = useDispatch();
    const favories = useSelector((state) => state.wishlests.favories);

    useEffect(() => {
        dispatch(fetchWishlist());
    }, [dispatch]);

    const handleRemove = (item) => {
        dispatch(removeWishlistItem(item.id));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white">
                        <FaHeart />
                    </span>
                    <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
                </div>

                {favories.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
                        <p className="text-gray-600 text-lg">No items in your wishlist yet.</p>
                        <Link
                            to="/"
                            className="inline-block mt-4 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all"
                        >
                            Explore listings
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favories.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100"
                            >
                                <div className="relative">
                                    <img
                                        src={item.images?.[0] ? `${STORAGE_URL}${item.images[0]}` : ''}
                                        alt={`Listing ${item.id}`}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-52 object-cover"
                                    />
                                    <span className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-rose-600 text-xs font-bold shadow-sm">
                                        <FaHeart /> Saved
                                    </span>
                                </div>
                                <div className="p-5">
                                    <h2 className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                                        {item.title}
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">{item.location}</p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <p className="text-xl font-bold text-gray-900">
                                            {formatPrice(item.price)} <span className="text-sm font-normal text-gray-500">MAD</span>
                                        </p>
                                        <button
                                            onClick={() => handleRemove(item)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors text-sm font-semibold"
                                        >
                                            <FaTrash /> Remove
                                        </button>
                                    </div>
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
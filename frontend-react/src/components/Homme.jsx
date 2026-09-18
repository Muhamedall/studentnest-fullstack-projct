import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router';
import axios from '../api/api';
import { STORAGE_URL } from '../api/api';
import { addWishlistItem, removeWishlistItem, fetchWishlist } from './Redux/wishlestSlice';
import { formatPrice } from '../utils/formatPrice';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/keyboard';
import 'swiper/css/mousewheel';

const ImageGallery = () => {
    const [listings, setListings] = useState([]);
    const showLogine = useSelector((state) => state.navbar.showLogine);
    const showInscription = useSelector((state) => state.navbar.showInscription);
    const favories = useSelector((state) => state.wishlests.favories || []);
    const user = useSelector((state) => state.users.user);
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const searchQuery = (searchParams.get('search') || '').trim().toLowerCase();

    useEffect(() => {
        if (user) {
            dispatch(fetchWishlist());
        }
    }, [user, dispatch]);

    useEffect(() => {
        axios.get('/api/dataListings')
            .then(response => {
                const data = response.data.map(listing => ({
                    ...listing,
                    images: Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images.replace(/\\/g, ''))
                }));
                setListings(data);
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, []);

    const handleFavorite = (listing) => {
        if (!user) return;

        const isFavorite = Array.isArray(favories) && favories.some(item => item.id === listing.id);
        if (isFavorite) {
            dispatch(removeWishlistItem(listing.id));
        } else {
            dispatch(addWishlistItem(listing.id));
        }
    };

    const isFavorite = (id) => Array.isArray(favories) && favories.some(item => item.id === id);

    const filteredListings = searchQuery
        ? listings.filter(listing =>
            `${listing.title} ${listing.location}`.toLowerCase().includes(searchQuery)
          )
        : listings;

    return (
        <div className={`${showLogine || showInscription ? "opacity-50 pointer-events-none " : ""} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10`}>
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {searchQuery ? `Results for "${searchQuery}"` : 'Find your perfect student home'}
                </h1>
                <p className="mt-2 text-gray-600">
                    {searchQuery
                        ? `${filteredListings.length} listing${filteredListings.length === 1 ? '' : 's'} found.`
                        : 'Affordable, safe and conveniently located accommodations near your campus.'}
                </p>
            </div>
            {filteredListings.length === 0 && searchQuery ? (
                <div className="py-16 text-center">
                    <p className="text-gray-600 text-lg">No listings match your search.</p>
                    <Link
                        to="/"
                        className="inline-block mt-4 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all"
                    >
                        Clear search
                    </Link>
                </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredListings.map(listing => (
                    <Link to={`/DetailesListing/${listing.title}`} key={listing.id} className="group">
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                            <div className="relative">
                                <Swiper
                                    className="w-full aspect-[4/3]"
                                    modules={[Navigation, Pagination, Keyboard, Mousewheel]}
                                    navigation
                                    pagination={{ clickable: true }}
                                    keyboard
                                    mousewheel
                                >
                                    {listing.images.map((image, index) => (
                                        <SwiperSlide key={index}>
                                            <img
                                                src={`${STORAGE_URL}${image}`}
                                                alt={`Listing ${listing.id} Image ${index + 1}`}
                                                loading={index === 0 ? 'eager' : 'lazy'}
                                                decoding="async"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {/* Favorite button */}
                                <button
                                    onClick={(e) => { e.preventDefault(); handleFavorite(listing); }}
                                    className="absolute top-3 right-3 z-10 flex items-center justify-center h-9 w-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
                                    aria-label="Toggle favorite"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 -960 960 960"
                                        fill={isFavorite(listing.id) ? "#e11d48" : "none"}
                                        stroke={isFavorite(listing.id) ? "#e11d48" : "#111827"}
                                        strokeWidth="45"
                                    >
                                        <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z" />
                                    </svg>
                                </button>

                                {/* Owner badge */}
                                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                                    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[10px] font-bold">
                                        {(listing.user?.name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">
                                        {listing.user?.name}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <h2 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                                        {listing.title}
                                    </h2>
                                </div>
                                <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                    {listing.location}
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-lg font-bold text-slate-950">
                                        {formatPrice(listing.price)} <span className="text-sm font-semibold text-gray-500">MAD</span>
                                    </span>
                                    <span className="text-xs font-medium text-gray-500">
                                        {listing.rooms} rooms · {listing.people} guests
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            )}
        </div>
    );
};

export default ImageGallery;
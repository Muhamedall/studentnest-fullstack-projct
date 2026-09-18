import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axios from '../api/api';
import { STORAGE_URL } from '../api/api';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/keyboard";
import "swiper/css/mousewheel";
import { formatPrice } from '../utils/formatPrice';

const DetailRoom = () => {
    const [roomDetail, setRoomDetail] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newReply, setNewReply] = useState({});
    const [commentError, setCommentError] = useState('');
    const [ratingInfo, setRatingInfo] = useState({ average: 0, count: 0, my_rating: null });
    const [pendingRating, setPendingRating] = useState(null);
    const [reserveStartDate, setReserveStartDate] = useState('');
    const [reserveEndDate, setReserveEndDate] = useState('');
    const [reserveMessage, setReserveMessage] = useState('');
    const [reserveError, setReserveError] = useState('');
    const [booking, setBooking] = useState(false);
    const { title } = useParams();

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    const loadComments = (listingId) => {
        axios.get(`/api/listings/${listingId}/comments`)
            .then(response => setComments(response.data))
            .catch(() => setComments([]));
    };

    const loadRatings = (listingId) => {
        axios.get(`/api/listings/${listingId}/ratings`)
            .then(response => {
                setRatingInfo({
                    average: Number(response.data.average) || 0,
                    count: Number(response.data.count) || 0,
                    my_rating: response.data.my_rating || null,
                });
            })
            .catch(() => {});
    };

    useEffect(() => {
        axios.get(`/api/dataListings/${title}`)
            .then(response => {
                setRoomDetail(response.data);
                const listingId = response.data.id;
                loadComments(listingId);
                loadRatings(listingId);
            })
            .catch(error => {
                console.error('There was an error fetching the room detail!', error);
            });
    }, [title]);

    useEffect(() => {
        if (roomDetail && (roomDetail.rating_avg || roomDetail.rating_count)) {
            setRatingInfo(prev => ({
                ...prev,
                average: Number(roomDetail.rating_avg) || prev.average,
                count: Number(roomDetail.rating_count) || prev.count,
                my_rating: roomDetail.my_rating || prev.my_rating,
            }));
        }
    }, [roomDetail]);

    if (!roomDetail) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <span className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const baseUrl = STORAGE_URL;

    let images = [];
    try {
        images = JSON.parse(roomDetail.images);
    } catch (error) {
        if (Array.isArray(roomDetail.images)) {
            images = roomDetail.images;
        }
    }

    const handleReserveClick = () => {
        setReserveMessage('');
        setReserveError('');
        if (!isLoggedIn) {
            setReserveError('Please log in to make a reservation.');
            return;
        }
        if (!reserveStartDate || !reserveEndDate) {
            setReserveError('Please select start and end dates.');
            return;
        }
        setBooking(true);
        axios.post(`/api/listings/${roomDetail.id}/checkout`, {
            start_date: reserveStartDate,
            end_date: reserveEndDate,
        })
            .then(response => {
                if (response.data.checkout_url) {
                    window.location.href = response.data.checkout_url;
                } else {
                    setReserveMessage('Reservation request submitted successfully!');
                    setReserveStartDate('');
                    setReserveEndDate('');
                    setBooking(false);
                }
            })
            .catch(error => {
                const msg = error.response?.data?.message || 'Error making the reservation.';
                setReserveError(msg);
                setBooking(false);
            });
    };

    const handleAddComment = () => {
        setCommentError('');
        if (!isLoggedIn) {
            setCommentError('Please log in to post a comment.');
            return;
        }
        if (!newComment.trim()) {
            setCommentError('Please write a comment first.');
            return;
        }
        axios.post('/api/comments', {
            text: newComment,
            listing_id: roomDetail.id,
        })
            .then(() => {
                setNewComment('');
                loadComments(roomDetail.id);
            })
            .catch(() => {
                setCommentError('Could not post the comment. Please try again.');
            });
    };

    const handleAddReply = (commentId) => {
        const replyText = newReply[commentId] || '';
        if (!isLoggedIn) {
            setCommentError('Please log in to reply.');
            return;
        }
        if (!replyText.trim()) {
            setCommentError('Please write a reply first.');
            return;
        }
        axios.post('/api/comments', {
            text: replyText,
            listing_id: roomDetail.id,
            parent_id: commentId,
        })
            .then(() => {
                setNewReply({ ...newReply, [commentId]: '' });
                setCommentError('');
                loadComments(roomDetail.id);
            })
            .catch(() => {
                setCommentError('Could not post the reply. Please try again.');
            });
    };

    const handleRatingChange = (value) => {
        if (!isLoggedIn) {
            setCommentError('Please log in to rate this room.');
            return;
        }
        setPendingRating(value);
        axios.post(`/api/listings/${roomDetail.id}/ratings`, { rating: value })
            .then(response => {
                setRatingInfo(prev => ({
                    ...prev,
                    average: Number(response.data.average) || 0,
                    count: Number(response.data.count) || 0,
                    my_rating: value,
                }));
                setPendingRating(null);
            })
            .catch(() => {
                setPendingRating(null);
                setCommentError('Could not save your rating. Please try again.');
            });
    };

    const starColor = (star) => {
        if (pendingRating && star <= pendingRating) return 'text-amber-400';
        if (ratingInfo.my_rating && star <= ratingInfo.my_rating) return 'text-amber-400';
        return 'text-gray-200';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{roomDetail.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {roomDetail.location}
                    </div>
                    <span className="font-bold text-lg text-gray-900">{formatPrice(roomDetail.price)} MAD <span className="text-sm font-normal text-gray-500">/ stay</span></span>
                    {ratingInfo.count > 0 && (
                        <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-semibold">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .587l3.668 7.568 8.332 1.151-6.084 5.854 1.472 8.318L12 18.896l-7.388 3.882 1.472-8.318-6.084-5.854 8.332-1.151z" />
                            </svg>
                            {ratingInfo.average} ({ratingInfo.count} reviews)
                        </span>
                    )}
                </div>
            </div>

            {/* Images grid */}
            <div className="lg:flex lg:gap-3 lg:mb-10">
                {images.length > 0 && (
                    <>
                        {/* Mobile swiper */}
                        <div className="lg:hidden mb-6">
                            <Swiper
                                className="w-full h-72 rounded-2xl overflow-hidden"
                                modules={[Navigation, Pagination, Keyboard, Mousewheel]}
                                navigation
                                pagination={{ clickable: true }}
                                keyboard
                                mousewheel
                            >
                                {images.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <img
                                            src={`${baseUrl}${image}`}
                                            alt={`Listing Image ${index + 1}`}
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                            decoding="async"
                                            className="w-full h-full object-cover"
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Desktop grid */}
                        <div className="hidden lg:block lg:w-[55%]">
                            <img
                                src={`${baseUrl}${images[0]}`}
                                alt={`Main image`}
                                decoding="async"
                                className="w-full h-[420px] object-cover rounded-2xl"
                            />
                        </div>
                        <div className="hidden lg:grid lg:w-[45%] grid-cols-2 gap-2">
                            {images.slice(1, 5).map((image, index) => (
                                <img
                                    key={index}
                                    src={`${baseUrl}${image}`}
                                    alt={`Image ${index + 2}`}
                                    loading="lazy"
                                    decoding="async"
                                    className={`w-full ${index === 0 ? 'h-full rounded-tl-2xl' : ''} ${index === 1 ? 'rounded-tr-2xl' : ''} ${index === 2 ? 'rounded-bl-2xl' : ''} ${index === 3 ? 'rounded-br-2xl' : ''} object-cover`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10">
                {/* Left: info + owner + rating + comments */}
                <div className="space-y-10">
                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-100">
                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" fill="#4f46e5"><path d="M80-200v-240q0-27 11-49t29-39v-112q0-50 35-85t85-35h160q23 0 43 8.5t37 23.5q17-15 37-23.5t43-8.5h160q50 0 85 35t35 85v112q18 17 29 39t11 49v240h-80v-80H160v80H80Zm440-360h240v-80q0-17-11.5-28.5T720-680H560q-17 0-28.5 11.5T520-640v80Zm-320 0h240v-80q0-17-11.5-28.5T400-680H240q-17 0-28.5 11.5T200-640v80Zm-40 200h640v-80q0-17-11.5-28.5T760-480H200q-17 0-28.5 11.5T160-440v80Zm640 0H160h640Z"/></svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Rooms</p>
                                <p className="font-bold text-gray-900">{roomDetail.rooms}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-violet-100">
                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" fill="#7c3aed"><path d="M411-480q-28 0-46-21t-13-49l12-72q8-43 40.5-70.5T480-720q44 0 76.5 27.5T597-622l12 72q5 28-13 49t-46 21H411Zm24-80h91l-8-49q-2-14-13-22.5t-25-8.5q-14 0-24.5 8.5T443-609l-8 49ZM124-441q-23 1-39.5-9T63-481q-2-9-1-18t5-17q0 1-1-4-2-2-10-24-2-12 3-23t13-19l2-2q2-19 15.5-32t33.5-13q3 0 19 4l3-1q5-5 13-7.5t17-2.5q11 0 19.5 3.5T208-626q1 0 1.5.5t1.5.5q14 1 24.5 8.5T251-596q2 7 1.5 13.5T250-570q0 1 1 4 7 7 11 15.5t4 17.5q0 4-6 21-1 2 0 4l2 16q0 21-17.5 36T202-441h-78Zm676 1q-33 0-56.5-23.5T720-520q0-12 3.5-22.5T733-563l-28-25q-10-8-3.5-20t18.5-12h80q33 0 56.5 23.5T880-540v20q0 33-23.5 56.5T800-440ZM0-240v-63q0-44 44.5-70.5T160-400q13 0 25 .5t23 2.5q-14 20-21 43t-7 49v65H0Zm240 0v-65q0-65 66.5-105T480-450q108 0 174 40t66 105v65H240Zm560-160q72 0 116 26.5t44 70.5v63H780v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5Zm-320 30q-57 0-102 15t-53 35h311q-9-20-53.5-35T480-370Zm0 50Zm1-280Z"/></svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Guests</p>
                                <p className="font-bold text-gray-900">{roomDetail.people}</p>
                            </div>
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="p-5 bg-gray-50 rounded-2xl">
                        <h3 className="font-bold text-gray-900 mb-3">Availability</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start</label>
                                <input
                                    type="date"
                                    value={roomDetail.date_debut}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-700"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">End</label>
                                <input
                                    type="date"
                                    value={roomDetail.date_fin}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-700"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {/* Owner + message */}
                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <span className="h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xl font-bold">
                                {(roomDetail.user?.name || 'U').charAt(0).toUpperCase()}
                            </span>
                            <div>
                                <p className="text-sm text-gray-500">Hosted by</p>
                                <p className="font-bold text-gray-900">{roomDetail.user?.name}</p>
                                <p className="text-sm text-gray-500">{roomDetail.user?.city}</p>
                            </div>
                        </div>
                        {isLoggedIn && (
                            <a
                                href={`/Messages?user=${roomDetail.user?.id}`}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-600 text-sm font-semibold rounded-xl transition-colors"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                                Message
                            </a>
                        )}
                    </div>

                    {/* Rating */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Rate this room</h3>
                        <p className="text-sm text-gray-500 mb-3">
                            {ratingInfo.count > 0
                                ? `${ratingInfo.average} / 5 average from ${ratingInfo.count} review${ratingInfo.count === 1 ? '' : 's'}`
                                : 'No ratings yet — be the first to rate!'}
                        </p>
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => handleRatingChange(star)} aria-label={`Rate ${star} stars`}>
                                    <svg
                                        className={`h-9 w-9 transition-colors hover:scale-110 ${starColor(star)}`}
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 .587l3.668 7.568 8.332 1.151-6.084 5.854 1.472 8.318L12 18.896l-7.388 3.882 1.472-8.318-6.084-5.854 8.332-1.151z" />
                                    </svg>
                                </button>
                            ))}
                            {ratingInfo.my_rating && (
                                <span className="ml-2 text-gray-600 text-sm">You rated <span className="font-bold">{ratingInfo.my_rating}</span> stars</span>
                            )}
                        </div>
                        {commentError && <p className="mt-2 text-sm text-red-600">{commentError}</p>}
                    </div>

                    {/* Comments */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Comments <span className="text-gray-400 font-medium">({comments.length})</span>
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <textarea
                                className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows="3"
                                placeholder={isLoggedIn ? "Add a comment..." : "Log in to add a comment..."}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button
                                className="mt-3 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg"
                                onClick={handleAddComment}
                            >
                                Post Comment
                            </button>
                        </div>
                        <div className="mt-6 space-y-4">
                            {comments.length === 0 && (
                                <p className="text-gray-500 text-sm">No comments yet. Start the conversation!</p>
                            )}
                            {comments.map((comment) => (
                                <div key={comment.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold">
                                            {(comment.user_name || 'U').charAt(0).toUpperCase()}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800">{comment.user_name}</span>
                                        <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-800">{comment.text}</p>
                                    <div className="mt-3 ml-4 space-y-2">
                                        {(comment.replies || []).length > 0 && (
                                            <div className="space-y-2">
                                                {comment.replies.map((reply) => (
                                                    <div key={`${comment.id}-r-${reply.id}`} className="pl-4 border-l-2 border-indigo-200 bg-white p-2 rounded-r-lg">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="h-6 w-6 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] font-bold">
                                                                {(reply.user_name || 'U').charAt(0).toUpperCase()}
                                                            </span>
                                                            <span className="text-xs font-semibold text-gray-700">{reply.user_name}</span>
                                                            <span className="text-[11px] text-gray-400">{new Date(reply.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-gray-700 text-sm">{reply.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <textarea
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                            rows="2"
                                            placeholder={isLoggedIn ? "Add a reply..." : "Log in to reply..."}
                                            value={newReply[comment.id] || ''}
                                            onChange={(e) => setNewReply({ ...newReply, [comment.id]: e.target.value })}
                                        />
                                        <button
                                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                            onClick={() => handleAddReply(comment.id)}
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Booking card */}
                <div className="mt-10 lg:mt-0">
                    <div className="lg:sticky lg:top-28 bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                        <p className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">
                            {formatPrice(roomDetail.price)} <span className="text-base font-normal text-gray-500">MAD / stay</span>
                        </p>
                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Check-in</label>
                                <input
                                    type="date"
                                    value={reserveStartDate}
                                    onChange={(e) => setReserveStartDate(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Check-out</label>
                                <input
                                    type="date"
                                    value={reserveEndDate}
                                    onChange={(e) => setReserveEndDate(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        {reserveMessage && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
                                {reserveMessage}
                            </div>
                        )}
                        {reserveError && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                                {reserveError}
                            </div>
                        )}
                        <button
                            className="w-full mt-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={handleReserveClick}
                            disabled={booking}
                        >
                            {booking ? 'Redirecting to payment...' : 'Reserve & Pay'}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3">You will pay securely with Stripe</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailRoom;
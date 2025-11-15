import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination, Keyboard, Mousewheel } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/keyboard";
import "swiper/css/mousewheel";
const DetailRoom = () => {
    const [comments, setComments] = useState([]);
const [newComment, setNewComment] = useState('');
const [newReply, setNewReply] = useState({});
const [rating, setRating] = useState(0);
const [userRating, setUserRating] = useState(null);

    SwiperCore.use([Navigation, Pagination, Keyboard, Mousewheel]);
    const { title } = useParams();
    const [roomDetail, setRoomDetail] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
    });

    useEffect(() => {
        axios.get(`http://localhost:8000/api/dataListings/${title}`)
            .then(response => {
                console.log("API response data:", response.data);
                setRoomDetail(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the room detail!', error);
            });
    }, [title]);

    if (!roomDetail) {
        return <div>Loading...</div>;
    }

    const baseUrl = 'http://localhost:8000/storage/';
    console.log("roomDetail object:", roomDetail);

    let images = [];
    try {
        images = JSON.parse(roomDetail.images);
    } catch (error) {
        console.error('Error parsing images JSON:', error);
    }
    console.log("Parsed images array:", images);

    const handleReserveClick = () => {
        setShowPayment(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCardDetails({ ...cardDetails, [name]: value });
    };

    const handleConfirmReservation = () => {
        console.log('Reservation confirmed with card details:', cardDetails);
        setShowPayment(false);
    };
    const handleAddComment = () => {
        setComments([...comments, { text: newComment, replies: [] }]);
        setNewComment('');
    };
    
    const handleAddReply = (index) => {
        const updatedComments = [...comments];
        updatedComments[index].replies.push(newReply[index] || '');
        setComments(updatedComments);
        setNewReply({ ...newReply, [index]: '' });
    };
    
    const handleRatingChange = (value) => {
        setRating(value);
        setUserRating(value);
    };
    
    return (
        <div className='mt-10 ml-[4%] lg:static'>
            <h1 className='font-bold text-2xl lg:text-4xl'>{roomDetail.title}</h1>
          
                          
            <div className="lg:flex lg:flex-row lg:w-[70%]">
                {images.length > 0 && (
                    <>

 <Swiper
                        className=" inline-block lg:hidden mt-[7%]  w-[80%] h-[90%]  lg:h-[35%] lg:w-[80%] rounded-lg ml-[5%]"
                        modules={[Navigation, Pagination, Keyboard, Mousewheel]}
                        navigation
                        pagination
                        keyboard
                        mousewheel
                        cssMode
                    >
                       {images.slice(1).map((image, index) => (
                        <>
                      <SwiperSlide  key={index}>
                      <img
                          src={`${baseUrl}${image}`}
                          alt={`Listing ${roomDetail.id} Image `}
                      />
                  </SwiperSlide>
                  </>
                   ))}

                  </Swiper>
                    <div className="  lg:flex-shrink-0 mr-4 mt-[2%]">
                        <img
                            src={`${baseUrl}${images[0]}`}
                            alt={`Listing ${roomDetail.id} Image 1`}
                            className="hidden lg:inline-block  lg:w-full lg:h-auto rounded-lg shadow-2xl"
                            onError={() => console.error(`Failed to load image: ${baseUrl}${images[0]}`)}
                        />
                    </div>
                    </>
                )}
                <div className="  lg:grid lg:grid-rows-2 lg:grid-flow-col lg:gap-2">
                    {images.slice(1).map((image, index) => (
                        <div key={index} className="flex-shrink-0">
                            <img
                                src={`${baseUrl}${image}`}
                                alt={`Listing ${roomDetail.id} Image ${index + 2}`}
                                className="hidden lg:inline-block  w-[90%] h-[75%] rounded-lg shadow-2xl"
                                onError={() => console.error(`Failed to load image: ${baseUrl}${image}`)}
                            />
                        </div>
                    ))}
                     <div>
                    <div className="p-2 lg:p-5 border rounded-lg shadow-lg lg:absolute">
                    <h1 className=' font-bold text-center mt-4 border-b-2'>{roomDetail.price.slice(0 ,-3)} MAD</h1>

                    <div className='mt-[10%] lg:flex lg:flex-row lg:gap-4'> 
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
        
                    <input
                            type="date"
                            value={roomDetail.date_debut}
                            className="disabled:bg-gray-100 px-2 py-1 border border-gray-300 rounded-lg"
                            disabled
                        />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">End Date</label>

                         <input
                            type="date"
                            value={roomDetail.date_fin}
                            className="disabled:bg-gray-100 px-2 py-1 border border-gray-300 rounded-lg"
                            disabled
                        />
                        </div>

                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                <div> 
                    <p className="text-lg font-semibold">Room Details</p>
                      <div className='flex flex-row gap-2'>
                     <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M80-200v-240q0-27 11-49t29-39v-112q0-50 35-85t85-35h160q23 0 43 8.5t37 23.5q17-15 37-23.5t43-8.5h160q50 0 85 35t35 85v112q18 17 29 39t11 49v240h-80v-80H160v80H80Zm440-360h240v-80q0-17-11.5-28.5T720-680H560q-17 0-28.5 11.5T520-640v80Zm-320 0h240v-80q0-17-11.5-28.5T400-680H240q-17 0-28.5 11.5T200-640v80Zm-40 200h640v-80q0-17-11.5-28.5T760-480H200q-17 0-28.5 11.5T160-440v80Zm640 0H160h640Z"/></svg> 
                     <p className="text-sm font-bold text-gray-700 mt-[3px]"> {roomDetail.rooms}</p>
                     </div>
                   <div className='flex flex-row gap-2'> 
                   <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M411-480q-28 0-46-21t-13-49l12-72q8-43 40.5-70.5T480-720q44 0 76.5 27.5T597-622l12 72q5 28-13 49t-46 21H411Zm24-80h91l-8-49q-2-14-13-22.5t-25-8.5q-14 0-24.5 8.5T443-609l-8 49ZM124-441q-23 1-39.5-9T63-481q-2-9-1-18t5-17q0 1-1-4-2-2-10-24-2-12 3-23t13-19l2-2q2-19 15.5-32t33.5-13q3 0 19 4l3-1q5-5 13-7.5t17-2.5q11 0 19.5 3.5T208-626q1 0 1.5.5t1.5.5q14 1 24.5 8.5T251-596q2 7 1.5 13.5T250-570q0 1 1 4 7 7 11 15.5t4 17.5q0 4-6 21-1 2 0 4l2 16q0 21-17.5 36T202-441h-78Zm676 1q-33 0-56.5-23.5T720-520q0-12 3.5-22.5T733-563l-28-25q-10-8-3.5-20t18.5-12h80q33 0 56.5 23.5T880-540v20q0 33-23.5 56.5T800-440ZM0-240v-63q0-44 44.5-70.5T160-400q13 0 25 .5t23 2.5q-14 20-21 43t-7 49v65H0Zm240 0v-65q0-65 66.5-105T480-450q108 0 174 40t66 105v65H240Zm560-160q72 0 116 26.5t44 70.5v63H780v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5Zm-320 30q-57 0-102 15t-53 35h311q-9-20-53.5-35T480-370Zm0 50Zm1-280Z"/></svg> 

                   <p className="text-sm font-bold text-gray-700 mt-[3px]">  {roomDetail.people} </p> 
                   
                    </div>
                </div>
               
            </div>
                   
                  
                        <button
                            className="w-full mt-[10%] bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                            onClick={handleReserveClick}
                        >
                            Reserve
                        </button>
                    </div>
                </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                   
                    
                </div>
              
            </div>
            <div>
                    <p className="text-lg font-semibold">Owner Details</p>
                    <p className="text-sm text-gray-700">{roomDetail.user.name}</p>
                    <p className="text-sm text-gray-700">{roomDetail.user.city}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M280-240q-17 0-28.5-11.5T240-280v-80h520v-360h80q17 0 28.5 11.5T880-680v600L720-240H280ZM80-280v-560q0-17 11.5-28.5T120-880h520q17 0 28.5 11.5T680-840v360q0 17-11.5 28.5T640-440H240L80-280Zm520-240v-280H160v280h440Zm-440 0v-280 280Z"/></svg>

                </div>
                <div>
                   
        <div className="mt-10">
            <h2 className="text-2xl font-semibold">Rate this Room</h2>
            <div className="flex items-center mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${
                            star <= rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        onClick={() => handleRatingChange(star)}
                    >
                        <path d="M12 .587l3.668 7.568 8.332 1.151-6.084 5.854 1.472 8.318L12 18.896l-7.388 3.882 1.472-8.318-6.084-5.854 8.332-1.151z" />
                    </svg>
                ))}
            </div>
            {userRating && (
                <p className="mt-2 text-gray-700">You rated this room: {userRating} stars</p>
            )}
        </div>

        <div className="mt-10">
            <h2 className="text-2xl font-semibold">Comments</h2>
            <div className="mt-4">
                <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows="4"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                    className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                    onClick={handleAddComment}
                >
                    Add Comment
                </button>
            </div>
            <div className="mt-6 space-y-4">
                {comments.map((comment, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <p>{comment.text}</p>
                        <div className="mt-2">
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                rows="2"
                                placeholder="Add a reply..."
                                value={newReply[index] || ''}
                                onChange={(e) =>
                                    setNewReply({ ...newReply, [index]: e.target.value })
                                }
                            />
                            <button
                                className="mt-2 bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600"
                                onClick={() => handleAddReply(index)}
                            >
                                Add Reply
                            </button>
                        </div>
                        {comment.replies.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {comment.replies.map((reply, replyIndex) => (
                                    <div key={replyIndex} className="ml-4 p-2 border-l-2 border-gray-300">
                                        <p>{reply}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
                
                </div>
          
            {showPayment && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out slide-down">
                        <h2 className="text-2xl font-semibold mb-4">Payment Details</h2>
                        <p className="mb-4">Please enter your payment details to confirm your reservation.</p>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Card Number</label>
                            <input
                                type="text"
                                name="cardNumber"
                                value={cardDetails.cardNumber}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input
                                type="text"
                                name="expiryDate"
                                value={cardDetails.expiryDate}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">CVV</label>
                            <input
                                type="text"
                                name="cvv"
                                value={cardDetails.cvv}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Card Holder Name</label>
                            <input
                                type="text"
                                name="cardHolderName"
                                value={cardDetails.cardHolderName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                                onClick={handleConfirmReservation}
                            >
                                Confirm Reservation
                            </button>
                            <button
                                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                                onClick={() => setShowPayment(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailRoom;

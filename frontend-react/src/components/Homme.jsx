import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { addWishlest, removeWishlest ,initializeWishlest } from './Redux/wishlestSlice';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Pagination, Keyboard, Mousewheel } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/keyboard';
import 'swiper/css/mousewheel';

SwiperCore.use([Navigation, Pagination, Keyboard, Mousewheel]);

const ImageGallery = () => {
    const [listings, setListings] = useState([]);
    const showLogine = useSelector((state) => state.navbar.showLogine);
    const showInscription = useSelector((state) => state.navbar.showInscription);
    const favories = useSelector((state) => state.wishlests.favories || []); 
    const user = useSelector((state) => state.users.user);
    const dispatch = useDispatch();

    useEffect(() => {
        if (user) {
            dispatch(initializeWishlest(user.id));
        }
    }, [user, dispatch]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/dataListings')
            .then(response => {
                const data = response.data.map(listing => ({
                    ...listing,
                    images: JSON.parse(listing.images.replace(/\\/g, ''))
                }));
                setListings(data);
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, []);

    const baseUrl = 'http://localhost:8000/storage/';

    const handleFavorite = (listing) => {
        if (!user) return; // Handle the case where the user is not logged in
    
        const isFavorite = Array.isArray(favories) && favories.some(item => item.id === listing.id);
        if (isFavorite) {
            dispatch(removeWishlest({ userId: user.id, itemId: listing.id }));
        } else {
            dispatch(addWishlest({ userId: user.id, item: { ...listing, image: `${baseUrl}${listing.images[0]}` } }));
        }
    };
    

    return (
        <div className={`${showLogine || showInscription ? "opacity-50 pointer-events-none " : ""} static lg:h-screen lg:grid lg:grid-cols-4 gap-2 lg:mt-[2%] lg:ml-[3%]`}>
            {listings.map(listing => (
                <Link to={`/DetailesListing/${listing.title}`} key={listing.id}>
                    <div className="">
                        <Swiper
                            className="mt-[7%] w-[80%] h-[90%] lg:h-[35%] lg:w-[80%] rounded-lg"
                            modules={[Navigation, Pagination, Keyboard, Mousewheel]}
                            navigation
                            pagination
                            keyboard
                            mousewheel
                            cssMode
                        >
                            {listing.images.map((image, index) => (
                                <SwiperSlide key={index} className="static">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        onClick={(e) => { e.preventDefault(); handleFavorite(listing) }}  className="absolute h-[30px] w-[30px] ml-[82%] mt-[5px] transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 " viewBox="0 -960 960 960" fill={Array.isArray(favories) && favories.some(item => item.id === listing.id) ? "#75FB4C" : "#FFFFFF"}>
                                        {(Array.isArray(favories) && favories.some(item => item.id === listing.id)) ?
                                            <path  d="M718-313 604-426l57-56 57 56 141-141 57 56-198 198ZM440-501Zm0 381L313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 22t81 62q34-40 81-62t99-22q81 0 136 45.5T831-680h-85q-18-40-53-60t-73-20q-51 0-88 27.5T463-660h-46q-31-45-70.5-72.5T260-760q-57 0-98.5 39.5T120-621q0 33 14 67t50 78.5q36 44.5 98 104T440-228q26-23 61-53t56-50l9 9 19.5 19.5L605-283l9 9q-22 20-56 49.5T498-172l-58 52Z" /> :
                                            <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z"/>
                                        }
                                    </svg>
                                    <img
                                        src={`${baseUrl}${image}`}
                                        alt={`Listing ${listing.id} Image ${index + 1}`}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <div className="ml-[10%]">
                            <h2 className="font-bold">{listing.title}</h2>
                            <p className="text-gray-400">Maroc ,{listing.location}</p>
                            <p>Owner: {listing.user.name}</p>
                            <p className="font-bold">{listing.price.slice(0, -3)} MAD</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ImageGallery;
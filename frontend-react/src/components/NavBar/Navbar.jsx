import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { setShowProfile, setShowLogine, setShowInscription, setShowMenuOfuser } from '../Redux/navbarSlice';
import { logoutUser } from '../Redux/usersSlice';

import Logine from '../Forms/Login';
import Singup from '../Forms/Singup';
import logo from './WhatsApp_Image_2024-04-12_at_22.08.25-removebg-preview.png';

const Navbar = () => {
  const navigate = useNavigate();
  const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [searchQuery, setSearchQuery] = useState('');
  const showProfile = useSelector((state) => state.navbar.showProfile);
  const showLogine = useSelector((state) => state.navbar.showLogine);
  const showInscription = useSelector((state) => state.navbar.showInscription);
  const showMenuOfuser = useSelector((state) => state.navbar.showMenuOfuser);
  const numberFavories = useSelector((state) => state.wishlests.numberFavories);

  const dispatch = useDispatch();

  const handleShow = () => {
    if (loggedIn) {
      dispatch(setShowMenuOfuser(true));
      dispatch(setShowProfile(false));
    } else {
      dispatch(setShowMenuOfuser(false));
      dispatch(setShowProfile(true));
    }
  };
  const removeMenuuser = () => {
    dispatch(setShowMenuOfuser(false));
  };
  const removeMenuProfile = () => {
    dispatch(setShowProfile(false));
  };

  const handleLogin = () => {
    dispatch(setShowLogine(true));
    dispatch(setShowProfile(false));
  };

  const handelInscription = () => {
    dispatch(setShowInscription(true));
    dispatch(setShowProfile(false));
  };
  const handleLogout = () => {
    dispatch(logoutUser())
      .then(() => {
        localStorage.removeItem('isLoggedIn');
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
    dispatch(setShowMenuOfuser(false));
  };

  return (
    <>
      <header
        className={`${showLogine || showInscription ? "opacity-60 pointer-events-none" : ""} sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/">
                <img src={logo} alt="logo" className="h-12 w-auto" />
              </Link>
            </div>

            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate('/?search=' + encodeURIComponent(searchQuery.trim()));
              }}
              className="flex items-center flex-1 max-w-xl mx-2 sm:mx-6 rounded-full border border-gray-300 shadow-sm hover:shadow-md transition-shadow px-3 sm:px-4 py-2 gap-2"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or city..."
                aria-label="Search listings"
                className="flex-1 min-w-0 bg-transparent text-sm text-gray-800 focus:outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="flex-shrink-0 bg-slate-950 hover:bg-slate-700 text-white rounded-full p-2 transition-all"
                aria-label="Search"
              >
                <FontAwesomeIcon icon={faSearch} className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {loggedIn ? (
                <Link
                  to="/Dashboard"
                  className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-slate-950 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors"
                >
                  Become a host
                </Link>
              ) : (
                <>
                  <button
                    onClick={handelInscription}
                    className="text-sm font-semibold text-gray-700 hover:text-slate-950 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors"
                  >
                    Sign up
                  </button>
                  <button
                    onClick={handleLogin}
                    className="text-sm font-semibold text-white bg-slate-950 hover:bg-slate-700 px-4 py-2 rounded-full transition-colors"
                  >
                    Log in
                  </button>
                </>
              )}

              {/* User menu trigger */}
              <button
                onClick={handleShow}
                className="flex items-center gap-2 rounded-full border border-gray-300 shadow-sm hover:shadow-md px-3 py-2 transition-all"
                aria-label="User menu"
              >
                <FontAwesomeIcon icon={faBars} className="text-gray-600" />
                <span className="h-6 w-px bg-gray-300 hidden sm:block" />
                <FontAwesomeIcon icon={faUser} className="hidden sm:inline-block text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Guest dropdown */}
        {showProfile && (
          <div className="absolute right-4 top-20 mt-2 w-64 rounded-2xl bg-white border border-gray-100 shadow-xl p-2 z-50">
            <button
              onClick={removeMenuProfile}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <ul className="mt-6">
              <li>
                <button
                  onClick={handleLogin}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Log in
                </button>
              </li>
              <li>
                <button
                  onClick={handelInscription}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Sign up
                </button>
              </li>
              <li>
                <Link
                  to="HelpCenter"
                  onClick={removeMenuProfile}
                  className="block px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Logged-in dropdown */}
        {showMenuOfuser && (
          <div className="absolute right-4 top-20 mt-2 w-72 rounded-2xl bg-white border border-gray-100 shadow-xl p-2 z-50">
            <button
              onClick={removeMenuuser}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <ul className="mt-6 space-y-0.5">
              <li>
                <Link
                  to="Account"
                  onClick={removeMenuuser}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Account
                </Link>
              </li>
              <li>
                <Link
                  to="Dashboard"
                  onClick={removeMenuuser}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Manage my listings
                </Link>
              </li>
              <li>
                <Link
                  to="Wishlest"
                  onClick={removeMenuuser}
                  className="flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Wishlist
                  {numberFavories > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center min-w-6 h-6 px-1.5 bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold rounded-full">
                      {numberFavories}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  to="Messages"
                  onClick={removeMenuuser}
                  className="block px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Messages
                </Link>
              </li>
              <li>
                <Link
                  to="HelpCenter"
                  onClick={removeMenuuser}
                  className="block px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Help Center
                </Link>
              </li>
              <li className="pt-2 mt-1 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Log out
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>
      {showLogine ? <Logine /> : null}
      {showInscription ? <Singup /> : null}
    </>
  );
};

export default Navbar;
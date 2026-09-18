import { useRef, useState } from "react";
import { useNavigate } from 'react-router';
import { loginUser } from '../Redux/usersSlice';
import { setLoggedIn, setShowLogine, setShowInscription, setShowProfile } from '../Redux/navbarSlice';
import { useDispatch, useSelector } from "react-redux";
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Logine = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [errorLogine, setErrorlogine] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    email: "",
    password: "",
  });

  const loading = useSelector(state => state.users.loading);

  const validateForm = () => {
    const fields = [
      { ref: emailRef, name: "email", message: "Email is required." },
      { ref: passwordRef, name: "password", message: "Please enter a password." },
    ];

    const errors = {};

    fields.forEach(({ ref, name, message }) => {
      const value = ref.current.value.trim();

      if (value === "") {
        errors[name] = message;
      } else if (name === "email" && !value.match(/^\S+@\S+\.\S+$/)) {
        errors[name] = "Please enter a valid email address.";
      } else {
        errors[name] = "";
      }
    });

    setErrorMessages(errors);

    const isValid = Object.values(errors).every((message) => message === "");

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();

    if (isValid) {
      try {
        const resultAction = await dispatch(loginUser({ email: emailRef.current.value, password: passwordRef.current.value }));
        if (loginUser.fulfilled.match(resultAction)) {
          dispatch(setLoggedIn(true));

          localStorage.setItem('isLoggedIn', 'true');
          dispatch(setShowLogine(false));
          dispatch(setShowInscription(false));
          dispatch(setShowProfile(false));
          navigate('/Account');
        } else if (loginUser.rejected.match(resultAction)) {
          setErrorlogine(true);
        }
      } catch (error) {
        setErrorlogine(true);
      }
    }
  };

  const handleSignup = () => {
    dispatch(setShowInscription(true));
    dispatch(setShowLogine(false));
    dispatch(setShowProfile(false));
  };

  const handleClose = () => {
    dispatch(setShowLogine(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      {loading && (
        <div className="flex items-center justify-center">
          <span className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!loading && (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
            <button
              onClick={handleClose}
              className="absolute ml-[90%] text-white/80 hover:text-white transition-colors"
              aria-label="Close login"
            >
              <FontAwesomeIcon icon={faXmark} className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold">
              Welcome back
            </h2>
            <p className="mt-1 text-indigo-100">Log in to <span className="font-mono font-semibold">Student</span>Nest</p>
          </div>
          <form className="px-8 py-6 space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                name="email"
                ref={emailRef}
                className={`${errorMessages.email ? "border-red-500" : "border-gray-300"} w-full py-2.5 px-4 rounded-xl border text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                id="email"
                type="email"
                placeholder="you@example.com"
              />
              {errorMessages.email && <p className="mt-1 text-sm text-red-600">{errorMessages.email}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input
                ref={passwordRef}
                className={`${errorMessages.password ? "border-red-500" : "border-gray-300"} w-full py-2.5 px-4 rounded-xl border text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                id="password"
                type="password"
                placeholder="••••••••"
              />
              {errorMessages.password && <p className="mt-1 text-sm text-red-600">{errorMessages.password}</p>}
            </div>
            {errorLogine && (
              <div className="p-4 rounded-xl bg-orange-50 border-l-4 border-orange-500 text-orange-700" role="alert">
                <p className="font-bold">Oops!</p>
                <p className="text-sm">There was an error with your login credentials.</p>
              </div>
            )}
            <button
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold transition-all shadow-lg"
              type="button"
            >
              Log in
            </button>
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <button
                onClick={handleSignup}
                className="font-bold text-indigo-600 hover:text-indigo-800"
                type="button"
              >
                Sign up
              </button>
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

export default Logine;
import { useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faXmark } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { registerUser } from "../Redux/usersSlice";
import { setShowLogine, setShowInscription } from '../Redux/navbarSlice';
import { useDispatch } from "react-redux";

const Signup = () => {
  const [loginSuccess, setLoginSuccess] = useState(false);
  const dispatch = useDispatch();

  const nameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const acceptConditionRef = useRef(false);
  const cityRef = useRef("");
  const profileImageRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [errorMessages, setErrorMessages] = useState({
    name: "",
    email: "",
    password: "",
    dateOfBirth: "",
    city: "",
    accept: "",
    profileImage: "",
  });

  const validateForm = () => {
    const fields = [
      { ref: nameRef, name: "name", message: "Please enter full name." },
      { ref: emailRef, name: "email", message: "Email is required." },
      { ref: passwordRef, name: "password", message: "Please enter a Password." },
      { ref: acceptConditionRef, name: "accept", message: "Please check your condition." },
      { ref: cityRef, name: "city", message: "Please enter a City." },
    ];

    const errors = {};

    fields.forEach(({ ref, name, message }) => {
      const value = ref.current.value.trim();

      if (value === "") {
        errors[name] = message;
      } else if (name === "email" && !value.match(/^\S+@\S+\.\S+$/)) {
        errors[name] = "Please enter a valid email address.";
      } else if (name === "accept" && !ref.current.checked) {
        errors[name] = message;
      } else {
        errors[name] = "";
      }
    });

    if (!selectedDate) {
      errors.dateOfBirth = "Please select a date.";
    } else {
      errors.dateOfBirth = "";
    }

    setErrorMessages(errors);

    const isValid = Object.values(errors).every((message) => message === "");

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();

    if (isValid) {
      try {
        const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
        const formData = new FormData();
        formData.append("name", nameRef.current.value);
        formData.append("email", emailRef.current.value);
        formData.append("password", passwordRef.current.value);
        formData.append("city", cityRef.current.value);
        formData.append("dateOfBirth", formattedDate);
        if (profileImageRef.current.files[0]) {
          formData.append("profile_image", profileImageRef.current.files[0]);
        }

        const resultAction = await dispatch(registerUser(formData));
        if (registerUser.fulfilled.match(resultAction)) {
          setLoginSuccess(true);
          setTimeout(() => {
            setLoginSuccess(false);
            dispatch(setShowLogine(true));
            dispatch(setShowInscription(false));
          }, 2000);
        } else if (registerUser.rejected.match(resultAction)) {
          setErrorMessages({ ...errorMessages, ...resultAction.payload.errors });
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleClose = () => {
    dispatch(setShowInscription(false));
  };

  const inputBase = "w-full py-2.5 px-4 rounded-xl border text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto py-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative">
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 text-white/80 hover:text-white transition-colors"
            aria-label="Close signup"
          >
            <FontAwesomeIcon icon={faXmark} className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold">
            Create your account
          </h2>
          <p className="mt-1 text-indigo-100">Sign up for <span className="font-mono font-semibold">Student</span>Nest</p>
        </div>
        <form className="px-8 py-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
              <input
                ref={nameRef}
                className={`${errorMessages.name ? "border-red-500" : "border-gray-300"} ${inputBase}`}
                type="text"
                placeholder="Your full name"
              />
              {errorMessages.name && <p className="mt-1 text-sm text-red-600">{errorMessages.name}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                ref={emailRef}
                className={`${errorMessages.email ? "border-red-500" : "border-gray-300"} ${inputBase}`}
                type="email"
                placeholder="Your email"
              />
              {errorMessages.email && <p className="mt-1 text-sm text-red-600">{errorMessages.email}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input
                ref={passwordRef}
                className={`${errorMessages.password ? "border-red-500" : "border-gray-300"} ${inputBase}`}
                type="password"
                placeholder="Your password"
              />
              {errorMessages.password && <p className="mt-1 text-sm text-red-600">{errorMessages.password}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  placeholderText="Select a date"
                  className={`${errorMessages.dateOfBirth ? "border-red-500" : "border-gray-300"} ${inputBase}`}
                />
                <FontAwesomeIcon icon={faCalendarDays} className="absolute right-4 top-3.5 text-gray-400" />
              </div>
              {errorMessages.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errorMessages.dateOfBirth}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">City</label>
              <input
                ref={cityRef}
                className={`${errorMessages.city ? "border-red-500" : "border-gray-300"} ${inputBase}`}
                type="text"
                placeholder="Your city"
              />
              {errorMessages.city && <p className="mt-1 text-sm text-red-600">{errorMessages.city}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Profile Image</label>
              <input
                ref={profileImageRef}
                className="w-full py-2 px-4 rounded-xl border border-gray-300 text-gray-700 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold hover:file:bg-indigo-100 transition-all"
                type="file"
                accept="image/*"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  ref={acceptConditionRef}
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700 text-sm">Accept terms and conditions</span>
              </label>
              {errorMessages.accept && <p className="mt-1 text-sm text-red-600">{errorMessages.accept}</p>}
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold transition-all shadow-lg"
            type="button"
          >
            Sign Up
          </button>
        </form>
      </div>
      {loginSuccess && (
        <div className="absolute z-[60] top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md rounded-xl bg-green-100 border-l-4 border-green-500 text-green-700 p-4 shadow-lg" role="alert">
          <p className="font-bold">Success!</p>
          <p className="text-sm">You have successfully signed up. Redirecting to login...</p>
        </div>
      )}
    </div>
  );
};

export default Signup;
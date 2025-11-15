import { useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import {  registerUser } from "../Redux/usersSlice";
import { setShowLogine, setShowInscription } from '../Redux/navbarSlice';
import { useDispatch, useSelector } from "react-redux";

const Signup = () => {
  const [loginSuccess, setLoginSuccess] = useState(false);
  const user = useSelector((state) => state.users.user);
  console.log(user);
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
        errors[name] = ""; // Ensure that all fields are initialized in errors object
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
          formData.append("profileImage", profileImageRef.current.files[0]);
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

  return (
    <>
      <div className="ml-[10%] lg:w-[50%]  absolute z-40 lg:ml-[35%] lg:mt-[3%] lg:h-[200%] w-[50%]  shadow-zinc-900">
        <form className="p-[5%] bg-white shadow-md rounded lg:px-10 lg:p-[10%] lg:mb-4  ">
          <nav className="flex flex-wrap gap-2 ">
            <div></div>
            <div>
              <h2 className="font-serif ml-[20%] text-wheat text-2xl">Sign up for <span className="m-0 font-mono">Student</span>Nest</h2>
            </div>
          </nav>
          <div className="lg:mt-10 lg:ml-[5%] lg:grid lg:grid-cols-2 lg:gap-5 lg:w-[80%]">
            <div className="lg:mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
              <input
                ref={nameRef}
                className={`${errorMessages.name ? "border-red-600" : ""} shadow appearance-none border rounded w-full py-2 px-3  text-gray-700 leading-tight focus:outline-none focus:shadow-outline `}
                type="text"
                placeholder="Your full name"
              />
              {errorMessages.name && <p style={{ color: "red" }}>{errorMessages.name}</p>}
            </div>
            <div className="lg:mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                ref={emailRef}
                className={`${errorMessages.email ? "border-red-600" : ""} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                type="email"
                placeholder="Your email"
              />
              {errorMessages.email && <p style={{ color: "red" }}>{errorMessages.email}</p>}
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input
                ref={passwordRef}
                className={`${errorMessages.password ? "border-red-600" : ""} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
                type="password"
                placeholder="Your password"
              />
              {errorMessages.password && <p style={{ color: "red" }}>{errorMessages.password}</p>}
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  placeholderText="Select a date"
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errorMessages.dateOfBirth ? "border-red-600" : ""
                  }`}
                />
                <FontAwesomeIcon icon={faCalendarDays} className="absolute right-3 top-2 text-gray-500" />
              </div>
              {errorMessages.dateOfBirth && <p style={{ color: "red" }}>{errorMessages.dateOfBirth}</p>}
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">City</label>
              <input
                ref={cityRef}
                className={`${errorMessages.city ? "border-red-600" : ""} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
                type="text"
                placeholder="Your city"
              />
              {errorMessages.city && <p style={{ color: "red" }}>{errorMessages.city}</p>}
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Profile Image</label>
              <input
                ref={profileImageRef}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                type="file"
                accept="image/*"
              />
            </div>
            <div className="mb-6">
              <label className="inline-flex items-center">
                <input
                  ref={acceptConditionRef}
                  type="checkbox"
                  className="form-checkbox"
                />
                <span className="ml-2">Accept terms and conditions</span>
              </label>
              {errorMessages.accept && <p style={{ color: "red" }}>{errorMessages.accept}</p>}
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={handleSubmit}
                className="shadow bg-slate-950 hover:bg-slate-700 focus:shadow-outline focus:outline-none text-white font-bold py-1 px-4 rounded"
                type="button"
              >
                Sign Up
              </button>
            </div>
          </div>
        </form>
      </div>
      {loginSuccess && (
        <div className="absolute z-50 mb-[15%] ml-[2%] lg:w-[30%] rounded-lg lg:ml-[30%] bg-green-100 border-l-4 border-green-500 text-green-700 lg:p-4" role="alert">
          <p className="font-bold">Success!</p>
          <p>You have successfully signed up. Redirecting to login...</p>
        </div>
      )}
    </>
  );
};

export default Signup;

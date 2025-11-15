// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import navbarReducer from '../navbarSlice';
import userReducer from '../usersSlice';
import wishlestSlice from '../wishlestSlice';

const store = configureStore({
  reducer: {
    navbar: navbarReducer,
    users: userReducer,
    wishlests: wishlestSlice,
  },
});

export default store;
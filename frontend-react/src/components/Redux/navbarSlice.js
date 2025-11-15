import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showProfile: false,
  showLogine: false,
  showInscription: false,
  showMenuOfuser: false,
  loggedIn: false,
};

const navbarSlice = createSlice({
  name: 'navbar',
  initialState,
  reducers: {
    setShowProfile(state, action) {
      state.showProfile = action.payload;
    },
    setShowLogine(state, action) {
      state.showLogine = action.payload;
    },
    setShowInscription(state, action) {
      state.showInscription = action.payload;
    },
    setShowMenuOfuser(state, action) {
      state.showMenuOfuser = action.payload;
    },
    setLoggedIn(state, action) {
      state.loggedIn = action.payload;
    },
  },
});

export const {
  setShowProfile,
  setShowLogine,
  setShowInscription,
  setShowMenuOfuser,
  setLoggedIn,
} = navbarSlice.actions;

export default navbarSlice.reducer;

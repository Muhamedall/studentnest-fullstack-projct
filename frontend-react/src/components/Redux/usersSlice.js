import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../../api/api';
import { setLoggedIn, setShowLogine, setShowInscription, setShowProfile } from './navbarSlice';

export const registerUser = createAsyncThunk(
  "users/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/register", formData, {
        headers: {
          "Content-Type" : "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const logoutUser = createAsyncThunk(
  'users/logoutUser',
  async (_, thunkAPI) => {
    try {
      const response = await axios.post('/api/logout');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.errors);
    }
  }
);

export const loginUser = createAsyncThunk(
  "users/loginUser",
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post("/api/login", { email, password });
      const userData = response.data;

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userData.user));

      dispatch(setLoggedIn(true));
      dispatch(setShowLogine(false));
      dispatch(setShowInscription(false));
      dispatch(setShowProfile(false));

      return userData;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.error = null;
    })
    .addCase(logoutUser.rejected, (state, action) => {
      state.error = action.payload;
    })
    .addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;

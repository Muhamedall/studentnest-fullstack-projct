import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/api';

export const fetchWishlist = createAsyncThunk(
    'wishlests/fetchWishlist',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/wishlist');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
        }
    }
);

export const addWishlistItem = createAsyncThunk(
    'wishlests/addWishlistItem',
    async (listingId, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/wishlist', { listing_id: listingId });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
        }
    }
);

export const removeWishlistItem = createAsyncThunk(
    'wishlests/removeWishlistItem',
    async (listingId, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/wishlist/${listingId}`);
            return listingId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
        }
    }
);

const initialState = {
    favories: [],
    numberFavories: 0,
    loading: false,
    error: null,
};

const wishlestSlice = createSlice({
    name: 'wishlests',
    initialState,
    reducers: {
        clearWishlist: (state) => {
            state.favories = [];
            state.numberFavories = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.favories = action.payload.map(item => ({
                    ...item.listing,
                    wishlistId: item.id,
                }));
                state.numberFavories = state.favories.length;
            })
            .addCase(fetchWishlist.rejected, (state) => {
                state.loading = false;
            })
            .addCase(addWishlistItem.fulfilled, (state, action) => {
                const item = action.payload;
                const exists = state.favories.some(f => f.id === item.listing_id);
                if (!exists) {
                    state.favories.push({
                        ...item.listing,
                        wishlistId: item.id,
                    });
                    state.numberFavories = state.favories.length;
                }
            })
            .addCase(removeWishlistItem.fulfilled, (state, action) => {
                const listingId = action.payload;
                state.favories = state.favories.filter(fav => fav.id !== listingId);
                state.numberFavories = state.favories.length;
            });
    },
});

export const { clearWishlist } = wishlestSlice.actions;
export default wishlestSlice.reducer;

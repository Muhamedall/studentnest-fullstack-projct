import { createSlice } from '@reduxjs/toolkit';

const loadFromLocalStorage = (userId) => {
    try {
        const serializedState = localStorage.getItem(`favories_${userId}`);
        if (serializedState === null) {
            return [];
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return [];
    }
};

const saveToLocalStorage = (userId, state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(`favories_${userId}`, serializedState);
    } catch (err) {
        console.error('Error saving to local storage:', err);
    }
};

const loadNumberFavoriesFromLocalStorage = (userId) => {
    try {
        const serializedState = localStorage.getItem(`numberFavories_${userId}`);
        if (serializedState === null) {
            return 0;
        }
        return parseInt(serializedState, 10);
    } catch (err) {
        return 0;
    }
};

const saveNumberFavoriesToLocalStorage = (userId, numberFavories) => {
    try {
        localStorage.setItem(`numberFavories_${userId}`, numberFavories.toString());
    } catch (err) {
        console.error('Error saving numberFavories to local storage:', err);
    }
};

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
        initializeWishlest: (state, action) => {
            const userId = action.payload;
            state.favories = loadFromLocalStorage(userId);
            state.numberFavories = loadNumberFavoriesFromLocalStorage(userId);
        },
        addWishlest: (state, action) => {
            const userId = action.payload.userId;
            const item = action.payload.item;

            if (!Array.isArray(state.favories)) {
                state.favories = [];
            }
            const existingItem = state.favories.find(fav => fav.id === item.id);
            if (!existingItem) {
                state.favories.push(item);
                saveToLocalStorage(userId, state.favories);
                state.numberFavories = state.favories.length;
                saveNumberFavoriesToLocalStorage(userId, state.numberFavories);
            }
        },
        removeWishlest: (state, action) => {
            const userId = action.payload.userId;
            const itemId = action.payload.itemId;

            state.favories = state.favories.filter(fav => fav.id !== itemId);
            saveToLocalStorage(userId, state.favories);
            state.numberFavories = state.favories.length;
            saveNumberFavoriesToLocalStorage(userId, state.numberFavories);
        },
    },
});

export const { addWishlest, removeWishlest, initializeWishlest } = wishlestSlice.actions;
export default wishlestSlice.reducer;
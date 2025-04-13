import { configureStore } from '@reduxjs/toolkit';
import urlReducer from './slices/urlSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    url: urlReducer,
    // Add other reducers here as needed
  },
  // Optional: configure middleware, devTools, etc.
});

// Define RootState type for TypeScript
export type RootState = ReturnType<typeof store.getState>;
// Define AppDispatch type for TypeScript
export type AppDispatch = typeof store.dispatch;

export default store; 
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import networkReducer from './slices/networkSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    network: networkReducer, //  
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // avoid timestamp warnings
    }),
});

export default store;
import { createSlice } from '@reduxjs/toolkit';

const networkSlice = createSlice({
  name: 'network',
  initialState: {
    isOnline: true, // assume online until NetInfo updates it
  },
  reducers: {
    // whenever NetInfo detects a change, we dispatch this action
    setNetworkState: (state, action) => {
      state.isOnline = action.payload;
    },
  },
});

export const { setNetworkState } = networkSlice.actions;
export default networkSlice.reducer;
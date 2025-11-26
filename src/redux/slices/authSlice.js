
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

////////////////////////
   //// Sign up new user

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await auth().createUserWithEmailAndPassword(email, password);
      const user = result.user;
      await AsyncStorage.setItem('UserData', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

///////////////////////////
   ///// Login existing user

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await auth().signInWithEmailAndPassword(email, password);
      const user = result.user;
      await AsyncStorage.setItem('UserData', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/////////////////////
/////   Logout user

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await auth().signOut();
  await AsyncStorage.multiRemove(['UserData', 'AppTheme']); // also clear theme if desired
  return null;
});
///////////////////////////////
/////    Restore session
///////////////////////
export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const saved = await AsyncStorage.getItem('UserData');
  return saved ? JSON.parse(saved) : null;
});



//////////////////////////////////////////////
  //  Restore theme preference at app start

export const restoreTheme = createAsyncThunk('theme/restoreTheme', async () => {
  const savedTheme = await AsyncStorage.getItem('AppTheme');
  return savedTheme || 'light';
});

/* -------------------------------------------------
    Slice
---------------------------------------------------*/
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    themeMode: 'light', // default theme
  },
  reducers: {
    toggleTheme(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('AppTheme', state.themeMode);
    },
    setTheme(state, action) {
      state.themeMode = action.payload;
      AsyncStorage.setItem('AppTheme', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Authentication  
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      // -- Theme restoration 
      .addCase(restoreTheme.fulfilled, (state, action) => {
        state.themeMode = action.payload;
      });
  },
});

export const { toggleTheme, setTheme } = authSlice.actions;
export default authSlice.reducer;
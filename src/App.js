
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import store from './redux/store';
import AppNavigator from './navigation/Appnavigator';
import { uploadPendingReports } from './utils/syncReports';
import { setNetworkState } from './redux/slices/networkSlice';
import './i18n';

// simple background component
function NetworkManager() {
  const dispatch = useDispatch();

  useEffect(() => {
    const syncIfOnline = async isConnected => {
      dispatch(setNetworkState(isConnected));
      if (isConnected) {
        try {
          await uploadPendingReports();
        } catch (err) {
          console.log('Sync error:', err);
        }
      }
    };

    // initial check
    NetInfo.fetch().then(net => syncIfOnline(!!net.isConnected));

    // listen to network changes
    const netSub = NetInfo.addEventListener(state =>
      syncIfOnline(!!state.isConnected)
    );

    // also retry when app comes back to foreground
    const appSub = AppState.addEventListener('change', status => {
      if (status === 'active') {
        NetInfo.fetch().then(net => syncIfOnline(!!net.isConnected));
      }
    });

    return () => {
      netSub && netSub();
      appSub && appSub.remove();
    };
  }, [dispatch]);

  return null;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <AppNavigator />
          <NetworkManager />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
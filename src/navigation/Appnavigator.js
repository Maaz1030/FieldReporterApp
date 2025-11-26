import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../utils/colors';
import { useTranslation } from 'react-i18next';
//////////////////////////////////////////////////
// Screens
import LoginScreen from '../screens/Auth/Login';
import SignUpScreen from '../screens/Auth/Signup';
import HomeScreen from '../screens/main/Home/HomeScreen';
import LocationScreen from '../screens/main/LocationScreen';
import CarddetailScreen from '../screens/main/CarddetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import EditProfile from '../screens/main/EditProfile';
import CreateReportScreen from '../screens/main/CreateReportScreen/CreateReportScreen';
import CardDetailScreen from '../screens/main/CarddetailScreen';
import EditReportScreen from '../screens/main/EditReportScreen';
import DraftsScreen from '../screens/main/DraftsScreen';
import ImageViewerScreen from '../screens/main/ImageViewerScreen';
import ReportDetailScreen from '../screens/main/ReportDetailScreen/ReportDetailScreen'

// used variables instead
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/// tabs are in maintabs  will  use it in main
function MainTabs() {
  const insets = useSafeAreaInsets();
  const themeMode = useSelector(state => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;
  const { t } = useTranslation(); /// for language

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 0.6,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 6,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home-outline';
          if (route.name === t('home')) iconName = 'home-outline';
          if (route.name === 'Location') iconName = 'location-outline';
          if (route.name === 'CreateReport') iconName = 'add-circle-outline';
          if (route.name === 'Profile') iconName = 'person-outline';
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name={t('home')} component={HomeScreen} />
      <Tab.Screen name="CreateReport" component={CreateReportScreen} />
      <Tab.Screen name="Location" component={LocationScreen} />

      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const themeMode = useSelector(state => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;

  const [initialRoute, setInitialRoute] = useState('Login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const saved = await AsyncStorage.getItem('UserData');
        const user = saved ? JSON.parse(saved) : null;
        if (user && user.uid) {
          setInitialRoute('MainTabs');
        } else {
          setInitialRoute('Login');
        }
      } catch (err) {
        setInitialRoute('Login');
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (loading) {
    // splash will be added here
    return null;
  }

  return (
    <NavigationContainer
      theme={{
        colors: {
          background: theme.primaryBackground,
          card: theme.surface,
          text: theme.primaryText,
          border: theme.border,
          primary: theme.accent,
        },
      }}
    >
      <StatusBar
        backgroundColor={theme.primaryBackground}
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
      />
      {/* dark-content, light-content used here to adjust globally  */}

      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Carddetail" component={ReportDetailScreen} />
        <Stack.Screen name="EditReport" component={EditReportScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        
        <Stack.Screen name="Draft" component={DraftsScreen} />

        <Stack.Screen
          name="ImageViewer"
          component={ImageViewerScreen}
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/////////

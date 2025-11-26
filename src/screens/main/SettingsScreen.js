import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutUser, toggleTheme } from '../../redux/slices/authSlice';
import colors from '../../utils/colors';
import { useTranslation } from 'react-i18next'; //  translation hook

const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  // -------- Theme state --------
  const themeMode = useSelector(state => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;
  const [darkMode, setDarkMode] = useState(themeMode === 'dark');

  // -------- Language state --------
  const [isEnglish, setIsEnglish] = useState(i18n.language === 'en');

  useEffect(() => {
    setDarkMode(themeMode === 'dark');
  }, [themeMode]);

  // -------- Logout handler --------
  const handleLogout = () => {
    Alert.alert(t('logout'), t('logout_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(logoutUser()).unwrap();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.log(' Logout Error:', error);
            Alert.alert('Error', 'Could not log out.');
          }
        },
      },
    ]);
  };

  // -------- Theme toggle --------
  const handleThemeSwitch = () => {
    setDarkMode(prev => !prev);
    dispatch(toggleTheme());
  };

  // -------- Language toggle --------
  const handleLanguageSwitch = async () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en'; // toggle between English & Urdu
    await i18n.changeLanguage(newLang);
    setIsEnglish(newLang === 'en');
    await AsyncStorage.setItem('appLanguage', newLang); // persist choice
  };

  // restore persisted language
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('appLanguage');
      if (saved && saved !== i18n.language) {
        await i18n.changeLanguage(saved);
        setIsEnglish(saved === 'en');
      }
    })();
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.primaryBackground,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 10,
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.headerBar,
          {
            borderColor: theme.border,
            backgroundColor: theme.primaryBackground,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={22} color={theme.primaryText} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
          {t('settings')}
        </Text>

        <View style={{ width: 22 }} />
      </View>

      {/* Edit Profile */}
      <TouchableOpacity
        style={[
          styles.row,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <View style={styles.rowLeft}>
          <Icon name="person-circle-outline" size={22} color={theme.accent} />
          <Text style={[styles.rowText, { color: theme.primaryText }]}>
            {t('edit_profile')}
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color={theme.secondaryText} />
      </TouchableOpacity>

      {/* Dark Mode */}
      <View
        style={[
          styles.row,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.rowLeft}>
          <Icon name="moon-outline" size={22} color={theme.accent} />
          <Text style={[styles.rowText, { color: theme.primaryText }]}>
            {t('dark_mode')}
          </Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={handleThemeSwitch}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={darkMode ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Language Switch */}
      <View
        style={[
          styles.row,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.rowLeft}>
          <Icon name="language-outline" size={22} color={theme.accent} />
          <Text style={[styles.rowText, { color: theme.primaryText }]}>
            {t('language')} ({isEnglish ? 'English' : 'اردو'})
          </Text>
        </View>
        <Switch
          value={isEnglish}
          onValueChange={handleLanguageSwitch}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={isEnglish ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[
          styles.row,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <View style={styles.rowLeft}>
          <Icon name="log-out-outline" size={22} color={theme.accent} />
          <Text style={[styles.rowText, { color: theme.primaryText }]}>
            {t('logout')}
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color={theme.secondaryText} />
      </TouchableOpacity>
    </View>
  );
};

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 10,
    marginBottom: 30,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 14,
    borderWidth: 1,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowText: { marginLeft: 10, fontSize: 16 },
});

export default SettingsScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Animated from 'react-native-reanimated';

import colors from '../../utils/colors';
import { ReportListItem } from './ReportListItem';
import formatTime from '../../utils/formatTime';      // shared time helper
import DeleteReport from '../../components/DeleteReport'; // ✅ shared delete component

const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/1.jpg';
const ACTION_WIDTH = 100;

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const isFocused = useIsFocused();

  const themeMode = useSelector(state => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;

  // ---- Load user & reports ----
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('UserData');
        const u = savedUser ? JSON.parse(savedUser) : null;
        setUser(u);

        const uid = u?.uid || 'guest';
        const key = `Reports_${uid}`;
        const stored = await AsyncStorage.getItem(key);

        if (stored) {
          const parsed = JSON.parse(stored).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          setReports(parsed);
        } else setReports([]);
      } catch (err) {
        console.error('Error loading profile or reports:', err);
      }
    };

    if (isFocused) loadProfileData();
  }, [isFocused]);

  // ---- Delete report handler using shared component ----
  const handleDeletePress = (reportId, reportTitle) => {
    DeleteReport({
      reportId,
      reportTitle,
      t,
      onSuccess: updatedList => setReports(updatedList),
    });
  };

  // ---- Render each report item ----
  const renderReport = ({ item }) => (
    <ReportListItem
      item={item}
      theme={theme}
      navigation={navigation}
      t={t}
      onDelete={handleDeletePress}
      formatTime={formatTime}
    />
  );

  const handleEditProfile = () => navigation.navigate('EditProfile');

  const avatar =
    user?.photoURL && user.photoURL.trim() !== ''
      ? user.photoURL
      : DEFAULT_AVATAR;

  // ---- Avatar viewer navigation ----
  const viewProfileImage = () => {
    navigation.navigate('ImageViewer', {
      imageUri: avatar,
      sharedElementId: `profile-avatar-${user.uid}`,
    });
  };

  // ---- Loading fallback ----
  if (!user) {
    return (
      <View style={styles.loadingState}>
        <Text>{t('loading_profile') || 'Loading profile...'}</Text>
      </View>
    );
  }

  const displayName =
    user.displayName && user.displayName.trim() !== ''
      ? user.displayName
      : t('default_username') || 'Set your user name';
  const email = user.email || 'No email available';

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.primaryBackground }]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
          {t('greet') || 'Profile Info'}
        </Text>

        {/* ---- Profile Card ---- */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
          <TouchableOpacity onPress={viewProfileImage}>
            <Animated.View sharedTransitionTag={`profile-avatar-${user.uid}`}>
              <Image source={{ uri: avatar }} style={styles.profileImage} />
            </Animated.View>
          </TouchableOpacity>

          <Text style={[styles.nameText, { color: theme.primaryText }]}>
            {displayName}
          </Text>
          <Text style={[styles.emailText, { color: theme.secondaryText }]}>
            {email}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.editButtonText}>{t('edit_profile')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.logoutButtonText}>{t('settings')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ---- Draft Section ---- */}
        <View style={[styles.draft, styles.draftButton]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Draft')}
            style={{ flexDirection: 'row' }}
          >
            <Text style={[styles.draft]}>
              {t('your_drafts') || 'Your Drafts'}
            </Text>
            <Icon
              name="document-text-outline"
              size={22}
              color={'#c1ce5bff'}
              style={{ top: 2, left: 5 }}
            />
          </TouchableOpacity>
        </View>

        {/* ---- Reports Section ---- */}
        <View style={styles.reportsSection}>
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
            {reports.length ? t('your_reports') : t('no_reports')}
          </Text>

          <FlashList
            data={reports}
            keyExtractor={item => item.id}
            renderItem={renderReport}
            estimatedItemSize={120}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingHorizontal: 16, paddingVertical: 20 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 25,
  },
  draft: { flexDirection: 'row', justifyContent: '' },
  profileCard: {
    borderRadius: 16,
    alignItems: 'center',
    padding: 24,
    elevation: 5,
    marginBottom: 25,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
  },
  nameText: { fontSize: 22, fontWeight: '600' },
  emailText: { fontSize: 15, marginBottom: 10 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '100%',
  },
  editButton: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 24,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  editButtonText: { color: '#4CAF50', fontSize: 15, fontWeight: '600' },
  draftButton: {
    backgroundColor: '#f7fae2ff',
    borderColor: '#c1ce5bff',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 14,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
    bottom: 6,
  },
  draft: {
    color: '#c1ce5bff',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 24,
    flex: 1,
    alignItems: 'center',
    marginLeft: 10,
  },
  logoutButtonText: { color: '#2196F3', fontSize: 15, fontWeight: '600' },
  reportsSection: { flex: 1, minHeight: 200 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    marginLeft: 4,
  },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
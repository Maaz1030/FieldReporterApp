import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import FastImage from 'react-native-fast-image';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';

const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/1.jpg';

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const isFocused = useIsFocused();

  const themeMode = useSelector(state => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;

  /* -------- Load current user & reports whenever screen is focused -------- */
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
          const parsed = JSON.parse(stored);
          const sorted = parsed.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          setReports(sorted);
        } else {
          setReports([]);
        }
      } catch (err) {
        console.error('Error loading profile or reports:', err);
      }
    };

    if (isFocused) loadProfileData();
  }, [isFocused]);

  /* -------- Delete Report Function -------- */
  const deleteReport = async (reportId) => {
    try {
      const userData = await AsyncStorage.getItem('UserData');
      const user = userData ? JSON.parse(userData) : null;
      const uid = user?.uid || 'guest';
      const key = `Reports_${uid}`;

      // Delete from local storage
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        let reports = JSON.parse(stored);
        reports = reports.filter((r) => r.id !== reportId);
        await AsyncStorage.setItem(key, JSON.stringify(reports));
        console.log(` Report ${reportId} removed locally for user ${uid}`);
        
        // Update UI state
        setReports(reports);
      }

      Alert.alert(t('deleted') || 'Deleted', t('deleted_success') || 'Report deleted successfully.');
    } catch (error) {
      console.error('Error deleting report:', error);
      Alert.alert(t('error') || 'Error', t('delete_failed') || 'Failed to delete report.');
    }
  };

  /* -------- Handle Delete Confirmation -------- */
  const handleDeletePress = (reportId, reportTitle) => {
    Alert.alert(
      t('delete_report') || 'Delete Report',
      t('delete_confirm') || `Are you sure you want to delete "${reportTitle}"?`,
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        { 
          text: t('delete') || 'Delete', 
          style: 'destructive', 
          onPress: () => deleteReport(reportId) 
        },
      ],
    );
  };

  /* -------- Render right swipe action (Delete) -------- */
  const renderRightActions = (progress, dragX, item) => {
    return (
      <RectButton
        style={styles.deleteAction}
        onPress={() => handleDeletePress(item.id, item.title)}
      >
        <Text style={styles.deleteActionText}>
          {t('delete') || 'Delete'}
        </Text>
      </RectButton>
    );
  };

  /* -------- Format readable time -------- */
  const formatTime = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  };

  /* -------- Render single report with swipe functionality -------- */
  const renderReport = ({ item }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.surface }]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Carddetail', { report: item })}
      >
        <View style={styles.imageWrap}>
          <FastImage
            style={styles.image}
            source={{
              uri:
                item.images && item.images.length > 0
                  ? item.images[0].uri
                  : 'https://via.placeholder.com/400x250.png?text=No+Image',
              priority: FastImage.priority.high,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
          {item.images?.length > 1 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>+{item.images.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text
            style={[styles.titleText, { color: theme.primaryText }]}
            numberOfLines={2}
          >
            {item.title || 'Untitled Report'}
          </Text>
          <Text
            style={[styles.metaText, { color: theme.secondaryText }]}
            numberOfLines={1}
          >
            {item.category} • {formatTime(item.createdAt)}
          </Text>
          <Text
            style={[styles.detailsText, { color: theme.secondaryText }]}
            numberOfLines={2}
          >
            {item.details || 'No description'}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  /* -------- Navigate to edit profile -------- */
  const handleEditProfile = () => navigation.navigate('EditProfile');

  /* -------- Loading placeholder -------- */
  if (!user)
    return (
      <View style={styles.loadingState}>
        <Text>{t('loading_profile') || 'Loading profile...'}</Text>
      </View>
    );

  /* -------- Determine avatar, name, email -------- */
  const avatar =
    user.photoURL && user.photoURL.trim() !== ''
      ? user.photoURL
      : DEFAULT_AVATAR;

  const displayName =
    user.displayName && user.displayName.trim() !== ''
      ? user.displayName
      : t('default_username') || 'Set your user name';
  const email = user.email || 'No email available';

  /* -------- UI -------- */
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.primaryBackground }]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
          {t('greet') || 'Profile Info'}
        </Text>

        {/* Profile Info Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
          <Image source={{ uri: avatar }} style={styles.profileImage} />
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

        {/* Reports Section */}
        <View style={styles.reportsSection}>
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
            {reports.length > 0 ? t('your_reports') : t('no_reports')}
          </Text>

          <FlashList
            data={reports}
            keyExtractor={item => item.id}
            renderItem={renderReport}
            estimatedItemSize={120}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingHorizontal: 16, paddingVertical: 20 },

  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 25,
  },

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

  card: {
    flexDirection: 'row',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    elevation: 3,
  },

  imageWrap: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },

  image: { width: '100%', height: '100%' },

  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  content: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  titleText: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  metaText: { fontSize: 13, marginBottom: 6 },
  detailsText: { fontSize: 13, lineHeight: 18 },

  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Swipe delete action styles
  deleteAction: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 14,
    marginBottom: 16,
  },
  deleteActionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
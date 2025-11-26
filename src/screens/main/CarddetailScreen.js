import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../utils/colors';
import firestore from '@react-native-firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';

export default function CardDetailScreen() {
  /// this is used to get animation but it is not working yet have to change it
  const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();

  const themeMode = useSelector(state => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;

  const { report } = route.params;
  const [menuVisible, setMenuVisible] = useState(false);

  // ---- Network listener for syncing ---- /// data to upload when we come online
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log(' Online - syncing pending operations...');
        syncPendingDeletions();
      }
    });

    return () => unsubscribe();
  }, []);

  const goBack = () => navigation.goBack();

  // ---- Delete prompt ----
  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(t('delete_report'), t('delete_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: deleteReport },
    ]);
  };

  // ---- Sync pending deletions ----
  const syncPendingDeletions = async () => {
    try {
      const userData = await AsyncStorage.getItem('UserData');
      const user = userData ? JSON.parse(userData) : null;
      const uid = user?.uid || 'guest';
      const key = `Reports_${uid}`;

      const stored = await AsyncStorage.getItem(key);
      if (!stored) return;

      const localReports = JSON.parse(stored);

      // Get all report IDs from local storage
      const localReportIds = localReports.map(report => report.id);

      // Check Firebase for reports that should be deleted
      const netState = await NetInfo.fetch();
      if (netState.isConnected && uid !== 'guest') {
        const snapshot = await firestore()
          .collection('fieldReporter_Users')
          .doc(uid)
          .collection('reports')
          .get();

        const firebaseReportIds = snapshot.docs.map(doc => doc.id);

        // Delete from Firebase any reports that don't exist locally
        for (const firebaseId of firebaseReportIds) {
          if (!localReportIds.includes(firebaseId)) {
            await firestore()
              .collection('fieldReporter_Users')
              .doc(uid)
              .collection('reports')
              .doc(firebaseId)
              .delete();
            console.log(` Synced deletion for report: ${firebaseId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing deletions:', error);
    }
  };

  // ---- Perform delete ----
  const deleteReport = async () => {
    try {
      const userData = await AsyncStorage.getItem('UserData');
      const user = userData ? JSON.parse(userData) : null;
      const uid = user?.uid || 'guest';
      const key = `Reports_${uid}`;

      // 1. Always delete from local storage first
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        let reports = JSON.parse(stored);
        reports = reports.filter(r => r.id !== report.id);
        await AsyncStorage.setItem(key, JSON.stringify(reports));
        console.log(` Report ${report.id} removed locally for user ${uid}`);
      }

      /////// 2. Try to delete from Firebase if online
      const netState = await NetInfo.fetch();
      if (netState.isConnected && uid !== 'guest') {
        try {
          await firestore()
            .collection('fieldReporter_Users')
            .doc(uid)
            .collection('reports')
            .doc(report.id)
            .delete();
          console.log(' Report deleted from Firestore');
          Alert.alert(t('deleted'), t('deleted_success'));
        } catch (err) {
          console.log(' Firestore delete failed:', err);
          Alert.alert(t('deleted'), t('deleted_locally_sync_later'));
        }
      } else {
        // Offline case
        Alert.alert(t('deleted'), t('deleted_locally_will_sync'));
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error deleting report:', error);
      Alert.alert(t('error'), t('delete_failed'));
    }
  };

  // ---- Edit handler ----
  const handleEdit = () => {
    setMenuVisible(false);
    navigation.navigate('EditReport', {
      report,
      reportIndex: route.params.reportIndex,
    });
  };

  // ---- Format date/time ----
  const formatTime = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return t('just_now');
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} ${t('minutes_ago')}`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${t('hours_ago')}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ${t('days_ago')}`;
    return date.toLocaleDateString();
  };

  // ---- UI ----
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.primaryBackground, paddingTop: insets.top },
      ]}
    >
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.primaryBackground}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.primaryText} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
          {t('report_details')}
        </Text>

        {/* menu */}
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={[styles.actionButton, { right: -15 }]}
        >
          <Icon name="ellipsis-vertical" size={22} color={theme.primaryText} />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.menuBox,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  left: 14,
                },
              ]}
            >
              <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                <Icon
                  name="create-outline"
                  size={18}
                  color={theme.primaryText}
                />
                <Text style={[styles.menuText, { color: theme.primaryText }]}>
                  {t('edit')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                <Icon name="trash-outline" size={18} color="#ff4444" />
                <Text style={[styles.menuText, { color: '#ff4444' }]}>
                  {t('delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Image */}
        <Animated.View
          style={styles.imageContainer}
          sharedTransitionTag={`reportImage-${report.id}`} // Use a unique tag based on report ID
        >
          <AnimatedFastImage
            style={styles.reportImage}
            source={{
              uri:
                report.images && report.images.length > 0
                  ? report.images[0].uri
                  : 'https://via.placeholder.com/400x250.png?text=No+Image',
              priority: FastImage.priority.high,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </Animated.View>
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text
            style={[styles.title, { color: theme.primaryText }]}
            numberOfLines={2}
          >
            {report.title || t('untitled_report')}
          </Text>

          {/* Meta */}
          <View style={styles.metaContainer}>
            <View
              style={[styles.categoryBadge, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.categoryText}>{report.category}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Icon name="time-outline" size={14} color={theme.secondaryText} />
              <Text style={[styles.dateText, { color: theme.secondaryText }]}>
                {formatTime(report.createdAt)}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.detailRow}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.accent + '20' },
              ]}
            >
              <Icon name="location-outline" size={16} color={theme.accent} />
            </View>
            <Text style={[styles.detailText, { color: theme.primaryText }]}>
              {t('location')}: {report.location}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="document-text-outline"
                size={20}
                color={theme.accent}
              />
              <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
                {t('description')}
              </Text>
            </View>
            <View
              style={[
                styles.descriptionBox,
                { backgroundColor: theme.surface },
              ]}
            >
              <Text style={[styles.description, { color: theme.primaryText }]}>
                {report.details}
              </Text>
            </View>
          </View>

          {/* Additional Images */}
          {report.images && report.images.length > 1 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="images-outline" size={20} color={theme.accent} />
                <Text
                  style={[styles.sectionTitle, { color: theme.primaryText }]}
                >
                  {t('photos')} ({report.images.length})
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.additionalImages}>
                  {report.images.map((image, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image
                        source={{ uri: image.uri }}
                        style={styles.additionalImage}
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// -----------------------------
// STYLES
// -----------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  backButton: { padding: 4, right: 10 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  actionButton: { padding: 8 },
  scrollView: { flex: 1 },
  imageContainer: { width: '100%', height: 280, top: 10 },
  reportImage: { width: '100%', height: '100%' },
  contentContainer: { padding: 20 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 16, lineHeight: 32 },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 14, marginLeft: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: { fontSize: 16, fontWeight: '500' },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginLeft: 8 },
  descriptionBox: { borderRadius: 12, padding: 16 },
  description: { fontSize: 16, lineHeight: 24 },
  additionalImages: { flexDirection: 'row', paddingRight: 20 },
  imageWrapper: { marginRight: 12 },
  additionalImage: { width: 100, height: 100, borderRadius: 12 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuBox: {
    marginTop: 70,
    marginRight: 15,
    borderWidth: 1,
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 6,
    width: 150,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuText: { fontSize: 15, marginLeft: 10 },
});

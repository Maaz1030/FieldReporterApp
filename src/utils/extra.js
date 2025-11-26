import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  Modal,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../utils/colors';

// Example report categories for field reporters
const REPORT_TYPES = [
  'Accident',
  'Infrastructure',
  'Environment',
  'Health',
  'Crime',
  'Natural Disaster',
  'Community',
  'Politics',
  'Other',
];

export default function CreateReportScreen() {
  const insets = useSafeAreaInsets();
  const theme = colors.light;

  // Form state
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [categoryModal, setCategoryModal] = useState(false);

  // placeholder photos array (empty initially)
  const samplePhotos = [];

  const handleSubmit = () => {
    console.log({
      title,
      details,
      category,
      location,
    });
    alert('Report saved locally (mock)');
    setTitle('');
    setDetails('');
    setCategory('');
    setLocation('');
  };

  const barStyle = 'dark-content';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.primaryBackground }]}>
        <StatusBar barStyle={barStyle} backgroundColor={theme.primaryBackground} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.header, { color: theme.primaryText }]}>Create New Report</Text>

          {/* ---------- Photo placeholder UI ---------- */}
          <View style={styles.photoRow}>
            {/* Add photo card */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.addBox,
                { borderColor: theme.accent, backgroundColor: theme.surface },
              ]}
            >
              <Icon name="camera-outline" size={36} color={theme.accent} />
              <Text style={{ color: theme.secondaryText, fontSize: 12, marginTop: 4 }}>
                Add Photo
              </Text>
            </TouchableOpacity>

            {/* Dummy preview boxes for layout illustration */}
            {samplePhotos.length === 0 && (
              <>
                <View style={[styles.previewWrap, { backgroundColor: theme.surface }]}>
                  <Icon name="image-outline" size={40} color={theme.secondaryText} />
                </View>
                <View style={[styles.previewWrap, { backgroundColor: theme.surface }]}>
                  <Icon name="image-outline" size={40} color={theme.secondaryText} />
                </View>
              </>
            )}
          </View>

          {/* ---------- Form fields ---------- */}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.primaryText,
              },
            ]}
            placeholder="Report Title"
            placeholderTextColor={theme.secondaryText}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.primaryText,
              },
            ]}
            placeholder="Detailed Description"
            placeholderTextColor={theme.secondaryText}
            multiline
            value={details}
            onChangeText={setDetails}
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.primaryText,
              },
            ]}
            placeholder="Location / Coordinates"
            placeholderTextColor={theme.secondaryText}
            value={location}
            onChangeText={setLocation}
          />

          {/* ---------- Category selector ---------- */}
          <TouchableOpacity
            style={[
              styles.dropdown,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={() => setCategoryModal(true)}
          >
            <Text
              style={{
                color: category ? theme.primaryText : theme.secondaryText,
                fontSize: 15,
              }}
            >
              {category || 'Select Category'}
            </Text>
            <Icon name="chevron-down-outline" size={18} color={theme.accent} />
          </TouchableOpacity>

          {/* ---------- Category modal ---------- */}
          <Modal
            visible={categoryModal}
            transparent
            animationType="fade"
            onRequestClose={() => setCategoryModal(false)}
          >
            <TouchableOpacity
              style={[styles.modalOverlay, { paddingTop: insets.top + 180 }]}
              activeOpacity={1}
              onPress={() => setCategoryModal(false)}
            >
              <View
                style={[
                  styles.modalBox,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <FlatList
                  data={REPORT_TYPES}
                  keyExtractor={item => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.categoryRow}
                      onPress={() => {
                        setCategory(item);
                        setCategoryModal(false);
                      }}
                    >
                      <Text style={{ color: theme.primaryText, fontSize: 15 }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* ---------- Submit button ---------- */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accent }]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Save Report</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  /* Photo area */
  photoRow: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center',
  },
  addBox: {
    width: 110,
    height: 110,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  previewWrap: {
    width: 110,
    height: 110,
    borderRadius: 10,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  /* Input styles */
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  /* Dropdown */
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 30,
  },
  modalOverlay: { flex: 1 },
  modalBox: {
    top: 200,
    width: '55%',
    alignSelf: 'flex-end',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 4,
    right: 16,
    maxHeight: 280,
  },
  categoryRow: { paddingVertical: 10, paddingHorizontal: 14 },
  /* Submit button */
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});



////////////



/////////////



import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FlashList } from '@shopify/flash-list';
import FastImage from 'react-native-fast-image';
import colors from '../../utils/colors';

export default function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const theme = colors.light;

  /* Dummy Data — replace later with reports fetched or offline data */
  const data = [
    {
      id: '1',
      title: 'Road Inspection',
      time: '2 hours ago',
      cover: 'https://via.placeholder.com/400x250.png?text=Road+Inspection',
    },
    {
      id: '2',
      title: 'Local Market Report',
      time: '4 hours ago',
      cover: 'https://via.placeholder.com/400x250.png?text=Local+Market',
    },
    {
      id: '3',
      title: 'Roadblock',
      time: '6 hours ago',
      cover: 'https://via.placeholder.com/400x250.png?text=Roadblock',
    },
    {
      id: '4',
      title: 'Power Issue',
      time: 'Yesterday',
      cover: 'https://via.placeholder.com/400x250.png?text=Power+Issue',
    },
    {
      id: '5',
      title: 'Factory on Fire',
      time: '2 days ago',
      cover: 'https://via.placeholder.com/400x250.png?text=Factory+Fire',
    },
    {
      id: '6',
      title: 'Warehouse Report',
      time: '3 days ago',
      cover: 'https://via.placeholder.com/400x250.png?text=Warehouse',
    },
  ];

  /* ---------- Search Filter ---------- */
  const filteredData = data.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearch = text => setSearchText(text);
  const clearSearch = () => setSearchText('');

  /* ---------- Render each product/report card ---------- */
  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
      activeOpacity={0.9}
      onPress={() => console.log('Tapped', item.title)}
    >
      <View style={styles.imageWrap}>
        <FastImage
          style={styles.productImage}
          source={{
            uri: item.cover,
            priority: FastImage.priority.high,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={[styles.productTitle, { color: theme.primaryText }]}>
          {item.title}
        </Text>
        <Text style={[styles.productTime, { color: theme.secondaryText }]}>
          {item.time}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.main, { backgroundColor: theme.primaryBackground }]}>
      {/* ---------- Search Bar ---------- */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.surface, shadowColor: theme.border },
          ]}
        >
          <Icon
            name="search-outline"
            size={20}
            color={theme.secondaryText}
            style={styles.leftIcon}
          />

          <TextInput
            placeholder="Search listings..."
            placeholderTextColor={theme.secondaryText}
            style={[styles.input, { color: theme.primaryText }]}
            value={searchText}
            onChangeText={handleSearch}
          />

          {searchText ? (
            <TouchableOpacity onPress={clearSearch}>
              <Icon
                name="close-circle"
                size={21}
                color={theme.secondaryText}
                style={styles.rightIcon}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: theme.surface, shadowColor: theme.border },
          ]}
        >
          <Icon name="filter-outline" color={theme.primaryText} size={22} />
        </TouchableOpacity>
      </View>

      {/* ---------- Section Title ---------- */}
      <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
        All Listings
      </Text>

      {/* ---------- Report List ---------- */}
      <FlashList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        estimatedItemSize={100}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  /* Search Bar */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    elevation: 3,
  },
  leftIcon: { marginRight: 6 },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
  },
  rightIcon: { marginLeft: 4 },
  filterButton: {
    marginLeft: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  /* Card */
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
  },
  imageWrap: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  cardTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productTime: {
    fontSize: 13,
  },
});



/////////////////////////

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

// Sync Queue Constants
const SYNC_QUEUE_KEY = 'SyncQueue';
const SYNC_TYPES = {
  DELETE: 'delete',
  UPDATE: 'update',
  CREATE: 'create'
};

export default function CardDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();

  const themeMode = useSelector((state) => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;

  const { report } = route.params;
  const [menuVisible, setMenuVisible] = useState(false);

  // ---- Network listener for syncing ----
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log('🔄 Online - processing sync queue...');
        processSyncQueue();
      }
    });

    // Process any pending sync on component mount if online
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        processSyncQueue();
      }
    });

    return () => unsubscribe();
  }, []);

  const goBack = () => navigation.goBack();

  // ---- Add task to sync queue ----
  const addToSyncQueue = async (type, data) => {
    try {
      const existingQueue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      
      const syncTask = {
        id: Date.now().toString(),
        type,
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };
      
      queue.push(syncTask);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      console.log(`📝 Added ${type} task to sync queue:`, syncTask.id);
      
      return syncTask.id;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  };

  // ---- Process sync queue ----
  const processSyncQueue = async () => {
    try {
      const existingQueue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (!existingQueue) return;

      const queue = JSON.parse(existingQueue);
      if (queue.length === 0) return;

      console.log(`🔄 Processing ${queue.length} pending sync tasks...`);

      const successfulTasks = [];
      const failedTasks = [];

      for (const task of queue) {
        try {
          await executeSyncTask(task);
          successfulTasks.push(task.id);
          console.log(`✅ Successfully synced task: ${task.id}`);
        } catch (error) {
          console.error(`❌ Failed to sync task ${task.id}:`, error);
          
          // Retry logic (max 3 retries)
          if (task.retryCount < 3) {
            task.retryCount += 1;
            failedTasks.push(task);
          } else {
            console.log(`🗑️ Removing task ${task.id} after max retries`);
          }
        }
      }

      // Update queue with failed tasks (for retry)
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failedTasks));
      
      if (successfulTasks.length > 0) {
        console.log(`🎉 Successfully synced ${successfulTasks.length} tasks`);
      }

    } catch (error) {
      console.error('Error processing sync queue:', error);
    }
  };

  // ---- Execute individual sync task ----
  const executeSyncTask = async (task) => {
    const userData = await AsyncStorage.getItem('UserData');
    const user = userData ? JSON.parse(userData) : null;
    const uid = user?.uid;

    if (!uid || uid === 'guest') {
      throw new Error('No user ID available for sync');
    }

    switch (task.type) {
      case SYNC_TYPES.DELETE:
        await firestore()
          .collection('fieldReporter_Users')
          .doc(uid)
          .collection('reports')
          .doc(task.data.reportId)
          .delete();
        break;

      case SYNC_TYPES.UPDATE:
        await firestore()
          .collection('fieldReporter_Users')
          .doc(uid)
          .collection('reports')
          .doc(task.data.reportId)
          .update(task.data.updateData);
        break;

      case SYNC_TYPES.CREATE:
        await firestore()
          .collection('fieldReporter_Users')
          .doc(uid)
          .collection('reports')
          .doc(task.data.reportId)
          .set(task.data.reportData);
        break;

      default:
        throw new Error(`Unknown sync type: ${task.type}`);
    }
  };

  // ---- Get pending sync count ----
  const getPendingSyncCount = async () => {
    try {
      const existingQueue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      return queue.length;
    } catch (error) {
      console.error('Error getting sync count:', error);
      return 0;
    }
  };

  // ---- Delete prompt ----
  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      t('delete_report'),
      t('delete_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: deleteReport },
      ],
    );
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
        reports = reports.filter((r) => r.id !== report.id);
        await AsyncStorage.setItem(key, JSON.stringify(reports));
        console.log(`🗑️ Report ${report.id} removed locally for user ${uid}`);
      }

      // 2. Check network status and handle sync
      const netState = await NetInfo.fetch();
      
      if (netState.isConnected && uid !== 'guest') {
        // Online: Delete directly from Firebase
        try {
          await firestore()
            .collection('fieldReporter_Users')
            .doc(uid)
            .collection('reports')
            .doc(report.id)
            .delete();
          console.log('✔️ Report deleted from Firestore');
          Alert.alert(t('deleted'), t('deleted_success'));
        } catch (err) {
          console.log('⚠️ Firestore delete failed, adding to sync queue:', err);
          // If direct delete fails, add to sync queue
          await addToSyncQueue(SYNC_TYPES.DELETE, { reportId: report.id });
          Alert.alert(t('deleted'), t('deleted_locally_sync_later'));
        }
      } else {
        // Offline: Add to sync queue
        await addToSyncQueue(SYNC_TYPES.DELETE, { reportId: report.id });
        
        const pendingCount = await getPendingSyncCount();
        Alert.alert(
          t('deleted'), 
          t('deleted_locally_will_sync') + ` (${pendingCount} pending syncs)`
        );
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
  const formatTime = (dateString) => {
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
                <Icon name="create-outline" size={18} color={theme.primaryText} />
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <FastImage
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
        </View>

        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={[styles.title, { color: theme.primaryText }]} numberOfLines={2}>
            {report.title || t('untitled_report')}
          </Text>

          {/* Meta */}
          <View style={styles.metaContainer}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.accent }]}>
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
              <Icon name="document-text-outline" size={20} color={theme.accent} />
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
                <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
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


 

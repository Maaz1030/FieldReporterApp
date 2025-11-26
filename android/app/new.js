import React, { useState, useEffect } from 'react';
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
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera } from 'react-native-image-picker';
import colors from '../../utils/colors';
import firestore from '@react-native-firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import { useSelector } from 'react-redux';

const REPORT_TYPES = [
  'Profession', 'Business', 'Accident', 'Infrastructure', 'Environment',
  'Health', 'Crime', 'Natural Disaster', 'Community', 'Politics', 'Other',
];

// Define a key for storing the draft
const DRAFT_STORAGE_KEY = 'ScreenDraft_NewReport';

export default function DraftsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const themeMode = useSelector(state => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;

  // State for form fields
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [capturedImages, setCapturedImages] = useState([]);
  
  // State for UI elements
  const [categoryModal, setCategoryModal] = useState(false);
  
  // ---------- Load draft from storage on component mount ----------
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const savedDraft = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft);
          setTitle(draftData.title || '');
          setDetails(draftData.details || '');
          setCategory(draftData.category || '');
          setLocation(draftData.location || '');
          setCapturedImages(draftData.images || []);
          console.log('✅ Draft loaded successfully.');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        Alert.alert('Error', 'Could not load saved draft.');
      }
    };

    loadDraft();
  }, []);

  // ---------- Save current form state as a draft ----------
  const saveDraft = async () => {
    try {
      const draftData = {
        title,
        details,
        category,
        location,
        images: capturedImages,
      };
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      Alert.alert('Draft Saved', 'Your report has been saved as a draft.');
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Could not save the draft.');
    }
  };

  // ---------- Clear all form fields and the saved draft ----------
  const clearFormAndDraft = async () => {
    setTitle('');
    setDetails('');
    setCategory('');
    setLocation('');
    setCapturedImages([]);
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
      console.log('✅ Draft cleared from storage.');
    } catch (error) {
      console.error('Error clearing draft from storage:', error);
    }
  };


  // ---------- capture image ----------
  const captureImage = async () => {
    if (capturedImages.length >= 5) {
      Alert.alert('Limit Reached', 'You can add a maximum of 5 photos.');
      return;
    }
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
      maxWidth: 800,
      maxHeight: 800,
    };
    launchCamera(options, response => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Camera Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        setCapturedImages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            uri: image.uri,
            base64: image.base64,
          },
        ]);
      }
    });
  };

  // ---------- remove image ----------
  const removeImage = imgId => {
    setCapturedImages(prev => prev.filter(i => i.id !== imgId));
  };

  // ---------- Publish report (save locally and upload to Firestore) ----------
  const publishReport = async () => {
    if (!title.trim() || !details.trim() || !category.trim() || !location.trim()) {
      Alert.alert('Missing Data', 'Please complete all fields to publish the report.');
      return;
    }

    try {
      const userData = await AsyncStorage.getItem('UserData');
      const user = userData ? JSON.parse(userData) : null;
      const uid = user?.uid || 'guest';

      const newReport = {
        id: Date.now().toString(),
        uid,
        title,
        details,
        category,
        location,
        createdAt: new Date().toISOString(),
        synced: false,
        images: capturedImages.map(img => ({
          uri: img.uri,
          base64: img.base64 || '',
        })),
      };

      const key = `Reports_${uid}`;
      const existing = await AsyncStorage.getItem(key);
      const reports = existing ? JSON.parse(existing) : [];
      reports.push(newReport);
      await AsyncStorage.setItem(key, JSON.stringify(reports));
      console.log(`✅ Report saved locally for user ${uid}`);

      const state = await NetInfo.fetch();
      if (state.isConnected && uid !== 'guest') {
        try {
          await firestore()
            .collection('fieldReporter_Users')
            .doc(uid)
            .collection('reports')
            .doc(newReport.id)
            .set({
              title: newReport.title,
              details: newReport.details,
              category: newReport.category,
              location: newReport.location,
              createdAt: newReport.createdAt,
              syncedAt: new Date().toISOString(),
            });
          console.log('  Report uploaded to Firestore');
          
          newReport.synced = true;
          const updatedReports = reports.map(r =>
            r.id === newReport.id ? newReport : r,
          );
          await AsyncStorage.setItem(key, JSON.stringify(updatedReports));
        } catch (err) {
          console.log('  Firestore upload failed, will sync later', err);
        }
      }
      
      Alert.alert('Success', 'Report published successfully!');
      // After successful publish, clear the form and the draft
      clearFormAndDraft();

    } catch (error) {
      console.error('Error publishing report:', error);
      Alert.alert('Error', 'Could not publish the report.');
    }
  };
  
  const barStyle = themeMode === 'dark' ? 'light-content' : 'dark-content';

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.primaryBackground,
              paddingTop: insets.top + 10,
            },
          ]}
        >
          <StatusBar
            barStyle={barStyle}
            backgroundColor={theme.primaryBackground}
          />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 40,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.header, { color: theme.primaryText }]}>
              Create New Report
            </Text>

            {/* -------- photo section -------- */}
            <View style={styles.photoSection}>
              <Text style={[styles.sectionLabel, { color: theme.primaryText }]}>
                Add Photos ({capturedImages.length}/5)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photoRow}>
                  <TouchableOpacity
                    style={[
                      styles.addBox,
                      {
                        borderColor: theme.accent,
                        backgroundColor: theme.surface,
                      },
                    ]}
                    onPress={captureImage}
                  >
                    <Icon name="camera-outline" size={36} color={theme.accent} />
                    <Text style={{ color: theme.secondaryText, fontSize: 12, marginTop: 4 }}>
                      Add Photo
                    </Text>
                  </TouchableOpacity>

                  {capturedImages.map(image => (
                    <View key={image.id} style={styles.imageContainer}>
                      <Image source={{ uri: image.uri }} style={styles.capturedImage} />
                      <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(image.id)}>
                        <Icon name="close-circle" size={24} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* -------- input fields -------- */}
            <TextInput style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.primaryText }]}
              placeholder="Report Title" placeholderTextColor={theme.secondaryText} value={title} onChangeText={setTitle} />

            <TextInput style={[styles.input, styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.primaryText }]}
              placeholder="Detailed Description" placeholderTextColor={theme.secondaryText} multiline value={details} onChangeText={setDetails} />

            <TextInput style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.primaryText }]}
              placeholder="Location" placeholderTextColor={theme.secondaryText} value={location} onChangeText={setLocation} />

            {/* -------- category dropdown -------- */}
            <TouchableOpacity style={[styles.dropdown, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setCategoryModal(true)}>
              <Text style={{ color: category ? theme.primaryText : theme.secondaryText, fontSize: 15 }}>
                {category || 'Select Category'}
              </Text>
              <Icon name="chevron-down-outline" size={18} color={theme.accent} />
            </TouchableOpacity>

            {/* -------- action buttons -------- */}
             <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={publishReport}>
              <Text style={styles.buttonText}>Publish Report</Text>
            </TouchableOpacity>

            <View style={styles.draftActionsContainer}>
                <TouchableOpacity style={[styles.draftButton, { backgroundColor: theme.surface }]} onPress={saveDraft}>
                    <Text style={[styles.draftButtonText, {color: theme.accent}]}>Save Draft</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={[styles.draftButton, {backgroundColor: 'transparent'}]} onPress={clearFormAndDraft}>
                    <Text style={[styles.draftButtonText, {color: '#ff4444'}]}>Clear</Text>
                </TouchableOpacity>
            </View>

          </ScrollView>

          {/* -------- category modal -------- */}
          <Modal visible={categoryModal} transparent animationType="fade" onRequestClose={() => setCategoryModal(false)}>
            <TouchableOpacity style={[styles.modalOverlay]} activeOpacity={1} onPress={() => setCategoryModal(false)}>
              <View style={[styles.modalBox, { backgroundColor: theme.surface, borderColor: theme.border, top: insets.top + 280, right: 16 }]}>
                <FlatList data={REPORT_TYPES} keyExtractor={item => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.categoryRow} onPress={() => { setCategory(item); setCategoryModal(false); }}>
                      <Text style={{ color: theme.primaryText, fontSize: 15 }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// ---------------- styles ----------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  photoSection: { marginBottom: 16, minHeight: 150 },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  photoRow: { flexDirection: 'row', alignItems: 'center' },
  addBox: {
    width: 110, height: 110, borderRadius: 10, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  imageContainer: { position: 'relative', marginRight: 12 },
  capturedImage: { width: 110, height: 110, borderRadius: 10 },
  removeImageButton: {
    position: 'absolute', top: -8, right: -8,
    backgroundColor: '#fff', borderRadius: 12,
  },
  input: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, marginBottom: 14,
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 14,
    paddingVertical: 14, marginBottom: 24,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalBox: {
    position: 'absolute', width: '50%', alignSelf: 'flex-end',
    borderRadius: 8, borderWidth: 1, elevation: 5, maxHeight: 300,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 },
  },
  categoryRow: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#eee'},
  button: { paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  draftActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  draftButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  draftButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
});

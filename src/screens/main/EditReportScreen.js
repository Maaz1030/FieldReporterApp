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
  Alert,
  Touchable,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../utils/colors';
import { useSelector } from 'react-redux';

const REPORT_TYPES = [
  'Profession',
  'Business',
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

export default function EditReportScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  //const theme = colors.light;
  const themeMode = useSelector(state => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;

  const { report, reportIndex } = route.params;

  const [title, setTitle] = useState(report.title);
  const [details, setDetails] = useState(report.details);
  const [category, setCategory] = useState(report.category);
  const [location, setLocation] = useState(report.location);
  const [categoryModal, setCategoryModal] = useState(false);
  const [capturedImages, setCapturedImages] = useState(report.images || []);

  /* ----------- Update Report ----------- */
  const updateReport = async () => {
    if (
      !title.trim() ||
      !details.trim() ||
      !category.trim() ||
      !location.trim()
    ) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const userData = await AsyncStorage.getItem('UserData');
      const user = userData ? JSON.parse(userData) : null;
      const uid = user?.uid || 'guest';
      const key = `Reports_${uid}`;

      //  merge previous report so id, uid, createdAt stay intact
      const updatedReport = {
        ...report,
        title,
        details,
        category,
        location,
        updatedAt: new Date(),
        images: capturedImages,
      };

      // this  make  sure every report has a unique id
      if (!updatedReport.id) {
        updatedReport.id = Date.now().toString();
      }

      const existing = await AsyncStorage.getItem(key);
      const reports = existing ? JSON.parse(existing) : [];

      // ✅ Replace matching id rather than trusting `reportIndex`
      const index = reports.findIndex(r => r.id === updatedReport.id);
      if (index !== -1) {
        reports[index] = updatedReport;
      } else {
        // fallback if no match found (shouldn't happen)
        reports[reportIndex] = updatedReport;
      }

      await AsyncStorage.setItem(key, JSON.stringify(reports));

      Alert.alert('Success', 'Report updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating report:', error);
      Alert.alert('Error', 'Failed to update report.');
    }
  };

  // Remove image from list
  const removeImage = imageId => {
    setCapturedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const barStyle = 'dark-content';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.primaryBackground, paddingTop: insets.top },
        ]}
      >
        <StatusBar
          barStyle={barStyle}
          backgroundColor={theme.primaryBackground}
        />

        {/* Header */}
        <View style={[styles.header, {}]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={theme.primaryText} />
          </TouchableOpacity>
          <View style={{ right: 120 }}>
            <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
              Edit Report
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.separator,
              {
                flexDirection: 'row',
                margin: 10,
                justifyContent: 'flex-start',
                paddingLeft: 20,
                paddingTop: insets.top,
                paddingbottom: insets.bottom,
              },
            ]}
          ></View>
          {/* ---------- Photos Section ---------- */}
          <View style={styles.photoSection}>
            <Text style={[styles.sectionLabel, { color: theme.primaryText }]}>
              Photos ({capturedImages.length}/5)
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photoRow}>
                {/* Existing Images */}
                {capturedImages.map(image => (
                  <View key={image.id} style={styles.imageContainer}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.capturedImage}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(image.id)}
                    >
                      <Icon name="close-circle" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
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
            placeholder="Location"
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
                      <Text style={{ color: theme.primaryText, fontSize: 15 }}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* ---------- Update button ---------- */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accent }]}
            onPress={updateReport}
          >
            <Text style={styles.buttonText}>Update Report</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    //left: 20,
    // right: 70,
    // left: 20,
    //backgroundColor:'red'
  },
  photoSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    top: 8,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
    // top: 5
  },
  capturedImage: {
    width: 110,
    height: 115,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 10,
  },
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
    top: 250,
    width: '45%',
    alignSelf: 'flex-end',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 4,
    right: 16,
    maxHeight: 280,
  },
  categoryRow: { paddingVertical: 10, paddingHorizontal: 14 },
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
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.light.accent,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

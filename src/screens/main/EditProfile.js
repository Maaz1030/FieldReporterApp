import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileData } from '../../redux/slices/authSlice';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../utils/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const darkMode = useSelector(state => state.auth.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');
  const [uploading, setUploading] = useState(false);

  // Load user data from AsyncStorage
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('UserData');
        const u = savedUser ? JSON.parse(savedUser) : null;
        setUser(u);

        // Set form fields with user data
        if (u) {
          setName(u.displayName || u.name || '');
          setEmail(u.email || '');
          setPhoto(u.photoURL || '');
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      }
    };

    if (isFocused) loadProfileData();
  }, [isFocused]);

  const handleImagePick = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    });

    if (result.didCancel || result.errorCode) return;
    const uri = result.assets?.[0]?.uri;
    if (uri) setPhoto(uri);
  };

  const handleSave = async () => {
  if (!name.trim() || !email.trim()) {
    Alert.alert('Missing Info', 'Please fill in all fields.');
    return;
  }

  setUploading(true);
  try {
    const savedUser = await AsyncStorage.getItem('UserData');
    const u = savedUser ? JSON.parse(savedUser) : {};
    const uid = u?.uid;
    if (!uid) {
      Alert.alert('Error', 'User not found.');
      return;
    }

    const updated = {
      displayName: name.trim(),
      email: email.trim(),
      photoURL: photo || u.photoURL || '',
    };

    // --- 1. Update Firestore directly ---
    await firestore()
      .collection('fieldReporter_Users')
      .doc(uid)
      .update(updated);

    // --- 2. Mirror to AsyncStorage ---
    const mergedUser = { ...u, ...updated };
    await AsyncStorage.setItem('UserData', JSON.stringify(mergedUser));

    // --- 3. Notify Redux if you need UI update ---
    dispatch({
      type: 'auth/updateFromLocal', // or your own reducer
      payload: mergedUser,
    });

    Alert.alert('Profile Updated', 'Your changes have been saved.');
    navigation.goBack();
  } catch (err) {
    console.error('Update error:', err);
    Alert.alert('Error', err.message || 'Unable to update profile.');
  } finally {
    setUploading(false);
  }
};

  // Show loading while user data is being fetched
  if (!user) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.primaryBackground,
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 10,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.primaryText }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.primaryBackground,
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 10,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={theme.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
          Edit Profile
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Avatar */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={handleImagePick}
      >
        {photo ? (
          <FastImage
            style={styles.avatar}
            source={{ uri: photo }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : user?.photoURL ? (
          <FastImage
            style={styles.avatar}
            source={{ uri: user.photoURL }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <Image
            source={require('../../assets/logo.png')}
            style={styles.avatar}
            resizeMode="cover"
          />
        )}
        <View style={[styles.cameraBadge, { backgroundColor: theme.accent }]}>
          <Icon name="camera" size={16} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Fields */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.primaryText,
          },
        ]}
        placeholder="Full Name"
        placeholderTextColor={theme.secondaryText}
        value={name}
        onChangeText={setName}
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
        placeholder="Email"
        placeholderTextColor={theme.secondaryText}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.accent }]}
        onPress={handleSave}
        activeOpacity={0.8}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Update Profile</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: theme.border }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={[styles.cancelButtonText, { color: theme.primaryText }]}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  avatarContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 30,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 6,
    borderRadius: 14,
    padding: 6,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  readOnlyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default EditProfileScreen;

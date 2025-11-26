import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera } from 'react-native-image-picker';

const MEDIA_TYPES = { PHOTO: 'photo', VIDEO: 'video' };
const MAX_MEDIA = 5;

export default function MediaPicker({ media, setMedia, theme, t }) {
  const [modalVisible, setModalVisible] = useState(false);

  const addMedia = () => {
    if (media.length >= MAX_MEDIA) {
      Alert.alert(
        t('limit_reached') || 'Limit reached',
        t('max_media_limit') || 'Maximum 5 files',
      );
      return;
    }
    setModalVisible(true);
  };

  const capturePhoto = () => {
    setModalVisible(false);
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
        saveToPhotos: true,
      },
      res => {
        if (res.assets && res.assets[0]) {
          const img = res.assets[0];
          setMedia(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              uri: img.uri,
              base64: img.base64,
              type: MEDIA_TYPES.PHOTO,
            },
          ]);
        }
      },
    );
  };

  const captureVideo = () => {
    setModalVisible(false);
    launchCamera(
      {
        mediaType: 'video',
        durationLimit: 30,
        saveToPhotos: true,
        videoQuality: 'high',
      },
      res => {
        if (res.assets && res.assets[0]) {
          const vid = res.assets[0];
          setMedia(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              uri: vid.uri,
              type: MEDIA_TYPES.VIDEO,
              duration: vid.duration,
            },
          ]);
        }
      },
    );
  };

  const remove = id => setMedia(prev => prev.filter(i => i.id !== id));

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.label, { color: theme.primaryText }]}>
        {t('add_media')} ({media.length}/{MAX_MEDIA})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.addBox,
              { borderColor: theme.accent, backgroundColor: theme.surface },
            ]}
            onPress={addMedia}
          >
            <Icon name="camera-outline" size={28} color={theme.accent} />
            <Text
              style={{ color: theme.secondaryText, fontSize: 12, marginTop: 4 }}
            >
              {t('add_media')}
            </Text>
          </TouchableOpacity>

          {media.map(item => (
            <View key={item.id} style={styles.thumbWrap}>
              <Image source={{ uri: item.uri }} style={styles.thumb} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => remove(item.id)}
              >
                <Icon name="close-circle" size={18} color="#ff4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <View
              style={[
                styles.modal,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TouchableOpacity onPress={capturePhoto} style={styles.option}>
                <Icon name="camera" size={22} color={theme.accent} />
                <Text style={[styles.optionText, { color: theme.primaryText }]}>
                  {t('take_photo')}
                </Text>
              </TouchableOpacity>
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
              <TouchableOpacity onPress={captureVideo} style={styles.option}>
                <Icon name="videocam" size={22} color={theme.accent} />
                <Text style={[styles.optionText, { color: theme.primaryText }]}>
                  {t('record_video')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  addBox: {
    width: 110,
    height: 110,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  thumbWrap: { marginRight: 12 },
  thumb: { width: 110, height: 110, borderRadius: 10 },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: { width: 200, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  option: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  optionText: { marginLeft: 10, fontSize: 16, fontWeight: '500' },
  divider: { height: 1, width: '100%' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
});

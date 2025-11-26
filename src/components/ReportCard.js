import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import formatTime from '../utils/formatTime';   

export default function ReportCard({ item, theme, navigation, t }) {
  // --- choose first media (photo or video) ---
  const firstMedia = item.media && item.media.length ? item.media[0] : null;

  let thumbUri = 'https://via.placeholder.com/400x250.png?text=No+Media';
  if (firstMedia) {
    thumbUri =
      firstMedia.type === 'photo'
        ? firstMedia.uri
        : firstMedia.thumbnail || firstMedia.uri;
  }

  // formatted relative time  (e.g., "2 hrs ago")
  const timeText = item.createdAt ? formatTime(item.createdAt, t) : '';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface }]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Carddetail', { report: item })}
    >
      <View style={styles.imageWrap}>
        <FastImage
          style={styles.image}
          source={{ uri: thumbUri }}
          resizeMode={FastImage.resizeMode.cover}
        />

        {/* ---- video overlay if item is a video ---- */}
        {firstMedia?.type === 'video' && (
          <View style={styles.videoOverlay}>
            <Icon name="play-circle" size={28} color="#ffffff" />
          </View>
        )}

        {/* ---- badge for multiple media ---- */}
        {item.media?.length > 1 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>+{item.media.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* --- time in top‑right corner --- */}
        {timeText ? (
          <Text style={[styles.timeText, { color: theme.secondaryText }]}>
            {timeText}
          </Text>
        ) : null}

        <Text
          style={[styles.titleText, { color: theme.primaryText }]}
          numberOfLines={1}
        >
          {item.title || t('untitled_report')}
        </Text>

        <Text
          style={[styles.metaText, { color: theme.secondaryText }]}
          numberOfLines={1}
        >
          {item.category}
        </Text>

        <Text
          style={[styles.detailsText, { color: theme.secondaryText }]}
          numberOfLines={1}
        >
          {item.details || t('no_description')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#ddd',
    elevation: 2,
    overflow: 'hidden',
  },
  imageWrap: {
    width: 100,
    height: 100,
    backgroundColor: '#ccc',
  },
  image: { width: '100%', height: '100%' },

  // --- overlays ---
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  // --- text content ---
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  timeText: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 11,
    fontWeight: '500',
  },
  titleText: { fontWeight: '600', fontSize: 16, marginBottom: 4 },
  metaText: { fontSize: 12, marginBottom: 6 },
  detailsText: { fontSize: 13 },
});
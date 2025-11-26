import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const ACTION_WIDTH = 100;
const THRESHOLD = -40; // how far before we lock open

export default function SwipeableReportCard({ item, theme, navigation, t, onDelete }) {
  const translateX = useSharedValue(0);

  // --- animated style for the front card
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // --- handle gesture events
  const pan = Gesture.Pan()
    .onUpdate(e => {
      // drag left only
      translateX.value = Math.max(-ACTION_WIDTH, Math.min(0, e.translationX));
    })
    .onEnd(e => {
      // if swiped far enough, keep it open, else close
      const shouldOpen = e.translationX < THRESHOLD;
      translateX.value = withSpring(shouldOpen ? -ACTION_WIDTH : 0, {
        damping: 14,
        stiffness: 120,
      });
    });

  return (
    <View style={styles.row}>
      {/* Delete button sits underneath */}
      <View style={styles.deleteBox}>
        <TouchableOpacity onPress={() => onDelete(item.id, item.title)}>
          <Text style={styles.deleteText}>{t('delete') || 'Delete'}</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable front card */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.card, { backgroundColor: theme.surface }, cardStyle]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.cardInner}
            onPress={() => navigation.navigate('Carddetail', { report: item })}
          >
            <FastImage
              style={styles.thumb}
              source={{
                uri:
                  item.images?.[0]?.uri ||
                  'https://via.placeholder.com/400x250.png?text=No+Image',
              }}
            />
            <View style={styles.textPart}>
              <Text style={[styles.title, { color: theme.primaryText }]} numberOfLines={1}>
                {item.title || 'Untitled Report'}
              </Text>
              <Text style={[styles.meta, { color: theme.secondaryText }]} numberOfLines={1}>
                {item.category}
              </Text>
              <Text style={[styles.detail, { color: theme.secondaryText }]} numberOfLines={1}>
                {item.details || 'No description'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'relative',
    height: 100,
    marginBottom: 12,
  },
  deleteBox: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  deleteText: { color: 'white', fontWeight: '600' },
  card: {
    flex: 1,
    borderRadius: 14,
    elevation: 3,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    height: '100%',
  },
  thumb: { width: 100, height: '100%', backgroundColor: '#ccc' },
  textPart: { flex: 1, padding: 10, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 12, marginBottom: 4 },
  detail: { fontSize: 13 },
});
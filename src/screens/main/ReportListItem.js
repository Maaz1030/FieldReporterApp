
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

const ACTION_WIDTH = 100;
const DELETE_THRESHOLD = -ACTION_WIDTH / 3;

// Create an Animated version of FastImage
const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

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

export function ReportListItem({ item, theme, navigation, t, onDelete }) {
  const MAX_SWIPE_LEFT = -ACTION_WIDTH;
  const MAX_SWIPE_RIGHT = 10;
  const animatedValue = useSharedValue(0);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: animatedValue.value }],
    };
  });

  const deleteButtonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedValue.value,
      [0, MAX_SWIPE_LEFT / 2, MAX_SWIPE_LEFT],
      [0, 0.5, 1],
    );

    const scale = interpolate(
      animatedValue.value,
      [0, MAX_SWIPE_LEFT],
      [0.8, 1],
    );

    return {
      opacity: opacity,
      transform: [{ scale: scale }],
    };
  });

  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      animatedValue.value = Math.max(
        MAX_SWIPE_LEFT,
        Math.min(MAX_SWIPE_RIGHT, event.translationX),
      );
    })
    .onEnd(event => {
      if (event.translationX < DELETE_THRESHOLD) {
        animatedValue.value = withSpring(MAX_SWIPE_LEFT, {
          velocity: event.velocityX,
          overshootClamping: true,
        });
      } else {
        animatedValue.value = withSpring(0, { velocity: event.velocityX });
      }
    });

  return (
    <View style={styles.listItemContainer}>
      <Animated.View style={[styles.deleteAction, deleteButtonAnimatedStyle]}>
        <TouchableOpacity
          style={styles.deleteButtonTouchArea}
          onPress={() => onDelete(item.id, item.title)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteActionText}>{t('delete') || 'Delete'}</Text>
        </TouchableOpacity>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: theme.surface },
            cardAnimatedStyle,
          ]}
        >
          <TouchableOpacity
            style={{ flexDirection: 'row', flex: 1 }}
            activeOpacity={0.9}
            // Pass the entire report object to CardDetailScreen
            onPress={() => navigation.navigate('Carddetail', { report: item })}
          >
            <Animated.View
              style={styles.imageWrap}
              sharedTransitionTag={`reportImage-${item.id}`} // Unique tag matching CardDetailScreen
            >
              <AnimatedFastImage
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
            </Animated.View>

            {/* Content ) */}
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
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// STYLES (Keep styles the same, omitted for brevity here)
// ...

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

  // Container for the list item to hold the delete button underneath the swipable card
  listItemContainer: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    // Position context for absolute delete button
    position: 'relative',
    height: 100, // Explicit height to match the card height
  },

  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    elevation: 3,
    height: '100%',
    width: '100%',
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
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH, // Match the action width
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  deleteButtonTouchArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

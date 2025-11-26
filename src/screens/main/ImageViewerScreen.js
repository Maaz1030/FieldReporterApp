import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Animated from 'react-native-reanimated';

export default function ImageViewerScreen({ route, navigation }) {
  // Get the image URI and the shared ID from the navigation parameters
  const { imageUri, sharedElementId } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* TouchableOpacity lets the user tap anywhere on the screen to go back */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={() => navigation.goBack()}
        activeOpacity={1}
      >
        <View style={styles.imageContainer}>
          {/* The Animated.View with the matching tag */}
          <Animated.View
            style={styles.animatedImage}
            sharedTransitionTag={sharedElementId}
          >
            <Image source={{ uri: imageUri }} style={styles.image} />
          </Animated.View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)', // for transpasrency
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  animatedImage: {
    // Let the image define its size during animation
    width: '90%',
    aspectRatio: 1, // Keep it square
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 200, // Make it circular to match the target shape
    resizeMode: 'cover',
  },
});

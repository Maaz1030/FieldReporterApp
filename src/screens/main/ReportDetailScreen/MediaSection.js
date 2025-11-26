import React from 'react';
import { View, Image, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

export default function MediaSection({ report, theme }) {
  if (!report.media || report.media.length === 0) return null;

  const main = report.media[0];

  return (
    <View style={styles.container}>
      {main.type === 'video' ? (
        <View style={styles.videoWrap}>
          <Video
            source={{ uri: main.uri }}
            style={styles.video}
            resizeMode="cover"
            controls
          />
          <View style={styles.playIcon}>
            <Icon name="play-circle" size={40} color="#fff" />
          </View>
        </View>
      ) : (
        <Image
          source={{ uri: main.uri }}
          style={styles.mainImage}
          resizeMode="cover"
        />
      )}

      {report.media.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
          {report.media.slice(1).map((m, i) => (
            <Image
              key={i}
              source={{ uri: m.thumbnail || m.uri }}
              style={styles.thumb}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const fullW = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  mainImage: { width: fullW, height: 260 },
  videoWrap: { width: fullW, height: 260, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  playIcon: { position: 'absolute', top: '40%', left: '45%' },
  thumbRow: { paddingHorizontal: 10, marginTop: 10 },
  thumb: { width: 90, height: 90, borderRadius: 10, marginRight: 10 },
});
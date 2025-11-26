import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function MetaSection({ report, theme, t, formatTime }) {
  return (
    <View style={styles.container}>
      <View style={[styles.categoryBadge, { backgroundColor: theme.accent }]}>
        <Text style={styles.categoryText}>{report.category}</Text>
      </View>

      <View style={styles.meta}>
        <Icon name="time-outline" size={14} color={theme.secondaryText} />
        <Text style={[styles.metaText, { color: theme.secondaryText }]}>
          {formatTime(report.createdAt, t)}
        </Text>
      </View>

      {report.location ? (
        <View style={styles.meta}>
          <Icon name="location-outline" size={14} color={theme.secondaryText} />
          <Text style={[styles.metaText, { color: theme.secondaryText, marginLeft: 4 }]}>
            {report.location}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 10 },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 6,
  },
  categoryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 13, marginLeft: 4 },
});
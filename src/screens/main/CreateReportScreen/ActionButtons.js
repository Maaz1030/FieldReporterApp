import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function ActionButtons({ theme, t, onSaveDraft, onPublish }) {
  return (
    <View>
      <TouchableOpacity style={[styles.btn, { backgroundColor: theme.accent }]} onPress={onPublish}>
        <Text style={styles.btnText}>{t('publish_report')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.draftBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={onSaveDraft}>
        <Text style={[styles.btnText, { color: theme.accent }]}>
          {t('save_draft')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  draftBtn: { borderWidth: 1 },
});
import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import colors from '../../../utils/colors';

import { useReportForm } from './useReportForm';
import MediaPicker from './MediaPicker';
import CategoryPicker from './CategoryPicker';
import FormFields from './FormFields';
import ActionButtons from './ActionButtons';

export default function CreateReportScreen({ navigation }) {
  const { t } = useTranslation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const themeMode = useSelector(state => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;

  const form = useReportForm(t); // all form state + logic
  const [categoryModal, setCategoryModal] = useState(false);

  useEffect(() => {
    if (route.params?.draftData) {
      const d = route.params.draftData;
      form.setTitle(d.title || '');
      form.setDetails(d.details || '');
      form.setCategory(d.category || '');
      form.setLocation(d.location || '');
      form.setMedia(d.media || []);

      // clear param so it doesn’t reapply on re‑focus
      navigation.setParams({ draftData: null });
    }
  }, [route.params?.draftData]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.primaryBackground,
          paddingTop: insets.top + 10,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: 16 }}
      >
        <Text style={[styles.header, { color: theme.primaryText }]}>
          {t('create_new_report')}
        </Text>

        {/* -------- Media Section -------- */}
        <MediaPicker
          theme={theme}
          t={t}
          media={form.media}
          setMedia={form.setMedia}
        />

        {/* -------- Input Fields -------- */}
        <FormFields
          theme={theme}
          t={t}
          title={form.title}
          setTitle={form.setTitle}
          details={form.details}
          setDetails={form.setDetails}
          location={form.location}
          setLocation={form.setLocation}
          category={form.category}
          openCategory={() => setCategoryModal(true)}
        />

        {/* -------- Category Modal -------- */}
        <CategoryPicker
          visible={categoryModal}
          onClose={() => setCategoryModal(false)}
          selected={form.category}
          onSelect={form.setCategory}
          theme={theme}
          t={t}
        />

        {/* -------- Action Buttons -------- */}
        <ActionButtons
          theme={theme}
          t={t}
          onSaveDraft={form.saveDraft}
          onPublish={form.publishReport}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
});

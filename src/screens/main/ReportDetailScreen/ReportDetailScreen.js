import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import colors from '../../../utils/colors';

import DeleteMenu from './DeleteMenu';
import MediaSection from './MediaSection';
import MetaSection from './MetaSection';
import formatTime from '../../../utils/formatTime';
import DeleteReport from '../../../components/DeleteReport'; //  shared delete component

export default function ReportDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const themeMode = useSelector(state => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;

  const { report } = route.params;
  const [menuVisible, setMenuVisible] = useState(false);

  // ---- Use shared delete component ----
  const handleDelete = () => {
    setMenuVisible(false);
    DeleteReport({
      reportId: report.id,
      reportTitle: report.title,
      t,
      onSuccess: () => navigation.goBack(), // return after delete
      onFail: () => console.log('Delete failed'),
    });
  };

  const handleEdit = () => {
    setMenuVisible(false);
    navigation.navigate('EditReport', { report });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.primaryBackground, paddingTop: insets.top },
      ]}
    >
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.primaryBackground}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.primaryText} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
          {t('report_details') || 'Report Details'}
        </Text>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Icon name="ellipsis-vertical" size={22} color={theme.primaryText} />
        </TouchableOpacity>
      </View>

      {/* --- Main Media and Information --- */}
      <MediaSection report={report} theme={theme} />
      <MetaSection
        report={report}
        theme={theme}
        t={t}
        formatTime={formatTime}
      />

      {/* Description */}
      <View style={styles.descriptionBox}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          {t('description')}
        </Text>
        <Text style={[styles.descriptionText, { color: theme.secondaryText }]}>
          {report.details || t('no_description')}
        </Text>
      </View>

      {/* Delete / Edit Menu */}
      <DeleteMenu
        visible={menuVisible}
        theme={theme}
        onClose={() => setMenuVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        t={t}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  descriptionBox: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  descriptionText: { fontSize: 16, lineHeight: 22 },
});
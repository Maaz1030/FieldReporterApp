import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import colors from '../../../utils/colors';
import SearchBar from './SearchBar';
import ReportCard from '../../../components/ReportCard';
import formatTime from '../../../utils/formatTime';   //  new import

export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [uid, setUid] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [reports, setReports] = useState([]);

  const themeMode = useSelector(state => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;

  // ---- Load current user once ----
  useEffect(() => {
    AsyncStorage.getItem('UserData').then(res => {
      const user = res ? JSON.parse(res) : {};
      setUid(user?.uid || 'guest');
    });
  }, []);

  // ---- Load reports when focused ----
  useEffect(() => {
    if (!uid || !isFocused) return;

    const loadReports = async () => {
      try {
        const key = `Reports_${uid}`;
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const list = JSON.parse(stored).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          setReports(list);
        } else {
          setReports([]);
        }
      } catch (err) {
        console.warn('Error loading reports:', err);
      }
    };

    loadReports();
  }, [uid, isFocused]);

  // ---- Search filter ----
  const filtered = reports.filter(r =>
    r.title?.toLowerCase().includes(searchText.toLowerCase()),
  );

  // ---- Handle navigation ----
  const handleCardPress = (report, index) => {
    navigation.navigate('Carddetail', { report, reportIndex: index });
  };

  return (
    <View
      style={[
        styles.main,
        { backgroundColor: theme.primaryBackground, paddingTop: insets.top },
      ]}
    >
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        onClear={() => setSearchText('')}
        theme={theme}
        t={t}
      />

      <Text style={[styles.titleHeader, { color: theme.primaryText }]}>
        {reports.length ? t('your_reports') : t('no_reports')}
      </Text>

      <FlashList
        data={filtered}
        keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
        estimatedItemSize={110}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        renderItem={({ item, index }) => (
          <ReportCard
            item={item}
            index={index}
            onPress={handleCardPress}
            navigation={navigation} 
            
            theme={theme}
            t={t}
            formatTime={formatTime}   // ✅ still passed in
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon
              name="document-text-outline"
              size={50}
              color={theme.secondaryText}
            />
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              {searchText ? t('no_reports_found') : t('no_reports_saved_yet')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  titleHeader: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: { fontSize: 16, marginTop: 10, textAlign: 'center' },
});
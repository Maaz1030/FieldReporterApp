import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import NetInfo from '@react-native-community/netinfo';

const REPORTS_KEY_PREFIX = 'Reports_';
const DRAFT_REPORTS_KEY = 'DraftReports';

export function useReportForm(t) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [media, setMedia] = useState([]);

  const clear = () => {
    setTitle('');
    setDetails('');
    setCategory('');
    setLocation('');
    setMedia([]);
  };

  // --- Save as draft ---
  const saveDraft = async () => {
    if (!title.trim() && !details.trim() && media.length === 0) {
      Alert.alert(
        t('empty_draft') || 'Empty Draft',
        t('cannot_save_empty_draft') || 'Cannot save empty draft',
      );
      return;
    }

    try {
      const draft = {
        id: Date.now().toString(),
        title,
        details,
        category,
        location,
        createdAt: new Date().toISOString(),
        media,
      };
      const existing = await AsyncStorage.getItem(DRAFT_REPORTS_KEY);
      const drafts = existing ? JSON.parse(existing) : [];
      drafts.push(draft);
      await AsyncStorage.setItem(DRAFT_REPORTS_KEY, JSON.stringify(drafts));
      Alert.alert(
        t('draft_saved') || 'Saved',
        t('report_saved_to_drafts') || 'Draft saved locally.',
      );
      clear();
    } catch (err) {
      console.error('Error saving draft:', err);
      Alert.alert(t('error'), t('draft_save_failed'));
    }
  };

  // --- Publish report (local + Firestore upload when online) ---
  const publishReport = async () => {
    if (!title || !details || !category || !location) {
      Alert.alert(
        t('missing_data') || 'Missing Data',
        t('fill_all_fields') || 'Please fill everything.',
      );
      return;
    }

    try {
      const userData = await AsyncStorage.getItem('UserData');
      const user = userData ? JSON.parse(userData) : {};
      const uid = user?.uid || 'guest';
      const key = `${REPORTS_KEY_PREFIX}${uid}`;

      const newReport = {
        id: Date.now().toString(),
        uid,
        title,
        details,
        category,
        location,
        createdAt: new Date().toISOString(),
        synced: false,
        media,
      };

      // --- 1️⃣ Save locally first ---
      const stored = await AsyncStorage.getItem(key);
      const list = stored ? JSON.parse(stored) : [];
      list.push(newReport);
      await AsyncStorage.setItem(key, JSON.stringify(list));

      console.log(`✅ Report saved locally for user: ${uid}`);

      // --- 2️⃣ If online, upload to Firestore ---
      const netState = await NetInfo.fetch();
      if (netState.isConnected && uid !== 'guest') {
        try {
          await firestore()
            .collection('fieldReporter_Users')
            .doc(uid)
            .collection('reports')
            .doc(newReport.id)
            .set({
              title: newReport.title,
              details: newReport.details,
              category: newReport.category,
              location: newReport.location,
              createdAt: newReport.createdAt,
              hasMedia: newReport.media.length > 0,
              mediaCount: newReport.media.length,
              syncedAt: new Date().toISOString(),
            });

          console.log('✅ Uploaded to Firestore');
          newReport.synced = true;

          // update local data to mark as synced
          const updatedList = list.map(r =>
            r.id === newReport.id ? newReport : r,
          );
          await AsyncStorage.setItem(key, JSON.stringify(updatedList));
        } catch (uploadErr) {
          console.log('⚠️ Firestore upload failed, will sync later', uploadErr);
        }
      } else {
        console.log('📴 Offline, will sync later');
      }

      Alert.alert(
        t('saved') || 'Saved',
        t('report_saved_locally') ||
          'Report saved locally and uploaded if online.',
      );
      clear();
    } catch (err) {
      console.error('Error in publishReport:', err);
      Alert.alert(t('error'), t('save_failed'));
    }
  };

  return {
    title,
    setTitle,
    details,
    setDetails,
    category,
    setCategory,
    location,
    setLocation,
    media,
    setMedia,
    saveDraft,
    publishReport,   // 👈 returned for ActionButtons
    clear,
  };
}
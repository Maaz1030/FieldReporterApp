import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import NetInfo from '@react-native-community/netinfo';

/**
 * Shows confirmation alert and deletes the report locally
 * and from Firestore when online.
 */
export default function DeleteReport({
  reportId,
  reportTitle,
  onSuccess,
  onFail,
  onCancel,
  t,
}) {
  Alert.alert(
    t?.('delete_report') || 'Delete Report',
    `${t?.('delete_confirm') || 'Are you sure you want to delete'} "${
      reportTitle || ''
    }"?`,
    [
      {
        text: t?.('cancel') || 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: t?.('delete') || 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // ---- 1️⃣ Get user info and local key ----
            const userData = await AsyncStorage.getItem('UserData');
            const user = userData ? JSON.parse(userData) : {};
            const uid = user?.uid || 'guest';
            const key = `Reports_${uid}`;

            // ---- 2️⃣ Remove locally from AsyncStorage ----
            const stored = await AsyncStorage.getItem(key);
            if (stored) {
              const arr = JSON.parse(stored).filter(r => r.id !== reportId);
              await AsyncStorage.setItem(key, JSON.stringify(arr));
              onSuccess && onSuccess(arr);
            }

            // ---- 3️⃣ Attempt to delete from Firestore if online ----
            const state = await NetInfo.fetch();
            if (state.isConnected && uid !== 'guest') {
              try {
                await firestore()
                  .collection('fieldReporter_Users')
                  .doc(uid)
                  .collection('reports')
                  .doc(reportId)
                  .delete();
                console.log(`✅ Firestore doc deleted: ${reportId}`);
              } catch (fireErr) {
                console.log(
                  '⚠️ Firestore delete failed, will sync later',
                  fireErr,
                );
              }
            } else {
              console.log('📴 Offline, Firestore delete deferred');
            }

            // ---- 4️⃣ Confirm to the user ----
            Alert.alert(
              t?.('deleted') || 'Deleted',
              t?.('deleted_success') || 'Report deleted successfully.',
            );
          } catch (error) {
            console.error('Delete error:', error);
            Alert.alert(
              t?.('error') || 'Error',
              t?.('delete_failed') || 'Failed to delete report.',
            );
            onFail && onFail(error);
          }
        },
      },
    ],
  );
}

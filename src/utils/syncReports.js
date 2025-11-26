import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pushes unsynced reports to Firestore
export const uploadPendingReports = async () => {
  try {
    const saved = await AsyncStorage.getItem('Reports');
    const reports = saved ? JSON.parse(saved) : [];
    const pending = reports.filter((r) => !r.synced && r.uid !== 'guest');

    for (const report of pending) {
      const docRef = firestore()
        .collection('fieldReporter_Users')
        .doc(report.uid)
        .collection('reports')
        .doc(report.id);

      await docRef.set({
        title: report.title,
        details: report.details,
        category: report.category,
        location: report.location,
        createdAt: report.createdAt,
        syncedAt: new Date().toISOString(),
      });

      report.synced = true;
    }

    await AsyncStorage.setItem('Reports', JSON.stringify(reports));
    console.log(' Pending reports synced to Firestore');
  } catch (error) {
    console.error('Sync Error:', error);
  }
};
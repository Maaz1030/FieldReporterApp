import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReportsListScreen() {
  const [reports, setReports] = useState([]);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('UserData');
      const user = saved ? JSON.parse(saved) : null;
      setUid(user?.uid);
    })();
  }, []);

  useEffect(() => {
    if (!uid) return;

    // 🔥 Real‑time snapshot listener
    const unsubscribe = firestore()
      .collection('fieldReporter_Users')
      .doc(uid)
      .collection('reports')
      .orderBy('createdAt', 'desc')
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        setReports(data);
      });

    return () => unsubscribe();
  }, [uid]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ccc' }}>
            <Text style={{ fontWeight: '600' }}>{item.title}</Text>
            <Text>{item.details}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{item.category}</Text>
          </View>
        )}
      />
    </View>
  );
}

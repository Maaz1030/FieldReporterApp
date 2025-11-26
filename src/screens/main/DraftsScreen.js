import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import colors from '../../utils/colors';

// Use the SAME key as your CreateReportScreen to ensure they match
const DRAFT_REPORTS_KEY = 'DraftReports';

export default function DraftsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const themeMode = useSelector(state => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;
  const isFocused = useIsFocused(); // Hook to reload data when the screen is focused

  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------- Load all drafts from storage ----------
  const loadDrafts = async () => {
    setLoading(true);
    try {
      const savedDrafts = await AsyncStorage.getItem(DRAFT_REPORTS_KEY);
      if (savedDrafts) {
        const draftsArray = JSON.parse(savedDrafts);
        // Reverse the array to show the newest drafts at the top
        setDrafts(draftsArray.reverse());
        console.log('✅ Drafts loaded successfully.');
      } else {
        // If no drafts are found, ensure the state is an empty array
        setDrafts([]);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
      Alert.alert('Error', 'Could not load saved drafts.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Reload drafts every time the screen comes into focus ----------
  useEffect(() => {
    if (isFocused) {
      loadDrafts();
    }
  }, [isFocused]);

  // ---------- Delete a specific draft from storage ----------
  const deleteDraft = async draftId => {
    try {
      // Filter out the draft to be deleted
      const updatedDrafts = drafts.filter(d => d.id !== draftId);
      setDrafts(updatedDrafts); // Update the UI immediately

      // Save the modified array back to AsyncStorage. We reverse it back to original order for saving.
      await AsyncStorage.setItem(
        DRAFT_REPORTS_KEY,
        JSON.stringify(updatedDrafts.slice().reverse()),
      );
      Alert.alert('Draft Deleted', 'The draft has been removed.');
    } catch (error) {
      console.error('Error deleting draft:', error);
      Alert.alert('Error', 'Could not delete the draft.');
      loadDrafts(); // In case of error, reload to ensure UI consistency
    }
  };

  // ---------- Show a confirmation alert before deleting ----------
  const confirmDelete = draftId => {
    Alert.alert('Delete Draft', 'Are you sure you want to delete this draft?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteDraft(draftId),
      },
    ]);
  };

  // ---------- Navigate to the CreateReportScreen to edit a draft ----------
  const editDraft = draft => {
    // Pass the selected draft's data to the CreateReportScreen
    navigation.navigate('CreateReport', { draftData: draft });
  };

  // ---------- Render each draft item in the FlatList ----------
  const renderDraftItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.draftItem,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
      onPress={() => editDraft(item)}
    >
      <View style={styles.draftContent}>
        <Text style={[styles.draftTitle, { color: theme.primaryText }]}>
          {item.title || 'Untitled Draft'}
        </Text>
        <Text
          style={[styles.draftDetails, { color: theme.secondaryText }]}
          numberOfLines={2}
        >
          {item.details || 'No details...'}
        </Text>
        <Text style={[styles.draftDate, { color: theme.secondaryText }]}>
          Saved: {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => confirmDelete(item.id)}
        style={styles.deleteButton}
      >
        <Icon name="trash-outline" size={22} color="#ff4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const barStyle = themeMode === 'dark' ? 'light-content' : 'dark-content';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.primaryBackground, paddingTop: insets.top },
      ]}
    >
      <StatusBar
        barStyle={barStyle}
        backgroundColor={theme.primaryBackground}
      />

      {/* Header */}
      <View
        style={[
          styles.headerBar,
          {
            borderColor: theme.border,
            backgroundColor: theme.primaryBackground,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={theme.primaryText} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.primaryText }]}>
          Drafts
        </Text>

        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <Text
          style={{
            color: theme.secondaryText,
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          Loading drafts...
        </Text>
      ) : drafts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon
            name="document-text-outline"
            size={60}
            color={theme.secondaryText}
          />
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            You have no saved drafts
          </Text>
          <Text style={[styles.emptySubText, { color: theme.secondaryText }]}>
            Drafts you save from the create report screen will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={drafts}
          renderItem={renderDraftItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 10,
    marginBottom: 30,
  },
  backButton: { padding: 4, left: 8 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
  },
  draftItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  draftContent: {
    flex: 1,
  },
  draftTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  draftDetails: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  draftDate: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    opacity: 0.7,
    bottom: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

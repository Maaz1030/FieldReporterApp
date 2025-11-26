import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
} from 'react-native';

const REPORT_TYPES = [
  'Profession',
  'Business',
  'Accident',
  'Infrastructure',
  'Environment',
  'Health',
  'Crime',
  'Natural Disaster',
  'Community',
  'Politics',
  'Other',
];

export default function CategoryPicker({
  visible,
  onClose,
  selected,
  onSelect,
  theme,
  t,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.box,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <FlatList
            data={REPORT_TYPES}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={{ color: theme.primaryText, fontSize: 15 }}>
                  {t(item.toLowerCase()) || item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  box: {
    width: '75%',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 4,
    paddingVertical: 10,
    maxHeight: 300,
  },
  row: { paddingVertical: 10, paddingHorizontal: 14 },
});

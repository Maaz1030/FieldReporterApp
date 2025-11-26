import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import colors from '../../../utils/colors';

export default function DateFilter({ visible, onClose, onSelect, theme }) {
  const [selected, setSelected] = useState('newest');
  const insets = useSafeAreaInsets();
  const themeMode = useSelector(state => state.auth.themeMode);
  const th =
    theme || colors[themeMode] || colors.light; // fallback if theme not passed

  const handleSelect = type => {
    setSelected(type);
    onClose();
    onSelect && onSelect(type);
  };

  const clearFilter = () => {
    setSelected('newest');
    onClose();
    onSelect && onSelect('newest');
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={[
          styles.overlay,
          { paddingTop: insets.top + 50, paddingBottom: insets.bottom },
        ]}
        onPress={onClose}
      >
        <View
          style={[
            styles.panel,
            { backgroundColor: th.surface, borderColor: th.border },
          ]}
        >
          <Text style={[styles.title, { color: th.primaryText }]}>
            Sort by Date
          </Text>

          {[
            { key: 'newest', label: 'Newest First' },
            { key: 'oldest', label: 'Oldest First' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.option,
                {
                  backgroundColor:
                    selected === opt.key ? th.accent : th.surface,
                },
              ]}
              onPress={() => handleSelect(opt.key)}
            >
              <Text
                style={{
                  color: selected === opt.key ? '#fff' : th.primaryText,
                  fontSize: 15,
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}

          {selected !== 'newest' && (
            <TouchableOpacity
              onPress={clearFilter}
              style={[styles.clearBtn, { borderColor: th.accent }]}
            >
              <Text style={[styles.clearText, { color: th.accent }]}>
                Remove Filter
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.close, { color: th.accent }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
     justifyContent: 'flex-start',
  //paddingTop: 180, // move the panel a bit down from the top edge
  },
  panel: {
    width: '85%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    elevation: 10,
  },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  clearBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  clearText: { fontSize: 14, fontWeight: '600' },
  close: { textAlign: 'right', fontSize: 14, fontWeight: '600' },
});
import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function DeleteMenu({ visible, onClose, onEdit, onDelete, theme, t }) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.box, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TouchableOpacity style={styles.item} onPress={onEdit}>
              <Icon name="create-outline" size={18} color={theme.primaryText} />
              <Text style={[styles.text, { color: theme.primaryText }]}>
                {t('edit') || 'Edit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={onDelete}>
              <Icon name="trash-outline" size={18} color="#ff4444" />
              <Text style={[styles.text, { color: '#ff4444' }]}>
                {t('delete') || 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end' },
  box: {
    marginTop: 70,
    marginRight: 15,
    borderWidth: 1,
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 6,
    width: 160,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  text: { fontSize: 15, marginLeft: 10 },
});
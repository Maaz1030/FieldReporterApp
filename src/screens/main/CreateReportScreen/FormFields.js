import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function FormFields({
  theme,
  t,
  title,
  setTitle,
  details,
  setDetails,
  location,
  setLocation,
  category,
  openCategory,
}) {
  return (
    <View>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.primaryText,
          },
        ]}
        placeholder={t('report_title')}
        placeholderTextColor={theme.secondaryText}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[
          styles.input,
          styles.textArea,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.primaryText,
          },
        ]}
        placeholder={t('detailed_description')}
        placeholderTextColor={theme.secondaryText}
        multiline
        value={details}
        onChangeText={setDetails}
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.primaryText,
          },
        ]}
        placeholder={t('location')}
        placeholderTextColor={theme.secondaryText}
        value={location}
        onChangeText={setLocation}
      />

      <TouchableOpacity
        style={[
          styles.dropdown,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
        onPress={openCategory}
      >
        <Text
          style={{ color: category ? theme.primaryText : theme.secondaryText }}
        >
          {category || t('select_category')}
        </Text>
        <Icon name="chevron-down-outline" size={18} color={theme.accent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
});

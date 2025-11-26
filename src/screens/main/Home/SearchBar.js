import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateFilter from './DateFilter';        // ✅ new component below

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  onFilterChange,     // callback to parent for sort mode
  theme,
  t,
}) {
  const [filterVisible, setFilterVisible] = useState(false);

  return (
    <View style={styles.searchContainer}>
      {/* --- Search Box --- */}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: theme.surface, shadowColor: theme.border },
        ]}
      >
        <Icon
          name="search-outline"
          size={20}
          color={theme.secondaryText}
          style={styles.leftIcon}
        />
        <TextInput
          placeholder={t('search_placeholder')}
          placeholderTextColor={theme.secondaryText}
          style={[styles.input, { color: theme.primaryText }]}
          value={value}
          onChangeText={onChangeText}
        />
        {value ? (
          <TouchableOpacity onPress={onClear}>
            <Icon
              name="close-circle"
              size={20}
              color={theme.secondaryText}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* --- tiny filter icon --- */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          { backgroundColor: theme.surface, shadowColor: theme.border },
        ]}
        onPress={() => setFilterVisible(true)}
      >
        <Icon name="filter-outline" size={22} color={theme.primaryText} />
      </TouchableOpacity>

      {/* --- Filter modal --- */}
      <DateFilter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onSelect={onFilterChange}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    elevation: 3,
  },
  leftIcon: { marginRight: 6 },
  input: { flex: 1, paddingVertical: 10, fontSize: 15 },
  rightIcon: { marginLeft: 4 },
  filterButton: {
    marginLeft: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
});
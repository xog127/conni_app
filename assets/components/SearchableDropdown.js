import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

const SearchableDropdown = ({ label, data, value, onSelect, placeholder, errorText }) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (item) => {
    onSelect(item);
    setShowDropdown(false);
    setQuery('');
  };

  const handleClear = () => {
    onSelect({ value: '', label: '' });  // Clear selection
    setShowDropdown(true);
    setQuery('');
  };

  const filteredData = data.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* Show selected course */}
      {value ? (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedText}>{value}</Text>
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput
            style={[styles.input, errorText && styles.inputError]}
            placeholder={placeholder}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setShowDropdown(true);
            }}
          />

          {showDropdown && filteredData.length > 0 && (
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.value}
              scrollEnabled={false}
              style={styles.dropdown}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelect(item)}
                >
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  dropdown: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
  },
  item: {
    padding: 12,
  },
  selectedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  selectedText: {
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    fontSize: 18,
    color: '#EF4444',
    paddingHorizontal: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
});

export default SearchableDropdown;

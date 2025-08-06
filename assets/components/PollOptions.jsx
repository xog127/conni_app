import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import uuid from 'react-native-uuid'

const PollOptions = ({ pollOptions = [], onOptionsChange = () => {} }) => {
  const [localOptions, setLocalOptions] = useState(() => {
    const initial = Array.isArray(pollOptions) && pollOptions.length >= 2
      ? pollOptions
      : [
          { id: uuid.v4(), option: '', votes: 0 },
          { id: uuid.v4(), option: '', votes: 0 },
        ];
    return initial;
  });
  // Sync back to parent
  useEffect(() => {
    onOptionsChange(localOptions);
  }, [localOptions]);

  const handleOptionChange = (text, index) => {
    const updated = [...localOptions];
    updated[index].option = text;
    setLocalOptions(updated);
  };

  const handleAdd = () => {
    if (localOptions.length < 10) {
      setLocalOptions([...localOptions, { id: uuid.v4(), option: '', votes: 0 }]);
    }
  };

  const handleRemove = (index) => {
    if (localOptions.length > 2) {
      const updated = localOptions.filter((_, i) => i !== index);
      setLocalOptions(updated);
    }
  };

  return (
    <View style={styles.container}>
      {localOptions.map((opt, index) => (
        <View key={opt.id} style={styles.optionWrapper}>
          <TextInput
            style={styles.optionBox}
            placeholder={`Option ${index + 1}`}
            value={opt.option}
            onChangeText={(text) => handleOptionChange(text, index)}
          />
          {index >= 2 && (
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(index)}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {localOptions.length < 10 && (
        <TouchableOpacity style={styles.addBox} onPress={handleAdd}>
          <Text style={styles.addText}>+ Add Option</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  optionWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  optionBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
  },
  addBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addText: {
    color: '#666',
    fontSize: 16,
  },
});

PollOptions.defaultProps = {
  pollOptions: [],
}

export default PollOptions;
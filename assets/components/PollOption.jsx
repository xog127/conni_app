import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const PollOption = ({ pollOption, onChoose, hasVoted, isSelected }) => {
  return (
    <TouchableOpacity
      style={[
        styles.optionBox,
        hasVoted && styles.disabled,
        isSelected && styles.selected,
      ]}
      onPress={onChoose}
      disabled={hasVoted}
    >
      <Text style={styles.optionText}>{pollOption.option}</Text>
      {hasVoted && (
        <Text style={styles.voteCount}>{pollOption.votes} votes</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionBox: {
    width: Dimensions.get('window').width - 32, // 16px padding on each side
    backgroundColor: '#eee',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    alignSelf: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  selected: {
    backgroundColor: '#D1C4E9', // soft lavender highlight
    borderWidth: 1,
    borderColor: '#836fff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  voteCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default PollOption;

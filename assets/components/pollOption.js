import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PollOption = ({ pollOption, onChoose, hasVoted }) => {
  // Calculate the background color based on vote status
  const OptionContainer = hasVoted ? (
    <View style={[styles.pollOption, styles.pollOptionUnchosen]}>
      <Text style={styles.pollOptionText}>{pollOption.option}</Text>
    </View>
  ) : (
    <TouchableOpacity onPress={onChoose} style={styles.touchable}>
      <View style={[styles.pollOption, styles.pollOptionChosen]}>
        <Text style={[styles.pollOptionText, styles.votableText]}>{pollOption.option}</Text>
        <Text style={[styles.pollOptionText, styles.votesText]}>{pollOption.votes}</Text>
      </View>
    </TouchableOpacity>
    
    
  );

  return <View style={styles.container}>{OptionContainer}</View>;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  touchable: {
    width: '100%',
  },
  pollOption: {
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pollOptionUnchosen: {
    backgroundColor: '#E8E8E8',
  },
  pollOptionChosen: {
    backgroundColor: '#836FFF',
  },
  pollOptionText: {
    fontSize: 14,
  },
  votableText: {
    color: '#FFFFFF',
    flex: 1,
  },
  votesText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default PollOption;
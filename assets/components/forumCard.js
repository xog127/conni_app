import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ForumCard = ({navigation, forumData}) => {

  const genreref = forumData.id;
  return (
  
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Forums', {genreref})}
    >
      {/* Left - Image */}
      <Image
        source={{ uri: forumData.photo }}
        style={styles.image}
      />

      {/* Middle - Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {forumData.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {forumData.description}
        </Text>
      </View>

      {/* Right - Icon */}
      <Feather name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
   
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // for Android shadow
    gap: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ForumCard;
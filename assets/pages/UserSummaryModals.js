import React from 'react';
import { Modal, View, Text, Image, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../services/authContext';
import { useNavigation } from '@react-navigation/native';
import { doc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { startOrGetDirectChat, updateRef } from '../firebase/queries';

const UserSummaryModal = ({ visible, onClose, user }) => {
  const { user: currentUser, updateProfile } = useAuth();
  const navigation = useNavigation();

  if (!user) return null;

  const handleChat = async () => {
    try {
      const { chatId, chatRef, created } = await startOrGetDirectChat({
        currentUserId: currentUser.uid,
        otherUserId: user.id,
      });

      if (created) {
        await updateRef({
          id: user.id,
          collectionName: 'users',
          updateFields: { chatRefs: arrayUnion(chatRef) },
        });
        await updateProfile({ chatRefs: arrayUnion(chatRef) });
      }

      onClose();
      navigation.navigate('Chatroom', {
        chatId,
        chatName: `${user.first_name} ${user.last_name}`,
      });
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container}>
          <Image
            source={user.photo_url ? { uri: user.photo_url } : require('../images/Blankprofile.png')}
            style={styles.avatar}
          />
          <Text style={styles.name}>{`${user.first_name} ${user.last_name}`}</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Course: {user.course || '-'}</Text>
            <Text style={styles.infoText}>Year: {user.graduation_year || '-'}</Text>
            <Text style={styles.infoText}>Gender: {user.gender || '-'}</Text>
            <Text style={styles.infoText}>Nationality: {user.nationality || '-'}</Text>
          </View>
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoContainer: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'left',
    marginVertical: 2,
  },
  chatButton: {
    backgroundColor: '#836fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserSummaryModal;
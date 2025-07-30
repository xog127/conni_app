import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  collection,
  query,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../services/authContext';

function ChatInfo({ route, navigation }) {
  const { chatId, chatName } = route.params;
  const [chatData, setChatData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChatInfo = async () => {
      try {
        setLoading(true);
        // Fetch chat document
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        
        if (!chatDoc.exists()) {
          Alert.alert('Error', 'Chat not found');
          navigation.goBack();
          return;
        }
        
        const data = chatDoc.data();
        setChatData(data);
        
        // Fetch members data
        const memberPromises = [];
        if (data.members && Array.isArray(data.members)) {
          // For each member reference, fetch the user data
          for (const memberRef of data.members) {
            try {
              if (memberRef && memberRef.path) {
                // If memberRef is a document reference
                memberPromises.push(getDoc(memberRef));
              } else if (typeof memberRef === 'string') {
                // If memberRef is a string (user ID)
                memberPromises.push(getDoc(doc(db, 'users', memberRef)));
              }
            } catch (error) {
              console.error('Error preparing member fetch:', error);
            }
          }
        }
        
        const memberDocs = await Promise.all(memberPromises);
        const memberData = memberDocs.map(doc => {
          if (doc.exists()) {
            return {
              id: doc.id,
              ...doc.data()
            };
          }
          return null;
        }).filter(Boolean); // Remove null entries
        
        setMembers(memberData);
      } catch (error) {
        console.error('Error fetching chat info:', error);
        Alert.alert('Error', 'Failed to load chat information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatInfo();
  }, [chatId, navigation]);

  const leaveChat = async () => {
    Alert.alert(
      'Leave Chat',
      'Are you sure you want to leave this chat?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Get user reference
              const userRef = doc(db, 'users', user.uid);
              
              // Update chat's members array to remove user
              await updateDoc(doc(db, 'chats', chatId), {
                members: arrayRemove(userRef)
              });
              
              // Update user's chatRefs to remove this chat
              // Note: This depends on how your user chatRefs are structured
              if (user.chatRefs) {
                const chatDocRef = doc(db, 'chats', chatId);
                await updateDoc(userRef, {
                  chatRefs: arrayRemove(chatDocRef)
                });
              }
              
              Alert.alert('Success', 'You have left the chat');
              navigation.navigate('AllChats'); // Navigate back to chat list
            } catch (error) {
              console.error('Error leaving chat:', error);
              Alert.alert('Error', 'Failed to leave chat');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderMember = ({ item }) => {
    const isCurrentUser = item.id === user.uid;
    
    // Determine name to display based on chat anonymity setting
    let displayedName;
    if (chatData?.isAnonymous) {
      // In anonymous chat, use firstName and lastName
      displayedName = item.firstName && item.lastName 
        ? `${item.firstName} ${item.lastName}`
        : (item.firstName || item.lastName || 'Anonymous User');
    } else {
      // In regular chat, use displayName
      displayedName = item.displayName || 'Unknown User';
    }
    
    // Get first letter for avatar
    const firstLetter = displayedName.charAt(0).toUpperCase();
    
    return (
      <View style={styles.memberItem}>
        <View style={styles.memberAvatar}>
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>
        <Text style={styles.memberName}>
          {displayedName}
          {isCurrentUser ? ' (You)' : ''}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6FFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Menu</Text>
        <View style={styles.rightPlaceholder} />
      </View>
      
      <ScrollView style={styles.container}>
        {/* Chat Details Section */}
        <View style={styles.section}>
          <View style={styles.chatAvatarContainer}>
            <View style={styles.chatAvatar}>
              <Text style={styles.chatAvatarText}>
                {chatName ? chatName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.chatName}>
            {chatName || 'Unnamed Chat'}
          </Text>
          
          <Text style={styles.chatDescription}>
            {chatData?.description || 'No description'}
          </Text>
          
          <Text style={styles.memberCount}>
            {members.length} {members.length === 1 ? 'participant' : 'participants'}
          </Text>
        </View>
        
        {/* Members Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Participants</Text>
        </View>
        
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Disable scrolling as we're in a ScrollView
          ListEmptyComponent={
            <Text style={styles.emptyText}>No participants found</Text>
          }
        />
        
        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={leaveChat}>
            <Feather name="log-out" size={24} color="#FF3B30" />
            <Text style={styles.actionButtonTextDanger}>Leave Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  appBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  rightPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  chatAvatarContainer: {
    marginBottom: 12,
  },
  chatAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A6FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatAvatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  chatName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  chatDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  memberCount: {
    fontSize: 14,
    color: '#999999',
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F7FA',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A6FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 16,
    color: '#333333',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#999999',
  },
  actionsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionButtonTextDanger: {
    fontSize: 16,
    marginLeft: 16,
    color: '#FF3B30',
  },
});

export default ChatInfo;
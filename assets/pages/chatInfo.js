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
import { Image } from 'native-base';
import { fetchReferenceData } from '../firebase/queries';
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
  const { chatId} = route.params;
  const [chatData, setChatData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [title, setTitle] = useState('Chat');

  useEffect(() => {
    const fetchTitle = async (chatInfoData) => {
      if (!chatInfoData || !chatInfoData.members || chatInfoData.members.length !== 2) return;
    
      const otherMemberRef = chatInfoData.members.find(
        (ref) => ref?.id !== user.uid && !ref?.path?.includes(user.uid)
      );
    
      if (otherMemberRef) {
        const snapshot = await getDoc(otherMemberRef);
        if (snapshot.exists()) {
          const otherUser = snapshot.data();
          const fullName = `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim();
          if (fullName) setTitle(fullName);
        }
      }
    };
    
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
        await fetchTitle(data);

        
        const memberRefs = data.members || [];
        const memberDocs = await Promise.all(
        memberRefs.map(async (entry) => {
          try {
            if (entry?.path) {
              // Firebase document reference
              const snapshot = await getDoc(entry);
              return { id: snapshot.id, ref: entry, data: snapshot.exists() ? snapshot.data() : null };
            } else if (typeof entry === 'string') {
              // Just a user ID, reconstruct the reference
              const userDocRef = doc(db, 'users', entry);
              const snapshot = await getDoc(userDocRef);
              return { id: entry, ref: userDocRef, data: snapshot.exists() ? snapshot.data() : null };
            } else {
              console.warn('Unexpected member entry:', entry);
              return null;
            }
          } catch (error) {
            console.error('Error fetching member:', error);
            return null;
          }
        })
        );

        const memberData = memberDocs.map(entry => {
          if (!entry || !entry.data) {
            return {
              id: entry?.id || 'unknown',
              first_name: null,
              last_name: null,
              course: null,
              graduation_year: null,
              photo_url: null,
              __unresolved: true // for debugging or placeholder fallback
            };
          }
          return {
            id: entry.id,
            ...entry.data
          };
        });

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
              
              Alert.alert('Chat removed', 'You have left the chat');
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
  
    // Determine name to display
    let displayedName;
    if (chatData?.isAnonymous) {
      displayedName = item.course && item.graduation_year
        ? `${item.course} ${item.graduation_year}`
        : 'Anonymous User';
    } else {
      displayedName = item.first_name && item.last_name
        ? `${item.first_name} ${item.last_name}`
        : 'Unknown User';
    }
    const profileImage = item.photo_url
      ? { uri: item.photo_url }
      : require('../images/default_profile.png'); // <-- add your own image here
  
    return (
      <View style={styles.memberItem}>
        <Image
          source={profileImage}
          alt="Profile"
          style={styles.memberAvatarImage}
        />
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
                {title ? title.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.chatName}>
            {title || 'Unnamed Chat'}
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
  memberAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
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
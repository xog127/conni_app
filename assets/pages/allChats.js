import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, Image } from 'react-native';
import { collection, getDoc, getDocs, onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { timeAgo } from '../customFunctions/time';
import { useAuth } from '../services/authContext';
import { fetchReferenceData } from '../firebase/queries';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';

function AllChats({navigation}) {
  const [chats, setChats] = useState([]);
  const { user } = useAuth();

  const resolveTitle = async (chatData) => {
    // For direct chats (2 members), show the other person's name
    if (chatData.isDirect && chatData.members && chatData.members.length === 2) {
      const otherMemberRef = chatData.members.find(
        (ref) => ref?.id !== user.uid && !ref?.path?.includes(user.uid)
      );
    
      if (otherMemberRef) {
        const snapshot = await getDoc(otherMemberRef);
        if (snapshot.exists()) {
          const otherUser = snapshot.data();
          return `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || 'Chat';
        }
      }
    }
    
    // For group chats, use the group_name
    if (chatData.group_name) {
      return chatData.group_name;
    }
  
    return 'Chat';
  };

  const resolveChatImage = async (chatData) => {
    // For direct chats, show the other person's profile picture
    if (chatData.isDirect && chatData.members && chatData.members.length === 2) {
      const otherMemberRef = chatData.members.find(
        (ref) => ref?.id !== user.uid && !ref?.path?.includes(user.uid)
      );
    
      if (otherMemberRef) {
        const snapshot = await getDoc(otherMemberRef);
        if (snapshot.exists()) {
          const otherUser = snapshot.data();
          return otherUser.photo_url || null;
        }
      }
    }
    
    // For group chats, use the uploaded image or default group icon
    if (chatData.image) {
      return chatData.image;
    }
    
    // Return null for default group icon (will be handled in renderItem)
    return null;
  };
  
  
  const onPressLogic = ({item}) => {
    console.log("Chat item pressed:", item);
    navigation.navigate('Chatroom', { chatId: item.id, title: item.title });
  };

  const renderItem = ({item}) => {
    // Calculate a timestamp display
    const timeDisplay = item.lastMessageTime ? timeAgo(item.lastMessageTime) : '';
    
    // Get the first letter of the chat name for the avatar
    const avatarLetter = item.title ? item.title.charAt(0).toUpperCase() : '?';
    console.log("Chat item:", item);
    
    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => onPressLogic({item})}>
        <View style={styles.avatarContainer}>
          {item.image ? (
            // Show actual image (profile picture for direct chats, group image for group chats)
            <Image 
              source={{ uri: item.image }} 
              style={styles.avatar} 
              resizeMode="cover"
            />
          ) : item.isDirect ? (
            // For direct chats without profile picture, show letter avatar
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
          ) : (
            // For group chats without image, show default group chat icon
            <Image 
              source={require('../images/default_profile.png')} 
              style={styles.avatar} 
              resizeMode="cover"
            />
          )}
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{item.title || 'Unnamed Chat'}</Text>
            <Text style={styles.timestamp}>{timeDisplay}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
            {item.lastMessage || 'No messages yet'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Use useFocusEffect to setup listeners when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Make sure user exists before setting up listeners
      if (!user || !user.chatRefs || !Array.isArray(user.chatRefs)) {
        console.log("No chat references found for user:", user);
        setChats([]);
        return;
      }
      
      console.log("Setting up chat listeners for:", user.chatRefs);
      
      // Keep track of all listener unsubscribe functions
      const unsubscribers = [];
      
      // Setup listeners for each chat
      user.chatRefs.forEach(chatRef => {
        try {
          const chatUnsubscribe = onSnapshot(chatRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
              const chatDocData = docSnapshot.data();
      
              // Compute title and image
              const title = await resolveTitle(chatDocData);
              const image = await resolveChatImage(chatDocData);
      
              const chatData = {
                id: docSnapshot.id,
                ...chatDocData,
                title,
                image,
              };
      
              setChats(prevChats => {
                const existingIndex = prevChats.findIndex(chat => chat.id === chatData.id);
                let updatedChats;
                if (existingIndex >= 0) {
                  updatedChats = [...prevChats];
                  updatedChats[existingIndex] = chatData;
                } else {
                  updatedChats = [...prevChats, chatData];
                }
                
                // Sort chats by last message time (most recent first)
                return updatedChats.sort((a, b) => {
                  if (!a.lastMessageTime && !b.lastMessageTime) return 0;
                  if (!a.lastMessageTime) return 1;
                  if (!b.lastMessageTime) return -1;
                  return b.lastMessageTime.toMillis() - a.lastMessageTime.toMillis();
                });
              });
      
              // ✅ Messages listener
              const messagesUnsubscribe = onSnapshot(
                collection(db, "chats", chatData.id, "messages"),
                querySnapshot => {
                  if (!querySnapshot.empty) {
                    const latestMessage = querySnapshot.docs[0].data();
      
                    setChats(prevChats => {
                      const updatedChats = prevChats.map(chat =>
                        chat.id === chatData.id
                          ? {
                              ...chat,
                              lastMessage: latestMessage.text || latestMessage.content || "New message",
                              lastMessageTime: latestMessage.timestamp,
                            }
                          : chat
                      );
                      
                      // Sort chats by last message time (most recent first)
                      return updatedChats.sort((a, b) => {
                        if (!a.lastMessageTime && !b.lastMessageTime) return 0;
                        if (!a.lastMessageTime) return 1;
                        if (!b.lastMessageTime) return -1;
                        return b.lastMessageTime.toMillis() - a.lastMessageTime.toMillis();
                      });
                    });
                  }
                },
                error => console.error("Error in messages listener:", error)
              );
      
              unsubscribers.push(messagesUnsubscribe);
            } else {
              console.log("Chat does not exist:", chatRef);
            }
          });
      
          unsubscribers.push(chatUnsubscribe);
        } catch (error) {
          console.error("Error setting up listeners for chat:", error);
        }
      });
      
      
      // Initial fetch to populate the list
      const initialFetch = async () => {
        try {
          const chatData = [];
          
          for (const chatRef of user.chatRefs) {
            try {
              const chatDoc = await fetchReferenceData(chatRef);
              if (chatDoc) {
                const title = await resolveTitle(chatDoc);
                chatData.push({ ...chatDoc, title });
              }
            } catch (error) {
              console.error(`Error fetching chat ${chatRef}:`, error);
            }
          }
          
          
          setChats(chatData);
          console.log("Initial chat data loaded:", chatData);
        } catch (error) {
          console.error("Error in initial fetch:", error);
        }
      };
      
      initialFetch();
      
      // Cleanup function to remove all listeners when component unmounts or loses focus
      return () => {
        console.log("Cleaning up chat listeners");
        unsubscribers.forEach(unsubscribe => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        });
      };
    }, [user]) // Re-run if user changes
  );

  return (
    <SafeAreaViewContext style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('CreateChat')}
          >
            <Feather name="plus" size={26} color="#666" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={chats}
          renderItem={(item) => renderItem(item)}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubtext}>Start a new chat to begin messaging</Text>
            </View>
          }
        />
      </View>
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Match your main background color
        },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    flexDirection : 'row',
    justifyContent : 'space-between'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  list: {
    width: '100%',
  },
  listContent: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A6FFF',
    justifyContent: 'center',
    alignItems: 'center',

  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

export default AllChats;
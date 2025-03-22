import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { collection, getDoc, getDocs, onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { timeAgo } from '../customFunctions/time';
import { useAuth } from '../services/authContext';
import { fetchReferenceData } from '../firebase/queries';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

function AllChats({navigation}) {
  const [chats, setChats] = useState([]);
  const { user } = useAuth();
  
  const onPressLogic = ({item}) => {
    console.log("Chat item pressed:", item);
    navigation.navigate('Chatroom', { chatId: item.id, chatName: item.group_name });
  };

  const renderItem = ({item}) => {
    // Calculate a timestamp display
    const timeDisplay = item.lastMessageTime ? timeAgo(item.lastMessageTime) : '';
    
    // Get the first letter of the chat name for the avatar
    const avatarLetter = item.group_name ? item.group_name.charAt(0).toUpperCase() : '?';
    console.log("Chat item:", item);
    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => onPressLogic({item})}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{item.group_name || 'Unnamed Chat'}</Text>
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
        console.log("Setting up listener for chat:", chatRef);
        
        try {
          
          // Set up listener for the chat document
          const chatUnsubscribe = onSnapshot(chatRef, 
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const chatData = {
                  id: docSnapshot.id,
                  ...docSnapshot.data()
                };
                console.log("Chat data:", chatData);
                // Update the chats state while preserving existing chats
                setChats(prevChats => {
                  const existingIndex = prevChats.findIndex(chat => chat.id === chatData.id);
                  if (existingIndex >= 0) {
                    // Replace existing chat with updated data
                    const updatedChats = [...prevChats];
                    updatedChats[existingIndex] = chatData;
                    return updatedChats;
                  } else {
                    // Add new chat
                    return [...prevChats, chatData];
                  }
                });
                
                console.log("Chat updated:", chatData);
              } else {
                console.log("Chat does not exist:", chatRef);
              }
            },
            (error) => {
              console.error("Error in chat listener:", error);
            }
          );
          
          unsubscribers.push(chatUnsubscribe);
          
          // Also set up a listener for the latest message in this chat
          const messagesUnsubscribe = onSnapshot(
            collection(db, "chats", chatData.id, "messages"),
            { limit: 1, orderBy: "timestamp", desc: true },
            (querySnapshot) => {
              if (!querySnapshot.empty) {
                const latestMessage = querySnapshot.docs[0];
                const messageData = latestMessage.data();
                
                // Update the specific chat with the latest message info
                setChats(prevChats => {
                  console.log("prev chats", prevChats)
                  return prevChats.map(chat => {
                    if (chat.id === chatData.id) {
                      return {
                        ...chat,
                        lastMessage: messageData.text || messageData.content || "New message",
                        lastMessageTime: messageData.timestamp
                      };
                    }
                    return chat;
                  });
                });
                
                console.log("Latest message updated for chat:", chatData.id);
              }
            },
            (error) => {
              console.error("Error in messages listener:", error);
            }
          );
          
          unsubscribers.push(messagesUnsubscribe);
          
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
                chatData.push(chatDoc);
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
    <SafeAreaView style={styles.safeArea}>
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
          key={(item) => item.id}
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
    </SafeAreaView>
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
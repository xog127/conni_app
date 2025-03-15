import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { collection, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { timeAgo } from '../customFunctions/time';
import { useAuth } from '../services/authContext';
import { fetchReferenceData } from '../firebase/queries';
import { Feather } from '@expo/vector-icons';

function AllChats({navigation}) {
  const [chats, setChats] = useState([]);
  const {  user } = useAuth();
  const onPressLogic = ({item} ) => {
    
  };

  const renderItem = ({item}) => {
    // Calculate a timestamp display
    const timeDisplay = item.lastMessageTime ? timeAgo(item.lastMessageTime) : '';
    
    // Get the first letter of the chat name for the avatar
    const avatarLetter = item.group_name ? item.group_name.charAt(0).toUpperCase() : '?';

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

  const fetchChats = async () => {
    try {
      // Make sure user and user.chatRefs exist before proceeding
      if (!user || !user.chatRefs || !Array.isArray(user.chatRefs)) {
        console.log("No chat references found for user:", user);
        setChats([]);
        return;
      }
      
      console.log("User chat references:", user.chatRefs);
      
      const chatData = [];
      
      // Process each chat reference one by one
      for (const chatRef of user.chatRefs) {
        try {
            console.log("chat ref is", chatRef)
            const chatDoc = await fetchReferenceData(chatRef);
            console.log(chatDoc)
            chatData.push(chatDoc)
            
        } catch (error) {
            console.error(`Error fetching chat ${chatRef}:`, error);
        }
      }
      
      setChats(chatData);
      console.log("Fetched chat data:", chatData);
    } catch (error) {
      console.error("Error in fetchChats function:", error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <SafeAreaView style = {styles.safeArea}>
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
        renderItem={renderItem}
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

export default AllChats ;
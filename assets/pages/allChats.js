import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, Image } from 'react-native';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../services/authContext';
import { timeAgo } from '../customFunctions/time';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';

function AllChats({ navigation }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);

  // tiny cache so we don't refetch the same user profile for every snapshot
  const usersCache = useMemo(() => new Map(), []);

  useEffect(() => {
    if (!user?.uid) return;

    // if your chat doc stores members as DocumentReferences:
    const userRef = doc(db, 'users', user.uid);

    // SINGLE real-time listener, ordered by lastMessageTime
    // ⚠️ Firestore will prompt you to create an index for: where(array-contains) + orderBy
    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', userRef),
      orderBy('lastMessageTime', 'desc')
    );

    const unsub = onSnapshot(q, async (snap) => {
      const base = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const rows = await Promise.all(
        base.map(async (chat) => {
          let title = chat.group_name || 'Chat';
          let image = chat.image || null;

          // For direct chats, resolve the other participant once and cache
          if (chat.isDirect && Array.isArray(chat.members) && chat.members.length === 2) {
            const otherRef = chat.members.find(r => r?.id !== user.uid);
            if (otherRef) {
              const otherUid = otherRef.id;
              let other = usersCache.get(otherUid);
              if (!other) {
                const s = await getDoc(otherRef);
                if (s.exists()) {
                  other = s.data();
                  usersCache.set(otherUid, other);
                }
              }
              if (other) {
                const name = `${other.first_name || ''} ${other.last_name || ''}`.trim();
                title = name || other.username || 'Chat';
                image = other.photo_url || other.profileImage || other.avatar || image;
              }
            }
          }

          return {
            id: chat.id,
            isDirect: !!chat.isDirect,
            title,
            image,
            lastMessage: chat.lastMessage || 'No messages yet',
            lastMessageTime: chat.lastMessageTime || null,
          };
        })
      );

      setChats(rows); // one setState, smooth list updates
    });

    return () => unsub();
  }, [user?.uid, usersCache]);

  const onPressChat = (item) => {
    navigation.navigate('Chatroom', { chatId: item.id, title: item.title });
  };

  const renderItem = ({ item }) => {
    const timeDisplay = item.lastMessageTime ? timeAgo(item.lastMessageTime) : '';
    const avatarLetter = item.title ? item.title.charAt(0).toUpperCase() : '?';

    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => onPressChat(item)}>
        <View style={styles.avatarContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.avatar} resizeMode="cover" />
          ) : item.isDirect ? (
            <View style={styles.avatar}><Text style={styles.avatarText}>{avatarLetter}</Text></View>
          ) : (
            <Image source={require('../images/default_profile.png')} style={styles.avatar} resizeMode="cover" />
          )}
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.timestamp}>{timeDisplay}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaViewContext style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('CreateChat')}>
            <Feather name="plus" size={26} color="#666" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubtext}>Start a new chat to begin messaging</Text>
            </View>
          }
          // small perf wins
          removeClippedSubviews
          initialNumToRender={12}
          windowSize={5}
        />
      </View>
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  list: { width: '100%' },
  listContent: { paddingBottom: 20 },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  avatarContainer: { marginRight: 16 },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#4A6FFF', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  chatContent: { flex: 1, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  chatName: { fontSize: 16, fontWeight: 'bold', color: '#333', flexShrink: 1 },
  timestamp: { fontSize: 12, color: '#999' },
  lastMessage: { fontSize: 14, color: '#666', flex: 1 },
  emptyContainer: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 8, fontWeight: 'bold' },
  emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
});

export default AllChats;

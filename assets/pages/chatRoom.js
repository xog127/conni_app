import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
  Dimensions,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  getDoc,
  where,
  startAfter,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/firebaseConfig';
import { useAuth } from '../services/authContext';
import { timeAgo, timeFormat } from '../customFunctions/time';

const MESSAGES_PER_LOAD = 20;

function ChatRoom({ route, navigation }) {
  const { chatId, chatName } = route.params;
  console.log("ChatRoom received params:", route.params);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [chatInfo, setChatInfo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const lastMessageRef = useRef(null);
  const flatListRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch chat info
    const fetchChatInfo = async () => {
      try {
        const chatDocRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatDocRef);
        
        if (chatDoc.exists()) {
          setChatInfo(chatDoc.data());
        } else {
          console.error('Chat not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching chat info:', error);
      }
    };

    fetchChatInfo();

    // Set up real-time listener for messages
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(MESSAGES_PER_LOAD)
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messageList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Debug the message data
        if (data.imageUrl) {
          console.log("Message with image:", doc.id, data.imageUrl);
        }
        
        messageList.push({
          id: doc.id,
          ...data,
        });
      });
      
      setMessages(messageList);
      setLoading(false);
      
      if (querySnapshot.docs.length > 0) {
        lastMessageRef.current = querySnapshot.docs[querySnapshot.docs.length - 1];
      }
    }, (error) => {
      console.error('Error in message listener:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId, navigation]);

  const loadMoreMessages = async () => {
    if (!hasMoreMessages || loadingMore || !lastMessageRef.current) return;
    
    setLoadingMore(true);
    
    try {
      const moreMessagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'desc'),
        startAfter(lastMessageRef.current),
        limit(MESSAGES_PER_LOAD)
      );
      
      const querySnapshot = await getDocs(moreMessagesQuery);
      const moreMessages = [];
      
      querySnapshot.forEach((doc) => {
        moreMessages.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      if (moreMessages.length > 0) {
        setMessages(prevMessages => [...prevMessages, ...moreMessages]);
        lastMessageRef.current = querySnapshot.docs[querySnapshot.docs.length - 1];
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !imageUri) || uploadingImage) return;
    
    try {
      // If there's an image, upload it first
      if (imageUri) {
        await uploadImageAndSend();
        return;
      }
      
      // Prepare message data
      const messageData = {
        text: newMessage.trim(),
        senderId: user.uid,
        senderName: user.displayName || 'Unknown User',
        timestamp: Timestamp.now(),
      };

      // Add message to messages subcollection
      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
      
      // Update chat document with latest message info
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: newMessage.trim(),
        lastMessageTime: Timestamp.now(),
        lastSenderId: user.uid
      });
      
      // Reset input fields
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets[0]) {
      console.log("Image picked:", result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImageAndSend = async () => {
    if (!imageUri) return;
    
    try {
      setUploadingImage(true);
      
      // Generate a unique file name
      const fileName = `${Date.now()}-${user.uid}`;
      const storageRef = ref(storage, `chat_images/${chatId}/${fileName}`);
      
      console.log("Preparing to upload image:", imageUri);
      
      // Fetch the image and convert to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      console.log("Image blob created, size:", blob.size);
      
      // Upload to Firebase Storage
      const uploadResult = await uploadBytes(storageRef, blob);
      console.log("Image uploaded successfully:", uploadResult.metadata.fullPath);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Image download URL:", downloadURL);
      
      // Create message with image
      const messageData = {
        text: newMessage.trim(),
        imageUrl: downloadURL, // Make sure the field name matches what your render function expects
        senderId: user.uid,
        senderName: user.displayName || 'Unknown User',
        timestamp: Timestamp.now(),
      };
      
      console.log("Sending message with image:", messageData);
      
      // Add message to messages subcollection
      const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
      console.log("Message with image added:", messageRef.id);
      
      // Update chat document with latest message info
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: newMessage.trim() || 'Image',
        lastMessageTime: Timestamp.now(),
        lastSenderId: user.uid
      });
      
      // Reset input fields
      setNewMessage('');
      setImageUri(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const showImagePreview = (imageUrl) => {
    console.log("Opening image preview:", imageUrl);
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === user.uid;
    
    // Debug log for messages with images
    if (item.imageUrl) {
      console.log(`Rendering message ${item.id} with image: ${item.imageUrl}`);
    }
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        
        {item.imageUrl && (
          <TouchableOpacity 
            onPress={() => showImagePreview(item.imageUrl)} 
            style={styles.imageContainer}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.messageImage} 
              resizeMode="cover"
              onLoad={() => console.log(`Image loaded: ${item.id}`)}
              onError={(e) => console.error(`Image error for ${item.id}:`, e.nativeEvent.error)}
            />
       
          </TouchableOpacity>
        )}
        
        {item.text && item.text.trim() !== '' && (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
        
        <Text style={styles.timestamp}>
          {item.timestamp ? timeAgo(item.timestamp) : 'Now'}
        </Text>
      </View>
    );
  };

  const ListFooterComponent = () => {
    if (!hasMoreMessages) return null;
    
    return (
      <View style={styles.loadingMoreContainer}>
        {loadingMore ? (
          <ActivityIndicator size="small" color="#4A6FFF" />
        ) : (
          <TouchableOpacity onPress={loadMoreMessages}>
            <Text style={styles.loadMoreText}>Load more messages</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Image Preview Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeModalButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Feather name="x" size={30} color="#FFF" />
          </TouchableOpacity>
          
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
              onError={(e) => {
                console.error("Error loading full screen image:", e.nativeEvent.error);
                Alert.alert("Error", "Failed to load image");
                setImageModalVisible(false);
              }}
            />
          )}
        </View>
      </Modal>
      
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.chatInfoContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {chatName ? chatName.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.chatTitle} numberOfLines={1}>
            {chatName || 'Chat'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => navigation.navigate('Chatinfo', { chatId, chatName })}
        >
          <Feather name="info" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Chat Messages */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#4A6FFF" style={styles.loader} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            inverted={true}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.5}
            ListFooterComponent={ListFooterComponent}
          />
        )}
        
        {/* Image Preview */}
        {imageUri && (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: imageUri }} 
              style={styles.imagePreview} 
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setImageUri(null)}
            >
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={pickImage}
            disabled={uploadingImage}
          >
            <Feather name="image" size={24} color={uploadingImage ? "#ccc" : "#666"} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            editable={!uploadingImage}
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, uploadingImage && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={uploadingImage || (!newMessage.trim() && !imageUri)}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color="#4A6FFF" />
            ) : (
              <Feather 
                name="send" 
                size={24} 
                color={(!newMessage.trim() && !imageUri) ? "#ccc" : "#4A6FFF"} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width * 0.95,  // 95% of screen width
    height: Dimensions.get('window').height * 0.8,  // 80% of screen height
    borderRadius: 8,
  },
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
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
  chatInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A6FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    maxWidth: 200,
  },
  infoButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#E5DDD5', // WhatsApp-like background
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    padding: 16,
    paddingTop: 8,
  },
  messageContainer: {
    maxWidth: '80%',
    minWidth: '40%',  // Ensure a minimum width
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6', // WhatsApp green bubble
    borderTopRightRadius: 2,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#4A6FFF',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333333',
  },
  timestamp: {
    fontSize: 11,
    color: '#999999',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  imageContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  messageImage: {
    width: '100%',  // Take up full width of container
    height: 200,
    backgroundColor: '#f1f1f1', // Show a placeholder color while loading
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    // This overlay will remain visible until the Image's onLoad event fires
    opacity: 0.5,
  },
  loadingMoreContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#4A6FFF',
    fontSize: 14,
  },
  imagePreviewContainer: {
    margin: 8,
    position: 'relative',
    alignSelf: 'center',
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  }
});

export default ChatRoom;
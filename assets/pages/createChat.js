import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp, doc, arrayUnion, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../services/authContext';

const CreateChat = () => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [image, setImage] = useState(null);
  const [addImage, setAddImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigation = useNavigation();
  const { user, updateProfile} = useAuth();

  // Image picker function
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsSubmitting(true);
        const uri = result.assets[0].uri;
        const imageUrl = await uploadImageToFirebase(uri);
        setImage(imageUrl);
        setAddImage(true);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to process image.');
      setIsSubmitting(false);
    }
  };

  const uploadImageToFirebase = async (uri) => {
    try {
      const storage = getStorage();
      const filename = `post_images/${Date.now()}`;
      const storageRef = ref(storage, filename);
      
      const response = await fetch(uri);
      const blob = await response.blob();
      
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const createChat = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create new chat document
      console.log(user)
      const userRef = doc(db, 'users', user.uid)
      const chatData = {
        group_name: groupName,
        description: description,
        isAnonymous: isAnonymous,
        isDirect: false, // This is a group chat, not a direct chat
        image: image || null,
        createdAt: serverTimestamp(),
        createdBy: userRef,
        members: [userRef],
        lastMessage: '',
        lastMessageTime: null
      };
      
      console.log("made chat data", chatData)

      const chatdoc = await addDoc(collection(db, "chats"), chatData);
      console.log("chat created is", chatdoc)
      await updateProfile({chatRefs : arrayUnion(chatdoc)})
   
      
      // Successfully created chat
      setIsSubmitting(false);
      navigation.goBack()
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create chat group');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Chat</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {image ? (
                <Image source={{ uri: image }} style={styles.groupImage} />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <Ionicons name="camera" size={40} color="#999" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Group Name *</Text>
            <TextInput
              style={styles.input}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name"
              placeholderTextColor="#999"
              maxLength={30}
            />
            
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="What's this group about?"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              maxLength={200}
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Anonymous Group</Text>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: "#ddd", true: "#4A6FFF" }}
                thumbColor={isAnonymous ? "#fff" : "#f4f3f4"}
              />
            </View>
            <Text style={styles.helperText}>
              When enabled, member identities will be hidden from each other
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.createButton, 
                (!groupName.trim() || isSubmitting) && styles.disabledButton
              ]}
              onPress={createChat}
              disabled={!groupName.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Create Chat Group</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  groupImage: {
    width: '100%',
    height: '100%',
  },
  imagePickerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  createButton: {
    backgroundColor: '#836fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  }
});

export default CreateChat;
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TextInput,
  Image,
  TouchableWithoutFeedback,
  Switch,
  Dimensions,
} from "react-native";
import {
  Box,
  HStack,
  Pressable,
  IconButton,
  Icon,
  Button,
  Text,
  Modal,
  VStack,
} from "native-base";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import { Feather, Ionicons } from '@expo/vector-icons';
import { addRef, getCollections } from "../firebase/queries";
import * as ImagePicker from 'expo-image-picker';
import { doc, Timestamp } from "firebase/firestore";
import CreatePostFields from "./createPostFields";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../services/authContext";
import { ForumSelector } from "./forumselector";
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';

// Poll Options Component
export const PollOptions = ({ pollOptions, onAddOption, onRemoveOption }) => {
  const [newOption, setNewOption] = useState("");

  const handleAddOption = () => {
    if (newOption.trim()) {
      onAddOption(newOption.trim());
      setNewOption("");
    }
  };

  return (
    <View style={styles.pollSection}>
      <View style={styles.pollInputContainer}>
        <TextInput
          style={styles.pollOptionInput}
          placeholder="Add poll option"
          value={newOption}
          onChangeText={setNewOption}
        />
        <TouchableOpacity 
          style={styles.addOptionButton}
          onPress={handleAddOption}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.pollOptionsContainer}>
        {pollOptions.map((pollOption, index) => (
          <View key={index} style={styles.pollOption}>
            <Text style={styles.pollOptionText}>{pollOption.option}</Text>
            <TouchableOpacity
              onPress={() => onRemoveOption(index)}
              style={styles.removeOptionButton}
            >
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

// Action Bar Component
const ActionBar = ({ options, onOptionToggle }) => {
  return (
    <View style={styles.actionBar}>
      <View style={styles.leftActions}>
        <TouchableOpacity style={styles.iconButton} onPress={() => onOptionToggle('addImage')}>
          <Feather name="image" size={22} color="#836fff" />
        </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} onPress={() => onOptionToggle('addPoll')}>
          <Feather name="bar-chart-2" size={22} color="#836fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} onPress={() => onOptionToggle('addChat')}>
          <Feather name="message-circle" size={22} color="#836fff" />
      </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={[styles.iconButton, styles.anonymousButton]} 
        onPress={() => onOptionToggle('anonymous')}
      >
        <Feather name="eye-off" size={22} color={options.anonymous ? "#836fff" : "#666"} />
      </TouchableOpacity>
    </View>
  );
};

// Main Component
const CreatePost = ({ navigation }) => {
  const scrollViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const {user} = useAuth();
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedForum, setSelectedForum] = useState("");
  const [addChat, setAddChat] = useState(false);
  const [addPoll, setAddPoll] = useState(false);
  const [addImage, setAddImage] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [pollOptions, setPollOptions] = useState([]);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Forums data
  const [forums, setForums] = useState([]);
  const [showForumModal, setShowForumModal] = useState(false);
  const [postType, setPostType] = useState('text');

  // Set up tab bar hiding
  useEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: 'none' }
      });
      
      return () => parent.setOptions({
        tabBarStyle: undefined
      });
    }
  }, [navigation]);

  // Load forums
  useEffect(() => {
    const fetchForums = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const forumsData = await getCollections({ collectionName: 'genres' });
        setForums(forumsData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching forums:', err);
        setError("Failed to load forums. Please try again.");
        setIsLoading(false);
      }
    };

    fetchForums();
  }, []);

  const handleFormChange = (data) => {
    setFormData(data);
  };

  const handleValidationChange = (isValid) => {
    setIsFormValid(isValid);
  };

  const addPollOption = (option) => {
    const newPollOption = { option, votes: 0 };
    setPollOptions([...pollOptions, newPollOption]);
  };

  const removePollOption = (index) => {
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handleForumSelect = (forum) => {
    setSelectedForum(forum);
    setFormData({});
  };

  const toggleOption = (option) => {
    switch(option) {
      case 'addChat':
        setAddChat(!addChat);
        break;
      case 'addPoll':
        setAddPoll(!addPoll);
        break;
      case 'addImage':
        if (!addImage) {
          pickImage();
        } else {
          setAddImage(false);
          setImage(null);
        }
        break;
      case 'anonymous':
        setAnonymous(!anonymous);
        break;
    }
  };

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

  const addPost = async () => {
    // Debug logs
    console.log("Title:", title);
    console.log("Description:", description);
    console.log("Selected Forum:", selectedForum);
    console.log("Form Data:", formData);
    console.log("Is Form Valid:", isFormValid);
    
    // Validation
    if (!title || !description || !selectedForum) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    // Only check isFormValid if it's not a General forum
    if (selectedForum.name !== "General" && !isFormValid) {
      Alert.alert("Error", "Please fill in all forum-specific fields.");
      return;
    }
  
    if (addPoll && pollOptions.length < 2) {
      Alert.alert("Error", "Please add at least 2 poll options.");
      return;
    }

    try {
      setIsSubmitting(true);
      const genreDoc = doc(db, "genres", selectedForum.id);
      const userDoc = doc(db, 'users', user.uid);
      
      // Initialize all arrays to empty arrays
      const postData = {
        post_title: title,
        post_data: description,
        post_genre_ref: genreDoc,
        post_photo: image || null,
        addChat,
        addPoll,
        addImage,
        pollOptions: addPoll ? { 
          ptions: pollOptions.map(option => ({ option, votes: 0 })), 
          voters: [] 
        } : null,
        anonymous,
        time_posted: Timestamp.now(),
        requirements: formData || {},
        num_likes: 0,
        num_comments: 0,
        views: 0,
        post_user: userDoc,
        like_userref: [], // Initialize empty array for likes
        liked_user_ref: [], // Initialize empty array for liked users
        chatRefs: [], // Initialize empty array for chat references
        commentedPostsRef: [], // Initialize empty array for commented posts
        postsRef: [], // Initialize empty array for user's posts
        voters: [], // Initialize empty array for poll voters
        comments: [] // Initialize empty array for comments
      };
      
      console.log("Posting data:", JSON.stringify(postData, null, 2));
      
      // Add the post to Firestore
      const postRef = await addRef({ 
        collectionName: "posts", 
        data: postData 
      });
      
      console.log("Post created successfully:", postRef);
      navigation.goBack();
    } catch (error) {
      console.error("Error adding post:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      Alert.alert(
        "Error", 
        `Failed to add post. Please try again.\nError: ${error.message}`
      );
      setIsSubmitting(false);
    }
  };

  // Handle loading and errors
  if (isLoading && forums.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#836fff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error && forums.length === 0) {
    return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              setError(null);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
    );
  }

  return (
    <SafeAreaViewRN style={{ flex: 1, backgroundColor: 'white' }}>
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
            {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.postButton,
              (!title || !selectedForum || isSubmitting) && styles.disabledButton
                ]}
                onPress={addPost}
            disabled={!title || !selectedForum || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>

              {/* Forum Selector */}
        <View style={styles.forumSelectorContainer}>
              <ForumSelector 
                forums={forums}
                selectedForum={selectedForum}
                onForumSelect={handleForumSelect}
              />
        </View>

        {/* Content Area */}
        <ScrollView 
          style={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                multiline
              />

              <TextInput
            style={styles.bodyInput}
            placeholder="What's on your mind?"
                value={description}
            onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />

          <View style={styles.contentExtrasContainer}>
              {/* Image Preview */}
              {addImage && image && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => {
                        setAddImage(false);
                        setImage(null);
                      }}
                    >
                      <Feather name="x" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
            )}

            {/* Forum Details */}
            {selectedForum && selectedForum.name !== "General" && (
              <View style={styles.forumDetailsContainer}>
                <CreatePostFields 
                  onChange={handleFormChange} 
                  selectedForum={selectedForum.name}
                  onValidationChange={handleValidationChange}
                  />
                </View>
              )}
          </View>

          {/* Poll Options */}
        {addPoll && (
          <View style={styles.pollContainer}>
            <PollOptions
              pollOptions={pollOptions}
              onAddOption={(options) => setPollOptions(options)}
              onRemoveOption={() => {}}
            />
          </View>
          )}
        </ScrollView>
            
        {/* Action Bar */}
        <View style={styles.actionBarContainer}>
          <View style={styles.divider} />
              <ActionBar 
                options={{ addChat, addPoll, addImage, anonymous }}
                onOptionToggle={toggleOption}
              />
            </View>
    </KeyboardAvoidingView>
    </SafeAreaViewRN>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postButton: {
    backgroundColor: '#836fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  forumSelectorContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 8,
    marginBottom: 8,
  },
  bodyInput: {
    fontSize: 16,
    minHeight: 120,
    paddingTop: 8,
  },
  contentExtrasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  imageContainer: {
    marginRight: 16,
    marginBottom: 16,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 4,
  },
  forumDetailsContainer: {
    flex: 1,
    minWidth: 250,
  },
  pollContainer: {
    marginTop: 16,
  },
  actionBarContainer: {
    width: '100%',
    backgroundColor: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginRight: 16,
  },
  anonymousButton: {
    marginRight: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#836fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CreatePost;
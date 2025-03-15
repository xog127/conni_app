import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TextInput,
  Text,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import { Feather } from '@expo/vector-icons';
import { addRef, getCollections } from "../firebase/queries";
import * as ImagePicker from 'expo-image-picker';
import { doc, Timestamp } from "firebase/firestore";
import CreatePostFields from "./createPostFields";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../services/authContext";

// Forum Selector Component
export const ForumSelector = ({ forums, selectedForum, onForumSelect }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  return (
    <View style={styles.dropdown}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setDropdownVisible(!dropdownVisible)}
      >
        <Text style={styles.dropdownButtonText}>{selectedForum.name}</Text>
      </TouchableOpacity>
      {dropdownVisible && (
        <View style={styles.dropdownList}>
          {forums.map((forum, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                onForumSelect(forum);
                setDropdownVisible(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{forum.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

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
export const ActionBar = ({ options, onOptionToggle }) => {
  return (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity style={styles.iconButton} onPress={() => onOptionToggle('addPoll')}>
        <Feather name="bar-chart-2" size={24} color="#836fff" />
        <Text style={styles.iconButtonText}>Poll</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.iconButton} onPress={() => onOptionToggle('addImage')}>
        <Feather name="image" size={24} color="#836fff" />
        <Text style={styles.iconButtonText}>Image</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.iconButton} onPress={() => onOptionToggle('addChat')}>
        <Feather name="message-circle" size={24} color="#836fff" />
        <Text style={styles.iconButtonText}>Chat</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.iconButton} onPress={() => onOptionToggle('anonymous')}>
        <Feather name="user-x" size={24} color="#836fff" />
        <Text style={styles.iconButtonText}>Anonymous</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main Component
const CreatePostForm = ({ navigation }) => {
  const scrollViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const {user} = useAuth
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedForum, setSelectedForum] = useState({ name: "Choose Forum" });
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
          setImageHeight(0); // Reset image height when removed
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
    // Validation
    console.log(isFormValid)
    if (!title || !description || selectedForum.name === "Choose Forum" || !isFormValid) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
  
    if (addPoll && pollOptions.length < 2) {
      Alert.alert("Error", "Please add at least 2 poll options.");
      return;
    }
    console.log(formData)
    genreDoc = doc(db, "genres", selectedForum.id) 
  
    try {
      setIsSubmitting(true);
  
      const postData = {
        post_title: title,
        post_data: description,
        post_genre_ref: genreDoc,
        addChat,
        addPoll,
        addImage,
        image,
        pollOptions: addPoll ? { pollOptions, voters: [] } : [],
        anonymous,
        time_posted: Timestamp.now(),
        requirements : formData,
        num_likes : 0,
        num_comments : 0,
        views : 0,
        post_user : doc(db, 'users', user.id)
      };
      
      await addRef({ collectionName: "posts", data: postData });
      navigation.goBack();
    } catch (error) {
      console.error("Error adding post:", error);
      Alert.alert("Error", "Failed to add post. Please try again.");
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
      <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          // keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          // enabled={true}
        >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        
          <View style={styles.mainContainer}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.header}>Create Post</Text>
              <TouchableOpacity
                style={[
                  styles.postButton,
                  isSubmitting && styles.disabledButton
                ]}
                onPress={addPost}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView
              ref={scrollViewRef}
              contentContainerStyle={
                styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {/* Forum Selector */}
              <ForumSelector 
                forums={forums}
                selectedForum={selectedForum}
                onForumSelect={handleForumSelect}
              />

              {/* Form Fields */}
              <CreatePostFields 
                onChange={handleFormChange} 
                selectedForum={selectedForum.name}
                onValidationChange={handleValidationChange}
              />
              {/* Title Input */}
              <TextInput
                style={styles.titleInput}
                placeholder="Enter title"
                value={title}
                onChangeText={setTitle}
                multiline
              />

              {/* Description Input */}
              <TextInput
                style={styles.descriptionInput}
                placeholder="Enter post details"
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                }}
                multiline
                textAlignVertical="top"
              />
              
              {/* Image Preview */}
              {addImage && image && (
                <View style={styles.imagePreviewContainer}>
                  <View style={styles.imageHeader}>
                    <Text style={styles.imageHeaderText}>Image Preview</Text>
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => {
                        setAddImage(false);
                        setImage(null);
                        setImageHeight(0); // Reset image height when removed
                      }}
                    >
                      <Feather name="x" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <Image 
                    source={{ uri: image }} 
                    style={styles.imagePreview} 
                  />
                </View>
              )}
              
              {/* Poll Options */}
              {addPoll && (
                <View style={styles.modalContentContainer}>
                  <View style={styles.pollSectionHeader}>
                    <Text style={styles.pollSectionTitle}>Add Poll Options</Text>
                    <TouchableOpacity 
                      style={styles.closePollButton}
                      onPress={() => setAddPoll(false)}
                    >
                      <Feather name="x" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                  
                  <PollOptions 
                    pollOptions={pollOptions}
                    onAddOption={addPollOption}
                    onRemoveOption={removePollOption}
                  />
                </View>
              )}
            </KeyboardAwareScrollView>
            
            {/* Bottom Action Bar - Always visible */}
            <View style={styles.fixedBottomContainer}>
              <ActionBar 
                options={{ addChat, addPoll, addImage, anonymous }}
                onOptionToggle={toggleOption}
              />
            </View>
          </View>
      </SafeAreaView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent : 'space-around'
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100, // Increased base padding for action bar
    flexGrow: 1, // Ensure content can grow to enable scrolling
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    color: "#836fff",
  },
  backButton: {
    padding: 8,
  },
  postButton: {
    backgroundColor: "#836fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#b0a4ff',
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  titleInput: {
    fontSize: 22,
    marginVertical: 16,
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  descriptionInput: {
    fontSize: 14,
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    minHeight: 200,
    borderRadius: 8,
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: Platform.OS === "ios" ? 10 : 0,
    zIndex: 10,
    elevation: 5,
  },
  imagePreviewContainer: {
    marginVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageHeaderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  removeImageButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  dropdown: {
    marginBottom: 16,
    zIndex: 1,
  },
  dropdownButton: {
    backgroundColor: "#fff",
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "grey",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000",
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  iconButtonText: {
    fontSize: 10,
    color: '#57636c',
    marginTop: 2,
  },
  modalContentContainer: {
    marginVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  pollSection: {
    marginTop: 8,
  },
  pollInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  pollOptionInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginRight: 8,
  },
  addOptionButton: {
    backgroundColor: '#836fff',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pollOptionsContainer: {
    gap: 8,
  },
  pollOption: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pollOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  removeOptionButton: {
    padding: 4,
    marginLeft: 8,
  },
  pollSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pollSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  closePollButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CreatePostForm;
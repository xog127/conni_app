import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthContext } from "../services/authContext";
import { Switch } from "react-native";
import { Feather } from '@expo/vector-icons';
import { addRef } from "../firebase/queries";
import {addDoc, collection, db} from "../firebase/firebaseConfig";
import { NativeBaseProvider } from "native-base";
import { Timestamp } from "firebase/firestore";


const CreatePostForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedForum, setSelectedForum] = useState("Choose Forum");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [addChat, setAddChat] = useState(false);
  const [addPoll, setAddPoll] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  
  // Poll state with correct structure
  const [pollOptions, setPollOptions] = useState([]);
  const [newOption, setNewOption] = useState("");

  const forums = ["General", "Events", "Market", "Announcements", "Discussions"];

  const addPollOption = () => {
    if (newOption.trim()) {
      const newPollOptions = { option: newOption.trim(), votes: 0};
      setPollOptions([...pollOptions, newPollOptions]);
      setNewOption("");
    }
  };

  const removePollOption = (index) => {
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const addPost = async () => {
    if (!title || !description || selectedForum === "Choose Forum") {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (addPoll && pollOptions.length < 2) {
      Alert.alert("Error", "Please add at least 2 poll options.");
      return;
    }

    const postData = {
      post_title : title,
      post_data : description,
      post_genre_ref: selectedForum,
      addChat,
      addPoll,
      pollOptions: addPoll ? {pollOptions, voters : []} : [],
      anonymous,
      time_posted: Timestamp.now(),
    };

    console.log("Post Data:", postData);
    
    addRef({ collectionName: "posts", data: postData });
    setTitle("");
    setDescription("");
    setSelectedForum("Choose Forum");
    setPollOptions([]);
    setAddPoll(false);
    setAddChat(false);
    setAnonymous(false);
  };

  return (
    <NativeBaseProvider>
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Create Post</Text>

          <TextInput
            style={styles.titleInput}
            placeholder="Enter title"
            value={title}
            onChangeText={setTitle}
            multiline
          />

          <TextInput
            style={[styles.descriptionInput, { height: Math.max(100, description.length / 2) }]}
            placeholder="Enter post details"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Text style={styles.dropdownButtonText}>{selectedForum}</Text>
            </TouchableOpacity>
            {dropdownVisible && (
              <View style={styles.dropdownList}>
                {forums.map((forum, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedForum(forum);
                      setDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{forum}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Add Chat</Text>
            <Switch
              value={addChat}
              onValueChange={setAddChat}
              trackColor={{ false: "#E0E3E7", true: "#E0E3E7" }}
              thumbColor={addChat ? "#836fff" : "#f4f3f4"}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Add Poll</Text>
            <Switch
              value={addPoll}
              onValueChange={setAddPoll}
              trackColor={{ false: "#E0E3E7", true: "#E0E3E7" }}
              thumbColor={addPoll ? "#836fff" : "#f4f3f4"}
            />
          </View>

          {addPoll && (
            <View style={styles.pollSection}>
              <View style={styles.pollInputContainer}>
                <TextInput
                  style={styles.pollInput}
                  placeholder="Add poll option"
                  value={newOption}
                  onChangeText={setNewOption}
                />
                <TouchableOpacity 
                  style={styles.addOptionButton}
                  onPress={addPollOption}
                >
                  <Feather name="plus" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.pollOptionsContainer}>
                {pollOptions.map((pollOption, index) => (
                  <View key={index} style={styles.pollOption}>
                    <Text style={styles.pollOptionText}>{pollOption.option}</Text>
                    <TouchableOpacity
                      onPress={() => removePollOption(index)}
                      style={styles.removeOptionButton}
                    >
                      <Feather name="x" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.switchRow}>
            <View style={{flexDirection: "row", justifyContent: "center", alignItems: "flex-end"}}>
              <Text style={styles.switchText}>Anonymous </Text>
              <Text style={[styles.switchText, {fontSize: 10}]}>(Display Course Year)</Text>
            </View>
            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              trackColor={{ false: "#E0E3E7", true: "#E0E3E7" }}
              thumbColor={anonymous ? "#836fff" : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={addPost}
          >
            <Text style={styles.submitButtonText}>Submit Post</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </NativeBaseProvider>
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
  container: {
    flexGrow: 1,
    padding: 16,
  },
  pollSection: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  pollInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pollInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
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
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#836fff",
  },
  titleInput: {
    backgroundColor: "#fff",
    padding: 0,
    margin: 16,
    fontSize: 22,
    paddingBottom: 16,
    borderBottomWidth: 0.2,
  },
  descriptionInput: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 14,
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  switchText: {
    fontSize: 14,
    color: "#57636c",
    fontWeight: "400",
  },
  submitButton: {
    backgroundColor: "#836fff",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CreatePostForm;
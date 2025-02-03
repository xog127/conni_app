import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Switch } from "react-native";
import { addRef } from "../firebase/queries";
import {addDoc, collection, db} from "../firebase/firebaseConfig";

const CreatePostForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedForum, setSelectedForum] = useState("Choose Forum");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [addChat, setAddChat] = useState(false);
  const [addPoll, setAddPoll] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  const forums = ["General", "Events", "Announcements", "Discussions"];

  const addPost = async () => {
    if (!title || !description || selectedForum === "Choose Forum" ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    const postData = {
      title,
      description,
      forum: selectedForum,
      addChat,
      addPoll,
      anonymous,
      createdAt: new Date().toISOString(),
    };

    console.log("Post Data:", postData);
    addRef({collectionName: "posts", data: postData});
    setTitle("");
    setDescription("");
    setSelectedForum("Choose Forum");

    }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Create Post</Text>

        {/* Title Input */}
        <TextInput
          style={styles.titleInput}
          placeholder="Enter title"
          value={title}
          onChangeText={setTitle}
          multiline
        />

        {/* Details Input */}
        <TextInput
          style={[styles.descriptionInput, { height: Math.max(100, description.length / 2) }]}
          placeholder="Enter post details"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Custom Dropdown */}
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

        {/* Switches */}
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

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={addPost}
        >
          <Text style={styles.submitButtonText}>Submit Post</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export const ForumSelector = ({ forums, selectedForum, onForumSelect, forumData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const generalForum = forums.find((forum) => forum.name === "General");

  useEffect(() => {

    if (!selectedForum && generalForum) {
        onForumSelect(generalForum);
    }
  }, [forums, selectedForum]);

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Button to open the bottom-sheet modal */}
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        
        <Text style={styles.selectorButtonText}>
          {selectedForum?.name || "General"}
        </Text>
        <Feather name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>

      {/* Bottom-Sheet Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Dark overlay */}
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
        />
        
        {/* Bottom Sheet */}
        <View style={styles.bottomSheetContainer}>
          <Text style={styles.sheetTitle}>Select Forum Type</Text>
          
          {forums.map((forum, index) => (
            <Pressable
              key={index}
              style={styles.forumItem}
              onPress={() => {
                onForumSelect(forum);
                setModalVisible(false);
              }}
            >
              <Image source={{ uri: forum.photo }} style={styles.icon} />
              <Text style={styles.forumName}>{forum.name}</Text>
              <Text style={styles.forumDescription}>
                {forum.description || "No description provided."}
              </Text>
            </Pressable>
          ))}

          {/* Cancel button at the bottom */}
          <Pressable
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  selectorButton: {
    backgroundColor: "#f5f5f5",
    borderColor: "grey",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  selectorButtonText: {
    fontSize: 16,
    color: "#666",
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bottomSheetContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    // This pushes the sheet up from the bottom
    maxHeight: "75%",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  forumItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  forumName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  forumDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  cancelButton: {
    alignSelf: "center",
    marginTop: 16,
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#836fff",
    fontWeight: "600",
  },
});
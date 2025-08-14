import React, { useState, useRef } from "react";
import { TextInput } from "react-native";
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  Input,
  Button,
  Modal,
  useToast,
  Avatar,
  Spinner,
  Actionsheet,
  useDisclose,
} from "native-base";
import { useAuth } from "../services/authContext";
import { updateProfile } from "../firebase/queries";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { checkUsernameExists } from "../firebase/queries"; // You may need to implement this
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import theme from '../../theme'; // Make sure path matches
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DUMMY_COURSES = [
  "MSc Mathematics",
  "BSc Psychology",
  "BSc Computer Science",
  "BA History",
];
const DUMMY_YEARS = ["Year 1", "Year 2", "Year 3", "Year 4"];

export default function ProfileEditScreen({ navigation }) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user.displayName ?? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim());
  const [username, setUsername] = useState(user.username ?? "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatar, setAvatar] = useState(user.avatar || user.photo_url || user.profileImage || null);
  const [course] = useState(user.course || DUMMY_COURSES[0]);
  const [year] = useState(user.year || DUMMY_YEARS[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const inputRefs = useRef({});
  const { isOpen, onOpen, onClose } = useDisclose();
  const handleSave = async () => {
    setLoading(true);
    setUsernameError("");
    // Username duplicate check
    if (username !== user.username) {
      const exists = await checkUsernameExists(username);
      if (exists) {
        setUsernameError("Username already taken");
        setLoading(false);
        inputRefs.current.username.focus();
        return;
      }
    }
    try {
      // Upload image to Firebase if it's a local URI
      let uploadedImageUrl = avatar;
      if (avatar && avatar.startsWith('file://')) {
        try {
          uploadedImageUrl = await uploadImageToFirebase(avatar);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.show({ description: "Failed to upload image. Please try again." });
          setLoading(false);
          return;
        }
      }

      // Update profile with all the different field names for compatibility
      await updateProfile(user.uid, {
        displayName,
        username,
        bio,
        avatar: uploadedImageUrl,
        photo_url: uploadedImageUrl,
        profileImage: uploadedImageUrl,
      });
      toast.show({ description: "Profile updated!" });
      navigation.goBack();
    } catch (error) {
      toast.show({ description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToFirebase = async (uri) => {
    try {
      const storage = getStorage();
      const filename = `user_images/${user.uid}_${Date.now()}`;
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType("");
  };

  const handleRequest = () => {
    closeModal();
    navigation.navigate("Feedback");
  };

  return (
      <Box flex={1} bg="white">
        {/* Header */}
        <HStack
          bg="white"
          justifyContent="space-between"
          alignItems="center"
          alignSelf="stretch"
          pt={insets.top}
          px={4}
        >
          <Pressable onPress={() => navigation.goBack()}>
            <Box
              width="48px"
              height="48px"
              justifyContent="center"
              alignItems="center"
            >
              <Ionicons name="chevron-back" size={30} color="black" />
            </Box>
          </Pressable>
          <Text fontSize={20} fontWeight="bold">
            Edit Profile
          </Text>
          <Button
            onPress={handleSave}
            isLoading={loading}
            bg="#836fff"
            _pressed={{ bg: "#6f5ce5" }}
            _text={{ fontWeight: "bold", fontSize: 16, color: "white" }}
          >
            Save
          </Button>
        </HStack>
        <KeyboardAwareScrollView
          contentContainerStyle={{ padding: 16 }}
          extraScrollHeight={100}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Picture */}
          <Box alignSelf="center" mb={4} position="relative" alignItems="center">
            <Avatar
              size="2xl"
              source={avatar ? { uri: avatar } : require("../images/Blankprofile.png")}
            >
              {displayName ? displayName[0].toUpperCase() : "U"}
            </Avatar>
            <Pressable
              position="absolute"
              bottom={0}
              right={0}
              onPress={onOpen}
            >
              <Box bg="#836fff" p={2} borderRadius="full">
                <MaterialIcons name="photo-camera" size={20} color="white" />
              </Box>

            </Pressable>
          </Box>
          <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content>
              <Actionsheet.Item onPress={() => { onClose(); pickImage(); }}>
                Choose from Gallery
              </Actionsheet.Item>
              <Actionsheet.Item onPress={() => { onClose(); takePhoto(); }}>
                Take Photo
              </Actionsheet.Item>
              <Actionsheet.Item onPress={onClose}>Cancel</Actionsheet.Item>
            </Actionsheet.Content>
          </Actionsheet>
          {/* Name */}
          <Box mb={4}>
            <Text fontSize={16} fontWeight="bold" mb={1}>
              Name
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Name"
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 12,
                borderRadius: 10,
                fontSize: 16,
              }}
            />
          </Box>
          {/* Username */}
          <Box mb={4}>
            <Text fontSize={16} fontWeight="bold" mb={1}>
              Username
            </Text>
            <TextInput
              ref={(el) => (inputRefs.current.username = el)}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                borderWidth: 1,
                borderColor: usernameError ? '#EF4444' : '#ccc',
                padding: 12,
                borderRadius: 10,
                fontSize: 16,
              }}
            />
            {usernameError ? (
              <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                {usernameError}
              </Text>
            ) : null}
          </Box>

          {/* Bio */}
          <Box mb={4}>
            <Text fontSize={16} fontWeight="bold" mb={1}>
              Bio
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell others a bit about you..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 12,
                borderRadius: 10,
                fontSize: 16,
                minHeight: 100, // Optional: enforce a larger text area feel
              }}
            />
          </Box>
          {/* Course (disabled) */}
          <Box>
            <Text fontSize={16} fontWeight="bold" mb={1}>
              Course
            </Text>
            <Pressable onPress={() => openModal("course")}>
              <Input
                value={course}
                isReadOnly
                borderRadius={10}
                fontSize={16}
                bg="gray.100"
                color="gray.500"
              />
            </Pressable>
          </Box>
          {/* Year (disabled) */}
          <Box>
            <Text fontSize={16} fontWeight="bold" mb={1}>
              Year
            </Text>
            <Pressable onPress={() => openModal("year")}>
              <Input
                value={year}
                isReadOnly
                borderRadius={10}
                fontSize={16}
                bg="gray.100"
                color="gray.500"
              />
            </Pressable>
          </Box>
        </KeyboardAwareScrollView>
        {/* Modal for Course/Year change request */}
        <Modal isOpen={modalVisible} onClose={closeModal}>
          <Modal.Content>
            <Modal.CloseButton />
            <Modal.Header>Request Change</Modal.Header>
            <Modal.Body>
              <Text>
                To change your {modalType}, please reach out via the Feedback page. We'll review and apply your request as needed.
              </Text>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button variant="ghost" onPress={closeModal}>
                  Cancel
                </Button>
                <Button onPress={handleRequest}>Request</Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </Box>
  );
}
// Helper: implement checkUsernameExists in your firebase/queries.js
// export async function checkUsernameExists(username) {
//   // Query your users collection for the username
// }

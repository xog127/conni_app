import React, { useState, useRef } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  NativeBaseProvider,
  Input,
  Button,
  Modal,
  useToast,
  Avatar,
  Spinner,
} from "native-base";
import { useAuth } from "../services/authContext";
import { updateProfile } from "../firebase/queries";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { checkUsernameExists } from "../firebase/queries"; // You may need to implement this
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
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatar, setAvatar] = useState(user.avatar || null);
  const [course] = useState(user.course || DUMMY_COURSES[0]);
  const [year] = useState(user.year || DUMMY_YEARS[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const inputRefs = useRef({});

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
      await updateProfile(user.uid, {
        displayName,
        username,
        bio,
        avatar,
      });
      toast.show({ description: "Profile updated!" });
      navigation.goBack();
    } catch (error) {
      toast.show({ description: error.message });
    } finally {
      setLoading(false);
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
            variant="ghost"
            onPress={handleSave}
            isLoading={loading}
            _text={{ fontWeight: "bold", fontSize: 16, color: "primary.500" }}
          >
            Save
          </Button>
        </HStack>
        <VStack space={5} p={4}>
          {/* Profile Picture */}
          <Box alignSelf="center" mb={2}>
            <Avatar
              size="2xl"
              source={avatar ? { uri: avatar } : require("../images/Blankprofile.png")}
            >
              {displayName ? displayName[0].toUpperCase() : "U"}
            </Avatar>
            <HStack justifyContent="center" mt={2} space={2}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<MaterialIcons name="photo-library" size={18} color="#3182ce" />}
                onPress={pickImage}
              >
                Gallery
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<MaterialIcons name="photo-camera" size={18} color="#3182ce" />}
                onPress={takePhoto}
              >
                Camera
              </Button>
            </HStack>
          </Box>
          {/* Username */}
          <Box>
            <Text fontSize={16} fontWeight="bold" mb={1}>
              Username
            </Text>
            <Input
              ref={(el) => (inputRefs.current.username = el)}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              fontSize={16}
              autoCapitalize="none"
              autoCorrect={false}
              borderRadius={10}
              isInvalid={!!usernameError}
            />
            {usernameError ? (
              <Text color="red.500" fontSize={12} mt={1}>
                {usernameError}
              </Text>
            ) : null}
          </Box>
          {/* Name */}
          <Box>
            <Text fontSize={16} fontWeight="bold" mb={1}>
              Name
            </Text>
            <Input
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Name"
              fontSize={16}
              borderRadius={10}
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
          {/* Bio */}
          <Box>
            <Text fontSize={16} fontWeight="bold" mb={1}>
              Bio
            </Text>
            <Input
              value={bio}
              onChangeText={setBio}
              placeholder="Bio"
              fontSize={16}
              borderRadius={10}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Box>
        </VStack>
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

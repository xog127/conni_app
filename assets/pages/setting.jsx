import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Text,
  VStack,
  Pressable,
  Button,
  Icon,
  NativeBaseProvider,
  Divider,
  ScrollView,
  Modal,
} from "native-base";
import { getAuth } from "../firebase/firebaseConfig.js";
import { getRef } from "../firebase/queries";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function UserSettingsScreen() {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [policyUrl, setPolicyUrl] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (currentUser) {
          // Fetch the current user's data
          const userData = await getRef({
            id: currentUser.uid, // Use the current user's UID
            collectionName: "users",
          });
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching User references:", error.message);
      }
    };

    fetchUser();
  }, []);

  const openPolicyModal = (url, text) => {
    setPolicyUrl(url);
    setText(text);
    setModalVisible(true);
  };

  const handleOpenBrowser = () => {
    setModalVisible(false);
    Linking.openURL(policyUrl);
  };

  return (
    <NativeBaseProvider>
      <ScrollView flex={1}>
        <Box safeArea p={4} w="full" maxW="md" mx="auto" bg="gray.100">
          {/* Profile Section */}
          <VStack space={4} alignItems="center" mb={4}>
            <Avatar
              size="xl"
              source={
                user?.photo_url
                  ? { uri: user.photo_url }
                  : require("../images/Blankprofile.png")
              }
            />
            <Pressable flexDirection="row" alignItems="center">
              <Text fontSize="lg" fontWeight="bold">
                {user?.first_name} {user?.last_name}
              </Text>
              <Icon as={MaterialIcons} name="edit" size={4} ml={2} />
            </Pressable>
          </VStack>

          {/* Setting Options Wrapped in White Box */}
          <Box bg="white" borderRadius="lg" p={4} shadow={2}>
            <VStack space={3}>
              <Pressable
                p={4}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                borderRadius="md"
                _pressed={{ bg: "coolGray.100" }}
              >
                <Text fontSize="md">Notification</Text>
                <Icon as={MaterialIcons} name="notifications" size={5} />
              </Pressable>
              <Divider />

              <Pressable
                p={4}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                borderRadius="md"
                _pressed={{ bg: "coolGray.100" }}
                onPress={() => navigation.navigate("Feedback")}
              >
                <Text fontSize="md">Give Feedback</Text>
                <Icon as={MaterialIcons} name="feedback" size={5} />
              </Pressable>
              <Divider />

              <Pressable
                p={4}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                borderRadius="md"
                _pressed={{ bg: "coolGray.100" }}
                onPress={() =>
                  openPolicyModal(
                    "https://example.com/privacy-policy",
                    "Privacy Policy"
                  )
                }
              >
                <Text fontSize="md">Privacy Policy</Text>
                <Icon as={MaterialIcons} name="privacy-tip" size={5} />
              </Pressable>
              <Divider />

              <Pressable
                p={4}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                borderRadius="md"
                _pressed={{ bg: "coolGray.100" }}
                onPress={() =>
                  openPolicyModal(
                    "https://example.com/terms-and-conditions",
                    "Terms and Conditions"
                  )
                }
              >
                <Text fontSize="md">Terms and Conditions</Text>
                <Icon as={MaterialIcons} name="gavel" size={5} />
              </Pressable>
            </VStack>
          </Box>

          {/* Logout & Delete Account Wrapped in Another White Box */}
          <Box bg="white" borderRadius="lg" p={4} shadow={2} mt={6}>
            <VStack space={3}>
              <Pressable
                p={4}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                borderRadius="md"
                _pressed={{ bg: "coolGray.100" }}
              >
                <Text color="red.500" fontWeight="bold">
                  Log out
                </Text>
                <Icon
                  as={MaterialIcons}
                  name="logout"
                  size={5}
                  color="red.500"
                />
              </Pressable>
              <Divider />

              <Pressable
                p={4}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                borderRadius="md"
                _pressed={{ bg: "coolGray.100" }}
              >
                <Text color="red.500" fontWeight="bold">
                  Delete account
                </Text>
                <Icon
                  as={MaterialIcons}
                  name="delete"
                  size={5}
                  color="red.500"
                />
              </Pressable>
            </VStack>
          </Box>
        </Box>
      </ScrollView>

      {/* Modal for Privacy Policy & Terms */}
      <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>Continue to {text}</Modal.Header>
          <Modal.Body>
            <Text>The document will open in a browser view.</Text>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onPress={handleOpenBrowser}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </NativeBaseProvider>
  );
}

import React, { useState } from "react";
import { TextInput } from "react-native";
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
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../services/authContext";
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';


export default function UserSettingsScreen({ navigation }) {
  const { logout, user, deleteAccount } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutConfirmationVisible, setLogoutConfirmationVisible] =
    useState(false); // State for logout confirmation modal
  const [
    deleteAccountConfirmationVisible,
    setDeleteAccountConfirmationVisible,
  ] = useState(false); // State for delete account modal

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };
  const handleConfirmDelete = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      await deleteUser(currentUser);
      setPasswordPromptVisible(false);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Delete account error:", error);
      Alert.alert("Error", error.message);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteAccountConfirmationVisible(false); // hide initial modal
    setPasswordPromptVisible(true); // show password prompt
  };
  const [passwordPromptVisible, setPasswordPromptVisible] = useState(false);
  const [password, setPassword] = useState('');
  return (
    <NativeBaseProvider>
      <ScrollView flex={1}>
        <Box safeArea p={4} w="full" maxW="md" mx="auto" bg="gray.100">
          {/* Profile Section */}
          <VStack space={4} alignItems="center" mb={4}>
            <Avatar
              size="xl"
              source={
                user?.photo_url || user?.profileImage || user?.avatar
                  ? { uri: user.photo_url || user.profileImage || user.avatar }
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
                onPress={() => setModalVisible(true)} // Open modal for Privacy Policy
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
                onPress={() => setModalVisible(true)} // Open modal for Terms and Conditions
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
                onPress={() => setLogoutConfirmationVisible(true)} // Show logout confirmation modal
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
                onPress={() => setDeleteAccountConfirmationVisible(true)} // Show delete account confirmation modal
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

      {/* Modal for Logout Confirmation */}
      <Modal
        isOpen={logoutConfirmationVisible}
        onClose={() => setLogoutConfirmationVisible(false)}
      >
        <Modal.Content maxWidth="400px">
          <Modal.Header>Log out</Modal.Header>
          <Modal.Body>
            <Text>You will be redirected to the login page.</Text>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="ghost"
              onPress={() => setLogoutConfirmationVisible(false)}
            >
              Cancel
            </Button>
            <Button colorScheme="blue" onPress={handleLogout}>
              Log out
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
      
      {/* Modal for Delet Account confirmation using password re-enter*/}
      <Modal isOpen={passwordPromptVisible} onClose={() => setPasswordPromptVisible(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>Re-enter Password</Modal.Header>
          <Modal.Body>
            <Text>Enter your password to confirm deletion:</Text>
            <TextInput
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
              style = {{
                borderWidth: 1,
                borderColour: '#ccc',
                padding: 10,
                marginTop: 12,
                borderRadius: 8,
              }}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onPress={() => setPasswordPromptVisible(false)}>
              Cancel
            </Button>
            <Button colorScheme="red" onPress={handleConfirmDelete}>
              Confirm Delete
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>


      {/* Modal for Delete Account Confirmation */}
      <Modal
        isOpen={deleteAccountConfirmationVisible}
        onClose={() => setDeleteAccountConfirmationVisible(false)}
      >
        <Modal.Content maxWidth="400px">
          <Modal.Header>Delete Account</Modal.Header>
          <Modal.Body>
            <Text>
              When you delete your account, all information associated with it
              is permanently removed. This process is irreversible, and you
              won't be able to recover your account or any of the data linked to
              it.
            </Text>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="ghost"
              onPress={() => setDeleteAccountConfirmationVisible(false)}
            >
              Cancel
            </Button>
            <Button colorScheme="red" onPress={handleDeleteAccount}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Modal for Privacy Policy and Terms */}
      <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>Continue to Policy</Modal.Header>
          <Modal.Body>
            <Text>The document will open in a browser view.</Text>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onPress={() => setModalVisible(false)}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </NativeBaseProvider>
  );
}
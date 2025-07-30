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
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../services/authContext";
import { Modal, View, StyleSheet } from "react-native";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";

export default function UserSettingsScreen({ navigation }) {
  const { logout, user, deleteAccount } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutConfirmationVisible, setLogoutConfirmationVisible] =
    useState(false);
  const [
    deleteAccountConfirmationVisible,
    setDeleteAccountConfirmationVisible,
  ] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    navigation.navigate("Login");
    if (!result.success) {
      console.error(result.error);
      try {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          password
        );
        await reauthenticateWithCredential(currentUser, credential);
        await deleteUser(currentUser);
        setPasswordPromptVisible(false);
        navigation.navigate("Login");
      } catch (error) {
        console.error("Delete account error:", error);
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <NativeBaseProvider>
      <ScrollView flex={1}>
        <Box safeArea p={4} w="full" maxW="md" mx="auto" bg="gray.100">
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
                onPress={() => setModalVisible(true)}
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
                onPress={() => setModalVisible(true)}
              >
                <Text fontSize="md">Terms and Conditions</Text>
                <Icon as={MaterialIcons} name="gavel" size={5} />
              </Pressable>
            </VStack>
          </Box>

          <Box bg="white" borderRadius="lg" p={4} shadow={2} mt={6}>
            <VStack space={3}>
              <Pressable
                p={4}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                borderRadius="md"
                _pressed={{ bg: "coolGray.100" }}
                onPress={() => setLogoutConfirmationVisible(true)}
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
                onPress={() => setDeleteAccountConfirmationVisible(true)}
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

      {/* Logout Confirmation Modal */}
      <Modal
        transparent
        visible={logoutConfirmationVisible}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Log out
            </Text>
            <Text>You will be redirected to the login page.</Text>
            <View style={styles.modalButtonGroup}>
              <Button
                variant="ghost"
                onPress={() => setLogoutConfirmationVisible(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="blue" onPress={handleLogout}>
                Log out
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for Delet Account confirmation using password re-enter*/}
      <Modal
        isOpen={passwordPromptVisible}
        onClose={() => setPasswordPromptVisible(false)}
      >
        <Modal.Content maxWidth="400px">
          <Modal.Header>Re-enter Password</Modal.Header>
          <Modal.Body>
            <Text>Enter your password to confirm deletion:</Text>
            <TextInput
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
              style={{
                borderWidth: 1,
                borderColour: "#ccc",
                padding: 10,
                marginTop: 12,
                borderRadius: 8,
              }}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="ghost"
              onPress={() => setPasswordPromptVisible(false)}
            >
              Cancel
            </Button>
            <Button colorScheme="red" onPress={handleConfirmDelete}>
              Confirm Delete
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        transparent
        visible={deleteAccountConfirmationVisible}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Delete Account
            </Text>
            <Text mb={2}>
              Deleting your account will permanently remove all associated data.
              This cannot be undone.
            </Text>
            <View style={styles.modalButtonGroup}>
              <Button
                variant="ghost"
                onPress={() => setDeleteAccountConfirmationVisible(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onPress={handleDeleteAccount}>
                Delete
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Privacy / Terms Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Continue to Policy
            </Text>
            <Text>The document will open in a browser view.</Text>
            <View style={styles.modalButtonGroup}>
              <Button variant="ghost" onPress={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button colorScheme="blue" onPress={() => setModalVisible(false)}>
                Yes
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalButtonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});

import React, { useState } from "react";
import { TextInput } from "react-native";
import {
  Box,
  Text,
  VStack,
  Input,
  TextArea,
  Checkbox,
  Button,
  useToast,
  NativeBaseProvider,
} from "native-base";
import { useAuth } from "../services/authContext"; // optional, to get user
import { submitFeedback } from "../firebase/queries"; // import Firestore function



export default function Feedback() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [receiveBy, setReceiveBy] = useState(["Conni chat", "Email"]);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const { user } = useAuth(); // optional
  

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.show({ description: "Please fill out all fields." });
      return;
    }
    setSubmitting(true);
    try {
      await submitFeedback({
        userId: user?.uid || "anonymous",
        title,
        description,
        receiveBy,
      });
      toast.show({ description: "Thank you for your feedback!" });
      setTitle("");
      setDescription("");
      setReceiveBy(["Conni chat", "Email"]);
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.show({ description: "Error submitting feedback." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <NativeBaseProvider>
      <Box safeArea p={4} w="full" maxW="md" mx="auto">
        <Text fontSize="xl" fontWeight="bold" textAlign="center" mb={4}>
          Feedback
        </Text>

        <VStack space={3}>
          <Box bg="gray.200" p={3} borderRadius="md">
            <TextInput
              placeholder="Title"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />
          </Box>
          <Box bg="gray.200" p={3} borderRadius="md">
            <TextInput
              placeholder="Description"
              style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </Box>
        </VStack>

        <Text fontSize="md" fontWeight="bold" mt={6}>
          Receive answer to:
        </Text>
        <VStack space={2} mt={2}>
          <Checkbox.Group
            value={receiveBy}
            onChange={setReceiveBy}
            accessibilityLabel="Choose how to receive feedback"
          >
            <Checkbox value="Conni chat">Conni chat</Checkbox>
            <Checkbox value="Email">Email</Checkbox>
          </Checkbox.Group>
        </VStack>

        <Button
          mt={8}
          bg="black"
          isLoading={submitting}
          _pressed={{ bg: "gray.700" }}
          onPress={handleSubmit}
          style={{ borderWidth: 1 }}
        >
          Submit
        </Button>
      </Box>
    </NativeBaseProvider>
  );
}
const styles = {
  input: {
    backgroundColor: "grey.200",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
};
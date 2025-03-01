import React, { useState } from "react";
import {
  Box,
  Text,
  VStack,
  Input,
  TextArea,
  Checkbox,
  Button,
  NativeBaseProvider,
} from "native-base";

export default function Feedback() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [receiveBy, setReceiveBy] = useState(["Conni chat", "Email"]);

  return (
    <NativeBaseProvider>
      <Box safeArea p={4} w="full" maxW="md" mx="auto">
        {/* Page Title */}
        <Text fontSize="xl" fontWeight="bold" textAlign="center" mb={4}>
          Feedback
        </Text>

        {/* Title Input */}
        <VStack space={3}>
          <Box bg="gray.200" p={3} borderRadius="md">
            <Input
              placeholder="Title"
              fontSize="md"
              variant="unstyled"
              value={title}
              onChangeText={(text) => setTitle(text)}
            />
          </Box>

          {/* Description Input */}
          <Box bg="gray.200" p={3} borderRadius="md">
            <TextArea
              placeholder="Description"
              fontSize="md"
              variant="unstyled"
              h={24}
              value={description}
              onChangeText={(text) => setDescription(text)}
            />
          </Box>
        </VStack>

        {/* Checkbox Options */}
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

        {/* Submit Button */}
        <Button mt={8} bg="black" _pressed={{ bg: "gray.700" }}>
          Submit
        </Button>
      </Box>
    </NativeBaseProvider>
  );
}

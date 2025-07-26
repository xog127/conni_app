// components/CommentCard.js
import React from "react";
import { Box, Text, HStack, VStack, Icon } from "native-base";
import { Ionicons } from "@expo/vector-icons";

export default function CommentCard({ message, time }) {
  return (
    <Box
      bg="#F9F9F9"
      px="4"
      py="3"
      w="100%"
      borderBottomWidth={1}
      borderColor="#E5E5E5"
    >
      <HStack alignItems="center" space={4}>
        <Icon as={Ionicons} name="chatbubble-outline" size="6" color="black" />
        <VStack flex={1}>
          <Text fontSize="sm" bold color="black">
            {message}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {time}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
}

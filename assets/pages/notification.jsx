import React, { useState } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  NativeBaseProvider,
} from "native-base";
import { useAuth } from "../services/authContext";
import { updateProfile } from "../firebase/queries";
import { Ionicons } from "@expo/vector-icons";
import CommentCard from "../components/notificationcard"; // adjust path if needed

export default function NotificationScreen({ navigation }) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState(user.location);
  const [website, setWebsite] = useState(user.website);
  const [avatar, setAvatar] = useState(user.avatar);

  const handleSave = async () => {
    try {
      await updateProfile(user.uid, {
        displayName,
        bio,
        location,
        website,
        avatar,
      });
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error.message);
    }
  };

  return (
    <Box flex={1} bg="white">
      <HStack
        bg="white"
        justifyContent="space-between"
        alignItems="center"
        alignSelf="stretch"
        pt={"10%"}
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
          Notification
        </Text>
        <Box
          width="48px"
          height="48px"
          justifyContent="center"
          alignItems="center"
        >
          {/* Invisible placeholder */}
          <Ionicons name="chevron-back" size={30} color="white" />
        </Box>
      </HStack>

      <VStack space={1} mt={2}>
        <CommentCard
          message={`Comments on your post ?Trump vs Harris?`}
          time="1 min ago"
        />
        <CommentCard
          message={`Likes on your post ?Trump vs Harris?`}
          time="1 min ago"
        />
        <CommentCard message={`You have unread messages`} time="1 min ago" />
      </VStack>
    </Box>
  );
}

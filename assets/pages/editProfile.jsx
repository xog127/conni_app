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

export default function ProfileEditScreen({ navigation }) {
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
    <NativeBaseProvider>
      <Box>
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
            Edit Profile
          </Text>

          <Box
            width="48px"
            height="48px"
            justifyContent="center"
            alignItems="center"
          >
            <Ionicons name="chevron-back" size={30} color="white" />
          </Box>
        </HStack>
        <VStack space={4} p={4}>
          <Box
            bg="gray.200"
            h={100}
            w={100}
            borderRadius={50}
            justifyContent="center"
            alignItems="center"
          >
            <Text>Avatar</Text>
          </Box>
          <Text fontSize={20} fontWeight="bold">
            Display Name
          </Text>
          <Text>{displayName}</Text>
          <Text fontSize={20} fontWeight="bold">
            Bio
          </Text>
          <Text>{bio}</Text>
          <Text fontSize={20} fontWeight="bold">
            Location
          </Text>
          <Text>{location}</Text>
          <Text fontSize={20} fontWeight="bold">
            Website
          </Text>
          <Text>{website}</Text>
        </VStack>
      </Box>
    </NativeBaseProvider>
  );
}

import React, { useState, useEffect } from "react";
import { Box, Text, Icon, HStack, VStack, Pressable } from "native-base";
import { fetchReferenceData } from "../firebase/queries";
import { Image } from "expo-image";

const postuserinfo = ({ userRef, anonymous, date_posted }) => {
  const [postUser, setPostUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await fetchReferenceData(userRef);
        if (data) {
          setPostUser(data);
        } else {
          setPostUser(null);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userRef]);
  if (loading) {
    return <Text>Loading...</Text>;
  }

  let userImage;
  let userName;

  if (postUser === null) {
    userImage = require("../images/Blankprofile.png");
    userName = "[Deleted User]";
  } else if (anonymous) {
    userImage = require("../images/Blankprofile.png");
    userName = postUser?.display_name;
  } else {
    userImage = postUser?.photo_url
      ? { uri: postUser.photo_url }
      : require("../images/Blankprofile.png");
    userName = `${postUser.first_name} ${postUser.last_name}`;
  }

  return (
    <HStack alignItems="center" mb={2}>
      <Image
        source={userImage}
        style={{ width: 40, height: 40, borderRadius: 20 }}
      />
      <VStack ml={3}>
        <Text fontSize="14" fontWeight="500">
          {userName}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {date_posted}
        </Text>
      </VStack>
    </HStack>
  );
};

export default postuserinfo;

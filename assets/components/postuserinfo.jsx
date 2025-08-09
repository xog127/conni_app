import React, { useState, useEffect } from "react";
import { Box, Text, HStack, VStack, Pressable, Icon } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { fetchReferenceData } from "../firebase/queries";
import { Image } from "expo-image";

const postuserinfo = ({ userRef, anonymous, date_posted, forumRef, onMorePress }) => {
  const [postUser, setPostUser] = useState(null);
  const [forum, setForum] = useState(null);
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

    const forumData = async () => {
      try {
        const data = await fetchReferenceData(forumRef);
        if (data) {
          setForum(data);
        } else {
          setForum(null);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    forumData();
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
    userName = `${postUser?.course} ${postUser?.graduation_year}`;
  } else {
    userImage = postUser?.photo_url
      ? { uri: postUser.photo_url }
      : require("../images/Blankprofile.png");
    userName = `${postUser.first_name} ${postUser.last_name}`;
  }

  return (
    <HStack justifyContent="space-between" alignItems="center" mb={2}>
      <Box flexGrow={1}>
        <HStack alignItems="center" mb={2}>
          <Image
            source={userImage}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
          <VStack ml={3}>
            <Text
              fontSize="14px"
              color="#464A4D"
              fontWeight="500"
              font="normal"
              lineHeight="16px"
              letterSpacing="0.5px"
            >
              {userName}
            </Text>
            <Text
              fontSize="12px"
              color="#757B80"
              fontWeight="500"
              font="normal"
              lineHeight="16px"
              letterSpacing="0.5px"
            >
              {date_posted}
            </Text>
          </VStack>
        </HStack>
      </Box>
      
      {/* Replace forum name box with report button */}
      <Pressable
        onPress={onMorePress}
        p={2}
        borderRadius="full"
        _pressed={{
          bg: "gray.100"
        }}
      >
        <Icon 
          as={Ionicons} 
          name="ellipsis-vertical" 
          size={5} 
          color="gray.500" 
        />
      </Pressable>
    </HStack>
  );
};

export default postuserinfo;
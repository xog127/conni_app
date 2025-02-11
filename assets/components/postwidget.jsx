import React, { useState, useEffect } from "react";
import { Box, Text, Icon, HStack, VStack, Pressable } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { getRef, fetchReferenceData } from "../firebase/queries";
import { Image } from "expo-image";
import { NativeModules } from "react-native";
import PostUserInfo from "./postuserinfo.jsx";

const postwidget = ({ postRef }) => {
  const [post, setPost] = useState(null);
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postData = await getRef({ id: postRef, collectionName: "posts" });
        setPost(postData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postRef]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box bg="white" shadow={1} p={4}>
      <PostUserInfo
        userRef={post?.post_user}
        anonymous={post?.anonymous}
        date_posted={"Today"}
      />
      <Text fontSize="sm" mb={2} fontWeight="bold">
        {post?.post_title}
      </Text>
      <Text fontSize="sm" color="gray.700">
        {post?.post_data}
      </Text>
      {post?.post_photo && (
        <Image
          source={{ uri: post?.post_photo }}
          style={{
            alignSelf: "center",
            width: "100%",
            height: undefined,
            aspectRatio: 1,
          }}
          contentFit="contain"
          contentPosition="center"
        />
      )}
      <HStack justifyContent="space-between" mt={3} alignItems="center">
        <HStack alignItems="center">
          <Pressable>
            <HStack alignItems="center">
              <Icon
                as={Ionicons}
                name="heart-outline"
                size={5}
                color="red.500"
              />
              <Text fontSize="xs" color="gray.700" ml={1}>
                {post?.num_likes}
              </Text>
            </HStack>
          </Pressable>
          <Pressable ml={4}>
            <HStack alignItems="center">
              <Icon
                as={Ionicons}
                name="chatbubble-outline"
                size={5}
                color="purple.500"
              />
              <Text fontSize="xs" color="gray.700" ml={1}>
                {post?.num_comments}
              </Text>
            </HStack>
          </Pressable>
          <Pressable ml={4}>
            <HStack alignItems="center">
              <Icon
                as={Ionicons}
                name="eye-outline"
                size={5}
                color="blue.500"
              />
              <Text fontSize="xs" color="gray.700" ml={1}>
                {post?.views}
              </Text>
            </HStack>
          </Pressable>
        </HStack>
        <Icon as={Ionicons} name="earth-outline" size={5} color="green.500" />
      </HStack>
    </Box>
  );
};

export default React.memo(postwidget);

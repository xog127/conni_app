import React, { useState, useEffect } from "react";
import { Box, Text, HStack, Pressable, VStack } from "native-base";
import { Image } from "expo-image";
import { getRef } from "../firebase/queries";

const MarketPreview = ({ postRef, navigation }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postData = await getRef({ id: postRef, collectionName: "posts" });
        setPost(postData);
      } catch (error) {
        console.error("Error fetching post:", error);
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
    <Pressable
      onPress={() =>
        navigation.navigate("PostDisplay", { postRef, navigation })
      }
    >
      <Box position="relative" width="169px" height="169px">
        {/* Image */}
        {post?.post_photo && (
          <Image
            source={{ uri: post.post_photo }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 10,
            }}
            contentFit="cover"
          />
        )}

        {/* Overlay Box for Price & Item */}
        {post?.req && (
          <VStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="rgba(0,0,0,0.6)" // Semi-transparent background
            p={2}
            borderBottomRadius={10}
          >
            <Text color="white" fontWeight="bold" fontSize="md">
              {post.req.Item}
            </Text>
            <Text color="yellow.400" fontWeight="bold" fontSize="lg">
              {post.req.Price}
            </Text>
          </VStack>
        )}
      </Box>
    </Pressable>
  );
};

export default React.memo(MarketPreview);

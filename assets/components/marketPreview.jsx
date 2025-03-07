import React, { useState, useEffect } from "react";
import { Box, Text, HStack, Pressable, VStack } from "native-base";
import { Image } from "expo-image";
import { getRef, fetchReferenceData } from "../firebase/queries";

const MarketPreview = ({ postRef, navigation }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postData = await getRef({ id: postRef, collectionName: "posts" });
        setPost(postData);

        setRelativeTime(timeAgo(postData.time_posted));
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
    <Pressable
      onPress={() =>
        navigation.navigate("PostDisplay", { postRef, navigation })
      }
    >
      <Box>
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
      </Box>
    </Pressable>
  );
};

export default React.memo(MarketPreview);

import React from "react";
import { Box, Text, HStack, Pressable, VStack } from "native-base";
import { Image } from "expo-image";
import PostUserInfo from "./postuserinfo.jsx";
import HeartIcon from "../customIcon/HeartIcon.js";
import CommentIcon from "../customIcon/CommentIcon.js";
import ViewIcon from "../customIcon/ViewIcon.js";
import { timeAgo } from "../customFunctions/time.js";
import { StyleSheet, View } from "react-native";
import ForumDetails from "../components/ForumDetails";

// Convert timestamp to relative time
const getTimeAgo = (timestamp) => {
  if (!timestamp) return "Just now";

  // If it's a Firebase timestamp
  if (timestamp.seconds) {
    return timeAgo(timestamp);
  }

  // If it's already in milliseconds
  if (typeof timestamp === "number") {
    return timeAgo({ seconds: Math.floor(timestamp / 1000) });
  }

  return "Just now";
};

const PostCard = ({ item, navigation, onReport }) => {
  const handleReport = () => {
    if (onReport) {
      onReport(); // This calls the parent with the specific post ID
    }
  };
    if (!item) return null;

  return (
    <Pressable
      onPress={() =>
        navigation?.navigate("PostDisplay", { postRef: item.id, navigation })}
        accessible={true}
        accessibilityLabel={`Post titled ${item?.post_title}`}
        accessibilityRole="button"
    >
      <Box
        bg="white"
        shadow={1}
        p={4}
        borderTopWidth={2}
        borderTopColor="#F6F6F6"
      >
        <PostUserInfo
          userRef={item?.post_user}
          anonymous={item?.anonymous}
          date_posted={getTimeAgo(item?.time_posted)}
          forumRef={item?.post_genre_ref}
          onMorePress = {handleReport}
        />

        <Text
          isTruncated
          maxW="1000"
          fontSize="18px"
          mb={1}
          lineHeight="24px"
          fontWeight="500"
        >
          {item?.post_title || "Untitled Post"}
        </Text>

        <Text noOfLines={8} fontSize="14px" lineHeight="20px" color="gray.700">
          {item?.post_data || "No content"}
        </Text>

        {item?.forum_details &&
          item?.forum_type &&
          item.forum_type !== "General" && (
            <Box mt={2}>
              <ForumDetails
                forumType={item.forum_type}
                forumDetails={item.forum_details}
              />
            </Box>
          )}

        {item?.post_photo && (
          <Box mt={4}>
            <Image
              source={{ uri: item.post_photo }}
              style={{
                width: "100%",
                height: 300,
                borderRadius: 8,
              }}
              contentFit="cover"
              transition={200}
              placeholder = "Loading..."
            />
          </Box>
        )}

        <HStack justifyContent="space-between" mt={2} alignItems="center" padding = {2}>
          <HStack alignItems="center">
            <Pressable>
              <HStack alignItems="center">
                <HeartIcon size={24} color="#FF5963" />
                <Text fontSize="xs" color="gray.700" ml={2}>
                  {item?.num_likes || 0}
                </Text>
              </HStack>
            </Pressable>
            <Pressable ml={4}>
              <HStack alignItems="center">
                <CommentIcon size={24} color="#464A4D" />
                <Text fontSize="xs" color="gray.700" ml={2}>
                  {item?.num_comments || 0}
                </Text>
              </HStack>
            </Pressable>
            <Pressable ml={4}>
              <HStack alignItems="center">
                <ViewIcon size={24} color="#464A4D" />
                <Text fontSize="xs" color="gray.700" ml={2}>
                  {item?.views || 0}
                </Text>
              </HStack>
            </Pressable>
          </HStack>
        </HStack>
      </Box>
    </Pressable>
  );
};
export default PostCard;

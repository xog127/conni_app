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

const PostCard = ({ item, navigation }) => {
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

  if (!item) return null;

  return (
    <Pressable
      onPress={() =>
        navigation?.navigate("PostDisplay", { postRef: item.id, navigation })
      }
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
        />

        <Text
          isTruncated
          maxW="1000"
          fontSize="16px"
          mb={1}
          lineHeight="24px"
          fontWeight="500"
        >
          {item?.post_title || "Untitled Post"}
        </Text>

        <Text noOfLines={4} fontSize="sm" color="gray.700">
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
            />
          </Box>
        )}

        <HStack justifyContent="space-between" mt={2} alignItems="center">
          <HStack alignItems="center">
            <Pressable>
              <HStack alignItems="center">
                <HeartIcon size={20} color="#FF5963" />
                <Text fontSize="xs" color="gray.700" ml={1}>
                  {item?.num_likes || 0}
                </Text>
              </HStack>
            </Pressable>
            <Pressable ml={4}>
              <HStack alignItems="center">
                <CommentIcon size={20} color="#464A4D" />
                <Text fontSize="xs" color="gray.700" ml={1}>
                  {item?.num_comments || 0}
                </Text>
              </HStack>
            </Pressable>
            <Pressable ml={4}>
              <HStack alignItems="center">
                <ViewIcon size={20} color="#464A4D" />
                <Text fontSize="xs" color="gray.700" ml={1}>
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

const styles = StyleSheet.create({
  emphasis: {
    fontWeight: "600",
    color: "#836fff",
    fontSize: 14,
  },
  emphasisContainer: {
    marginBottom: 10,
  },
  detailLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  labelContainer: {
    width: 100, // Fixed width for labels
    marginRight: 8,
  },
  detailLabel: {
    color: "#666",
    fontWeight: "500",
    fontSize: 14,
  },
  detailValue: {
    color: "#333",
    fontSize: 14,
    flex: 1,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  skillChip: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  skillChipText: {
    fontSize: 12,
    color: "#666",
  },
  forumDetailsBox: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
});

export default PostCard;

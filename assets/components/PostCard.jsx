import React from "react";
import { Box, Text, HStack, Pressable, VStack } from "native-base";
import { Image } from "expo-image";
import PostUserInfo from "./postuserinfo.jsx";
import HeartIcon from "../customIcon/HeartIcon.js";
import CommentIcon from "../customIcon/CommentIcon.js";
import ViewIcon from "../customIcon/ViewIcon.js";
import { timeAgo } from "../customFunctions/time.js";

const PostCard = ({ item, navigation }) => {
  // Convert timestamp to milliseconds for timeAgo function
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    if (timestamp.seconds) {
      return timeAgo(timestamp.seconds * 1000);
    }
    return timeAgo(timestamp);
  };

  const renderForumDetails = () => {
    if (!item.requirements) return null;

    return (
      <VStack space={2} mt={2}>
        {Object.entries(item.requirements).map(([key, value]) => {
          // Skip empty values
          if (!value) return null;

          // Format date values
          let displayValue = value;
          if (value instanceof Date || (typeof value === 'string' && value.includes('T'))) {
            displayValue = new Date(value).toISOString().split('T')[0];
          }

          return (
            <HStack key={key} space={2} alignItems="center">
              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                {key}:
              </Text>
              <Text fontSize="sm" color="gray.700">
                {displayValue}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    );
  };

  return (
    <Pressable
      onPress={() =>
        navigation.navigate("PostDisplay", { postRef: item.id, navigation })
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
          userRef={item.post_user}
          anonymous={item.anonymous}

          date_posted={getTimeAgo(item.time_posted)}

          forumRef={item.post_genre_ref}
        />

        <Text
          isTruncated
          maxW="1000"
          fontSize="16px"
          mb={1}
          lineHeight="24px"
          fontWeight="500"
        >
          {item.post_title}
        </Text>

        <Text noOfLines={4} fontSize="sm" color="gray.700">
          {item.post_data}
        </Text>

        {item.requirements && item.forum?.name !== "General" && (
          <VStack
            mt={2}
            p="12px"
            bg="gray.100"
            borderRadius="16px"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            space="10px"
          >
            {renderForumDetails()}
          </VStack>
        )}


        {item.image && (
          <Image
            source={{ uri: item.image }}
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

        <HStack justifyContent="space-between" mt={2} alignItems="center">
          <HStack alignItems="center">
            <Pressable>
              <HStack alignItems="center">
                <HeartIcon size={20} color="#FF5963" />
                <Text fontSize="xs" color="gray.700" ml={1}>
                  {item.likes?.length || 0}
                </Text>
              </HStack>
            </Pressable>
            <Pressable ml={4}>
              <HStack alignItems="center">
                <CommentIcon size={20} color="#464A4D" />
                <Text fontSize="xs" color="gray.700" ml={1}>
                  {item.num_comments || 0}
                </Text>
              </HStack>
            </Pressable>
            <Pressable ml={4}>
              <HStack alignItems="center">
                <ViewIcon size={20} color="#464A4D" />
                <Text fontSize="xs" color="gray.700" ml={1}>
                  {item.views || 0}
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

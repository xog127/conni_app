import React from "react";
import { Box, Text, HStack, Pressable, VStack, Image } from "native-base";
import PostUserInfo from "./postuserinfo.jsx";
import HeartIcon from "../customIcon/HeartIcon.js";
import CommentIcon from "../customIcon/CommentIcon.js";
import ViewIcon from "../customIcon/ViewIcon.js";
import { timeAgo } from "../customFunctions/time.js";

const PostCard = ({ item, navigation }) => {
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
          date_posted={
            item.time_posted ? timeAgo(item.time_posted) : "Just now"
          }
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
            {Object.entries(item.requirements)
              .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
              .map(([key, value]) => (
                <HStack key={key} flex={1}>
                  <Box minWidth="80px">
                    <Text
                      fontSize="14px"
                      color="#65686B"
                      fontWeight="500"
                      lineHeight="21px"
                      letterSpacing="0.5px"
                      style={{
                        fontStyle: "normal",
                        width: "60px",
                      }}
                    >
                      {key}
                    </Text>
                  </Box>
                  <HStack space="10px" flexWrap="wrap">
                    {Array.isArray(value) ? (
                      value.map((item, index) => (
                        <Box
                          key={index}
                          px="12px"
                          py="6px"
                          bg="gray.200"
                          borderRadius="full"
                        >
                          <Text
                            fontSize="12px"
                            color="#383C3F"
                            fontWeight="500"
                            lineHeight="21px"
                            letterSpacing="0.5px"
                            style={{
                              fontStyle: "normal",
                            }}
                          >
                            {item}
                          </Text>
                        </Box>
                      ))
                    ) : (
                      <Text
                        fontSize="12px"
                        color="#383C3F"
                        fontWeight="500"
                        lineHeight="21px"
                        letterSpacing="0.5px"
                        style={{
                          fontStyle: "normal",
                        }}
                      >
                        {value}
                      </Text>
                    )}
                  </HStack>
                </HStack>
              ))}
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

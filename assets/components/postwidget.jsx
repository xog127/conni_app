import React, { useState, useEffect } from "react";
import { Box, Text, HStack, Pressable, VStack } from "native-base";
import { Image } from "expo-image";
import PostUserInfo from "./postuserinfo.jsx";
import { timeAgo } from "../customFunctions/time.js";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import HeartIcon from "../customIcon/HeartIcon.js";
import CommentIcon from "../customIcon/CommentIcon.js";
import ViewIcon from "../customIcon/ViewIcon.js";
import { getRef, fetchReferenceData } from "../firebase/queries";

const PostWidget = ({ postRef, navigation }) => {
  const [post, setPost] = useState(null);
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relativeTime, setRelativeTime] = useState("");

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postData = await getRef({ id: postRef, collectionName: "posts" });
        setPost(postData);
        if (postData?.post_genre_ref) {
          const genreData = await fetchReferenceData(postData.post_genre_ref);
          setGenre(genreData);
        }
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
    <SafeAreaProvider>
      <SafeAreaView>
        <Pressable
          onPress={() =>
            navigation.navigate("PostDisplay", { postRef, navigation })
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
              userRef={post?.post_user}
              anonymous={post?.anonymous}
              date_posted={relativeTime}
              forumRef={post?.post_genre_ref}
            />

            <Text
              isTruncated
              maxW="1000"
              fontSize="16px"
              mb={1}
              lineHeight="24px"
              fontWeight="500"
            >
              {post?.post_title}
            </Text>

            <Text noOfLines={4} fontSize="sm" color="gray.700">
              {post?.post_data}
            </Text>

            {post?.req && (
              <VStack
                mt={2}
                p="12px"
                bg="gray.100"
                borderRadius="16px"
                flexDirection="column"
                justifyContent="center"
                alignItems="flex-start"
                space="10px" // NativeBase equivalent of gap
              >
                {Object.entries(post.req)
                  .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                  .map(([key, value]) => (
                    <HStack key={key} flex={1}>
                      <Box minWidth="80px">
                        <Text
                          fontSize="14px"
                          color="#65686B"
                          fontWeight="500"
                          lineHeight="21px" // Fixed lineHeight equivalent to 150% of 14px
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
                                lineHeight="21px" // Fixed lineHeight equivalent to 150% of 14px
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
                            lineHeight="21px" // Fixed lineHeight equivalent to 150% of 14px
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

            <HStack justifyContent="space-between" mt={2} alignItems="center">
              <HStack alignItems="center">
                <Pressable>
                  <HStack alignItems="center">
                    <HeartIcon size={20} color="#FF5963" />
                    <Text fontSize="xs" color="gray.700" ml={1}>
                      {post?.num_likes}
                    </Text>
                  </HStack>
                </Pressable>
                <Pressable ml={4}>
                  <HStack alignItems="center">
                    <CommentIcon size={20} color="#464A4D" />
                    <Text fontSize="xs" color="gray.700" ml={1}>
                      {post?.num_comments}
                    </Text>
                  </HStack>
                </Pressable>
                <Pressable ml={4}>
                  <HStack alignItems="center">
                    <ViewIcon size={20} color="#464A4D" />
                    <Text fontSize="xs" color="gray.700" ml={1}>
                      {post?.views}
                    </Text>
                  </HStack>
                </Pressable>
              </HStack>
            </HStack>
          </Box>
        </Pressable>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default React.memo(PostWidget);

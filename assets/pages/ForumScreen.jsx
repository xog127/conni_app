import React, { useEffect, useState } from "react";
import { Box, Text, Icon, HStack, VStack, Pressable } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import PostPreviews from "../components/postPreviews";
import { getAnyCollection, getRef } from "../firebase/queries";
import { AnimatePresence, MotiView } from "moti";
import { NativeBaseProvider } from "native-base";

export default function ForumScreen({ route, navigation }) {
  const { genreref } = route.params;
  const [isOpen, setIsOpen] = useState(false);
  const [genre, setGenre] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Latest");
  const options = ["Latest", "Most Liked", "Most Commented", "Most Viewed"];
  const [postRefs, setPostRefs] = useState([]);

  const filterPostsByGenre = (posts, genreRef) => {
    const filteredPosts = posts.filter((post) => {
      // Ensure post_genre_ref exists and has an id before filtering
      if (post.post_genre_ref) {
        const genreRefId = post.post_genre_ref.id || post.post_genre_ref.path;

        // Only include posts that match the genreRef AND have a post_photo
        return genreRefId === genreRef;
      }

      // If post_genre_ref doesn't exist OR there's no post_photo, exclude it
      return false;
    });

    return filteredPosts;
  };

  useEffect(() => {
    const fetchPostRefs = async () => {
      try {
        const genreData = await getRef({
          id: genreref,
          collectionName: "genres",
        });
        setGenre(genreData);
        const posts = await getAnyCollection("posts");
        const filteredPosts = filterPostsByGenre(posts, genreref);
        setPostRefs(
          filteredPosts.sort((a, b) => b.time_posted - a.time_posted)
        );
      } catch (error) {
        console.error("Error fetching post references:", error.message);
      }
    };
    fetchPostRefs();
  }, [genreref]);

  const renderHeader = () => (
    <Box>
      <Box bg="gray.200" py={2} px={4} borderRadius="md" position="relative">
        <Pressable onPress={() => setIsOpen(!isOpen)}>
          <HStack
            justifyContent="flex-end"
            alignItems="center"
            space={4}
            height="20px"
          >
            <Text fontSize="md" fontWeight="bold">
              {selectedOption}
            </Text>
            <Icon
              as={Ionicons}
              name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}
              size={6}
              color="gray.600"
            />
          </HStack>
        </Pressable>
        <AnimatePresence>
          {isOpen && (
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -10 }}
              transition={{ type: "timing", duration: 300 }}
              style={{
                position: "absolute",
                top: 40, // Positioning the dropdown below
                right: 10,
                zIndex: 10,
              }}
            >
              <VStack
                bg="gray.200" // Apply the background color directly from NativeBase
                borderRadius="8"
                width={140}
              >
                {options.map((option, index) => (
                  <Pressable
                    key={index}
                    py={2}
                    px={3}
                    onPress={() => {
                      setSelectedOption(option);
                      setIsOpen(false);
                    }}
                    _pressed={{ bg: "gray.600" }}
                  >
                    <Text fontSize="sm">{option}</Text>
                  </Pressable>
                ))}
              </VStack>
            </MotiView>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );

  return (
    <NativeBaseProvider>
      <HStack
        bg="white"
        justifyContent="space-between"
        alignItems="center"
        alignSelf="stretch"
        pt={"10%"}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Box
            width="48px"
            height="48px"
            justifyContent="center"
            alignItems="center"
          >
            <Ionicons name="chevron-back" size={30} color="black" />
          </Box>
        </Pressable>
        <Text fontSize={20} fontWeight="bold">
          {genre?.name}
        </Text>

        <Box
          width="48px"
          height="48px"
          justifyContent="center"
          alignItems="center"
        >
          <Ionicons name="chevron-back" size={30} color="white" />
        </Box>
      </HStack>
      <PostPreviews
        data={postRefs}
        renderHeader={renderHeader}
        navigation={navigation}
      />
    </NativeBaseProvider>
  );
}

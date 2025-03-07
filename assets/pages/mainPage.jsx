import React, { useEffect, useState, useCallback } from "react";
import {
  NativeBaseProvider,
  Box,
  Icon,
  FlatList,
  HStack,
  Pressable,
  Spacer,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import PostWidget from "../components/postwidget";
import MarketPreview from "../components/marketPreview";
import { getAnyCollection } from "../firebase/queries";
import ConniIcon from "../customIcon/ConniIcon";

export default function MainPage({ navigation }) {
  const [postRefs, setPostRefs] = useState([]);
  const [MakretRefs, setMarketRefs] = useState([]);
  const genreRef = "QNywRjCYSwAi4TuLkzbh";
  // Filter function that filters posts by 'post_genre_ref'

  const filterPostsByGenre = (posts, genreRef) => {
    const filteredPosts = posts.filter((post) => {
      // Ensure post_genre_ref exists and has an id before logging
      if (post.post_genre_ref) {
        const genreRefId = post.post_genre_ref.id || post.post_genre_ref.path; // Fallback to path if id is missing

        // Only filter posts where post_genre_ref is valid and matches genreRef
        return genreRefId === genreRef;
      }

      // If post_genre_ref doesn't exist, we don't want to include this post
      return false;
    });

    console.log(
      `Fetched ${filteredPosts.length} posts with genreRef: ${genreRef}`
    );
    return filteredPosts;
  };

  useEffect(() => {
    const fetchPostRefs = async () => {
      try {
        const posts = await getAnyCollection("posts");
        const filteredPosts = filterPostsByGenre(posts, genreRef);
        setMarketRefs(filteredPosts);
        setPostRefs(posts.sort((a, b) => b.time_posted - a.time_posted));
      } catch (error) {
        console.error("Error fetching post references:", error.message);
      }
    };

    fetchPostRefs();
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <PostWidget key={item.id} postRef={item.id} navigation={navigation} />
    ),
    [navigation]
  );

  const renderHeader = () => (
    <Box
      bg="white"
      h={100}
      justifyContent="space-between"
      alignItems="center"
      flexDirection="row"
      px={4}
      pt={"10%"}
    >
      <HStack flex={1} alignItems="center" justifyContent="space-between">
        {/* Left section */}
        <HStack space={4} alignItems="center">
          {/* Add Pressable to open the drawer */}
          <Pressable onPress={() => navigation.openDrawer()}>
            <Icon as={Ionicons} name="menu" size={7} color="black" />
          </Pressable>
          <Icon as={Ionicons} name="notifications" size={7} color="white" />
        </HStack>
        {/* Centered ConniIcon */}
        <Spacer />
        <ConniIcon name="logo" size={56} />
        <Spacer />
        {/* Right section */}
        <HStack space={4} alignItems="center">
          <Pressable>
            <Icon
              as={Ionicons}
              name="notifications"
              size={7}
              color="gray.500"
            />
          </Pressable>
          <Pressable>
            <Icon as={Ionicons} name="search" size={7} color="gray.500" />
          </Pressable>
        </HStack>
      </HStack>
      <HStack>
        {MakretRefs.map((post) => (
          <MarketPreview
            key={post.id}
            postRef={post.id}
            navigation={navigation}
          />
        ))}
      </HStack>
    </Box>
  );

  return (
    <NativeBaseProvider>
      <Box flex={1} bg="white">
        {/* Posts List with scrollable header */}
        <FlatList
          data={postRefs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader} // Header is now part of scrollable content
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </Box>
    </NativeBaseProvider>
  );
}

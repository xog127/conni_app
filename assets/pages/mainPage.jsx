import React, { useEffect, useState, useCallback } from "react";
import { Box, Icon, HStack, Pressable, Spacer, Spinner, Center } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { getAnyCollection } from "../firebase/queries";
import ConniIcon from "../customIcon/ConniIcon";
import PostPreviews from "../components/postPreviews";

// Number of posts to load per batch
const POSTS_PER_LOAD = 10;

export default function MainPage({ navigation }) {
  const [postRefs, setPostRefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        setLoading(true);
        const posts = await getAnyCollection("posts");
        // Sort posts by time_posted in descending order (newest first)
        const sortedPosts = posts.sort((a, b) => b.time_posted - a.time_posted);
        setAllPosts(sortedPosts);
        
        // Load only the first batch
        const initialPosts = sortedPosts.slice(0, POSTS_PER_LOAD);
        setPostRefs(initialPosts);
        setCurrentIndex(POSTS_PER_LOAD);
      } catch (error) {
        console.error("Error fetching post references:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, []);

  const loadMorePosts = useCallback(() => {
    // Don't load more if already loading or if we've loaded all posts
    if (loadingMore || currentIndex >= allPosts.length) return;
    
    setLoadingMore(true);
    console.log("Loading more posts...");
    
    // Simulate network delay to show loading indicator
    setTimeout(() => {
      // Get the next batch of posts
      const nextBatch = allPosts.slice(
        currentIndex, 
        currentIndex + POSTS_PER_LOAD
      );
      
      // Update state
      setPostRefs(prevPosts => [...prevPosts, ...nextBatch]);
      setCurrentIndex(prevIndex => prevIndex + POSTS_PER_LOAD);
      setLoadingMore(false);
      
      console.log(`Loaded ${nextBatch.length} more posts`);
    }, 500); // Small delay to make loading visible
  }, [allPosts, currentIndex, loadingMore]);

  const renderHeader = () => (
    <Box>
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
      </Box>
    </Box>
  );

  const renderFooter = () => {
    if (currentIndex >= allPosts.length) return null;
    
    return (
      <Center py={4}>
        {loadingMore ? (
          <Spinner size="sm" color="#836FFF" />
        ) : null}
      </Center>
    );
  };

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="white">
        <Spinner size="lg" color="#836FFF" />
      </Box>
    );
  }

  return (
    <PostPreviews
      data={postRefs}
      renderHeader={renderHeader}
      renderFooter={renderFooter}
      navigation={navigation}
      isMarketView={true}
      onEndReached={loadMorePosts}
      onEndReachedThreshold={0.5}
    />
  );
}
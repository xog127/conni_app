import React, { useEffect, useState, useCallback } from "react";
import { Box, Text, Icon, HStack, VStack, Pressable, Spinner, Center } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import PostPreviews from "../components/postPreviews";
import { getAnyCollection, getRef } from "../firebase/queries";
import { AnimatePresence, MotiView } from "moti";
import { NativeBaseProvider } from "native-base";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

export default function ForumScreen({ route, navigation }) {
  const { genreref } = route.params;
  const [isOpen, setIsOpen] = useState(false);
  const [genre, setGenre] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Latest");
  const options = ["Latest", "Most Liked", "Most Commented", "Most Viewed"];
  const [postRefs, setPostRefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const POSTS_PER_LOAD = 10;

  const filterPostsByGenre = (posts, genreRef) => {
    const filteredPosts = posts.filter((post) => {
      if (post.post_genre_ref) {
        const genreRefId = post.post_genre_ref.id || post.post_genre_ref.path;
        return genreRefId === genreRef;
      }
      return false;
    });
    return filteredPosts;
  };

  useEffect(() => {
    const fetchPostRefs = async () => {
      try {
        setLoading(true);
        const genreData = await getRef({
          id: genreref,
          collectionName: "genres",
        });
        setGenre(genreData);
        const posts = await getAnyCollection("posts");
        const filteredPosts = filterPostsByGenre(posts, genreref);
        const sortedPosts = filteredPosts.sort((a, b) => b.time_posted - a.time_posted);
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
    fetchPostRefs();
  }, [genreref]);

  const loadMorePosts = useCallback(() => {
    if (loadingMore || currentIndex >= allPosts.length) return;
    
    setLoadingMore(true);
    
    setTimeout(() => {
      const nextBatch = allPosts.slice(
        currentIndex, 
        currentIndex + POSTS_PER_LOAD
      );
      
      setPostRefs(prevPosts => [...prevPosts, ...nextBatch]);
      setCurrentIndex(prevIndex => prevIndex + POSTS_PER_LOAD);
      setLoadingMore(false);
    }, 500);
  }, [allPosts, currentIndex, loadingMore]);

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
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Center flex={1}>
          <Spinner size="lg" color="#836FFF" />
        </Center>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Box flex={1}>
        <HStack 
          px={4} 
          py={3} 
          alignItems="center" 
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="gray.200"
        >
          <Pressable onPress={() => navigation.goBack()}>
            <Icon as={Ionicons} name="arrow-back" size={6} color="black" />
          </Pressable>
          <Text fontSize="lg" fontWeight="bold">
            {genre?.name || "Forum"}
          </Text>
          <Box w={6} /> {/* Spacer for alignment */}
        </HStack>

        <PostPreviews
          data={postRefs}
          navigation={navigation}
          isMarketView={false}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          renderFooter={renderFooter}
        />
      </Box>
    </SafeAreaView>
  );
}

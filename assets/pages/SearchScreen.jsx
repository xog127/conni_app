import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Text,
  Input,
  HStack,
  Pressable,
  VStack,
  Divider,
  Spinner,
  Center,
} from "native-base";
import { ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAnyCollection } from "../firebase/queries";
import PostPreviews from "../components/postPreviews";

// Number of posts to load per batch
const POSTS_PER_LOAD = 10;

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const searchInputRef = useRef(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentIndex(0); // Reset pagination when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [postsData, forumsData] = await Promise.all([
          getAnyCollection("posts"),
          getAnyCollection("genres"),
        ]);

        // Sort posts by time_posted in descending order
        const sortedPosts = postsData.sort(
          (a, b) => b.time_posted - a.time_posted
        );
        setAllPosts(sortedPosts);

        // Load only the first batch
        const initialPosts = sortedPosts.slice(0, POSTS_PER_LOAD);
        setFilteredPosts(initialPosts);
        setCurrentIndex(POSTS_PER_LOAD);

        // Calculate trending posts
        const sortedByLikes = [...postsData]
          .sort((a, b) => {
            const likesA = a.likes?.length || 0;
            const likesB = b.likes?.length || 0;
            return likesB - likesA;
          })
          .slice(0, 10);
        setTrendingPosts(sortedByLikes);

        setForums(forumsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Filter posts based on search query and selected forum
  useEffect(() => {
    const filterPosts = () => {
      let filtered = [...allPosts];

      // Apply search filter
      if (debouncedQuery) {
        const lowercaseQuery = debouncedQuery.toLowerCase();
        filtered = filtered.filter((post) => {
          const titleMatch = post?.post_title
            ? post.post_title.toLowerCase().includes(lowercaseQuery)
            : false;
          const dataMatch = post?.post_data
            ? post.post_data.toLowerCase().includes(lowercaseQuery)
            : false;
          return titleMatch || dataMatch;
        });
      }

      // Apply forum filter
      if (selectedForum) {
        filtered = filtered.filter((post) => {
          if (!post?.post_genre_ref) return false;
          const genreRefId = post.post_genre_ref.id || post.post_genre_ref.path;
          return genreRefId === selectedForum.id;
        });
      }

      // Load only the first batch
      const initialPosts = filtered.slice(0, POSTS_PER_LOAD);
      setFilteredPosts(initialPosts);
      setCurrentIndex(POSTS_PER_LOAD);
    };

    filterPosts();
  }, [debouncedQuery, selectedForum, allPosts]);

  const loadMorePosts = useCallback(() => {
    if (loadingMore || currentIndex >= allPosts.length) return;

    setLoadingMore(true);

    setTimeout(() => {
      let filtered = [...allPosts];

      // Apply search filter
      if (debouncedQuery) {
        const lowercaseQuery = debouncedQuery.toLowerCase();
        filtered = filtered.filter((post) => {
          const titleMatch = post?.post_title
            ? post.post_title.toLowerCase().includes(lowercaseQuery)
            : false;
          const dataMatch = post?.post_data
            ? post.post_data.toLowerCase().includes(lowercaseQuery)
            : false;
          return titleMatch || dataMatch;
        });
      }

      // Apply forum filter
      if (selectedForum) {
        filtered = filtered.filter((post) => {
          if (!post?.post_genre_ref) return false;
          const genreRefId = post.post_genre_ref.id || post.post_genre_ref.path;
          return genreRefId === selectedForum.id;
        });
      }

      // Get the next batch of posts
      const nextBatch = filtered.slice(
        currentIndex,
        currentIndex + POSTS_PER_LOAD
      );

      setFilteredPosts((prevPosts) => [...prevPosts, ...nextBatch]);
      setCurrentIndex((prevIndex) => prevIndex + POSTS_PER_LOAD);
      setLoadingMore(false);
    }, 500);
  }, [allPosts, currentIndex, loadingMore, debouncedQuery, selectedForum]);

  const handleForumSelect = (forum) => {
    setSelectedForum(selectedForum?.id === forum.id ? null : forum);
    setCurrentIndex(0); // Reset pagination when forum changes
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const renderHeader = () => (
    <Box>
      {/* Search Bar with Back Button */}
      <Box px={4} py={3} flexDirection="row" alignItems="center">
        <Pressable onPress={() => navigation.goBack()} mr={3}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Input
          ref={searchInputRef}
          flex={1}
          placeholder="Search posts..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          variant="filled"
          borderRadius="10"
          py={3}
          fontSize="md"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          InputLeftElement={
            <Box pl={3}>
              <Ionicons name="search" size={20} color="gray" />
            </Box>
          }
        />
      </Box>

      {/* Forum Chips */}
      <Box>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginBottom: 12,
          }}
        >
          <HStack space={2}>
            {forums.map((forum) => (
              <Pressable
                key={forum.id}
                onPress={() => handleForumSelect(forum)}
              >
                <Box
                  px={4}
                  py={2}
                  borderRadius="full"
                  bg={
                    selectedForum?.id === forum.id ? "primary.500" : "gray.100"
                  }
                >
                  <Text
                    color={
                      selectedForum?.id === forum.id ? "white" : "gray.700"
                    }
                    fontWeight="medium"
                  >
                    {forum.name}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </HStack>
        </ScrollView>
      </Box>
    </Box>
  );

  const renderNoResults = () => {
    if (filteredPosts.length === 0 && (searchQuery || selectedForum)) {
      return (
        <Center flex={1} py={8}>
          <Text fontSize="lg" color="gray.500">
            No results found
          </Text>
          <Text fontSize="sm" color="gray.400" mt={2}>
            Try different search terms or remove filters
          </Text>
        </Center>
      );
    }
    return null;
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
      data={filteredPosts.length > 0 ? filteredPosts : trendingPosts}
      renderHeader={renderHeader}
      navigation={navigation}
      isMarketView={false}
      ListEmptyComponent={renderNoResults}
    />
  );
}

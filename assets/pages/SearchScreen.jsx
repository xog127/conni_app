import React, { useState, useEffect } from "react";
import { Box, Text, Input, HStack, ScrollView, Pressable, VStack } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { getAnyCollection } from "../firebase/queries";
import PostPreviews from "../components/postPreviews";

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, forumsData] = await Promise.all([
          getAnyCollection("posts"),
          getAnyCollection("genres")
        ]);
        
        // Sort posts by time_posted in descending order
        const sortedPosts = postsData.sort((a, b) => b.time_posted - a.time_posted);
        setPosts(sortedPosts);
        setFilteredPosts(sortedPosts);
        setForums(forumsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = posts;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.post_title.toLowerCase().includes(query) || 
        post.post_data.toLowerCase().includes(query)
      );
    }

    // Apply forum filter
    if (selectedForum) {
      filtered = filtered.filter(post => {
        if (!post.post_genre_ref) return false;
        const genreRefId = post.post_genre_ref.id || post.post_genre_ref.path;
        return genreRefId === selectedForum.id;
      });
    }

    setFilteredPosts(filtered);
  }, [searchQuery, selectedForum, posts]);

  const handleForumSelect = (forum) => {
    setSelectedForum(selectedForum?.id === forum.id ? null : forum);
  };

  return (
    <Box flex={1} bg="white">
      {/* Search Bar */}
      <Box px={4} py={2} bg="white">
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          variant="filled"
          borderRadius="10"
          py="3"
          px="5"
          InputLeftElement={
            <Ionicons name="search" size={20} color="gray" style={{ marginLeft: 10 }} />
          }
        />
      </Box>

      {/* Forum Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        px={4}
        py={1}
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
                bg={selectedForum?.id === forum.id ? "primary.500" : "gray.100"}
              >
                <Text
                  color={selectedForum?.id === forum.id ? "white" : "gray.700"}
                  fontWeight="medium"
                >
                  {forum.name}
                </Text>
              </Box>
            </Pressable>
          ))}
        </HStack>
      </ScrollView>

      {/* Posts List */}
      <Box flex={1} mt={1}>
        {loading ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <Text>Loading...</Text>
          </Box>
        ) : (
          <PostPreviews
            data={filteredPosts}
            navigation={navigation}
          />
        )}
      </Box>
    </Box>
  );
} 
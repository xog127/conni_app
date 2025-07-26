import React, { useState, useRef, useEffect } from "react";
import { Box, Text, Input, HStack, Pressable, Spinner, Center, ScrollView, FlatList, VStack, Image } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAnyCollection, getRef } from "../firebase/queries";
import { timeAgo } from "../customFunctions/time.js";
import PostUserInfo from "../components/postuserinfo.jsx";
import HeartIcon from "../customIcon/HeartIcon.js";
import CommentIcon from "../customIcon/CommentIcon.js";
import ViewIcon from "../customIcon/ViewIcon.js";
import PostCard from "../components/PostCard.jsx";

export default function NewSearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const searchInputRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsData, forumsData] = await Promise.all([
          getAnyCollection("posts"),
          getAnyCollection("genres")
        ]);
        
        // Fetch user data for each post
        const postsWithUserData = await Promise.all(
          postsData.map(async (post) => {
            try {
              const userData = await getRef({
                id: post.post_user.id || post.post_user.path,
                collectionName: "users"
              });
              const forumData = await getRef({
                id: post.post_genre_ref.id || post.post_genre_ref.path,
                collectionName: "genres"
              });
              return {
                ...post,
                user: userData,
                forum: forumData
              };
            } catch (error) {
              console.error("Error fetching user or forum data:", error);
              return post;
            }
          })
        );
        
        setAllPosts(postsWithUserData);
        setForums(forumsData);
        setFilteredPosts(postsWithUserData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter posts based on search query and selected forum
  useEffect(() => {
    const filterPosts = async () => {
      if (!searchQuery && !selectedForum) {
        setFilteredPosts(allPosts);
        return;
      }

      setFiltering(true);
      try {
        let filtered = [...allPosts];

        // Apply search filter
        if (searchQuery) {
          const lowercaseQuery = searchQuery.toLowerCase();
          filtered = filtered.filter(post => {
            const titleMatch = post?.post_title ? post.post_title.toLowerCase().includes(lowercaseQuery) : false;
            const dataMatch = post?.post_data ? post.post_data.toLowerCase().includes(lowercaseQuery) : false;
            return titleMatch || dataMatch;
          });
        }

        // Apply forum filter
        if (selectedForum) {
          filtered = filtered.filter(post => {
            if (!post?.post_genre_ref) return false;
            const genreRefId = post.post_genre_ref.id || post.post_genre_ref.path;
            return genreRefId === selectedForum.id;
          });
        }

        // Sort posts by time_posted in descending order (newest first)
        filtered.sort((a, b) => b.time_posted - a.time_posted);

        // Small delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 300));
        setFilteredPosts(filtered);
      } catch (error) {
        console.error("Error filtering posts:", error);
      } finally {
        setFiltering(false);
      }
    };

    filterPosts();
  }, [searchQuery, selectedForum, allPosts]);

  const handleForumSelect = (forum) => {
    // Immediately update the selected forum for visual feedback
    setSelectedForum(selectedForum?.id === forum.id ? null : forum);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const renderHeader = () => (
    <Box>
      {/* Search Bar with Back Button */}
      <Box px={4} py={3} flexDirection="row" alignItems="center" style = {{outlineWidth: 0}}>
        <Pressable onPress={() => navigation.goBack()} mr={3}>
          <Ionicons name="arrow-back" size={24} color="black" style = {{outlineWidth: 1}} />
        </Pressable>
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          style={{ outlineWidth: 0 }}
          _input={{ outlineWidth: 0 }}
          _focus={{ outlineWidth: 0 }}
        />
        
      </Box>

      {/* Forum Chips */}
      <Box>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <HStack space={2}>
            {forums.map((forum) => (
              <Pressable
                key={forum.id}
                onPress={() => handleForumSelect(forum)}
                disabled={filtering}
              >
                <Box
                  px={4}
                  py={2}
                  borderRadius="full"
                  bg={selectedForum?.id === forum.id ? "primary.500" : "gray.100"}
                  opacity={filtering ? 0.7 : 1}
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
      </Box>
    </Box>
  );

  const renderPost = ({ item }) => (
    <PostCard item={item} navigation={navigation} />
  );

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="white">
        <Spinner size="lg" color="#836FFF" />
      </Box>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'left', 'right']}>
      <Box flex={1}>
        {renderHeader()}
        <Box flex={1} position="relative">
          {filtering && (
            <Box 
              position="absolute" 
              top={0} 
              left={0} 
              right={0} 
              bottom={0} 
              bg="rgba(255, 255, 255, 0.8)" 
              justifyContent="center" 
              alignItems="center"
              zIndex={1}
            >
              <Spinner size="lg" color="#836FFF" />
            </Box>
          )}
          {filteredPosts.length === 0 ? (
            <Box flex={1} justifyContent="center" alignItems="center" p={4}>
              <Text fontSize="lg" color="gray.500" textAlign="center">
                No results found
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center" mt={2}>
                Try adjusting your search or filter
              </Text>
            </Box>
          ) : (
            <FlatList
              data={filteredPosts}
              renderItem={renderPost}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </Box>
      </Box>
    </SafeAreaView>
  );
} 
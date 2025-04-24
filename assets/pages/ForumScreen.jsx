import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Text,
  Icon,
  HStack,
  VStack,
  Pressable,
  Spinner,
  Center,
  FlatList,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { getAnyCollection, getRef } from "../firebase/queries";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, RefreshControl } from 'react-native';
import PostCard from "../components/PostCard.jsx";

export default function ForumScreen({ route, navigation }) {
  const { genreref } = route.params;
  const [genre, setGenre] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch genre data
      const genreData = await getRef({
        id: genreref,
        collectionName: "genres",
      });
      setGenre(genreData);

      // Fetch all posts
      const postsData = await getAnyCollection("posts");

      // Filter posts by genre
      const filteredPosts = postsData.filter((post) => {
        if (post.post_genre_ref) {
          const genreRefId = post.post_genre_ref.id || post.post_genre_ref.path;
          return genreRefId === genreref;
        }
        return false;
      });

      // Sort posts by time
      const sortedPosts = filteredPosts.sort(
        (a, b) => b.time_posted - a.time_posted
      );

      setPosts(sortedPosts);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [genreref]);

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const renderPost = ({ item }) => (
    <PostCard item={item} navigation={navigation} />
  );

  if (loading) {
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

          <Center flex={1}>
            <Spinner size="lg" color="#836FFF" />
          </Center>
        </Box>
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

        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#836FFF"]}
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </Box>
    </SafeAreaView>
  );
}

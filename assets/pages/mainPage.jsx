import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Icon,
  HStack,
  Pressable,
  Spacer,
  Spinner,
  Center,
  FlatList,
  ScrollView,
  VStack,
  Image,
  Text,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { getAnyCollection, getRef } from "../firebase/queries";
import ConniIcon from "../customIcon/ConniIcon";
import PostWidget from "../components/postwidget";
import PostUserInfo from "../components/postuserinfo.jsx";
import { timeAgo } from "../customFunctions/time.js";
import HeartIcon from "../customIcon/HeartIcon.js";
import CommentIcon from "../customIcon/CommentIcon.js";
import ViewIcon from "../customIcon/ViewIcon.js";
import MarketPreview from "../components/marketPreview";
import PostCard from "../components/PostCard.jsx";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export default function MainPage({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [marketPosts, setMarketPosts] = useState([]);
  const marketRef = "QNywRjCYSwAi4TuLkzbh";

  const flatListRef = useRef(null);

  const fetchData = async () => {
    try {
      // Fetch all posts
      const postsData = await getAnyCollection("posts");

      // Fetch forum data for each post
      const postsWithForumData = await Promise.all(
        postsData.map(async (post) => {
          try {
            const forumData = await getRef({
              id: post.post_genre_ref.id || post.post_genre_ref.path,
              collectionName: "genres",
            });
            return {
              ...post,
              forum: forumData,
            };
          } catch (error) {
            console.error("Error fetching forum data:", error);
            return post;
          }
        })
      );

      const sortedPosts = postsWithForumData.sort(
        (a, b) => b.time_posted - a.time_posted
      );
      setPosts(sortedPosts);

      // Fetch market data
      // Market genre reference
      const marketGenre = await getRef({
        id: marketRef,
        collectionName: "genres",
      });
      setMarketData(marketGenre);

      // Filter market posts
      const marketPosts = postsData.filter((post) => {
        if (post.post_genre_ref) {
          const genreRefId = post.post_genre_ref.id || post.post_genre_ref.path;
          return genreRefId === marketRef && post.image;
        }
        return false;
      });
      setMarketPosts(marketPosts);
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
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // Handle tab press to scroll to top
  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", (e) => {
      if (navigation.isFocused()) {
        // If already on the screen, scroll to top
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const renderMarketSection = () => {
    if (!marketData || marketPosts.length === 0) return null;

    return (
      <Box>
        <VStack pt="36px" pb="36px" space="12px">
          <HStack justifyContent={"space-between"} px="20px">
            <HStack space="8px">
              <Image
                source={{ uri: marketData.photo }}
                style={{
                  width: "24px",
                  height: "24px",
                  aspectRatio: 1,
                }}
              />
              <Text
                fontSize="20px"
                fontWeight="500"
                lineHeight="36px"
                fontStyle="normal"
              >
                Market
              </Text>
            </HStack>
            <Pressable
              onPress={() =>
                navigation.navigate("IndividualForum", { genreref: marketRef })
              }
            >
              <Box px="12px" py="6px" bg="#836FFF" borderRadius="16px">
                <Text
                  fontSize="14px"
                  fontWeight="500"
                  lineHeight="21px"
                  fontStyle="normal"
                  color="#FFF"
                >
                  See All
                </Text>
              </Box>
            </Pressable>
          </HStack>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <HStack space="8px" px="20px">
              {marketPosts.map((post) => (
                <MarketPreview
                  key={post.id}
                  postRef={post.id}
                  navigation={navigation}
                />
              ))}
            </HStack>
          </ScrollView>
        </VStack>
      </Box>
    );
  };
  const renderPost = ({ item, index }) => (
    <>
      <PostCard item={item} navigation={navigation} />
      {index === 0 && renderMarketSection()}
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Box flex={1}>
          <HStack px={4} py={3} alignItems="center" space={3}>
            <Pressable onPress={() => navigation.openDrawer()}>
              <Icon as={Ionicons} name="menu" size={6} color="gray.500" />
            </Pressable>
            <ConniIcon />
            <Spacer />
            <Pressable>
              <Icon
                as={Ionicons}
                name="notifications"
                size={6}
                color="gray.500"
              />
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Search")}>
              <Icon as={Ionicons} name="search" size={6} color="gray.500" />
            </Pressable>
          </HStack>

          <Center flex={1}>
            <Spinner size="lg" color="#836FFF" />
          </Center>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Box flex={1}>
        <HStack px={4} py={3} alignItems="center" space={3}>
          <Pressable onPress={() => navigation.openDrawer()}>
            <Icon as={Ionicons} name="menu" size={6} color="gray.500" />
          </Pressable>
          <ConniIcon />
          <Spacer />
          <Pressable>
            <Icon
              as={Ionicons}
              name="notifications"
              size={6}
              color="gray.500"
            />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Search")}>
            <Icon as={Ionicons} name="search" size={6} color="gray.500" />
          </Pressable>
        </HStack>

        <FlatList
          ref={flatListRef}
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#836FFF"]}
              tintColor="#836FFF"
            />
          }
          onEndReachedThreshold={0.5}
        />
      </Box>
    </SafeAreaView>
  );
}

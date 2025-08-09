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
import ReportModal from "../components/ReportModal.jsx";

export default function MainPage({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [marketPosts, setMarketPosts] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingPostId, setReportingPostId] = useState(null);
  const marketRef = "QNywRjCYSwAi4TuLkzbh";
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const flatListRef = useRef(null);

  const handleReport = (postId) => {
    setReportingPostId(postId);
    setShowReportModal(true);
  };

  const fetchData = async (isRefresh = false) => {
    try {
      console.log('Fetching data...', isRefresh ? '(refresh)' : '(initial)');
      
      // Fetch all posts
      const postsData = await getAnyCollection("posts");
      console.log(`Fetched ${postsData.length} total posts`);

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

      // Fetch market data if not already loaded
      if (!marketData) {
        const marketGenre = await getRef({
          id: marketRef,
          collectionName: "genres",
        });
        setMarketData(marketGenre);
      }

      // Filter market posts - FIXED: Using post_photo instead of post.image
      const filteredMarketPosts = postsData.filter((post) => {
        if (post.post_genre_ref) {
          const genreRefId = post.post_genre_ref.id || post.post_genre_ref.path;
          const isMarketPost = genreRefId === marketRef;
          const hasImage = post.post_photo && post.post_photo.trim() !== '';
          
          console.log(`Post ${post.id}: isMarket=${isMarketPost}, hasImage=${hasImage}, photo=${post.post_photo}`);
          
          return isMarketPost && hasImage;
        }
        return false;
      });

      // Sort market posts by newest first
      const sortedMarketPosts = filteredMarketPosts.sort(
        (a, b) => b.time_posted - a.time_posted
      );

      console.log(`Found ${sortedMarketPosts.length} market posts with images`);
      setMarketPosts(sortedMarketPosts);
      setLastFetchTime(Date.now());

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData(false);
  }, []);

  // Improved focus effect - only refresh when coming back from certain screens
  useFocusEffect(
    useCallback(() => {
      const shouldRefresh = navigation.getState().routes[navigation.getState().index].params?.refresh;
      const timeSinceLastFetch = lastFetchTime ? Date.now() - lastFetchTime : Infinity;
      
      // Refresh if explicitly requested or if it's been more than 5 minutes
      if (shouldRefresh || timeSinceLastFetch > 300000) {
        console.log('Refreshing due to focus:', { shouldRefresh, timeSinceLastFetch });
        fetchData(true);
      }
    }, [lastFetchTime])
  );

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
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

  // Enhanced market section rendering with better error handling
  const renderMarketSection = () => {
    try {
      if (!marketData) {
        console.log('No market data available');
        return null;
      }

      if (marketPosts.length === 0) {
        console.log('No market posts available');
        // Show empty state instead of hiding completely
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
                    alt="Market icon"
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
              <Box px="20px" py="20px" alignItems="center">
                <Text color="gray.500" fontSize="14px">
                  No market items available yet
                </Text>
                <Pressable
                  mt="8px"
                  onPress={() => navigation.navigate("CreatePost", { 
                    preselectedForum: "Market",
                    refresh: true 
                  })}
                >
                  <Box px="16px" py="8px" bg="#836FFF20" borderRadius="20px">
                    <Text color="#836FFF" fontWeight="500" fontSize="12px">
                      Post First Item
                    </Text>
                  </Box>
                </Pressable>
              </Box>
            </VStack>
          </Box>
        );
      }

      console.log(`Rendering market section with ${marketPosts.length} posts`);

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
                  alt="Market icon"
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
                    See All ({marketPosts.length})
                  </Text>
                </Box>
              </Pressable>
            </HStack>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <HStack space="8px" px="20px">
                {marketPosts.map((post, index) => {
                  console.log(`Rendering market post ${post.id} at index ${index}`);
                  return (
                    <MarketPreview
                      key={post.id}
                      postRef={post.id}
                      postData={post} // Pass full post data for better performance
                      navigation={navigation}
                    />
                  );
                })}
              </HStack>
            </ScrollView>
          </VStack>
        </Box>
      );
    } catch (error) {
      console.error('Error rendering market section:', error);
      return (
        <Box px="20px" py="12px">
          <Text color="red.500">Unable to load market section</Text>
        </Box>
      );
    }
  };

  const renderPost = ({ item, index }) => (
    <>
      <PostCard 
        item={item} 
        navigation={navigation}
        onReport={() => handleReport(item.id)} 
      />
      {index === 0 && renderMarketSection()}
    </>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white" }}
        edges={["top", "left", "right"]}
      >
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
          </HStack>

          <Center flex={1}>
            <Spinner size="lg" color="#836FFF" />
          </Center>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["top", "left", "right"]}
    >
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Box flex={1}>
        <HStack px={4} py={3} alignItems="center" space={3}>
          <Pressable onPress={() => navigation.openDrawer()}>
            <Icon as={Ionicons} name="menu" size={6} color="gray.500" />
          </Pressable>
          <ConniIcon />
          <Spacer />
          <Pressable onPress={() => navigation.navigate("Notification")}>
            <Icon
              as={Ionicons}
              name="notifications"
              size={6}
              color="gray.500"
            />
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
        <ReportModal
          isVisible={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setReportingPostId(null);
          }}
          postId={reportingPostId}
        />
      </Box>
    </SafeAreaView>
  );
}
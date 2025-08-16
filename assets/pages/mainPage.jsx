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
import MarketPreview from "../components/marketPreview";
import PostCard from "../components/PostCard.jsx";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, RefreshControl } from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import ReportModal from "../components/ReportModal.jsx";
import { registerForPushNotificationsAsync } from '../services/pushNotificationService';
import { TouchableOpacity } from "react-native";


export default function MainPage({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [marketPosts, setMarketPosts] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingPostId, setReportingPostId] = useState(null);
  const marketRef = "QNywRjCYSwAi4TuLkzbh";
  const didFirstFocusFetch = useRef(false);
  const marketLoadedRef = useRef(false);

  const flatListRef = useRef(null);
  const route = useRoute();

  const handleReport = (postId) => {
    setReportingPostId(postId);
    setShowReportModal(true);
  };

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      // keep the UI flags minimal; the focus effect sets loading/refreshing
      const postsData = await getAnyCollection("posts");
  
      const postsWithForumData = await Promise.all(
        postsData.map(async (post) => {
          try {
            const forumData = await getRef({
              id: post.post_genre_ref.id || post.post_genre_ref.path,
              collectionName: "genres",
            });
            return { ...post, forum: forumData };
          } catch {
            return post;
          }
        })
      );
  
      setPosts(postsWithForumData.sort((a, b) => b.time_posted - a.time_posted));
  
      if (!marketLoadedRef.current) {
        const marketGenre = await getRef({ id: marketRef, collectionName: "genres" });
        setMarketData(marketGenre);
        marketLoadedRef.current = true;
      }
  
      const filteredMarketPosts = postsData
        .filter((post) => {
          const refId = post.post_genre_ref?.id || post.post_genre_ref?.path;
          const isMarket = refId === marketRef;
          const hasImage = !!post.post_photo && post.post_photo.trim() !== "";
          return isMarket && hasImage;
        })
        .sort((a, b) => b.time_posted - a.time_posted);
  
      setMarketPosts(filteredMarketPosts);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  

  // Initial data fetch
  useEffect(() => {
    const parent = navigation.getParent(); // Tab navigator
    const sub = parent?.addListener("tabPress", e => {
      if (navigation.isFocused()) {
        // Scroll to top
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        // Always refresh on tab press
        setRefreshing(true);
        fetchData(true);
      }
    });
    return sub;
  }, [navigation, fetchData]);
  
  // Handle route params for scroll to top and refresh
  useFocusEffect(
    useCallback(() => {
      // show spinner on first entry; pull-to-refresh spinner on subsequent entries
      if (!didFirstFocusFetch.current) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
  
      fetchData(true); // always refresh on focus
      didFirstFocusFetch.current = true;
  
      return () => {};
    }, [fetchData])
  );

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  // Enhanced market section rendering with better error handling
  const renderMarketSection = () => {
    try {
      if (!marketData) {
        console.log('No market data available');
        return null;
      }

      if (marketPosts.length === 0) {
        console.log('No market posts available');
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
                  return (
                    <MarketPreview
                      key={post.id}
                      postRef={post.id}
                      postData={post}
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
        <TouchableOpacity 
          style={{
            backgroundColor: '#836FFF',
            padding: 15,
            borderRadius: 8,
            margin: 20,
            alignItems: 'center'
          }}
          onPress={registerForPushNotificationsAsync}
        >
          <Text style={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontSize: 16 
          }}>
            🧪 Test Push Notifications
          </Text>
        </TouchableOpacity>

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
          onEndReachedThreshold={0.25}
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
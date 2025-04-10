import React, { useState, useEffect } from "react";
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

export default function MainPage({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState(null);
  const [marketPosts, setMarketPosts] = useState([]);
  const marketRef = "QNywRjCYSwAi4TuLkzbh";
  console.log(marketRef);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
            const genreRefId =
              post.post_genre_ref.id || post.post_genre_ref.path;
            return genreRefId === marketRef && post.image;
          }
          return false;
        });
        setMarketPosts(marketPosts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
            <Pressable onPress={() => navigation.openDrawer()}>
              <Icon as={Ionicons} name="menu" size={7} color="black" />
            </Pressable>
            <Pressable onPress={() => navigation.navigate("RedditCreatePost")}>
              <Icon as={Ionicons} name="add-circle" size={7} color="#836FFF" />
            </Pressable>
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
            <Pressable onPress={() => navigation.navigate("Search")}>
              <Icon as={Ionicons} name="search" size={7} color="gray.500" />
            </Pressable>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );

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
      <Box flex={1} justifyContent="center" alignItems="center" bg="white">
        <Spinner size="lg" color="#836FFF" />
      </Box>
    );
  }

  return (
    <Box flex={1} bg="white">
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </Box>
  );
}

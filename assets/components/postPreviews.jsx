import React, { useCallback, useState, useEffect } from "react";
import { Box, FlatList, HStack, VStack, Text, Pressable } from "native-base";
import { Image } from "expo-image";
import { ScrollView } from "native-base";
import PostCard from "./PostCard";
import MarketPreview from "../components/marketPreview";
import { getRef } from "../firebase/queries";

const PostPreviews = ({
  data,
  renderHeader,
  renderFooter,
  navigation,
  isMarketView = false,
  onEndReached,
  onEndReachedThreshold = 0.5,
}) => {
  const [marketRefs, setMarketRefs] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const genreRef = "QNywRjCYSwAi4TuLkzbh";

  const filterPostsByGenre = (posts, genreRef) => {
    const filteredPosts = posts.filter((post) => {
      // Ensure post_genre_ref exists and has an id before filtering
      if (post.post_genre_ref) {
        const genreRefId = post.post_genre_ref.id || post.post_genre_ref.path;

        // Only include posts that match the genreRef AND have a post_photo
        return genreRefId === genreRef && post.post_photo;
      }

      // If post_genre_ref doesn't exist OR there's no post_photo, exclude it
      return false;
    });

    return filteredPosts;
  };

  useEffect(() => {
    if (isMarketView && data.length > 0) {
      // Prevents running on empty data
      const fetchMarketData = async () => {
        try {
          const filteredPosts = filterPostsByGenre(data, genreRef);
          setMarketRefs(filteredPosts);
          const marketData = await getRef({
            id: genreRef,
            collectionName: "genres",
          });
          setMarketData(marketData);
        } catch (error) {
          console.error("Error fetching market data:", error.message);
        }
      };
      fetchMarketData();
    }
  }, [isMarketView, data]); // <-- Add data as a dependency

  const renderItem = useCallback(
    ({ item, index }) => (
      <>
        <PostCard item = {item} navigation={navigation} />
        {index === 0 && isMarketView && marketData?.photo && (
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
                <Pressable>
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
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              >
                <HStack space="8px" px="20px">
                  {marketRefs.map((post) => (
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
        )}
      </>
    ),
    [navigation, marketRefs, marketData, isMarketView]
  );

  return (
    <Box flex={1} bg="white">
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 20 }}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
      />
    </Box>
  );
};

export default PostPreviews;

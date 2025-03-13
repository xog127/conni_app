import React, { useEffect, useState } from "react";
import { Box, Icon, HStack, Pressable, Spacer } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { getAnyCollection } from "../firebase/queries";
import ConniIcon from "../customIcon/ConniIcon";
import PostPreviews from "../components/postPreviews";

export default function MainPage({ navigation }) {
  const [postRefs, setPostRefs] = useState([]);
  // Filter function that filters posts by 'post_genre_ref'

  useEffect(() => {
    const fetchPostRefs = async () => {
      try {
        const posts = await getAnyCollection("posts");
        setPostRefs(posts.sort((a, b) => b.time_posted - a.time_posted));
      } catch (error) {
        console.error("Error fetching post references:", error.message);
      }
    };

    fetchPostRefs();
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
            {/* Add Pressable to open the drawer */}
            <Pressable onPress={() => navigation.openDrawer()}>
              <Icon as={Ionicons} name="menu" size={7} color="black" />
            </Pressable>
            <Icon as={Ionicons} name="notifications" size={7} color="white" />
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
            <Pressable>
              <Icon as={Ionicons} name="search" size={7} color="gray.500" />
            </Pressable>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );

  return (
    <PostPreviews
      data={postRefs}
      renderHeader={renderHeader}
      navigation={navigation}
      isMarketView={true}
    />
  );
}

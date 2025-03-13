import { useEffect, useState } from "react";
import {
  NativeBaseProvider,
  Box,
  Text,
  Icon,
  ScrollView,
  HStack,
  VStack,
  Pressable,
} from "native-base";
import { AnimatePresence, MotiView } from "moti";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { getRef, fetchUserPosts } from "../firebase/queries";
import { useAuth } from "../services/authContext";
import PostPreviews from "../components/postPreviews";

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const currentUser = user;
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [commentedPosts, setCommentedPosts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Your Posts");
  const options = ["Your Posts", "Liked Posts", "Commented Posts"];

  useEffect(() => {
    const fetchPostRefs = async () => {
      console.log("current user is", currentUser);
      try {
        if (currentUser) {
          const userData = await getRef({
            id: currentUser.uid,
            collectionName: "users",
          });
          const userPosts = await fetchUserPosts(currentUser.uid);
          setPosts(
            userPosts.posts.sort((a, b) => b.time_posted - a.time_posted)
          );
          setLikedPosts(
            userPosts.likedPosts.sort((a, b) => b.time_posted - a.time_posted)
          );
          setCommentedPosts(
            userPosts.commentedPosts.sort(
              (a, b) => b.time_posted - a.time_posted
            )
          );
          console.log("ProfileScreen navigation:", navigation);
        }
      } catch (error) {
        console.error("Error fetching post references:", error.message);
      }
    };

    fetchPostRefs();
  }, [selectedOption]);

  const displayedPosts =
    selectedOption === "Your Posts"
      ? posts
      : selectedOption === "Liked Posts"
      ? likedPosts
      : commentedPosts;

  return (
    <NativeBaseProvider>
      <Box
        bg="white"
        h={"12%"}
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
        px={4}
        pt={"10%"}
      >
        <Text fontSize="30" fontWeight="bold" color="#836fff">
          UCL
        </Text>
        <Pressable onPress={() => navigation.navigate("Setting")}>
          <Icon as={Ionicons} name="settings-outline" size={28} color="gray" />
        </Pressable>
      </Box>
      <Box>
        <HStack justifyContent="space-between" px={4} py={4}>
          <Image
            source={
              user?.photo_url
                ? { uri: user.photo_url }
                : require("../images/Blankprofile.png")
            }
            style={{ width: 80, height: 80, borderRadius: 40 }}
          />
          <VStack space={2} flex={1} justifyContent="center">
            <Text fontSize="lg" fontWeight="bold">
              {user?.display_name}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Course : {user?.course}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Year : {user?.graduation_year}
            </Text>
          </VStack>
        </HStack>
      </Box>

      <ScrollView flex={1}>
        <Box>
          <Box
            bg="gray.200"
            py={2}
            px={4}
            borderRadius="md"
            position="relative"
          >
            <Pressable onPress={() => setIsOpen(!isOpen)}>
              <HStack
                justifyContent="flex-end"
                alignItems="center"
                space={4}
                height="20px"
              >
                <Text fontSize="md" fontWeight="bold">
                  {selectedOption}
                </Text>
                <Icon
                  as={Ionicons}
                  name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}
                  size={6}
                  color="gray.600"
                />
              </HStack>
            </Pressable>
            <AnimatePresence>
              {isOpen && (
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -10 }}
                  transition={{ type: "timing", duration: 300 }}
                  style={{
                    position: "absolute",
                    top: 40,
                    right: 10,
                    zIndex: 10,
                  }}
                >
                  <VStack bg="gray.200" borderRadius="8" width={140}>
                    {options.map((option, index) => (
                      <Pressable
                        key={index}
                        py={2}
                        px={3}
                        onPress={() => {
                          setSelectedOption(option);
                          setIsOpen(false);
                        }}
                        _pressed={{ bg: "gray.600" }}
                      >
                        <Text fontSize="sm">{option}</Text>
                      </Pressable>
                    ))}
                  </VStack>
                </MotiView>
              )}
            </AnimatePresence>
          </Box>
        </Box>

        {displayedPosts.length > 0 ? (
          <PostPreviews
            data={displayedPosts}
            navigation={navigation}
            isMarketView={false}
          />
        ) : (
          <Text textAlign="center" mt={4} color="gray.500">
            No posts found.
          </Text>
        )}
      </ScrollView>
    </NativeBaseProvider>
  );
}

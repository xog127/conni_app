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
          {user?.first_name + " " + user?.last_name}
        </Text>
      </Box>
      <Box bg="white" pt="11px">
        <VStack>
          <HStack
            justifyContent="space-between"
            space="25px"
            px="16px"
            pb="16px"
          >
            <Image
              source={
                user?.photo_url
                  ? { uri: user.photo_url }
                  : require("../images/Blankprofile.png")
              }
              style={{ width: 68, height: 68, borderRadius: 68 }}
            />
            <VStack flex={1} justifyContent="center">
              <Text
                fontSize="16px"
                fontWeight="500"
                color="#000"
                lineHeight="24px"
                letterSpacing="0.15px"
              >
                {user?.first_name + " " + user?.last_name}
              </Text>
              <Text
                fontSize="16px"
                color="#000"
                fontWeight="500"
                lineHeight="24px"
                letterSpacing="0.15px"
              >
                {user?.course}
              </Text>
              <Text
                fontSize="16px"
                color="#000"
                fontWeight="500"
                lineHeight="24px"
                letterSpacing="0.15px"
              >
                Year : {user?.graduation_year}
              </Text>
            </VStack>
          </HStack>
          <HStack px="24px" justifyContent="center" space="24px" pb="24px">
            <Pressable onPress={() => navigation.navigate("EditProfile")}>
              <Box
                px="36px"
                py="4px"
                borderColor="#78767F"
                borderWidth="1px"
                borderRadius="8px"
              >
                <Text
                  fontWeight="500"
                  fontStyle="normal"
                  lineHeight="20px"
                  letterSpacing="0.14px"
                  fontSize="14px"
                >
                  Edit Profile
                </Text>
              </Box>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Setting")}>
              <Box
                px="47px"
                py="4px"
                borderColor="#78767F"
                borderWidth="1px"
                borderRadius="8px"
              >
                <Text
                  fontWeight="500"
                  fontStyle="normal"
                  lineHeight="20px"
                  letterSpacing="0.14px"
                  fontSize="14px"
                >
                  Setting
                </Text>
              </Box>
            </Pressable>
          </HStack>
        </VStack>
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

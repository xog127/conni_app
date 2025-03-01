import { useEffect, useState } from "react";
import {
  NativeBaseProvider,
  Box,
  Input,
  Text,
  Icon,
  ScrollView,
  HStack,
  VStack,
  Pressable,
  Image,
} from "native-base";
import { AnimatePresence, MotiView } from "moti";
import PostWidget from "../components/postwidget";
import { Ionicons } from "@expo/vector-icons";
import { getRef, getAnyCollection } from "../firebase/queries";
import { useAuth } from "../services/authContext";
import { fetchReferenceData } from "../firebase/queries";

export default function ProfileScreen() {
  const {user} = useAuth();
  //const auth = getAuth();
  const currentUser = user;
  const [users, setUser] = useState(null);
  const [postRefs, setPostRefs] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Your Posts");
  const options = ["Your Posts", "Liked Posts", "Commented Posts"];

  useEffect(() => {
    const fetchPostRefs = async () => {
      console.log("current user is", currentUser);
      try {
        if (currentUser) {
          // Fetch the current user's data
          const userData = await getRef({
            id: currentUser.uid, // Use the current user's UID
            collectionName: "users",
          });
          setUser(userData);
          filterPosts(userData, selectedOption);
        }
      } catch (error) {
        console.error("Error fetching post references:", error.message);
      }
    };

    fetchPostRefs();
  }, [selectedOption]);

  const filterPosts = async (userData, option) => {
    try {
      let postIds = [];

      switch (option) {
        case "Your Posts":
          postIds = userData.postsRef.map((ref) => ref.id) || [];
          break;

        case "Liked Posts":
          postIds = userData.postsRef.map((ref) => ref.id) || [];
          break;

        case "Commented Posts":
          postIds = userData.postsRef.map((ref) => ref.id) || [];
          break;

        default:
          postIds = [];
          break;
      }
      console.log("Post IDs:", postIds);
      // Fetch only the posts referenced in the user's attributes
      const posts = await fetchReferenceData(postIds);
      setFilteredPosts(posts);
    } catch (error) {
      console.error("Error filtering posts:", error.message);
    }
  };

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
        <Icon as={Ionicons} name="settings-outline" size={28} color="gray" />
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
                    top: 40, // Positioning the dropdown below
                    right: 10,
                    zIndex: 10,
                  }}
                >
                  <VStack
                    bg="gray.200" // Apply the background color directly from NativeBase
                    borderRadius="8"
                    width={140}
                  >
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

        {filteredPosts.map((post) => (
          <PostWidget key={post.id} postRef={post.id} />
        ))}
      </ScrollView>
    </NativeBaseProvider>
  );
}

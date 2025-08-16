import { useEffect, useState } from "react";
import {
  NativeBaseProvider,
  Box,
  Text,
  Icon,
  HStack,
  VStack,
  Pressable,
  FlatList,
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
  const [selectedOption, setSelectedOption] = useState("Posts");
  const options = ["Posts", "Liked", "Commented"];
  const [tabLayouts, setTabLayouts] = useState([]);
  const selectedIndex = options.indexOf(selectedOption);

  useEffect(() => {
    const fetchPostRefs = async () => {
      try {
        if (currentUser) {
          const userData = await getRef({
            id: currentUser.uid,
            collectionName: "users",
          });
          console.log("👤 userData:", userData);
          const userPosts = await fetchUserPosts(currentUser.uid);
          console.log(userData.postRef);
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
        }
      } catch (error) {
        console.error("Error fetching post references:", error.message);
      }
    };

    fetchPostRefs();
  }, [selectedOption]);

  const displayedPosts =
    selectedOption === "Posts"
      ? posts
      : selectedOption === "Liked"
      ? likedPosts
      : commentedPosts;

  console.log("🔍 displayedPosts for", selectedOption, ":", displayedPosts);
  
  return (
    <NativeBaseProvider>
      <Box flex={1} bg="white">
        {/* Fixed Header Section - This won't scroll */}
        <Box
          bg="white"
          h={"12%"}
          justifyContent="space-between"
          alignItems="center"
          flexDirection="row"
          px={4}
          pt={"10%"}
        >
          <Text
            fontSize="28"
            fontWeight="medium"
            color="#836fff"
            fontFamily={"Roboto Serif"}
          >
            {user?.first_name + " " + user?.last_name}
          </Text>
        </Box>

        {/* Fixed Profile Info Section - This won't scroll */}
        <Box bg="white" pt="8px">
          <VStack>
            <HStack
              justifyContent="space-between"
              space="24px"
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

        {/* Fixed Tab Section - This won't scroll */}
        <Box bg="white" pt="8px">
          <HStack justifyContent="space-between" px="16px">
            {options.map((option, index) => (
              <Pressable
                key={index}
                flex={1}
                alignItems="center"
                onPress={() => setSelectedOption(option)}
                onLayout={(event) => {
                  const { x, width } = event.nativeEvent.layout;
                  setTabLayouts((prev) => {
                    const copy = [...prev];
                    copy[index] = { x, width };
                    return copy;
                  });
                }}
              >
                <VStack alignItems="center" py={2}>
                  <Text
                    fontSize="16px"
                    padding="10px"
                    fontWeight={selectedOption === option ? "bold" : "500"}
                    color={selectedOption === option ? "#836fff" : "gray.500"}
                  >
                    {option}
                  </Text>
                  {/* Gray Line for all tabs */}
                  <Box
                    mt={1}
                    width="100%"
                    height="2px"
                    bg="gray.300"
                    position="absolute"
                    bottom={0}
                  />
                </VStack>
              </Pressable>
            ))}

            {/* Animated Underline */}
            {selectedIndex >= 0 &&
              tabLayouts[selectedIndex]?.x !== undefined &&
              tabLayouts[selectedIndex]?.width !== undefined && (
                <MotiView
                  style={{
                    position: "absolute",
                    bottom: 0,
                    height: 2,
                    backgroundColor: "#836fff",
                    borderRadius: 2,
                  }}
                  from={{ translateX: 0, width: 0 }}
                  animate={{
                    translateX: tabLayouts[selectedIndex].x,
                    width: tabLayouts[selectedIndex].width,
                  }}
                  transition={{ type: "timing", duration: 200 }}
                />
            )}
          </HStack>
        </Box>

        {/* Scrollable Posts Section - Only this part scrolls */}
        <Box flex={1}>
          {displayedPosts.length > 0 ? (
            <PostPreviews
              data={displayedPosts}
              navigation={navigation}
              isMarketView={false}
            />
          ) : (
            <Box flex={1} justifyContent="center" alignItems="center">
              <Text textAlign="center" mt={4} color="gray.500">
                No posts found.
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </NativeBaseProvider>
  );
}
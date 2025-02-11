import React, { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { AnimatePresence, MotiView } from "moti";
import PostWidget from "../components/postwidget";
import { getDocs, collection, db } from "../firebase/firebaseConfig";

export default function MainPage() {
  const [postRefs, setPostRefs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Latest");
  const options = ["Latest", "Most Liked", "Most Commented", "Most Viewed"];

  useEffect(() => {
    const fetchPostRefs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        const refs = querySnapshot.docs.map((doc) => doc.id);
        setPostRefs(refs);
      } catch (error) {
        console.error("Error fetching post references:", error.message);
      }
    };

    fetchPostRefs();
  }, []);

  return (
    <NativeBaseProvider>
      <Box
        bg="#836fff"
        h={"12%"}
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
        px={4}
        pt={"10%"}
      >
        <Image
          source={require("../images/iconreverse.png")}
          style={{ width: 48, height: 48 }}
        />
        <Text fontSize="30" fontWeight="bold" color="white">
          UCL
        </Text>
        <Icon
          as={Ionicons}
          name="notifications-outline"
          size={28}
          color="white"
        />
      </Box>

      <ScrollView flex={1}>
        <Box flex={1} bg="gray.100">
          <Box bg="white" pt={5} py={3} px={4} shadow={2}>
            <Input
              placeholder="Find Posts..."
              variant="rounded"
              bg="gray.200"
              fontSize="md"
              InputLeftElement={
                <Icon
                  as={Ionicons}
                  name="search"
                  size={5}
                  ml={3}
                  color="gray.500"
                />
              }
            />
          </Box>
          <Box bg="white" py={4}>
            <HStack justifyContent="space-evenly" bg="white">
              <VStack alignItems="center">
                <Image
                  source={require("../images/School.jpeg")}
                  style={{ width: 24, height: 24 }}
                />
                <Text fontSize="12">Portico</Text>
              </VStack>
              <VStack alignItems="center">
                <Image
                  source={require("../images/Notification.jpeg")}
                  style={{ width: 24, height: 24 }}
                />
                <Text fontSize="12">Notice</Text>
              </VStack>
              <VStack alignItems="center">
                <Image
                  source={require("../images/library_2.jpeg")}
                  style={{ width: 24, height: 24 }}
                />
                <Text fontSize="12">Library</Text>
              </VStack>
              <VStack alignItems="center">
                <Image
                  source={require("../images/Calendar.jpeg")}
                  style={{ width: 24, height: 24 }}
                />
                <Text fontSize="12">Calendar</Text>
              </VStack>
            </HStack>
          </Box>

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

        {postRefs.map((postRef) => (
          <PostWidget key={postRef} postRef={postRef} />
        ))}
      </ScrollView>
    </NativeBaseProvider>
  );
}

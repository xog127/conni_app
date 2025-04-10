import React from "react";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Linking, Platform } from "react-native";
import {
  VStack,
  Text,
  Pressable,
  HStack,
  Box,
  Avatar,
  Divider,
  Icon,
  useTheme,
} from "native-base";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useAuth } from "../services/authContext";

function CustomDrawerContent(props) {
  const { user } = useAuth();
  const theme = useTheme();

  const quickLinks = [
    {
      name: "Portico",
      icon: "school",
      color: "#4CAF50",
      url: "https://evision.ucl.ac.uk/",
    },
    {
      name: "Moodle",
      icon: "graduation-cap",
      color: "#2196F3",
      url: "https://moodle.ucl.ac.uk/",
    },
    {
      name: "Library",
      icon: "book",
      color: "#9C27B0",
      url: "https://www.ucl.ac.uk/library/",
    },
    {
      name: "Calendar",
      icon: "calendar-alt",
      color: "#FF9800",
      url: "https://timetable.ucl.ac.uk/",
    },
  ];

  const renderQuickLink = (item, index) => (
    <Pressable 
      key={index} 
      onPress={() => Linking.openURL(item.url)}
      mb={2}
    >
      <HStack
        alignItems="center"
        space={3}
        py={3}
        px={4}
        borderRadius="xl"
        bg="gray.50"
        _pressed={{ bg: "gray.100" }}
      >
        <Box
          width={10}
          height={10}
          borderRadius="lg"
          bg={item.color + "10"}
          justifyContent="center"
          alignItems="center"
        >
          <FontAwesome5 name={item.icon} size={20} color={item.color} />
        </Box>
        <Text fontSize="md" fontWeight="medium" color="gray.800">
          {item.name}
        </Text>
      </HStack>
    </Pressable>
  );

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ 
        flexGrow: 1,
        paddingTop: Platform.OS === 'ios' ? 0 : 20
      }}
    >
      <VStack space={6} flex={1} px={4}>
        {/* User Profile Section */}
        <Box pt={4} pb={6}>
          <Pressable 
            onPress={() => props.navigation.navigate("Profile")}
          >
            <HStack space={3} alignItems="center">
              <Avatar
                size="lg"
                source={
                  user?.photo_url
                    ? { uri: user.photo_url }
                    : require("../images/Blankprofile.png")
                }
                bg="gray.300"
              />
              <VStack>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  {user?.first_name} {user?.last_name}
                </Text>
                <HStack space={1} alignItems="center">
                  <Text fontSize="sm" color="gray.500">
                    View Profile
                  </Text>
                  <Icon 
                    as={Ionicons}
                    name="chevron-forward" 
                    size={4} 
                    color="gray.400"
                  />
                </HStack>
              </VStack>
            </HStack>
          </Pressable>
        </Box>

        <Divider bg="gray.200" />

        {/* Quick Links */}
        <VStack space={3}>
          <Text 
            fontSize="xs" 
            fontWeight="bold" 
            color="gray.500"
            letterSpacing="xl"
            pl={2}
          >
            QUICK LINKS
          </Text>
          <VStack space={2}>
            {quickLinks.map(renderQuickLink)}
          </VStack>
        </VStack>

        <Box flex={1} />

        {/* Feedback Button */}
        <Box pb={6}>
          <Pressable
            onPress={() => props.navigation.navigate("Feedback")}
          >
            <HStack
              space={3}
              py={3}
              px={4}
              borderRadius="2xl"
              bg="#836FFF15"
              alignItems="center"
              borderWidth={1}
              borderColor="#836FFF20"
            >
              <Icon 
                as={Ionicons}
                name="chatbubble-ellipses-outline" 
                size={5} 
                color="#836FFF"
              />
              <Text fontSize="md" fontWeight="medium" color="#836FFF">
                Give Feedback
              </Text>
            </HStack>
          </Pressable>
        </Box>
      </VStack>
    </DrawerContentScrollView>
  );
}

export default CustomDrawerContent;

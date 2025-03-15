import React from "react";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Linking } from "react-native";
import {
  VStack,
  Text,
  Pressable,
  HStack,
  Box,
  NativeBaseProvider,
} from "native-base";
import { FontAwesome5 } from "@expo/vector-icons";

function CustomDrawerContent(props) {
  const menuItems = [
    {
      name: "Portico",
      icon: "school",
      color: "green",
      url: "https://www.example1.com",
    },
    {
      name: "Notice",
      icon: "bell",
      color: "red",
      url: "https://www.example2.com",
    },
    {
      name: "Library",
      icon: "book",
      color: "blue",
      url: "https://www.example3.com",
    },
    {
      name: "Calendar",
      icon: "calendar-alt",
      color: "brown",
      url: "https://www.example4.com",
    },
  ];

  return (
    <NativeBaseProvider>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        <VStack space="6" my="2" mx="4">
          {/* Sidebar Header */}
          <Text fontSize="30" fontWeight="bold" fontFamily={"Roboto Serif"}>
            University College London
          </Text>
          {/* Menu List */}
          <Box>
            <Text fontSize="24" fontWeight="semibold" height={"12"} py={"8px"}>
              Quick Menu
            </Text>
            {menuItems.map((item, index) => (
              <Pressable key={index} onPress={() => Linking.openURL(item.url)}>
                <HStack
                  alignItems="center"
                  space={3}
                  py={4}
                  borderBottomWidth={1}
                  borderColor="white"
                  justifyContent={"space-between"}
                >
                  <Text fontSize="16" fontWeight={"medium"}>
                    {item.name}
                  </Text>
                  <FontAwesome5 name={item.icon} size={20} color={item.color} />
                </HStack>
              </Pressable>
            ))}
          </Box>

          {/* Feedback Button */}
          <Pressable
            mt={10}
            p={3}
            bg="gray.200"
            borderRadius="md"
            alignItems="center"
            onPress={() => props.navigation.navigate("Feedback")}
          >
            <Text fontSize="md">Give Feedback</Text>
          </Pressable>
        </VStack>
      </DrawerContentScrollView>
    </NativeBaseProvider>
  );
}

export default CustomDrawerContent;

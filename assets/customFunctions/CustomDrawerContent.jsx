import React from "react";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Linking } from "react-native";
import { VStack, Text, Pressable, NativeBaseProvider } from "native-base";

function CustomDrawerContent(props) {
  return (
    <NativeBaseProvider>
      <DrawerContentScrollView {...props}>
        <VStack space="6" my="2" mx="1">
          <Text bold color="gray.700" px="4">
            Sidebar Menu
          </Text>
          <VStack space="3">
            {/* External Links */}
            <Pressable
              onPress={() => Linking.openURL("https://www.example1.com")}
            >
              <Text color="blue.500">Example Website 1</Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL("https://www.example2.com")}
            >
              <Text color="blue.500">Example Website 2</Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL("https://www.example3.com")}
            >
              <Text color="blue.500">Example Website 3</Text>
            </Pressable>
          </VStack>
          <VStack space="3" mt="5">
            {/* Internal Navigation */}
            <Pressable onPress={() => props.navigation.navigate("Feedback")}>
              <Text color="blue.500">Go to Feedback Page</Text>
            </Pressable>
          </VStack>
        </VStack>
      </DrawerContentScrollView>
    </NativeBaseProvider>
  );
}

export default CustomDrawerContent;

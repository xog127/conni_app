import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  ScrollView,
  Spinner,
  Icon,
} from "native-base";
import { useAuth } from "../services/authContext";
import { Ionicons } from "@expo/vector-icons";
import NotificationCard from "../components/notificationcard";
import {
  subscribeToNotifications,
  formatNotificationForDisplay,
  markNotificationAsRead,
} from "../firebase/queries"; // Adjust path as needed
export default function NotificationScreen({ navigation }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications(
      user.uid,
      (rawNotifications) => {
        // Format notifications for display
        const formattedNotifications = rawNotifications.map(
          formatNotificationForDisplay
        );
        setNotifications(formattedNotifications);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user?.uid]);

  const handleNotificationPress = async (notification) => {
    try {
      // Mark notification as read
      if (!notification.read) {
        await markNotificationAsRead(user.uid, notification.id);
      }
      // Handle navigation based on notification type
      switch (notification.type) {
        case "comment":
        case "like":
          console.log("Navigating to post:", notification);
          console.log("Post ID:", notification.postId);
          // Use postId from the notification (it's at the top level)
          if (notification.postId) {
            navigation.navigate("PostDisplay", {
              postRef: notification.postId,
              navigation,
            });
          }
          break;
        case "message":
          navigation.navigate("Messages");
          break;
        default:
          console.log("Notification pressed:", notification);
      }
    } catch (error) {
      console.error("Error handling notification press:", error);
    }
  };

  return (
    <Box flex={1} bg="white">
      {/* Header */}
      <HStack
        px={4}
        py={3}
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="gray.200"
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Icon as={Ionicons} name="arrow-back" size={6} color="black" />
        </Pressable>
        <Text fontSize="lg" fontWeight="bold">
          Notification
        </Text>
        <Box w={6} /> {/* Spacer for alignment */}
      </HStack>

      {/* Notifications List */}
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Box flex={1} justifyContent="center" alignItems="center" mt={10}>
            <Spinner size="lg" color="blue.500" />
            <Text mt={4} color="gray.500">
              Loading notifications...
            </Text>
          </Box>
        ) : notifications.length === 0 ? (
          <Box flex={1} justifyContent="center" alignItems="center" mt={10}>
            <Ionicons name="notifications-outline" size={64} color="#9CA3AF" />
            <Text mt={4} fontSize={18} color="gray.500">
              No notifications yet
            </Text>
            <Text
              mt={2}
              fontSize={14}
              color="gray.400"
              textAlign="center"
              px={8}
            >
              You'll see notifications here when someone interacts with your
              posts
            </Text>
          </Box>
        ) : (
          <VStack space={0}>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={handleNotificationPress}
              />
            ))}
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const NotificationCard = ({ notification, onPress }) => {
  const getIconName = (type) => {
    switch (type) {
      case "comment":
        return "message-circle";
      case "like":
        return "heart";
      case "message":
        return "mail";
      case "follow":
        return "user-plus";
      default:
        return "bell";
    }
  };

  const getIconColor = (type, isRead) => {
    if (isRead) {
      return "#9CA3AF"; // Gray color for read notifications
    }

    switch (type) {
      case "comment":
        return "#3B82F6"; // Blue
      case "like":
        return "#EF4444"; // Red
      case "message":
        return "#10B981"; // Green
      case "follow":
        return "#8B5CF6"; // Purple
      default:
        return "#6B7280"; // Gray
    }
  };

  const formatTimeAgo = (timestamp) => {
    // If timestamp is already formatted (like "1 min ago"), return as is
    if (typeof timestamp === "string" && timestamp.includes("ago")) {
      return timestamp;
    }

    // Otherwise, you can implement your own time formatting logic here
    // For now, returning a default
    return timestamp || "Just now";
  };

  const isRead = notification.read;

  return (
    <TouchableOpacity
      style={[styles.card, isRead && styles.readCard]}
      activeOpacity={0.7}
      onPress={() => onPress && onPress(notification)}
    >
      {/* Left - Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              getIconColor(notification.type, isRead) + (isRead ? "15" : "20"),
          },
        ]}
      >
        <Feather
          name={getIconName(notification.type)}
          size={20}
          color={getIconColor(notification.type, isRead)}
        />
      </View>

      {/* Middle - Content */}
      <View style={styles.contentContainer}>
        <Text
          style={[styles.title, isRead && styles.readTitle]}
          numberOfLines={2}
        >
          {notification.title}
        </Text>
        <Text style={[styles.timestamp, isRead && styles.readTimestamp]}>
          {formatTimeAgo(notification.timestamp)}
        </Text>
      </View>

      {/* Right - Unread indicator */}
      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  readCard: {
    backgroundColor: "#F9FAFB",
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 20,
  },
  readTitle: {
    color: "#6B7280",
    fontWeight: "400",
  },
  timestamp: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  readTimestamp: {
    color: "#9CA3AF",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
  },
});

export default NotificationCard;

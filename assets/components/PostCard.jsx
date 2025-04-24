import React from "react";
import { Box, Text, HStack, Pressable, VStack } from "native-base";
import { Image } from "expo-image";
import PostUserInfo from "./postuserinfo.jsx";
import HeartIcon from "../customIcon/HeartIcon.js";
import CommentIcon from "../customIcon/CommentIcon.js";
import ViewIcon from "../customIcon/ViewIcon.js";
import { timeAgo } from "../customFunctions/time.js";
import { StyleSheet, View } from "react-native";

const PostCard = ({ item, navigation }) => {
  // Convert timestamp to relative time
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    
    // If it's a Firebase timestamp
    if (timestamp.seconds) {
      return timeAgo(timestamp);
    }
    
    // If it's already in milliseconds
    if (typeof timestamp === 'number') {
      return timeAgo({ seconds: Math.floor(timestamp / 1000) });
    }
    
    return "Just now";
  };

  const renderForumDetails = React.useMemo(() => {
    if (!item?.forum_details || !item?.forum_type || item?.forum_type === "General") return null;

    // Helper functions inside useMemo to ensure proper scope
    const renderLabel = (label, value, prefix = "", suffix = "") => {
      if (!value) return null;
      return (
        <View style={styles.detailLine}>
          <View style={styles.labelContainer}>
            <Text style={styles.detailLabel}>{label}:</Text>
          </View>
          <Text style={styles.detailValue}>
            {prefix}{value}{suffix}
          </Text>
        </View>
      );
    };

    const renderEmphasis = (text) => {
      if (!text) return null;
      return (
        <View style={[styles.detailLine, styles.emphasisContainer]}>
          <Text style={styles.emphasis}>{text}</Text>
        </View>
      );
    };

    const renderSkillChips = (skills) => {
      if (!skills || !skills.length) return null;
      return (
        <View style={styles.detailLine}>
          <View style={styles.labelContainer}>
            <Text style={styles.detailLabel}>Skills:</Text>
          </View>
          <View style={styles.skillsContainer}>
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    };

    let content = null;

    switch (item.forum_type) {
      case "Market":
        const marketType = item.forum_details["Buy or Sell"] || "Sell";
        content = (
          <View>
            {renderEmphasis(marketType)}
            {renderLabel("Item", item.forum_details.Item)}
            {renderLabel("Price", item.forum_details.Price, "£")}
          </View>
        );
        break;

      case "Research":
        content = (
          <View>
            {renderLabel("Duration", item.forum_details.Duration)}
            {renderLabel("Eligibilities", item.forum_details.Eligibilities)}
          </View>
        );
        break;

      case "Ticket":
        const ticketType = item.forum_details["Buy or Sell"] || "Sell";
        content = (
          <View>
            {renderEmphasis(ticketType)}
            {item.forum_details.Date && renderLabel("Date", new Date(item.forum_details.Date).toISOString().split('T')[0])}
            {renderLabel("Price", item.forum_details.Price, "£")}
            {renderLabel("Quantity", item.forum_details.Quantity)}
          </View>
        );
        break;

      case "Flat":
        content = (
          <View>
            {renderEmphasis(item.forum_details["Rent type"])}
            {item.forum_details["Move in Date"] && renderLabel("Move in Date", new Date(item.forum_details["Move in Date"]).toISOString().split('T')[0])}
            {item.forum_details["Move out Date"] && renderLabel("Move out Date", new Date(item.forum_details["Move out Date"]).toISOString().split('T')[0])}
            {renderLabel("Location", item.forum_details.Location)}
            {renderLabel("Price", item.forum_details.Price, "£", " per week")}
          </View>
        );
        break;

      case "Project":
        const incentive = item.forum_details.Incentive || "Money";
        content = (
          <View>
            {renderLabel("Incentive", incentive)}
            {incentive === "Other" && item.forum_details.CustomIncentive && 
              renderLabel("Custom incentive", item.forum_details.CustomIncentive)}
            {renderSkillChips(item.forum_details.Skills)}
          </View>
        );
        break;

      default:
        return null;
    }

    return content;
  }, [item?.forum_details, item?.forum_type]);

  if (!item) return null;

  return (
    <Pressable 
      onPress={() => navigation?.navigate('PostDisplay', { postRef: item.id, navigation })}
    >
      <Box
        bg="white"
        shadow={1}
        p={4}
        borderTopWidth={2}
        borderTopColor="#F6F6F6"
      >
        <PostUserInfo
          userRef={item?.post_user}
          anonymous={item?.anonymous}
          date_posted={getTimeAgo(item?.time_posted)}
          forumRef={item?.post_genre_ref}
        />

        <Text
          isTruncated
          maxW="1000"
          fontSize="16px"
          mb={1}
          lineHeight="24px"
          fontWeight="500"
        >
          {item?.post_title || 'Untitled Post'}
        </Text>

        <Text noOfLines={4} fontSize="sm" color="gray.700">
          {item?.post_data || 'No content'}
        </Text>

        {item?.forum_details && item?.forum_type && item.forum_type !== "General" && (
          <Box mt={2}>
            <View style={styles.forumDetailsBox}>
              {renderForumDetails}
            </View>
          </Box>
        )}

        {item?.post_photo && (
          <Box mt={4}>
            <Image
              source={{ uri: item.post_photo }}
              style={{
                width: "100%",
                height: 300,
                borderRadius: 8,
              }}
              contentFit="cover"
              transition={200}
            />
          </Box>
        )}

        <HStack justifyContent="space-between" mt={2} alignItems="center">
          <HStack alignItems="center">
            <Pressable>
              <HStack alignItems="center">
                <HeartIcon size={20} color="#FF5963" />
                <Text fontSize="xs" color="gray.700" ml={1}>
                  {item?.likes?.length || 0}
                </Text>
              </HStack>
            </Pressable>
            <Pressable ml={4}>
              <HStack alignItems="center">
                <CommentIcon size={20} color="#464A4D" />
                <Text fontSize="xs" color="gray.700" ml={1}>
                  {item?.num_comments || 0}
                </Text>
              </HStack>
            </Pressable>
            <Pressable ml={4}>
              <HStack alignItems="center">
                <ViewIcon size={20} color="#464A4D" />
                <Text fontSize="xs" color="gray.700" ml={1}>
                  {item?.views || 0}
                </Text>
              </HStack>
            </Pressable>
          </HStack>
        </HStack>
      </Box>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  emphasis: {
    fontWeight: "600",
    color: "#836fff",
    fontSize: 14,
  },
  emphasisContainer: {
    marginBottom: 10,
  },
  detailLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  labelContainer: {
    width: 100, // Fixed width for labels
    marginRight: 8,
  },
  detailLabel: {
    color: "#666",
    fontWeight: "500",
    fontSize: 14,
  },
  detailValue: {
    color: "#333",
    fontSize: 14,
    flex: 1,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  skillChip: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  skillChipText: {
    fontSize: 12,
    color: "#666",
  },
  forumDetailsBox: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
});

export default PostCard;

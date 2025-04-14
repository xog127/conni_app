import React from "react";
import { Box, Text, HStack, Pressable, VStack, View } from "native-base";
import { Image } from "expo-image";
import PostUserInfo from "./postuserinfo.jsx";
import HeartIcon from "../customIcon/HeartIcon.js";
import CommentIcon from "../customIcon/CommentIcon.js";
import ViewIcon from "../customIcon/ViewIcon.js";
import { timeAgo } from "../customFunctions/time.js";
import { StyleSheet } from "react-native";

const PostCard = ({ item, navigation }) => {
  // Convert timestamp to milliseconds for timeAgo function
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    if (timestamp.seconds) {
      return timeAgo(timestamp.seconds * 1000);
    }
    return timeAgo(timestamp);
  };

  const renderForumDetails = (post) => {
    if (!post.forum_details) return null;

    const renderLabel = (label, value, prefix = "", suffix = "") => {
      if (!value) return null;
      return (
        <View style={styles.detailLine}>
          <View style={styles.labelContainer}>
            <Text style={styles.detailLabel}>{label}:</Text>
          </View>
          <Text style={styles.detailValue}>
            {prefix}
            {value}
            {suffix}
          </Text>
        </View>
      );
    };

    const renderEmphasis = (text) => (
      <View style={[styles.detailLine, styles.emphasisContainer]}>
        <Text style={styles.emphasis}>{text}</Text>
      </View>
    );

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

    switch (post.forum_type) {
      case "Market":
        const marketType = post.forum_details["Buy or Sell"] || "Sell";
        return (
          <View>
            {renderEmphasis(marketType)}
            {post.forum_details.Item &&
              renderLabel("Item", post.forum_details.Item)}
            {post.forum_details.Price &&
              renderLabel("Price", post.forum_details.Price, "£")}
          </View>
        );

      case "Research":
        return (
          <View>
            {renderLabel("Duration", post.forum_details.Duration)}
            {renderLabel("Eligibilities", post.forum_details.Eligibilities)}
          </View>
        );

      case "Ticket":
        const ticketType = post.forum_details["Buy or Sell"] || "Sell";
        return (
          <View>
            {renderEmphasis(ticketType)}
            {post.forum_details.Date &&
              renderLabel(
                "Date",
                new Date(post.forum_details.Date).toISOString().split("T")[0]
              )}
            {post.forum_details.Price &&
              renderLabel("Price", post.forum_details.Price, "£")}
            {post.forum_details.Quantity &&
              renderLabel("Quantity", post.forum_details.Quantity)}
          </View>
        );

      case "Flat":
        return (
          <View>
            {renderEmphasis(post.forum_details["Rent type"])}
            {renderLabel(
              "Move in Date",
              new Date(post.forum_details["Move in Date"])
                .toISOString()
                .split("T")[0]
            )}
            {renderLabel(
              "Move out Date",
              new Date(post.forum_details["Move out Date"])
                .toISOString()
                .split("T")[0]
            )}
            {renderLabel("Location", post.forum_details.Location)}
            {renderLabel("Price", post.forum_details.Price, "£", " per week")}
          </View>
        );

      case "Project":
        const incentive = post.forum_details.Incentive || "Money";
        return (
          <View>
            {renderLabel("Incentive", incentive)}
            {incentive === "Other" &&
              post.forum_details.CustomIncentive &&
              renderLabel(
                "Custom incentive",
                post.forum_details.CustomIncentive
              )}
            {renderSkillChips(post.forum_details.Skills)}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Pressable
      onPress={() =>
        navigation.navigate("PostDisplay", { postRef: item.id, navigation })
      }
    >
      <Box
        bg="white"
        shadow={1}
        p={4}
        borderTopWidth={2}
        borderTopColor="#F6F6F6"
      >
        <PostUserInfo
          userRef={item.post_user}
          anonymous={item.anonymous}
          date_posted={getTimeAgo(item.time_posted)}
          forumRef={item.post_genre_ref}
        />

        <Text
          isTruncated
          maxW="1000"
          fontSize="16px"
          mb={1}
          lineHeight="24px"
          fontWeight="500"
        >
          {item.post_title}
        </Text>

        <Text noOfLines={4} fontSize="sm" color="gray.700">
          {item.post_data}
        </Text>

        {item.forum_details && item.forum_type && (
          <Box mt={2}>
            <View style={styles.forumDetailsBox}>
              {renderForumDetails(item)}
            </View>
          </Box>
        )}

        {item.post_photo && (
          <Image
            source={{ uri: item.post_photo }}
            style={{
              alignSelf: "center",
              width: "100%",
              height: undefined,
              aspectRatio: 1,
            }}
            contentFit="contain"
            contentPosition="center"
          />
        )}

        <HStack justifyContent="space-between" mt={2} alignItems="center">
          <HStack alignItems="center">
            <Pressable>
              <HStack alignItems="center">
                <HeartIcon size={20} color="#FF5963" />
                <Text fontSize="xs" color="gray.700" ml={1}>
                  {item.num_likes || 0}
                </Text>
              </HStack>
            </Pressable>
            <Pressable ml={4}>
              <HStack alignItems="center">
                <CommentIcon size={20} color="#464A4D" />
                <Text fontSize="xs" color="gray.700" ml={1}>
                  {item.num_comments || 0}
                </Text>
              </HStack>
            </Pressable>
            <Pressable ml={4}>
              <HStack alignItems="center">
                <ViewIcon size={20} color="#464A4D" />
                <Text fontSize="xs" color="gray.700" ml={1}>
                  {item.views || 0}
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
    flexDirection: "row",
    alignItems: "flex-start",
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
  },
});

export default PostCard;

// components/ForumDetails.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ForumDetails = ({ forumType, forumDetails }) => {
  if (!forumType || !forumDetails || forumType === "General") return null;

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

  switch (forumType) {
    case "Market":
      const marketType = forumDetails["Buy or Sell"] || "Sell";
      content = (
        <>
          {renderEmphasis(marketType)}
          {renderLabel("Item", forumDetails.Item)}
          {renderLabel("Price", forumDetails.Price, "£")}
        </>
      );
      break;

    case "Research":
      content = (
        <>
          {renderLabel("Duration", forumDetails.Duration)}
          {renderLabel("Eligibilities", forumDetails.Eligibilities)}
        </>
      );
      break;

    case "Ticket":
      const ticketType = forumDetails["Buy or Sell"] || "Sell";
      content = (
        <>
          {renderEmphasis(ticketType)}
          {forumDetails.Date &&
            renderLabel(
              "Date",
              new Date(forumDetails.Date).toISOString().split("T")[0]
            )}
          {renderLabel("Price", forumDetails.Price, "£")}
          {renderLabel("Quantity", forumDetails.Quantity)}
        </>
      );
      break;

    case "Flat":
      content = (
        <>
          {renderEmphasis(forumDetails["Rent type"])}
          {renderLabel(
            "Move in Date",
            new Date(forumDetails["Move in Date"]).toISOString().split("T")[0]
          )}
          {renderLabel(
            "Move out Date",
            new Date(forumDetails["Move out Date"]).toISOString().split("T")[0]
          )}
          {renderLabel("Location", forumDetails.Location)}
          {renderLabel("Price", forumDetails.Price, "£", " per week")}
        </>
      );
      break;

    case "Project":
      const incentive = forumDetails.Incentive || "Money";
      content = (
        <>
          {renderLabel("Incentive", incentive)}
          {incentive === "Other" &&
            forumDetails.CustomIncentive &&
            renderLabel("Custom incentive", forumDetails.CustomIncentive)}
          {renderSkillChips(forumDetails.Skills)}
        </>
      );
      break;

    default:
      return null;
  }

  return <View style={styles.forumDetailsBox}>{content}</View>;
};

const styles = StyleSheet.create({
  forumDetailsBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    borderColor: "#eee",
    borderWidth: 1,
  },
  detailLine: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center",
  },
  labelContainer: {
    minWidth: 90,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
  },
  emphasisContainer: {
    marginBottom: 8,
  },
  emphasis: {
    fontSize: 16,
    fontWeight: "600",
    color: "#836fff",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  skillChip: {
    backgroundColor: "#836fff20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    marginTop: 4,
  },
  skillChipText: {
    color: "#836fff",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ForumDetails;

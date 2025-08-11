// components/ForumDetails.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ForumDetails = ({ forumType, forumDetails }) => {
  if (!forumType || !forumDetails || forumType === "General") return null;

  const renderLabel = (label, value) => {
    if (!value) return null;
    return (
      <View style={styles.detailLine}>
        <View style={styles.labelContainer}>
          <Text style={styles.detailLabel}>{label}:</Text>
        </View>
        <Text style={styles.detailValue}>{String(value)}</Text>
      </View>
    );
  };

  const renderSkillChips = (skills) => {
    if (!skills || !Array.isArray(skills) || skills.length === 0) return null;
    return (
      <View style={styles.detailLine}>
        <View style={styles.labelContainer}>
          <Text style={styles.detailLabel}>Skills:</Text>
        </View>
        <View style={styles.skillsContainer}>
          {skills.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillChipText}>{String(skill)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Get forum type config
  const getForumTypeConfig = (type) => {
    const configs = {
      Market: { icon: "🛍️", color: "#4CAF50" },
      Research: { icon: "🔬", color: "#2196F3" },
      Ticket: { icon: "🎟️", color: "#FF9800" },
      Flat: { icon: "🏠", color: "#9C27B0" },
      Project: { icon: "💼", color: "#FF5722" },
    };
    return configs[type] || { icon: "📝", color: "#836fff" };
  };

  const config = getForumTypeConfig(forumType);

  // Get header emphasis
  const getHeaderEmphasis = () => {
    if (forumType === "Market" || forumType === "Ticket") {
      return forumDetails["Buy or Sell"] || "Sell";
    }
    if (forumType === "Flat") {
      return forumDetails["Rent type"] || "";
    }
    return null;
  };

  const headerEmphasis = getHeaderEmphasis();

  // Render content based on forum type
  const renderContent = () => {
    try {
      switch (forumType) {
        case "Market":
          return (
            <>
              {renderLabel("Item", forumDetails.Item)}
              {forumDetails.Price && renderLabel("Price", `£${forumDetails.Price}`)}
            </>
          );

        case "Research":
          return (
            <>
              {renderLabel("Duration", forumDetails.Duration)}
              {renderLabel("Eligibilities", forumDetails.Eligibilities)}
            </>
          );

        case "Ticket":
          return (
            <>
              {forumDetails.Date && renderLabel("Date", new Date(forumDetails.Date).toLocaleDateString())}
              {forumDetails.Price && renderLabel("Price", `£${forumDetails.Price}`)}
              {renderLabel("Quantity", forumDetails.Quantity)}
            </>
          );

        case "Flat":
          return (
            <>
              {forumDetails["Move in Date"] && renderLabel("Move in", new Date(forumDetails["Move in Date"]).toLocaleDateString())}
              {forumDetails["Move out Date"] && renderLabel("Move out", new Date(forumDetails["Move out Date"]).toLocaleDateString())}
              {renderLabel("Location", forumDetails.Location)}
              {forumDetails.Price && renderLabel("Price", `£${forumDetails.Price}/week`)}
            </>
          );

        case "Project":
          const incentive = forumDetails.Incentive || "Money";
          return (
            <>
              {renderLabel("Incentive", incentive)}
              {incentive === "Other" && forumDetails.CustomIncentive && 
                renderLabel("Details", forumDetails.CustomIncentive)}
              {renderSkillChips(forumDetails.Skills)}
            </>
          );

        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering forum details content:", error);
      return null;
    }
  };

  return (
    <View style={[styles.forumDetailsBox, { borderLeftColor: config.color }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.forumIcon}>{config.icon}</Text>
          <Text style={[styles.forumType, { color: config.color }]}>
            {forumType}
          </Text>
        </View>
        {headerEmphasis && (
          <View style={[styles.emphasisPill, { backgroundColor: config.color }]}>
            <Text style={styles.emphasis}>{headerEmphasis}</Text>
          </View>
        )}
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  forumDetailsBox: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  forumIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  forumType: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailLine: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  labelContainer: {
    minWidth: 80,
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
    fontWeight: "400",
  },
  emphasisPill: {
    backgroundColor: "#836fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emphasis: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  skillChip: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 4,
  },
  skillChipText: {
    color: "#4338CA",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ForumDetails;
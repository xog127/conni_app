import React, { useState, useEffect } from "react";
import { Box, Text, HStack, VStack, Pressable, Icon } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { fetchReferenceData } from "../firebase/queries";
import { Image } from "expo-image";
import UserSummaryModal from "../pages/UserSummaryModals"; // check path
// import timeAgo if you prefer relative time: import { timeAgo } from "../customFunctions/time";

const PostUserInfo = ({ userRef, anonymous, date_posted, forumRef, onMorePress }) => {
  const [postUser, setPostUser] = useState(null);
  const [forum, setForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileVisible, setProfileVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const [u, f] = await Promise.all([
          userRef ? fetchReferenceData(userRef).catch(() => null) : Promise.resolve(null),
          forumRef ? fetchReferenceData(forumRef).catch(() => null) : Promise.resolve(null),
        ]);
        if (!isMounted) return;
        setPostUser(u);
        setForum(f);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => { isMounted = false; };
  }, [userRef, forumRef]);

  if (loading) return <Text>Loading...</Text>;

  // --- Date formatting (robust) ---
  const formatPosted = (d) => {
    if (!d) return "";
    // Firestore Timestamp
    if (d.seconds != null) return new Date(d.seconds * 1000).toLocaleString();
    // millis
    if (typeof d === "number") return new Date(d).toLocaleString();
    // string
    return String(d);
    // Or use: return timeAgo(d) if you prefer relative.
  };

  // --- Name & image logic ---
  let userImage;
  let userName;

  if (anonymous) {
    // Always treat as anonymous, regardless of user doc status
    userImage = require("../images/Blankprofile.png");
    const course = postUser?.course?.trim();
    const year = postUser?.graduation_year || postUser?.graduationYear || "";
    userName = (course || year)
      ? `${course ?? "UCL"} ${year}`
      : "Anonymous";
  } else if (!postUser) {
    userImage = require("../images/Blankprofile.png");
    userName = "[Deleted User]";
  } else {
    const uri = postUser.photo_url || postUser.profileImage || postUser.avatar || null;
    userImage = uri ? { uri } : require("../images/Blankprofile.png");
    const first = (postUser.first_name || postUser.firstName || "").trim();
    const last = (postUser.last_name || postUser.lastName || "").trim();
    userName = (first || last) ? `${first} ${last}`.trim() : (postUser.username || "User");
  }

  const handleProfilePress = () => {
    if (!anonymous) setProfileVisible(true);
  };

  return (
    <>
      <HStack justifyContent="space-between" alignItems="center" mb={1}>
        <Pressable
          flexGrow={1}
          onPress={handleProfilePress}
          disabled={anonymous}
          _pressed={{ bg: "gray.50" }}
          borderRadius="md"
          p={1}
        >
          <HStack alignItems="center" mb={2}>
            <Image
              source={userImage}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
            <VStack ml={3}>
              <Text
                fontSize="14px"
                color="#464A4D"
                fontWeight="500"
                lineHeight="16px"
                letterSpacing="0.5px"
              >
                {userName}
              </Text>
              <Text
                fontSize="12px"
                color="#757B80"
                fontWeight="500"
                lineHeight="16px"
                letterSpacing="0.5px"
              >
                {formatPosted(date_posted)}
              </Text>
            </VStack>
          </HStack>
        </Pressable>

        <Pressable
          onPress={onMorePress}
          p={2}
          borderRadius="full"
          _pressed={{ bg: "gray.100" }}
        >
          <Icon as={Ionicons} name="ellipsis-vertical" size={5} color="gray.500" />
        </Pressable>
      </HStack>

      <UserSummaryModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        user={postUser}
      />
    </>
  );
};

export default PostUserInfo;


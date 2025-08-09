import React from "react";
import { Box, Text, VStack, Pressable, HStack } from "native-base";
import { Image } from "expo-image";

const MarketPreview = ({ postRef, postData, navigation }) => {
  const post = postData;

  // choose the right image field, array-safe, legacy fallback
  const photo =
    Array.isArray(post?.post_photo) ? post.post_photo[0] :
    post?.post_photo || post?.image || null;

  const imageUri = photo && !String(photo).startsWith("gs://") ? photo : null;

  // format price with £
  const rawPrice = post?.requirements?.Price ?? post?.price;
  const price =
    rawPrice == null ? "" :
    typeof rawPrice === "number"
      ? `£${rawPrice.toLocaleString("en-GB")}`
      : String(rawPrice).trim().startsWith("£")
        ? String(rawPrice)
        : `£${String(rawPrice)}`;

  return (
    <Pressable onPress={() => navigation.navigate("PostDisplay", { postRef })}>
      <Box position="relative" width="169px" height="169px">
        <Image
          source={imageUri ? { uri: imageUri } : undefined}
          style={{ width: 169, height: 169, borderRadius: 10, backgroundColor: "#eee" }}
          contentFit="cover"
          transition={100}
        />

        {(post?.requirements?.Item || price) && (
          <HStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            px="8px"
            py="6px"
            bg="rgba(0,0,0,0.35)"
            borderBottomLeftRadius={10}
            borderBottomRightRadius={10}
            alignItems="center"
            space="8px"
            maxH="35%"   // keeps it slim
          >
            {post?.requirements?.Item ? (
              <Text flex={1} color="white" fontWeight="600" fontSize="sm" numberOfLines={1}>
                {post.requirements.Item}
              </Text>
            ) : null}
            {price ? (
              <Box px="8px" py="4px" bg="rgba(0,0,0,0.45)" borderRadius="10px">
                <Text color="yellow.300" fontWeight="700" fontSize="sm">
                  {price}
                </Text>
              </Box>
            ) : null}
          </HStack>
        )}
      </Box>
    </Pressable>
  );
};

export default React.memo(MarketPreview);

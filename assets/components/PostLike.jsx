// PostLike.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Pressable } from 'react-native';
import { HStack, Text } from 'native-base';
import { AntDesign } from '@expo/vector-icons';
import { db } from '../firebase/firebaseConfig';
import { doc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { updateRef, sendPostNotification } from '../firebase/queries';
import { useAuth } from '../services/authContext';

export default function PostLike({ post }) {
  const { user } = useAuth();

  const postDoc = useMemo(() => doc(db, 'posts', post.id), [post.id]);
  const userRef = useMemo(() => doc(db, 'users', user.uid), [user.uid]);

  const [likes, setLikes] = useState(post?.num_likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  // initial isLiked from user context (uses DocumentReference path match)
  useEffect(() => {
    const likedPostsRef = user?.liked_posts_ref || [];
    const liked = likedPostsRef.some((ref) => ref?.path === postDoc.path);
    setIsLiked(liked);
    setLikes(post?.num_likes || 0);
  }, [user?.liked_posts_ref, post?.num_likes, postDoc.path]);

  const toggleLike = async () => {
    if (!user?.uid || !post?.id) return;

    // optimistic UI
    setIsLiked((prev) => !prev);
    setLikes((prev) => prev + (isLiked ? -1 : 1));
    onLocalUpdate?.(post.id, delta, !isLiked); 

    try {
      if (isLiked) {
        // UNLIKE
        await updateRef({
          id: post.id,
          collectionName: 'posts',
          updateFields: {
            num_likes: increment(-1),
            // keep this key consistent everywhere
            liked_user_ref: arrayRemove(userRef),
          },
        });
        await updateRef({
          id: user.uid,
          collectionName: 'users',
          updateFields: {
            liked_posts_ref: arrayRemove(postDoc),
          },
        });
      } else {
        // LIKE
        await updateRef({
          id: post.id,
          collectionName: 'posts',
          updateFields: {
            num_likes: increment(1),
            liked_user_ref: arrayUnion(userRef),
          },
        });
        await updateRef({
          id: user.uid,
          collectionName: 'users',
          updateFields: {
            liked_posts_ref: arrayUnion(postDoc),
          },
        });
        // optional: notify post owner
        sendPostNotification?.({
          senderId: user.uid,
          receiverRef: post.post_user, // keep as DocumentReference (matches your code)
          type: 0,
          postRef: postDoc,
        });
      }
    } catch (e) {
      // rollback on error
      setIsLiked((prev) => !prev);
      setLikes((prev) => prev + (isLiked ? 1 : -1));
      onLocalUpdate?.(post.id, -delta, isLiked);
      console.error('Error toggling like:', e);
    }
  };

  return (
    <Pressable onPress={toggleLike} hitSlop={8}>
      <HStack alignItems="center">
        <AntDesign name={isLiked ? 'heart' : 'hearto'} size={24} color="#FF5963" />
        <Text fontSize="xs" color="gray.700" ml={1}>
          {likes}
        </Text>
      </HStack>
    </Pressable>
  );
}

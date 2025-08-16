import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import UserInfoRow from '../components/userInfoRow';
import { getRef, fetchReferenceData, getSubRefAll, addRef, updateRef,sendPostNotification } from '../firebase/queries';
import CommentCard from '../components/commentCard.js';
import { addDoc, db } from '../firebase/firebaseConfig';
import { Timestamp, doc, collection, arrayUnion, increment} from 'firebase/firestore';
import PollOption from '../components/PollOption';
import { useRoute } from '@react-navigation/native';
import { Box } from 'native-base';
import { useAuth } from '../services/authContext';
import ReportModal from '../components/ReportModal';
import ForumDetails from "../components/ForumDetails";

const PostDisplay = () => {
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const route = useRoute();
  const { postRef, navigation } = route.params || {};

  // Add keyboard listeners with height tracking
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleReply = (comment) => {
    setReplyingTo(comment);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };
  
  const renderCommentInput = () => (
    <View style={[
      styles.commentInputWrapper,
      // Dynamic positioning based on keyboard state
      Platform.OS === 'android' && {
        position: keyboardVisible ? 'absolute' : 'relative',
        bottom: keyboardVisible ? keyboardHeight : 0,
        left: 0,
        right: 0,
        zIndex: keyboardVisible ? 1000 : 1,
      }
    ]}>
      {replyingTo && (
        <View style={styles.replyingToContainer}>
          <Text style={styles.replyingToText}>
            Replying to <Text style={styles.replyingToName}>{replyingTo?.authorName || "Unknown"}</Text>
          </Text>
          <TouchableOpacity onPress={cancelReply} style={styles.cancelReplyButton}>
            <Feather name="x" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.commentInputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleAddComment}
        >
          <Feather name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
  
    try {
      let commentsRef = collection(db, 'posts', postRef, 'comments');
      const commentData = {
        content: newComment,
        num_likes: 0,
        date_created: Timestamp.now(),
        created_by_uid: user.uid,
        createdby_ref: doc(db, 'users', user.uid),
      };
  
      let newDocRef;
      if (replyingTo) {
        commentsRef = collection(db, 'posts', postRef, 'comments', replyingTo.id, 'reply');
        newDocRef = await addDoc(commentsRef, commentData);
  
        const newReply = { 
          id: newDocRef.id, 
          ...commentData,
          createdby_ref: doc(db, 'users', user.uid),
          liked_by: [],
        };
  
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo.id
              ? { ...c, replies: [...(c.replies || []), newReply] }
              : c
          )
        );
      } else {
        newDocRef = await addDoc(commentsRef, commentData);
  
        const newTopLevel = { 
          id: newDocRef.id, 
          ...commentData, 
          replies: [],
          createdby_ref: doc(db, 'users', user.uid),
          liked_by: [],
        };
        setComments((prev) => [newTopLevel, ...prev]);
      }
  
      const postDocRef = doc(db, 'posts', post.id);
      await updateRef({
        id: post.id,
        collectionName: 'posts',
        updateFields: { num_comments: increment(1) },
      });
      
      await updateRef({
        id: user.uid,
        collectionName: 'users',
        updateFields: { commented_posts_ref: arrayUnion(postDocRef) },
      });
  
      sendPostNotification({
        senderId: user.uid,
        receiverRef: post.post_user,
        type: 1,
        postRef: postDocRef,
      });
  
      setNewComment('');
      setReplyingTo(null);
      inputRef.current?.clear();
      Keyboard.dismiss();
  
      setPost(prev => ({
        ...prev,
        num_comments: (prev.num_comments || 0) + 1
      }));
  
    } catch (error) {
      console.error('Error adding comment:', error);
      getComments();
    }
  };

  const getComments = async () => {
    try {
      const commentsData = await getSubRefAll({
        collection: collection(db, 'posts', postRef, 'comments'),
      });
  
      const withReplies = await Promise.all(
        commentsData.map(async (c) => {
          const replies = await getSubRefAll({
            collection: collection(db, 'posts', postRef, 'comments', c.id, 'reply'),
          });
          return { ...c, replies };
        })
      );
  
      setComments(withReplies);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPoll = async (index) => {
    try {
      const updatedOptions = [...post.pollOptions.options];
      updatedOptions[index].votes += 1;
  
      const updatedVoters = [...(post.pollOptions.voters || []), user.uid];
  
      await updateRef({
        id: post.id,
        collectionName: "posts",
        updateFields: {
          "pollOptions": {
            options: updatedOptions,
            voters: updatedVoters
          }
        }
      });
  
      const updatedPost = await getRef({ id: postRef, collectionName: "posts" });
      setPost(updatedPost);
    } catch (error) {
      console.error('Error updating poll:', error);
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const onMorePress = () => {
    handleReport();
  };

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postData = await getRef({ id: postRef, collectionName: "posts" });
        setPost(postData);
    
        const genreData = await fetchReferenceData(postData.post_genre_ref);
        setGenre(genreData);

        getComments();
    
        updateRef({
          id: postData.id,
          collectionName: "posts",
          updateFields: {
          views: increment(1),
          },
        });
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with Genre and Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.genreText}>{genre?.name || 'Loading...'}</Text>
      </View>

      <View style={styles.keyboardAvoidingView}>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          extraData={comments} 
          contentContainerStyle={[
            styles.flatListContent,
            // Add bottom padding when keyboard is visible on Android to prevent overlap
            Platform.OS === 'android' && keyboardVisible && { paddingBottom: keyboardHeight + 80 }
          ]}
          ListHeaderComponent={
            <>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#836fff" />
                </View>
              ) : post ? (
                <>
                  <UserInfoRow 
                    userRef={post.post_user} 
                    postData={post} 
                    onMorePress={onMorePress}
                    onPostDeleted={(id) => {
                      navigation.goBack();
                    }}
                  />

                  <View style={styles.postContent}>
                    <Text style={styles.postTitle}>{post.post_title}</Text>
                    <Text style={styles.postDescription}>{post.post_data}</Text>
                  </View>

                  {post.forum_type && post.forum_details && post.forum_type !== "General" && (
                    <Box mt={2} px={4}>
                      <ForumDetails
                        forumType={post.forum_type}
                        forumDetails={post.forum_details}
                      />
                    </Box>
                  )}

                  {Array.isArray(post.pollOptions?.options) && post.addPoll && (
                    <Box mt={4} px={4}>
                      {post.pollOptions.options.map((pollOption, index) => {
                        const hasVoted = post.pollOptions?.voters?.includes(user.uid);
                        const isSelected = hasVoted && user.uid && post.pollOptions.voters?.includes(user.uid) && index ===
                          post.pollOptions.options.findIndex(opt => opt.votes > pollOption.votes - 1); 

                        return (
                          <PollOption
                            key={index}
                            pollOption={pollOption}
                            hasVoted={hasVoted}
                            isSelected={isSelected}
                            onChoose={() => handleSelectPoll(index)}
                          />
                        );
                      })}
                    </Box>
                  )}

                  {post.post_photo && (
                    <Box mt={4} px={4}>
                      <Image
                        source={{ uri: post.post_photo}}
                        style={{
                          width: "100%",
                          height: 400,
                          borderRadius: 8,
                        }}
                        contentFit="cover"
                        transition={200}
                      />
                    </Box>
                  )}

                  <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>
                     {post.views || 0} views
                    </Text>
                  </View>
                  
                  <View style={styles.userSafetyInfoContainer}>
                    <Text style={styles.userSafetyInfoText}>
                      - Any comments that violate the guideline can be deleted without notice{'\n'}
                      - If you find certain comments to be disturbing, please report through Dashboard {'>'} Setting {'>'} Feedback.
                    </Text>
                  </View>

                  <Text style={styles.commentsHeader}>Comments {post.num_comments}</Text>
                </>
              ) : (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Post not found</Text>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <CommentCard
              onReply={handleReply}
              comment={item}
              replies={item.replies || []}
              postData={post}
              onTrigger={getComments}
              docu={doc(db, 'posts', post.id, 'comments', item.id)}
            />
          )}
        />
        
        {/* Always render comment input - positioning handled by dynamic styles */}
        {renderCommentInput()}
      </View>

      <ReportModal
        isVisible={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={postRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  genreText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#836fff',
  },
  postContent: {
    padding: 16,
  },
  postTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  postDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  statsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  userSafetyInfoContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f0f0f0',
  },
  userSafetyInfoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  commentsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 5,
  },
  flatListContent: {
    paddingBottom: 50,
  },
  commentInputWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    maxHeight: 100
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#836fff',
    borderRadius: 10,
    paddingHorizontal: 10
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  replyingToText: {
    fontSize: 12,
    color: '#666',
  },
  replyingToName: {
    fontWeight: '600',
    color: '#333',
  },
  cancelReplyButton: {
    padding: 4,
  },
});

export default PostDisplay;
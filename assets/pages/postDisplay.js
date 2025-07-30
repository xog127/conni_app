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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import UserInfoRow from '../components/userInfoRow';
import { getRef, fetchReferenceData, getSubRefAll, addRef, updateRef } from '../firebase/queries';
import CommentCard from '../components/commentCard.js';
import { addDoc, db } from '../firebase/firebaseConfig';
import { Timestamp, doc, collection, arrayUnion, increment} from 'firebase/firestore';
import PollOption from '../components/pollOption.js';
import { useRoute } from '@react-navigation/native';
import { Box } from 'native-base';
import { useAuth } from '../services/authContext';
import ReportModal from '../components/ReportModal';


const PostDisplay = () => {
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const inputRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const route = useRoute();
  const { postRef, navigation } = route.params || {};
  const handleReply = (comment) => {
    setReplyingTo(comment);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };
  
  const renderCommentInput = () => (
    
    <View style={styles.commentInputWrapper}>
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
        createdby_ref: doc(db, 'users', user.uid),
      };

      // If replying to a comment, add the reply_to field
      if (replyingTo) {
        commentsRef = collection(db, 'posts', postRef, 'comments', replyingTo.id, 'reply');
      }

      await addDoc(commentsRef, commentData);
      const postDoc = doc(db, 'posts', post.id);
        await updateRef({
          id: post.id,
          collectionName: "posts",
          updateFields: {
            "num_comments": increment(1),
          },
        });
        await updateRef({
          id: user.uid,
          collectionName: "users",
          updateFields: {
            "commented_posts_ref": arrayUnion(postDoc)
          },
        });
      setNewComment('');
      setReplyingTo(null);
      inputRef.current?.clear();
      getComments();
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getComments = async () => {
    try {
      const commentsData = await getSubRefAll({collection: collection(db, 'posts', postRef, 'comments')});
      
      setComments(commentsData);
  
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectPoll = async (index) => {
    try {
      await updateRef({
        id: post.id,
        collectionName: "posts",
        updateFields: {
          [`pollOptions.pollOptions.${index}.votes`]: increment(1),
          "pollOptions.voters": arrayUnion(post.user_ref)
        }
      });
      useEffect();
    } catch (error) {
      console.error('Error updating poll:', error);
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  // Pass this to UserInfoRow as a prop
  const onMorePress = () => {
    handleReport();
  };

  const renderForumRequirements = () => {
    


    const renderSkillChips = (skills) => {
      if (!skills || !skills.length) return null;
      return (
        <View style={styles.requirementRow} key="skills">
          <Text style={styles.requirementLabel}>Skills:</Text>
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
        content = (
          <>
            {renderEmphasis(marketType)}
            {post.forum_details.Item && renderLabel("Item", post.forum_details.Item)}
            {post.forum_details.Price && renderLabel("Price", post.forum_details.Price, "£")}
          </>
        );
        break;

      case "Research":
        content = (
          <>
            {renderLabel("Duration", post.forum_details.Duration)}
            {renderLabel("Eligibilities", post.forum_details.Eligibilities)}
          </>
        );
        break;

      case "Ticket":
        const ticketType = post.forum_details["Buy or Sell"] || "Sell";
        content = (
          <>
            {renderEmphasis(ticketType)}
            {post.forum_details.Date && renderLabel("Date", new Date(post.forum_details.Date).toISOString().split('T')[0])}
            {post.forum_details.Price && renderLabel("Price", post.forum_details.Price, "£")}
            {post.forum_details.Quantity && renderLabel("Quantity", post.forum_details.Quantity)}
          </>
        );
        break;

      case "Flat":
        content = (
          <>
            {renderEmphasis(post.forum_details["Rent type"])}
            {renderLabel("Move in Date", new Date(post.forum_details["Move in Date"]).toISOString().split('T')[0])}
            {renderLabel("Move out Date", new Date(post.forum_details["Move out Date"]).toISOString().split('T')[0])}
            {renderLabel("Location", post.forum_details.Location)}
            {renderLabel("Price", post.forum_details.Price, "£", " per week")}
          </>
        );
        break;

      case "Project":
        const incentive = post.forum_details.Incentive || "Money";
        content = (
          <>
            {renderLabel("Incentive", incentive)}
            {incentive === "Other" && post.forum_details.CustomIncentive && 
              renderLabel("Custom incentive", post.forum_details.CustomIncentive)}
            {renderSkillChips(post.forum_details.Skills)}
          </>
        );
        break;

      default:
        return null;
    }

    return (
      <View style={styles.requirementsContainer}>
        {content}
      </View>
    );
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
    <KeyboardAvoidingView behavior="padding" style={styles.safeArea}>
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Genre and Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.genreText}>{genre?.name || 'Loading...'}</Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
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
                />

                {/* Post Content */}
                <View style={styles.postContent}>
                  <Text style={styles.postTitle}>{post.post_title}</Text>
                  <Text style={styles.postDescription}>{post.post_data}</Text>
                </View>

                {/* Forum Requirements */}
                {post.forum_details && post.forum_type && post.forum_type !== "General" && (
                  <Box mt={2}>
                    <View style={styles.requirementsContainer}>
                      {renderForumRequirements()}
                    </View>
                  </Box>
                )}

                {/* Post Image */}
                {post.post_photo && (
                  <Box mt={4}>
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

                {/* Polls Content */}
                {post.addPoll && post.pollOptions?.pollOptions?.map((pollOption, index) => (
                  <PollOption
                    key={index}
                    pollOption={pollOption}
                    hasVoted={pollOption.voters?.includes(authUser)}
                    onChoose={() => {
                      handleSelectPoll(index);
                    }}
                  />
                ))}

                {/* Post Stats */}
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
        renderItem={({ item }) => <CommentCard onReply={handleReply} comment={item} postData={post} onTrigger = {getComments} docu={doc(db, 'posts', post.id, 'comments', item.id)}/>}
        contentContainerStyle={styles.flatListContent}
      />
      
      {renderCommentInput()}

      <ReportModal
        isVisible={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={postRef}
      />
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
  commentInputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
  commentInputWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
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
    // Requirements styling
    requirementsContainer: {
      marginHorizontal: 16,
      marginVertical: 12,
      padding: 16,
      backgroundColor: "#f9f9f9",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#eee",
    },
    requirementRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 4,
    },
    requirementLabel: {
      fontSize: 14,
      color: "#666",
      fontWeight: "500",
      marginRight: 8,
      flex: 1,
    },
    requirementValue: {
      fontSize: 14,
      color: "#333",
      flex: 2,
    },
    emphasisText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#836fff",
      textAlign: "left",
    },
    skillsContainer: {
      flex: 2,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    skillChip: {
      backgroundColor: "#836fff20",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
    },
    skillChipText: {
      color: "#836fff",
      fontSize: 12,
      fontWeight: "500",
    },
});


export default PostDisplay;

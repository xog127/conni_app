// CommentCard.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import UserInfoRowComment from './userInfoRowComment';
import { getSubRefAll } from '../firebase/queries'; // Import your query function
import { collection, doc } from 'firebase/firestore';
import { db,getDoc } from '../firebase/firebaseConfig';

const CommentCard = ({ postData, comment, onReply, onDelete, onTrigger, isReply = false, docu }) => {
  const [replies, setReplies] = useState([]);
  

  const fetchReplies = async () => {
    try {
      const repliesData = await getSubRefAll({ 
        collection : collection(db, 'posts', postData.id, 'comments', comment.id, 'reply')
      });
      setReplies(repliesData);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };
  const handleReplyPress = async () => {
  try {
    const userSnap = await getDoc(comment.createdby_ref);
    console.log("User snapshot:", userSnap);
    const authorName = userSnap.exists() ? userSnap.data().first_name +' '+  userSnap.data().last_name : "Hello";
    console.log("Author's name:", authorName);
    onReply({ ...comment, authorName });
  } catch (error) {
    console.error("Failed to get author's name:", error);
    onReply({ ...comment, authorName: "Unknown" });
  }
};

  useEffect(() => {
    try{
      fetchReplies();
    } catch (error) {
      console.error('Error fetching replies:', error);
    } 
  }, []);

  return (
    <View style={[styles.container, isReply && styles.replyContainer]}>
      <UserInfoRowComment 
        postData={postData}
        commentData={comment}
        onDeletePress={() => {
          onTrigger();
          fetchReplies();
        }}
        docu={docu}
      />

        
      <View style={[styles.contentContainer, isReply && styles.replyContentContainer]}>
        <Text style={styles.commentText}>{comment.content}</Text>
        
        {!isReply && (
          <TouchableOpacity 
  onPress={handleReplyPress}
  style={styles.replyButton}
          >
          <Feather name="message-circle" size={16} color="#666" />
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
      )}

        {/* Render replies */}
        {replies.map((reply) => (
          <CommentCard
            key={reply.id}
            postData={postData}
            comment={reply}
            onReply={onReply}
            onTrigger={onTrigger}
            isReply={true}
            docu={doc(db, 'posts', postData.id, 'comments', comment.id, 'reply', reply.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginVertical: 1,
  },
  replyContainer: {
    marginLeft: 20, // Indent replies
    width: '95%', // Make replies slightly narrower
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingBottom: 12,
  },
  replyContentContainer: {
    paddingHorizontal: 20,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 8,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  replyButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
});

export default CommentCard;
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import UserInfoRowComment from './userInfoRowComment';

const CommentCard = ({ postData, comment, userRef, onReply, onDelete }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  return (
    <View style={styles.container}>
      <UserInfoRowComment 
        postData={postData}
        commentData={comment}
      />
      
      <View style={styles.contentContainer}>
        <Text style={styles.commentText}>{comment.content}</Text>
        
        <TouchableOpacity 
          onPress={() => setIsReplying(true)}
          style={styles.replyButton}
        >
          <Feather name="message-circle" size={16} color="#666" />
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
      </View>

      {/* Reply Modal */}
      <Modal
        visible={isReplying}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsReplying(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setIsReplying(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reply to comment</Text>
              <TouchableOpacity onPress={() => setIsReplying(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.replyInput}
              placeholder="Write your reply..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
              autoFocus
            />
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                !replyText.trim() && styles.submitButtonDisabled
              ]}
              onPress={handleReply}
              disabled={!replyText.trim()}
            >
              <Text style={styles.submitButtonText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginVertical: 1,

  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingBottom: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 16,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CommentCard;
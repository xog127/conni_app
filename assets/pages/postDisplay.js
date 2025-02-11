import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import UserInfoRow from '../components/userInfoRow';
import { getRef, fetchReferenceData, getSubRefAll, addRef } from '../firebase/queries';
import CommentCard from '../components/commentCard.js';
import { addDoc, collection, db } from '../firebase/firebaseConfig';
import { Timestamp, doc } from 'firebase/firestore';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry.js';

const PostDisplay = () => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState(null);
  const postRef = '2u4ga9gghwilkMbq8HW1';
  const [newComment, setNewComment] = useState('');
  const inputRef = useRef(null);

  

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const commentsRef = collection(db, 'posts', postRef, 'comments');
      await addDoc(commentsRef, {
        content: newComment,
        date_created: Timestamp.now(),
        createdby_ref: doc(db, 'users', 'ErtsKCM5RFbcMAxiyCsz4sbjZxe2'),
      });
      setNewComment('');
      inputRef.current?.clear();
      getComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getComments = async () => {
    try {
      const commentsData = await getSubRefAll({ id: postRef, collectionName: 'posts', subCollectionName: 'comments' });
      console.log('Comments:', commentsData);
      setComments(commentsData);
  
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postData = await getRef({ id: postRef, collectionName: 'posts' });
        setPost(postData);
    
        const genreData = await fetchReferenceData(postData.post_genre_ref);
        setGenre(genreData);

        const commentsData = await getSubRefAll({ id: postRef, collectionName: 'posts', subCollectionName: 'comments' });
        console.log('Comments:', commentsData);
        setComments(commentsData);
    
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#836fff" />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.safeArea}>
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Genre and Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => console.log('back pressed')} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.genreText}>{genre?.name || 'Loading...'}</Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <UserInfoRow userRef={post.post_user} postData={post} />

            {/* Post Content */}
            <View style={styles.postContent}>
              <Text style={styles.postTitle}>{post?.post_title}</Text>
              <Text style={styles.postDescription}>{post?.post_data}</Text>
              {post?.post_photo && (
                <Image
                  source={{ uri: post.post_photo }}
                  style={styles.postImage}
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Post Stats */}
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {post?.num_likes || 0} likes · {post?.num_comments || 0} comments · {post?.views || 0} views
              </Text>
            </View>

            <View style={styles.userSafetyInfoContainer}>
              <Text style={styles.userSafetyInfoText}>
                - Any comments that violate the guideline can be deleted without notice{'\n'}
                - If you find certain comments to be disturbing, please report through Dashboard {'>'} Setting {'>'} Feedback.
              </Text>
            </View>

            <Text style={styles.commentsHeader}>Comments</Text>
          </>
        }
        renderItem={({ item }) => <CommentCard comment={item} userRef={item.createdby_ref} postData={post} onTrigger = {getComments}/>}
        contentContainerStyle={styles.flatListContent}
      />
      <View style={styles.commentInputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Add a comment..."
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
    justifyContent: 'center',
    alignItems: 'center',
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
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginTop: 8,
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
  }
});

export default PostDisplay;

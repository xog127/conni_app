import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { fetchReferenceData, sendPostNotification } from '../firebase/queries';
import { timeAgo } from '../customFunctions/time';
import { db } from '../firebase/firebaseConfig';
import { doc, increment, arrayRemove, arrayUnion, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { updateRef } from '../firebase/queries';
import { useAuth } from '../services/authContext';
import UserSummaryModal from '../pages/UserSummaryModals';


const UserInfoRow = ({ 
  userRef, postData,
  onMorePress,
  onPostDeleted,
}) => {
  const { user } = useAuth();
  const postDoc = doc(db, 'posts', postData.id);
  const [postuser, setUser] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [likes, setLikes] = useState(postData?.num_likes || 0);
  const [userName, setUserName] = useState('');
  const [isLiked, setLiked] = useState(false);
  const [relativeTime, setRelativeTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileVisible, setProfileVisible] = useState(false);
  const isAnon = !!postData?.anonymous;
  const authorUid =
  postData?.created_by_uid ??
  postData?.createdby_ref?.id ??
  postData?.post_user?.id ??
  null;

  const canDelete = !!user && user.uid === authorUid;

  const handleDeletePost = async () => {
    try {
      setOptionsVisible(false);
  
      // client-side guard (rules still enforce this on server)
      const currentAuthorUid =
        postData?.created_by_uid ??
        postData?.createdby_ref?.id ??
        postData?.post_user?.id ??
        null;
      const deletePostWithChildren = async (postId) => {
        const commentsSnap = await getDocs(collection(db, 'posts', postId, 'comments'));
        await Promise.all(commentsSnap.docs.map(d => deleteDoc(d.ref)));
        await deleteDoc(doc(db, 'posts', postId));
      };
      if (!user || user.uid !== currentAuthorUid) return;
  
      // NOTE: this deletes only the post doc. If you also need to
      // remove comments/subcollections, see "recursive delete" note below.
      // Delete post + comments (or swap for deleteDoc if you only want the post gone)
      await deletePostWithChildren(postData.id);
      onPostDeleted?.(postData.id);
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };
  
  
  

  const handleLike = async () => {
    if (!postData?.id || !userRef) {
      console.error('Missing required data for like action');
      return;
    }
  
    try {
      if (isLiked) {
        await updateRef({
          id: postData.id,
          collectionName: "posts",
          updateFields: {
            "num_likes": increment(-1),  
            "liked_user_ref": arrayRemove(userRef)
          },
        });
        await updateRef({
          id: user.uid,
          collectionName: "users",
          updateFields: {
            "liked_posts_ref": arrayRemove(postDoc)
          },
        });
        setLiked(false);
        setLikes(prev => prev - 1);
      } else {
        await updateRef({
          id: postData.id,
          collectionName: "posts",
          updateFields: {
            "num_likes": increment(1),
            "like_userref": arrayUnion(userRef)
          },
        });
        await updateRef({
          id: user.uid,
          collectionName: "users",
          updateFields: {
            "liked_posts_ref": arrayUnion(postDoc)
          },
        });
        setLiked(true);
        setLikes(prev => prev + 1);
        sendPostNotification({
          senderId: user.uid,
          receiverRef: postData.post_user,
          type: 0,
          postRef : postDoc
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };
  

  const handleProfilePress = () => {
    if (!isAnon) {
      setProfileVisible(true);
    }
  };

  useEffect(() => {
    if (user && postDoc?.path) {
      const likedPostsRef = user.liked_posts_ref || [];
      const liked = likedPostsRef.some(ref => ref?.path === postDoc.path);
      setLiked(liked);
    }
  }, [user, postDoc?.path]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userRef || !postData) return;
      try {
        const data = await fetchReferenceData(userRef);
        setUser(data);
        const displayName = postData.anonymous
          ? `${data.course} ${data.graduation_year}`
          : `${data.first_name} ${data.last_name}`;
        setUserName(displayName);
  
        if (postData.time_posted) {
          setRelativeTime(timeAgo(postData.time_posted));
        }
      } catch (err) {
        console.error('Error fetching post user:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [userRef, postData]);
  

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handleProfilePress}
        disabled={isAnon}
        style={styles.userInfoLeft}
      >
        <View style={styles.imageContainer}>
          <Image
            source={
              isAnon
                ? require('../images/Blankprofile.png')
                : (postuser?.photo_url || postuser?.profileImage || postuser?.avatar
                    ? { uri: postuser.photo_url || postuser.profileImage || postuser.avatar }
                    : require('../images/Blankprofile.png'))
            }
            style={styles.userImage}
          />
        </View>
        <View style={styles.userTextInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.postDate}>{relativeTime}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionButtons}>
        <View style={styles.likesContainer}>

          <TouchableOpacity 
            onPress={handleLike} 
            style={styles.actionButton}
          >
            <AntDesign 
              name={isLiked ? "heart" : "hearto"}
              size={24} 
              color={isLiked ? "red" : "red"}
            />
          </TouchableOpacity>
          <Text style={styles.likesCount}>{likes}</Text>
        </View>

        <TouchableOpacity 
          onPress={() => setOptionsVisible(true)} 
          style={styles.actionButton}
        >
          <Feather name="more-vertical" size={24} color="#666" />
        </TouchableOpacity>

        <Modal
          animationType="fade"
          transparent={true}
          visible={optionsVisible}
          onRequestClose={() => setOptionsVisible(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setOptionsVisible(false)}
          >
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  setOptionsVisible(false);
                  onMorePress?.();
                }}
              >
                <Feather name="flag" size={20} color="#FF3B30" />
                <Text style={styles.optionText}>Report</Text>
              </TouchableOpacity>

              {canDelete && (
                <TouchableOpacity
                  style={[styles.optionItem, styles.deleteOption]}
                  onPress={handleDeletePost}
                >
                  <Feather name="trash-2" size={20} color="#ff4444" />
                  <Text style={[styles.optionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Modal>
      </View>
      <UserSummaryModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        user={postuser}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  imageContainer: {
    marginRight: 12,
    flexShrink: 0,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userTextInfo: {
    justifyContent: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flexWrap: 'wrap',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    fontSize: 16,
    color: '#666',
    marginLeft: 6,
  },
  postDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    width: '80%',
    maxWidth: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FF3B30',
  },
  deleteOption: {
    borderBottomWidth: 0,
  },
  deleteText: {
    color: '#ff4444',
  },
});

export default UserInfoRow;
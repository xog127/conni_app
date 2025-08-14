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
import { timeAgo } from '../customFunctions/time';
import { db } from '../firebase/firebaseConfig';
import { arrayRemove,increment, arrayUnion, doc, deleteDoc } from 'firebase/firestore';
import { updateRef, updateSubRef,  fetchReferenceData} from '../firebase/queries';
import { useAuth } from '../services/authContext';
import UserSummaryModal from '../pages/UserSummaryModals';

const UserInfoRowComment = ({ 
  commentData, postData, onDeletePress, docu
}) => {
  const { user } = useAuth();
  const commentDoc = doc(db, 'posts', postData.id, 'comments', commentData.id);
  const [commentuser, setUser] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [likes, setLikes] = useState(commentData?.num_likes || 0);
  const [userName, setUserName] = useState('');
  const [isLiked, setLiked] = useState(false);
  const [relativeTime, setRelativeTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileVisible, setProfileVisible] = useState(false);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await updateSubRef({
          docu: docu,
          updateFields: {
            "num_likes": increment(-1),
          },
        });
        await updateRef({
          id: user.uid,
          collectionName: "users",
          updateFields: {
            "liked_comments_ref": arrayRemove(commentDoc)
          },
        });
        setLiked(false);
        setLikes(prev => prev - 1);
      } else {
        await updateSubRef({
          docu: docu,
          updateFields: {
            "num_likes": increment(1),
          },
        });
        await updateRef({
          id: user.uid,
          collectionName: "users",
          updateFields: {
            "liked_comments_ref": arrayUnion(commentDoc)
          },
        });
        setLiked(true);
        setLikes(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleDelete = async () => {
    try {
      setOptionsVisible(false);
      await deleteDoc(docu);
      onDeletePress();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleProfilePress = () => {
    if (!postData.anonymous) {
      setProfileVisible(true);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
                if (commentData.date_created) {
                  setRelativeTime(timeAgo(commentData.date_created));
                }
        
        const data = await fetchReferenceData(commentData.createdby_ref);
        if (data) {
          setUser(data);
          if (postData.anonymous) {
            setUserName(`${data.course} ${data.graduation_year}`);
          } else {
            setUserName(`${data.first_name} ${data.last_name}`);
          }
          
        if (user && commentDoc?.path) {
          const likedCommentsRef = user.liked_comments_ref || [];
          const liked = likedCommentsRef.some(ref => ref?.path === commentDoc.path);
          setLiked(liked);
        }
      }

      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
        disabled={postData?.anonymous}
        style={styles.userInfoLeft}
      >
        <View style={styles.imageContainer}>
          <Image
            source={
              commentuser?.photo_url || commentuser?.profileImage || commentuser?.avatar
                ? { uri: commentuser.photo_url || commentuser.profileImage || commentuser.avatar }
                : require('../images/Blankprofile.png')
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
        <TouchableOpacity
          onPress={handleLike}
          style={styles.actionButton}
        >
          <View style={styles.likeContainer}>
            <AntDesign
              name={isLiked ? "heart" : "hearto"}
              size={16}
              color={isLiked ? "red" : "red"}
            />
            <Text style={styles.likeCount}>{likes || 0}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setOptionsVisible(true)}
          style={styles.actionButton}
        >
          <Feather name="more-vertical" size={14} color="#666" />
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
                  onReport?.();
                  setOptionsVisible(false);
                }}
              >
                <Feather name="flag" size={20} color="#666" />
                <Text style={styles.optionText}>Report</Text>
              </TouchableOpacity>
              
              {(commentData.createdby_ref == commentData.createdby_ref) && (
                <TouchableOpacity
                  style={[styles.optionItem, styles.deleteOption]}
                  onPress={handleDelete}
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
        user={commentuser}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    marginRight: 8,
  },
  userImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userTextInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  postDate: {
    fontSize: 10,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 12,
    padding: 4,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  deleteOption: {
    borderBottomWidth: 0,
  },
  deleteText: {
    color: '#ff4444',
  },
});

export default UserInfoRowComment;
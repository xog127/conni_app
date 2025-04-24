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
import { fetchReferenceData } from '../firebase/queries';
import { timeAgo } from '../customFunctions/time';
import { db } from '../firebase/firebaseConfig';
import { doc, increment, arrayRemove, arrayUnion } from 'firebase/firestore';
import { updateRef } from '../firebase/queries';
import { useAuth } from '../services/authContext';

const UserInfoRow = ({ 
  userRef, postData,
  onMorePress
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
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };
  

  const handleProfilePress = () => {
    if (!postData?.anonymous) {
      onProfilePress?.();
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userRef || !postData) {
        console.error('Missing required props');
        setLoading(false);
        return;
      }
  
      try {
        const data = await fetchReferenceData(userRef);
        if (data) {
          setUser(data);
          if (postData.anonymous) {
            setUserName(`${data.course} ${data.graduation_year}`);
          } else {
            setUserName(`${data.first_name} ${data.last_name}`);
          }
        }
  
        const currentuser = await fetchReferenceData(userRef);
        let likedFromUser = false;
        const likedPostsRef = currentuser?.liked_posts_ref || [];
        if (Array.isArray(likedPostsRef)) {
          // Check if postDoc (a Firestore document reference) is in liked_posts_ref
          likedFromUser = likedPostsRef.some(ref => ref?.id === postData.id);
        }
  
        setLiked( likedFromUser);
  
        if (postData.time_posted) {
          setRelativeTime(timeAgo(postData.time_posted));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
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
      <View style={styles.userInfoLeft}>
        <TouchableOpacity 
          onPress={handleProfilePress}
          disabled={postData?.anonymous}
          style={styles.imageContainer}
        >
          <Image
            source={
              postuser?.photo_url
                ? { uri: user.photo_url }
                : require('../images/Blankprofile.png')
            }
            style={styles.userImage}
          />
        </TouchableOpacity>
        <View style={styles.userTextInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.postDate}>{relativeTime}</Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <View style={styles.likesContainer}>
        <Text style={styles.likesCount}>{likes}</Text>

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
            </View>
          </Pressable>
        </Modal>
      </View>
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
    fontSize: 14,
    color: '#666',
    marginRight: 4,
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
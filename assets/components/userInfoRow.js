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
import { increment, arrayRemove, arrayUnion } from 'firebase/firestore';
import { updateRef } from '../firebase/queries';


const UserInfoRow = ({ 
  userRef, postData
}) => {
  const [user, setUser] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [likes, setLikes] = useState(0);
  const [userName, setUserName] = useState('');
  const [isLiked, setLiked] = useState(false);
  const [relativeTime, setRelativeTime] = useState('');

const handleLike = async () => {
  try {
    if (isLiked) {
      // Unlike: Remove the user reference from likes array
      await updateRef({
        id: postData.id,  // Consistent use of postData.id
        collectionName: "posts",
        updateFields: {
          "num_likes": increment(-1),  
          "liked_user_ref": arrayRemove(userRef)
        },
      }).then(() => {;
      setLiked(false); 
      }) // Use setLiked instead of isLiked()
    } else {
      // Like: Add the user reference to likes array
      await updateRef({
        id: postData.id,  // Consistent use of postData.id
        collectionName: "posts",
        updateFields: {
          "num_likes": increment(1),
          "like_userref": arrayUnion(userRef)
        },
      }).then(() => {
        setLiked(true);  // Use setLiked instead of isLiked()
      });
      
    }
  } catch (error) {
    console.error('Error updating like:', error);
    // Optionally add error handling UI feedback here
  }
};

  const handleProfilePress = () => {
    if (!postData.anonymous) {
      onProfilePress?.();
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            // Pass the entire reference object
            fetchReferenceData(userRef).then((data) => {
                setUser(data);
                if (postData.anonymous) {
                  setUserName(data.first_name + ' ' + data.last_name);
                }
                else {
                  setUserName(data.display_name);
                }
             
                if (postData.like_userref.includes(userRef)) {
                  setLiked(true);
                }
              });
       
            if (likes > 0) {
              setLiked(true);
            }

            setRelativeTime(timeAgo(postData.time_posted));
           
    
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchUserData();
  }, []);

  
  

  return (
    <View style={styles.container}>
      <View style={styles.userInfoLeft}>
        <TouchableOpacity 
          onPress={handleProfilePress}
          disabled={postData.anonymous}
          style={styles.imageContainer}
        >
          
        </TouchableOpacity>
        <View style={styles.userTextInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.postDate}>{relativeTime}</Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
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

        <TouchableOpacity 
          onPress={() => setOptionsVisible(true)} 
          style={styles.actionButton}
        >
          <Feather name="more-vertical" size={24} color="#666" />
        </TouchableOpacity>

        {/* Options Modal */}
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

              {/* {isOwnPost && (
                <TouchableOpacity 
                  style={[styles.optionItem, styles.deleteOption]}
                  onPress={() => {
                    onDelete?.();
                    setOptionsVisible(false);
                  }}
                >
                  <Feather name="trash-2" size={20} color="#ff4444" />
                  <Text style={[styles.optionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              )} */}
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
    alignItems: 'flex-start', // Changed from 'center' to allow vertical expansion
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed from 'center' to align with top
    flex: 1, // Added to allow proper space distribution
    marginRight: 12, // Added to maintain space from action buttons
  },
  imageContainer: {
    marginRight: 12,
    flexShrink: 0, // Prevent image from shrinking
  },
  userTextInfo: {
    justifyContent: 'center',
    flex: 1, // Added to allow text container to take remaining space
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flexWrap: 'wrap', // Allow text to wrap
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0, // Prevent action buttons from shrinking
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

export default UserInfoRow;
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
import { arrayRemove, arrayUnion, doc, deleteDoc } from 'firebase/firestore';
import { updateSubRef, deleteDocument, fetchReferenceData} from '../firebase/queries';
import { db } from '../firebase/firebaseConfig';


const UserInfoRowComment = ({ 
  commentData, postData, onDeletePress
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
      await updateSubRef({
        id: postData.id, 
        subID: commentData.id,
        subCollectionName: "comments",
        collectionName: "posts",
        updateFields: {
          "liked_user_ref": arrayRemove(commentData.createdby_ref)
        },
      }).then(() => {;
      setLiked(false); 
      }) // Use setLiked instead of isLiked()
    } else {
      // Like: Add the user reference to likes array
      await updateSubRef({
        id: postData.id, 
        subID: commentData.id,
        subCollectionName: "comments",
        collectionName: "posts",
        updateFields: {
          "liked_user_ref": arrayUnion(commentData.createdby_ref)
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

handleDelete = async () => {
  try {
    setOptionsVisible(false);
    await deleteDoc(doc(db, 'posts', postData.id, 'comments', commentData.id));
    onDeletePress();
    console.log('Deleting comment:', deleteDoc);
    
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
}

  const handleProfilePress = () => {
    if (!postData.anonymous) {
      onProfilePress?.();
    }
  };

  useEffect(() => {

    setRelativeTime(timeAgo(commentData.date_created));

    const fetchUserData = async () => {
        try {
            // Pass the entire reference object
            fetchReferenceData(commentData.createdby_ref).then((data) => {
                setUser(data);
                console.log('User is now for comment:', data);
                if (postData.anonymous) {
                  setUserName(data.first_name + ' ' + data.last_name);
                }
                else {
                  setUserName(data.display_name);
                }
                if (commentData.liked_user_ref.includes(commentData.createdby_ref)) {
                  setLiked(true);
                }
              });
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
            size={14} 
            color={isLiked ? "red" : "red"}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setOptionsVisible(true)} 
          style={styles.actionButton}
        >
          <Feather name="more-vertical" size={14} color="#666" />
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

              {(commentData.createdby_ref == commentData.createdby_ref) && (
                <TouchableOpacity 
                  style={[styles.optionItem, styles.deleteOption]}
                  onPress={ handleDelete }
                >
                  <Feather name="trash-2" size={20} color="#ff4444" />
                  <Text style={[styles.optionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              )}
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
    alignItems: 'center',
    padding: 8,
 
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 12,
  },
  userImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
  },
  userTextInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  postDate: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
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

export default UserInfoRowComment;
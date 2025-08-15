import { db, collection } from "./firebaseConfig";
import { doc, getDoc, updateDoc, addDoc, getDocs, query,where,serverTimestamp, getFirestore, orderBy, limit, onSnapshot } from "firebase/firestore";
import { triggerPushNotification } from "../services/pushNotificationService";


const getCollections = async ({ collectionName }) => {
  try {

    // Reference the collection
    const collectionRef = collection(db, collectionName);

    // Fetch all documents in the collection
    const querySnapshot = await getDocs(collectionRef);

    // Map through the snapshot and return all documents
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
};

const getRef = async ({ id, collectionName }) => {
  try {
    //console.log("Fetching document:", id, "from collection:", collectionName);

    // Reference the specific document
    const docRef = doc(db, collectionName, id);

    // Fetch the document
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    return null;
  }
};

const getSubRefAll = async ({ collection }) => {
  try {
    //console.log("Fetching all documents from subcollection:", subCollectionName, "under document:", id, "in collection:", collectionName);

    // Reference the subcollection
    const subCollectionRef = collection;

    // Fetch all documents in the subcollection
    const querySnapshot = await getDocs(subCollectionRef);

    // Map through the snapshot and return all documents
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
};


const getSubRef = async ({ id, subCollectionID , collectionName, subCollectionName }) => {
    try {
      //console.log("Fetching document:", id, "from collection:", collectionName, subCollectionName);
  
      // Reference the specific document
      const docRef = doc(db, collectionName, id, subCollectionName, subCollectionID);
  
      // Fetch the document
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        
        return docSnap.data(); // Return document fields
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      return null;
    }
  };

  async function fetchReferenceData(reference) {
    try {
      if (!reference) {
        throw new Error("Invalid Firestore reference: reference is null or undefined.");
      }
  
      const docSnapshot = await getDoc(reference);
  
      if (docSnapshot.exists()) {
        return {
              id : docSnapshot.id,
              ...docSnapshot.data()
              };
      } else {
        console.log("No document found for this reference");
        return null;
      }
    } catch (error) {
      console.error("Error fetching data from reference:", error);
    }
  }

  const getPostsWithPagination = async (postsPerLoad = 10, startAfterDoc = null) => {
    try {
      // Base query - ordered by time_posted in descending order (newest first)
      let postsQuery = query(
        collection(db, 'posts'),
        orderBy('time_posted', 'desc'),
        limit(postsPerLoad)
      );
      
      // If we have a document to start after, add it to the query
      if (startAfterDoc) {
        postsQuery = query(
          collection(db, 'posts'),
          orderBy('time_posted', 'desc'),
          startAfter(startAfterDoc),
          limit(postsPerLoad)
        );
      }
      
      // Execute the query
      const querySnapshot = await getDocs(postsQuery);
      const posts = [];
      
      // Convert the query results to a usable array
      querySnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      // Get the last document for pagination
      const lastVisible = querySnapshot.docs.length > 0 
        ? querySnapshot.docs[querySnapshot.docs.length - 1] 
        : null;
      
      return {
        posts,
        lastVisible
      };
    } catch (error) {
      console.error('Error fetching paginated posts:', error);
      throw error;
    }
  };

const updateRef = async ({ id, collectionName, updateFields }) => {
  try {
    const documentRef = doc(db, collectionName, id);
    
    // Dynamically creating the update object from updateFields
    const updateData = {};
    for (const field in updateFields) {
      updateData[field] = updateFields[field];
    }

    // Updating the document with multiple fields
    await updateDoc(documentRef, updateData);
  } catch (error) {
    console.error('Error updating document:', error);
    throw error; // Re-throw to handle in the calling function
  }
};

const updateSubRef = async ({ docu, updateFields }) => {
  try {
    const documentRef = docu;
    
    // Dynamically creating the update object from updateFields
    const updateData = {};
    for (const field in updateFields) {
      updateData[field] = updateFields[field];
    }

    // Updating the document with multiple fields
    await updateDoc(documentRef, updateData);
  } catch (error) {
    console.error('Error updating document:', error);
    throw error; // Re-throw to handle in the calling function
  }
};

const deleteDocument = async (docId) => {
  try {
    await deleteDoc(docId);
    console.log(`Document ${docId} deleted successfully!`);
  } catch (error) {
    console.error("Error deleting document:", error);
  }
};

const addRef = async ({ collectionName, data }) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      console.log("Document written with ID: ", docRef.id);
      return docRef;
    } catch (error) {
      console.error("Error adding document: ", error);
      throw error;
    }
  };

  const getAnyCollection = async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName), { source: 'server' });
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return documents;
    } catch (error) {
      console.error(`Error fetching documents from collection ${collectionName}:`, error);
      return [];
    }
  };

  const fetchUserPostList = async (userId, refField) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDocRef);
  
      if (!userSnapshot.exists()) {
        return [];
      }
  
      const userData = userSnapshot.data();
      const postRefs = userData[refField] || []; // Get the list of post references
  
      // Fetch posts data by document references (this is where the change happens)
      return fetchPostsData(postRefs);
    } catch (error) {
      console.error(`Error fetching ${refField} for user ${userId}:`, error);
      return [];
    }
  };

  
  const fetchPostsData = async (postRefs) => {
    try {
  
      // Convert the postRefs to document references if they are just paths
      const postPromises = postRefs.map(async (postRef) => {
        const postPath = postRef.path || postRef; // Get path from DocumentReference or use the path directly
        const postDocRef = doc(db, postPath); // Convert path to document reference
        const postSnapshot = await getDoc(postDocRef);
        return postSnapshot.exists() ? { id: postSnapshot.id, ...postSnapshot.data() } : null;
      });
  
      const posts = await Promise.all(postPromises);
      return posts.filter(post => post !== null); // Remove null values
    } catch (error) {
      console.error("Error fetching post data:", error);
      return [];
    }
  };
  
  const fetchUserPosts = async (userId) => {
    const posts = await fetchUserPostList(userId, "posts_ref");
    const likedPosts = await fetchUserPostList(userId, "liked_posts_ref");
    const commentedPosts = await fetchUserPostList(userId, "commented_posts_ref");
    return {
      posts,
      likedPosts,
      commentedPosts
    };
  
  };

const sendPostNotification = async ({ senderId, receiverRef, type, postRef }) => {
  console.log(senderId, receiverRef, type, postRef);

  try {
    const senderUserRef = doc(db, "users", senderId);

    const receiverSnapshot = await getDoc(receiverRef);
    if (!receiverSnapshot.exists()) {
      console.error("Receiver user does not exist:", receiverRef.path);
      return;
    }

    const receiverNotificationsRef = collection(receiverRef, "notification");

    // Step 1: Query for existing matching notification
    const q = query(
      receiverNotificationsRef,
      where("user_sent_ref", "==", senderUserRef),
      where("post_ref", "==", postRef),
      where("type", "==", type)
    );

    const existingNotifications = await getDocs(q);

    if (!existingNotifications.empty) {
      console.log("Duplicate notification exists. Skipping addDoc.");
      return;
    }

    // Add in-app notification
    await addDoc(receiverNotificationsRef, {
      read: false,
      type,
      user_sent_ref: senderUserRef,
      post_ref: postRef,
      created_at: serverTimestamp(),
    });

    console.log("Notification sent successfully.");

    // --- Trigger push notification ---
    const receiverData = receiverSnapshot.data();
    const expoPushToken = receiverData?.expoPushToken; // Make sure you store Expo push token in user doc

    if (expoPushToken) {
      await triggerPushNotification(
        expoPushToken,
        "New Notification",
        `You have a new ${type} notification!`
      );
    } else {
      console.log("No Expo push token found for receiver");
    }

  } catch (error) {
    console.error("Error sending notification:", error);
  }
};


export async function submitFeedback({ userId = "anonymous", title, description, receiveBy }) {
  return await addDoc(collection(db, "feedback"), {
    userId,
    title,
    description,
    receiveBy,
    createdAt: serverTimestamp(),
  });
}

export const getUserNotifications = async (userId) => {
  try {
    const notificationsRef = collection(db, `users/${userId}/notification`);
    const q = query(
      notificationsRef, 
      orderBy('created_at', 'desc'),
      limit(50) // Limit to last 50 notifications
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const notificationData = {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
      
      // If notification has a post_ref, fetch the post data
      if (notificationData.post_ref) {
        try {
          const postDoc = await getDoc(doc(db, notificationData.post_ref));
          if (postDoc.exists()) {
            notificationData.postData = {
              id: postDoc.id,
              ...postDoc.data()
            };
          }
        } catch (error) {
          console.error('Error fetching post data:', error);
          notificationData.postData = null;
        }
      }
      
      notifications.push(notificationData);
    }
    
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Function to get a single notification with post data
export const getNotificationWithPost = async (userId, notificationId) => {
  try {
    const notificationRef = doc(db, `users/${userId}/notification/${notificationId}`);
    const notificationDoc = await getDoc(notificationRef);
    
    if (!notificationDoc.exists()) {
      throw new Error('Notification not found');
    }
    
    const notificationData = {
      id: notificationDoc.id,
      ...notificationDoc.data()
    };
    
    // Fetch post data if post_ref exists
    if (notificationData.post_ref) {
      try {
        const postDoc = await getDoc(doc(db, notificationData.post_ref));
        if (postDoc.exists()) {
          notificationData.postData = {
            id: postDoc.id,
            ...postDoc.data()
          };
        }
      } catch (error) {
        console.error('Error fetching post data:', error);
        notificationData.postData = null;
      }
    }
    
    return notificationData;
  } catch (error) {
    console.error('Error fetching notification:', error);
    throw error;
  }
};

// Real-time listener for notifications
export const subscribeToNotifications = (userId, callback) => {
  const notificationsRef = collection(db, `users/${userId}/notification`);
  const q = query(
    notificationsRef, 
    orderBy('created_at', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, async (querySnapshot) => {
    const notifications = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const notificationData = {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
      
      // Fetch post data if post_ref exists
      if (notificationData.post_ref) {
        try {
          console.log("Fetching post data for notification:", notificationData.id);
          console.log("Post reference:", notificationData.post_ref);
          
          // Use the DocumentReference directly with getDoc
          const postDoc = await getDoc(notificationData.post_ref);
          
          console.log("Post document fetched:", postDoc.exists());
          if (postDoc.exists()) {
            notificationData.postData = {
              id: postDoc.id,
              ...postDoc.data()
            };
          }
        } catch (error) {
          console.error('Error fetching post data:', error);
          notificationData.postData = null;
        }
      }
      
      notifications.push(notificationData);
    }
    
    callback(notifications);
  });
};

// Function to format notification for display
export const formatNotificationForDisplay = (notification) => {
  console.log("Formatting notification for display:", notification);
  const postTitle = notification.postData?.post_title || 
                   "your post";
  
  let title = "";
  let type = "default";
  
  switch (notification.type) {
    case 0: // Like notification
      title = `Likes on your post "${postTitle}"`;
      type = "like";
      break;
    case 1: // Comment notification
      title = `Comments on your post "${postTitle}"`;
      type = "comment";
      break;
    case 2: // Message notification
      title = "You have unread messages";
      type = "message";
      break;
    default:
      title = "New notification";
      type = "default";
  }
  
  return {
    id: notification.id,
    type: type,
    title: title,
    timestamp: formatTimestamp(notification.created_at),
    read: notification.read || false,
    postId: notification.postData?.id,
    originalData: notification
  };
};

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  // Handle Firestore timestamp
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

// Function to mark notification as read
export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const notificationRef = doc(db, `users/${userId}/notification/${notificationId}`);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const startOrGetDirectChat = async ({ currentUserId, otherUserId, groupName = 'Chat' }) => {

  const currentRef = doc(db, 'users', currentUserId);
  const otherRef = doc(db, 'users', otherUserId);
  const chatsRef = collection(db, 'chats');

  // Check for existing direct chat
  const q = query(chatsRef, where('members', 'array-contains', currentRef));
  const snapshot = await getDocs(q);
  for (const chatDoc of snapshot.docs) {
    const data = chatDoc.data();
    const members = data.members || [];
    const hasOther = members.find((m) => m?.path === otherRef.path);
    if (hasOther && members.length === 2) {
      return {
        chatId: chatDoc.id,
        chatRef: chatDoc.ref,
        created: false,
        chatData: data
      };
    }
  }

  // Create new direct chat
  const chatData = {
    group_name: groupName,              // 🟢 Set meaningful group name
    description: '',
    isAnonymous: false,
    isDirect: true,                     // 🟢 Mark as direct chat
    memberIds: [currentUserId, otherUserId], // 🟢 Optional for future use
    members: [currentRef, otherRef],
    createdAt: serverTimestamp(),
    createdBy: currentRef,
    lastMessage: '',
    lastMessageTime: null,
  };

  const chatDocRef = await addDoc(chatsRef, chatData);
  return {
    chatId: chatDocRef.id,
    chatRef: chatDocRef,
    created: true,
    chatData
  };
};

  
  
export {getRef, getSubRef, fetchReferenceData, updateRef, updateSubRef ,addRef, deleteDocument ,getSubRefAll, getCollections, getAnyCollection, fetchUserPosts, getPostsWithPagination, sendPostNotification,};


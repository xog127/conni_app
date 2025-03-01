import { db, collection } from "./firebaseConfig";
import { doc, getDoc, updateDoc, addDoc, getDocs } from "firebase/firestore";

const getCollections = async ({ collectionName }) => {
  try {
    console.log("Fetching all documents from collection:", collectionName);

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
      const docSnapshot = await getDoc(reference);
      if (docSnapshot.exists()) {
        //console.log("Fetched Data:", docSnapshot.data());
        return docSnapshot.data();
      } else {
        console.log("No document found for this reference");
        return null;
      }
    } catch (error) {
      console.error("Error fetching data from reference:", error);
    }
  }

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
        console.log(`User with ID ${userId} not found.`);
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
      console.log("Fetching post data for:", postRefs);
  
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
    console.log("Fetching posts for user:", userId);
    const posts = await fetchUserPostList(userId, "postsRef");
    const likedPosts = await fetchUserPostList(userId, "likedPostsRef");
    const commentedPosts = await fetchUserPostList(userId, "commentedPostsRef");
    return {
      posts,
      likedPosts,
      commentedPosts
    };
  
  };
  
  


export {getRef, getSubRef, fetchReferenceData, updateRef, updateSubRef ,addRef, deleteDocument ,getSubRefAll, getCollections, getAnyCollection, fetchUserPosts};


import { db, collection } from "./firebaseConfig";
import { doc, getDoc, updateDoc, addDoc, getDocs } from "firebase/firestore";


const getRef = async ({ id, collectionName }) => {
  try {
    console.log("Fetching document:", id, "from collection:", collectionName);

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

const getSubRefAll = async ({ id, collectionName, subCollectionName }) => {
  try {
    console.log("Fetching all documents from subcollection:", subCollectionName, "under document:", id, "in collection:", collectionName);

    // Reference the subcollection
    const subCollectionRef = collection(db, collectionName, id, subCollectionName);

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
      console.log("Fetching document:", id, "from collection:", collectionName, subCollectionName);
  
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

const updateSubRef = async ({ id, subID, collectionName, subCollectionName, updateFields }) => {
  try {
    const documentRef = doc(db, collectionName, id, subCollectionName, subID);
    
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

export {getRef, getSubRef, fetchReferenceData, updateRef, updateSubRef ,addRef, getSubRefAll};

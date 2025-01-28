import { db } from "./firebaseConfig";
import { doc, getDoc, updateDoc, addDoc } from "firebase/firestore";

const getRef = async ({ id, collectionName }) => {
  try {
    console.log("Fetching document:", id, "from collection:", collectionName);

    // Reference the specific document
    const docRef = doc(db, collectionName, id);

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

const updateRef = async ({ id, collectionName, updateData, updateField }) => {
  const documentRef = doc(db, collectionName, id);
  updateDoc(documentRef, {
    [updateField] : updateData
  })

}

const addRef = async ({ collectionName, data}) => {
    const documentRef = doc(db, collectionName);
    addDoc(documentRef, data);
}

export {getRef, getSubRef, fetchReferenceData, updateRef, addRef};

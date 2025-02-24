import { 
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot
  } from 'firebase/firestore';
  import { db } from '../firebase/firebaseConfig';
  
  class UserService {
    async createUserDocument(user, additionalData = {}) {
      if (!user) return;
  
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);
  
      if (!snapshot.exists()) {
        const { email } = user;
        const createdAt = new Date();
  
        try {
          await setDoc(userRef, {
            email,
            createdAt,
            ...additionalData
          });
        } catch (error) {
          console.error('Error creating user document', error);
        }
      }
  
      return userRef;
    }
  
    async getUserData(uid) {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return userDoc.exists() ? userDoc.data() : null;
      } catch (error) {
        console.error('Error fetching user data', error);
        return null;
      }
    }
  
    async updateUserData(uid, data) {
      try {
        await updateDoc(doc(db, 'users', uid), data);
        return true;
      } catch (error) {
        console.error('Error updating user data', error);
        return false;
      }
    }
  
    onUserDataChange(uid, callback) {
      return onSnapshot(
        doc(db, 'users', uid),
        (doc) => callback(doc.data()),
        (error) => console.error('Error listening to user data', error)
      );
    }
  }
  
  export default new UserService();
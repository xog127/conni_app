import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
  } from 'firebase/auth';
  import { auth } from '../firebase/firebaseConfig';
  
  class AuthService {
    async signUpWithEmail(email, password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (error) {
        throw error;
      }
    }
  
    async signInWithEmail(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (error) {
        throw error;
      }
    }
  
    async signOut() {
      try {
        await signOut(auth);
      } catch (error) {
        throw error;
      }
    }
  
    onAuthStateChanged(callback) {
      return onAuthStateChanged(auth, callback);
    }
  }
  
  export default new AuthService();
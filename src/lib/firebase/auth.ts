
import { 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from './config';

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  if (!auth) {
    throw new Error("Firebase is not configured. Please check your .env file.");
  }
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Error starting redirect sign-in:", error);
    throw error;
  }
};

export const getRedirectResultFromGoogle = async () => {
  if (!auth) {
    return null;
  }
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch(error: any) {
    if (error.code === 'auth/unauthorized-domain') {
        console.error("Firebase Auth Error: This domain is not authorized. Please check your Firebase project's settings and ensure the current domain is listed in the 'Authorized domains' section of the Authentication settings.");
    } else {
        console.error("Error getting redirect result:", error);
    }
    throw error;
  }
}

export const signUpWithEmailPassword = async (email, password) => {
    if (!auth) {
        throw new Error("Firebase is not configured.");
    }
    return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmailPassword = async (email, password) => {
    if (!auth) {
        throw new Error("Firebase is not configured.");
    }
    return await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  if (!auth) {
    return; // No need to do anything if Firebase isn't configured
  }
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

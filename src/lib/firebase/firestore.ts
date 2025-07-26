
import { db } from './config';
import { doc, getDoc, setDoc, collection, type DocumentData, writeBatch, getDocs, deleteDoc, query } from 'firebase/firestore';
import type { AppSettings } from '@/hooks/use-app-settings';

if (!db) {
  console.warn("Firestore is not initialized. User data will not be saved to the cloud.");
}

// --- User Document Functions ---

const usersCollection = db ? collection(db, 'users') : null;

// Get a reference to a user's document
export const getUserDocRef = (uid: string) => {
    if (!usersCollection) throw new Error("Firestore not initialized.");
    return doc(usersCollection, uid);
};

// Fetch a user's document data (which contains their settings)
export const getUserDoc = async (uid: string): Promise<DocumentData | null> => {
    if (!db) return null;
    try {
        const docRef = getUserDocRef(uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No such user document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting user document:", error);
        return null;
    }
};

// Create or update a user's document data
export const updateUserDoc = async (uid: string, data: Partial<DocumentData>): Promise<void> => {
    if (!db) return;
    try {
        const docRef = getUserDocRef(uid);
        // `setDoc` with `merge: true` will create the document if it doesn't exist,
        // or update it if it does.
        await setDoc(docRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating user document:", error);
    }
};

// --- Subcollection Functions ---

// Get a reference to a user's subcollection (e.g., habits, goals)
export const getUserSubcollectionRef = (uid: string, collectionName: string) => {
    if (!db) throw new Error("Firestore not initialized.");
    const userDocRef = getUserDocRef(uid);
    return collection(userDocRef, collectionName);
};

// Generic function to fetch all documents from a user's subcollection
export const getSubcollection = async <T>(uid: string, collectionName: string): Promise<T[]> => {
    if (!db) return [];
    try {
        const collectionRef = getUserSubcollectionRef(uid, collectionName);
        const q = query(collectionRef);
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
        console.error(`Error getting ${collectionName} subcollection:`, error);
        return [];
    }
};

// Generic function to save a document to a user's subcollection
export const saveToSubcollection = async <T extends { id: string }>(uid: string, collectionName: string, data: T): Promise<void> => {
    if (!db) return;
    try {
        const collectionRef = getUserSubcollectionRef(uid, collectionName);
        await setDoc(doc(collectionRef, data.id), data);
    } catch (error) {
        console.error(`Error saving to ${collectionName} subcollection:`, error);
    }
};

// Generic function to delete a document from a user's subcollection
export const deleteFromSubcollection = async (uid: string, collectionName: string, docId: string): Promise<void> => {
    if (!db) return;
    try {
        const docRef = doc(getUserSubcollectionRef(uid, collectionName), docId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error(`Error deleting from ${collectionName} subcollection:`, error);
    }
};

// Function to migrate a whole collection from local storage to firestore
export const migrateCollection = async <T extends { id: string }>(uid: string, collectionName: string, localData: T[]) => {
    if (!db || localData.length === 0) return;
    const batch = writeBatch(db);
    const collectionRef = getUserSubcollectionRef(uid, collectionName);
    localData.forEach(item => {
        const docRef = doc(collectionRef, item.id);
        batch.set(docRef, item);
    });
    try {
        await batch.commit();
        console.log(`Successfully migrated ${collectionName} to Firestore.`);
    } catch (error) {
        console.error(`Error migrating ${collectionName}:`, error);
    }
};

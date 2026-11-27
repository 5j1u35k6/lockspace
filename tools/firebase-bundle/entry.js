export { initializeApp } from 'firebase/app';
export { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
export { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, deleteDoc, query, where, orderBy, limit, startAfter, serverTimestamp } from 'firebase/firestore';

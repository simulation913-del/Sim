// firebase.js
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require("firebase/firestore");

// Your Firebase project config (copy from Firebase Console → Project Settings)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Add a message tied to a user
async function addMessage(userId, role, name, content) {
  await addDoc(collection(db, "history"), { userId, role, name, content, timestamp: new Date() });
}

// Get history for a specific user
async function getHistory(userId) {
  const q = query(collection(db, "history"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

// Clear history for a specific user
async function clearHistory(userId) {
  const q = query(collection(db, "history"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  for (let d of snapshot.docs) {
    await deleteDoc(doc(db, "history", d.id));
  }
}

module.exports = { addMessage, getHistory, clearHistory };

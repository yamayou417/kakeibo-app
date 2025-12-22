import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { 
  getFirestore, collection, query, orderBy, limit, getDocs, where, addDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyATXLdNYTvmlMa0jhsBXXTtxMm5fHVmZ6s",
  authDomain: "kakeibo-f73fc.firebaseapp.com",
  projectId: "kakeibo-f73fc",
  storageBucket: "kakeibo-f73fc.firebasestorage.app",
  messagingSenderId: "64975489834",
  appId: "1:64975489834:web:19ac6c76d85e5769f8ac53",
  measurementId: "G-7C1M3B338Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "money-history");

export { auth, signInWithPopup, GoogleAuthProvider, signOut, query, orderBy, limit, getDocs, collection, where, db, addDoc, onAuthStateChanged };
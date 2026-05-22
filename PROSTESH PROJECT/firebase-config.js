import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJt2HeStIW0ETRjTC0Y3pVvWJpvf_tjJg",
  authDomain: "prostesh-project.firebaseapp.com",
  projectId: "prostesh-project",
  storageBucket: "prostesh-project.firebasestorage.app",
  messagingSenderId: "333933700523",
  appId: "1:333933700523:web:9499d128cf14d079671eee"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
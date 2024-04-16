import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDJ-M3HOY63LuwIgNPLaf1G3WBk9gUf6WI",
  authDomain: "vitrinea-4433b.firebaseapp.com",
  projectId: "vitrinea-4433b",
  storageBucket: "vitrinea-4433b.appspot.com",
  messagingSenderId: "297078940338",
  appId: "1:297078940338:web:1e3f94ec67a5e8cb2d5fab",
  measurementId: "G-CD1X17RQTG"
};

const queryString = window.location.search.substring(1)

if (!queryString) {
  alert("Error: No reference to the image found in the query string.");
  throw new Error("Product reference not found. Stopping execution.");
}

initializeApp(firebaseConfig);
const db = getFirestore();
const docRef = doc(db, 'products', queryString);

async function fetchArModel() {
  const doc = await getDoc(docRef);
  if (!doc.exists()) {
      alert("Error: Image reference not found.");
      throw new Error("Product reference doesn't exist. Stopping execution.");
  }
  return doc.data().arModel;
}

const fetched = await fetchArModel()
export {fetched}
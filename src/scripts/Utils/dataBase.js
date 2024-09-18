import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDJ-M3HOY63LuwIgNPLaf1G3WBk9gUf6WI",
  authDomain: "vitrinea-4433b.firebaseapp.com",
  projectId: "vitrinea-4433b",
  storageBucket: "vitrinea-4433b.appspot.com",
  messagingSenderId: "297078940338",
  appId: "1:297078940338:web:1e3f94ec67a5e8cb2d5fab",
  measurementId: "G-CD1X17RQTG"
};
const queryString = window.location.search.substring(1);

if (!queryString) {
  alert("Error: No reference to the image found in the query string.");
  throw new Error("Product reference not found. Stopping execution.");
}
console.log(queryString)

initializeApp(firebaseConfig);
const db = getFirestore();
const docRef = doc(db, 'products', queryString);

async function fetchArModel() {
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    alert("Error: Image reference not found.");
    throw new Error("Product reference doesn't exist. Stopping execution.");
  }

  const modelosAr = getImagesArrays(docSnap.data().arModel);
  console.log(modelosAr);
  if (!modelosAr) {
    alert("No hay imagenes frontAR");
    throw new Error("No frontAR images. Stopping execution.");
  }
  return modelosAr;
}

function getImagesArrays(obj) {
  if (!obj.frontAR) return null;
  const images = {
    frontAR: obj.frontAR.slice(),
    backAR: obj.backAR?.length ? obj.backAR.slice() : obj.frontAR.slice(),
    frontRightAR: obj.frontRightAR?.length ? obj.frontRightAR.slice() : obj.frontAR.slice(),
    frontLeftAR: obj.frontLeftAR?.length ? obj.frontLeftAR.slice() : obj.frontAR.slice(),
    name: obj.name,
    simConfig: obj.simConfig,
  };
  return images;
}

export async function updateData(newData) {
  try {
    await updateDoc(docRef, newData);
    console.log('Dato actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar el dato:', error);
  }
}

const fetched = await fetchArModel();

export { fetched };
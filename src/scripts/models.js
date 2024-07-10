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

  if (!modelosAr) {
    alert("No hay imagenes frontAR");
    throw new Error("No frontAR images. Stopping execution.");
  }

  const base64ModelosAr = await convertUrlsToBase64(modelosAr);
  return base64ModelosAr;
}

function getImagesArrays(obj) {
  if (!obj.frontAR) return null;
  const images = { frontAR: obj.frontAR.slice() };
  if (obj.backAR === null || obj.backAR === '' || obj.backAR === undefined || obj.backAR.length === 0) {
    images.backAR = obj.frontAR.slice()
  } else {
    images.backAR = obj.backAR.slice()
  }
  images.name = obj.name
  return images;
}

function imageToBase64(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = reject;
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  });
}

async function convertUrlsToBase64(modelos) {
  const convertPromises = [];

  if (modelos.frontAR) {
    convertPromises.push(...modelos.frontAR.map((url, index) => imageToBase64(url).then(base64 => modelos.frontAR[index] = base64)));
  }
  if (modelos.backAR) {
    convertPromises.push(...modelos.backAR.map((url, index) => imageToBase64(url).then(base64 => modelos.backAR[index] = base64)));
  }

  await Promise.all(convertPromises);
  return modelos;
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

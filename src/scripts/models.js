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

  function imageToBase64(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }
  async function convertUrlsToBase64(urls) {
    return new Promise((resolve) => {
      var counter = 0;
      urls.forEach(function (url, index) {
        imageToBase64(url, function (base64) {
          urls[index] = base64;
          counter++;
          if (counter === urls.length) {
            resolve(urls);
          }
        });
      });
    });
  }

  function obtenerArraysDeImagenes(objeto) {
    if (!objeto || !objeto.frontAR) {
      return null;
    } else if (!objeto.backAR) {
      const nuevoObjeto = {
        frontAR: objeto.frontAR.slice()
      };
      return nuevoObjeto;
    } else if (!objeto || !objeto.frontAR || !objeto.backAR) {
      const nuevoObjeto = {
        frontAR: objeto.frontAR.slice(),
        backAR: objeto.backAR.slice()
      };
      return nuevoObjeto;
    }
  }

  var modelosAr = obtenerArraysDeImagenes(doc.data().arModel);

  if (!modelosAr.backAR) {
    modelosAr.frontAR = await convertUrlsToBase64(modelosAr.frontAR)
      .then(function (urls) {
        return urls
      });
  }else{
    modelosAr.frontAR = await convertUrlsToBase64(modelosAr.frontAR)
      .then(function (urls) {
        return urls
      });
    modelosAr.backAR = await convertUrlsToBase64(modelosAr.backAR)
      .then(function (urls) {
        return urls
      });
  }
  return modelosAr;
}

var fetched = await fetchArModel()

export { fetched }

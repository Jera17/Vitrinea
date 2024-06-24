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

const queryString = window.location.search.substring(1);

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

  let modelosAr = obtenerArraysDeImagenes(doc.data().arModel);

  function obtenerArraysDeImagenes(objeto) {
    console.log(objeto)
    if (!objeto.frontAR) {
      alert("No hay imagenes frontAR");
      return null;
    } else if (!objeto.backAR) {
      console.log("No hay imagenes backAR");
      return { frontAR: objeto.frontAR.slice() };
    } else {
      console.log("Si hay imagenes backAR");
      return {
        frontAR: objeto.frontAR.slice(),
        backAR: objeto.backAR.slice()
      };
    }
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

  // if (!modelosAr.backAR) {
  //   console.log("uwu")
  //   modelosAr.frontAR = await convertUrlsToBase64(modelosAr.frontAR);
  // } else {
  //   console.log("ewe")
  //   modelosAr.frontAR = await convertUrlsToBase64(modelosAr.frontAR);
  //   modelosAr.backAR = await convertUrlsToBase64(modelosAr.backAR);
  // }

  // async function convertUrlsToBase64(urls) {
  //   return new Promise((resolve) => {
  //     var counter = 0;
  //     console.log(urls)
  //     urls.forEach(function (url, index) {
  //       imageToBase64(url, function (base64) {
  //         urls[index] = base64;
  //         counter++;
  //         if (counter === urls.length) {
  //           resolve(urls);
  //         }
  //       });
  //     });
  //   });
  // }

  async function convertUrlsToBase64(modelos) {
    return new Promise((resolve) => {
      let urls = [];
      let keys = [];
  
      if (modelos.frontAR) {
        urls = urls.concat(modelos.frontAR);
        keys = keys.concat(Array(modelos.frontAR.length).fill('frontAR'));
      }
      if (modelos.backAR) {
        urls = urls.concat(modelos.backAR);
        keys = keys.concat(Array(modelos.backAR.length).fill('backAR'));
      }
  
      var counter = 0;
      urls.forEach(function (url, index) {
        imageToBase64(url, function (base64) {
          if (keys[index] === 'frontAR') {
            modelos.frontAR[index - (keys.indexOf('frontAR'))] = base64;
          } else {
            modelos.backAR[index - (keys.indexOf('backAR'))] = base64;
          }
          counter++;
          if (counter === urls.length) {
            resolve(modelos);
          }
        });
      });
    });
  }
  
  modelosAr = await convertUrlsToBase64(modelosAr);


  // Dispatch custom event with fetched data
  document.dispatchEvent(new CustomEvent('dataFetched', { detail: modelosAr }));
}

// Start fetching data
fetchArModel();
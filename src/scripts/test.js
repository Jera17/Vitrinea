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

initializeApp(firebaseConfig);
const db = getFirestore()
const docRefKey = "VDuMzy56lyB5zpK0Dxga"

var imageArea = document.getElementById("imageArea");
var displayArea = document.getElementById("displayArea");

const docRef = doc(db, 'products', docRefKey)

async function fetchArModel() {
    try {
        const doc = await getDoc(docRef);
        const arModel = doc.data().arModel;
        //return arModel;
        return arModel;
    } catch (err) {
        console.log(err.message);
        throw err;
    }
}

const uwu = await fetchArModel()

console.log("uwu")
console.log(uwu)
console.log(uwu.frontAR)
imageArea.src = uwu.frontAR[0]
displayArea.innerHTML = `
    <p>Name: ${uwu.type}</p>
    <p>Name: ${uwu.name}</p>
    `;


// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";
// import { } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js"
// import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// const firebaseConfig = {
//     apiKey: "AIzaSyDJ-M3HOY63LuwIgNPLaf1G3WBk9gUf6WI",
//     authDomain: "vitrinea-4433b.firebaseapp.com",
//     projectId: "vitrinea-4433b",
//     storageBucket: "vitrinea-4433b.appspot.com",
//     messagingSenderId: "297078940338",
//     appId: "1:297078940338:web:1e3f94ec67a5e8cb2d5fab",
//     measurementId: "G-CD1X17RQTG"
// };

// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const db = getFirestore()

// const docRefKey = "VDuMzy56lyB5zpK0Dxga"

// var imageArea = document.getElementById("imageArea");
// var displayArea = document.getElementById("displayArea");

// const docRef = doc(db, 'products', docRefKey)

// async function fetchArModel() {
//     try {
//         const doc = await getDoc(docRef);
//         const arModel = doc.data().arModel;
//         imageArea.src = arModel.frontAR[0]
//         displayArea.innerHTML = `
//             <p>Name: ${arModel.type}</p>
//             <p>Name: ${arModel.name}</p>
//             `;
//         //return arModel;
//         return arModel;
//     } catch (err) {
//         console.log(err.message);
//         throw err;
//     }
// }

// const uwu = await fetchArModel()

// console.log("uwu")
// console.log(uwu)
// console.log(uwu.frontAR)
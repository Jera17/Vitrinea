/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/test.js":
/*!*****************************!*\
  !*** ./src/scripts/test.js ***!
  \*****************************/
/***/ (() => {

eval("// import { initializeApp } from '../../node_modules/firebase/app';\n\n// const firebaseConfig = {\n//   apiKey: \"AIzaSyDJ-M3HOY63LuwIgNPLaf1G3WBk9gUf6WI\",\n//   authDomain: \"vitrinea-4433b.firebaseapp.com\",\n//   projectId: \"vitrinea-4433b\",\n//   storageBucket: \"vitrinea-4433b.appspot.com\",\n//   messagingSenderId: \"297078940338\",\n//   appId: \"1:297078940338:web:1e3f94ec67a5e8cb2d5fab\",\n//   measurementId: \"G-CD1X17RQTG\"\n// };\n\n// const app = initializeApp(firebaseConfig);\n\n\nconst admin = ('../../node_modules/firebase-admin');\nconst serviceAccount = ('./ruta/a/tu/serviceAccountKey.json');\nadmin.initializeApp({\n  credential: admin.credential.cert(serviceAccount)\n});\nconst db = firestore();\n\n\n// const functions = require(\"firebase-functions\");\n// const express = require(\"express\");\n// const admin = require(\"firebase-admin\");\n// const app = express();\n// admin.initializeApp({\n//   credential: admin.credential.applicationDefault(),\n//   databaseURL: \"https://vitrinea-4433b.firebaseio.com\",\n// });\n\n// import { getFirestore, collection, getDocs } from 'firebase/firestore';\n\n// const db = getFirestore(app);\n// const querySnapshot = await getDocs(collection(db, 'nombre_de_tu_coleccion'));\n\n// querySnapshot.forEach((doc) => {\n//   console.log('ID del documento:', doc.id);\n//   console.log('Datos del documento:', doc.data());\n// });\n\n//# sourceURL=webpack://recorded/./src/scripts/test.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/scripts/test.js"]();
/******/ 	
/******/ })()
;
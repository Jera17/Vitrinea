import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDJ-M3HOY63LuwIgNPLaf1G3WBk9gUf6WI",
  authDomain: "vitrinea-4433b.firebaseapp.com",
  projectId: "vitrinea-4433b",
  storageBucket: "vitrinea-4433b.appspot.com",
  messagingSenderId: "297078940338",
  appId: "1:297078940338:web:1e3f94ec67a5e8cb2d5fab",
  measurementId: "G-CD1X17RQTG"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Obtener los valores únicos de data.arModel.type
async function getUniqueTypes() {
  const types = new Set();
  const querySnapshot = await getDocs(collection(db, "products"));

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.arModel && data.arModel.type) {
      types.add(data.arModel.type);
    }
  });

  return Array.from(types);
}

const typeMappings = {
  'Anillo': 'rings',
  'Gafas': 'glasses',
  'Brazaletes': 'bracelets',
  'Collares': 'necklaces',
  'Sombreros': 'hats',
  'Camisetas': 'shirts',
  'Vestidos largos': 'longDresses',
  'Vestidos cortos': 'shortDresses',
  'Faldas y pantalones cortos': 'skirtAndShorts',
  'Bolsos': 'bags',
  'Aretes': 'earrings',
  'Bolsos largos': 'longBags',
  'Pantalones': 'pants'
};

// Función para cargar los datos desde Firestore y mostrarlos en la tabla
async function loadData(filterType = '') {
  const dataOutput = document.getElementById('dataOutput');
  const querySnapshot = await getDocs(collection(db, "products"));

  dataOutput.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos
  querySnapshot.forEach((doc) => {
    const data = doc.data();

    // Verificar si data.arModel.type existe y no está vacío
    if (data.arModel && data.arModel.type && (filterType === '' || data.arModel.type === filterType)) {
      const row = `
        <tr data-type="${data.arModel.type}" data-id="${doc.id}">
        <td>${doc.id}</td>
        <td>${data.arModel.type}</td>
        <td>${data.name}</td>
        </tr>
        `;
      dataOutput.innerHTML += row;
    }
  });
}

// Función para llenar el campo de selección
async function populateFilter() {
  const filterSelect = document.getElementById('filterSelect');
  const uniqueTypes = await getUniqueTypes();

  uniqueTypes.forEach((type) => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    filterSelect.appendChild(option);
  });
}

// Manejar el cambio en el filtro
document.getElementById('filterSelect').addEventListener('change', (event) => {
  const selectedType = event.target.value;
  loadData(selectedType);
});

// Manejar el clic en las filas de la tabla
document.getElementById('dataOutput').addEventListener('click', (event) => {
  const targetRow = event.target.closest('tr');
  if (targetRow) {
    const currentUrl = window.location.href;
    const type = targetRow.getAttribute('data-type');
    const mappedType = typeMappings[type] || type;
    const docId = targetRow.getAttribute('data-id');
    const addHash = document.getElementById('addHash').checked;
    const hashSuffix = addHash ? '#A' : '';
    const linkOutput = document.getElementById('linkOutput');
    linkOutput.innerHTML = `<a href="${currentUrl}public/${mappedType}.html?${docId}${hashSuffix}">Enlace: ${currentUrl}public/${mappedType}.html?${docId}${hashSuffix}</a>`;
  }
});

// Llamar a las funciones cuando se cargue la página
window.onload = async () => {
  await populateFilter();
  loadData(); // Cargar todos los datos al inicio
};
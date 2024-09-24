import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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

// Obtener los valores únicos de data.arModel.type y data.marca
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

async function getUniqueBrands() {
  const brands = new Set();
  const querySnapshot = await getDocs(collection(db, "products"));

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.marca) {
      brands.add(data.marca);
    }
  });

  return Array.from(brands);
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
async function loadData(filterType = '', filterBrand = '') {
  const dataOutput = document.getElementById('dataOutput');
  const querySnapshot = await getDocs(collection(db, "products"));

  dataOutput.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos
  querySnapshot.forEach((doc) => {
    const data = doc.data();

    // Verificar si data.arModel.type y data.marca existen y no están vacíos
    if (data.arModel && data.arModel.type && data.marca &&
      (filterType === '' || data.arModel.type === filterType) &&
      (filterBrand === '' || data.marca === filterBrand)) {

        // Formatear la fecha de creación
        const dateCreation = data.date_creation.toDate();
        const formattedDate = dateCreation.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

      const row = `
        <tr>
          <td data-id="${doc.id}">${doc.id}</td>
          <td data-marca="${data.marca}">${data.marca}</td>
          <td data-type="${data.arModel.type}">${data.arModel.type}</td>
          <td data-name="${data.name}">${data.name}</td>
          <td data-date_creation="${data.date_creation}">${formattedDate}</td>
        </tr>
      `;
      dataOutput.innerHTML += row;
    }
  });
}

// Función para llenar los campos de selección
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

async function populateBrandFilter() {
  const filterMarca = document.getElementById('filterMarca');
  const uniqueBrands = await getUniqueBrands();

  uniqueBrands.forEach((brand) => {
    const option = document.createElement('option');
    option.value = brand;
    option.textContent = brand;
    filterMarca.appendChild(option);
  });
}

// Función para ordenar la tabla
function sortTable(column, order) {
  const rows = Array.from(document.querySelector('#dataOutput').querySelectorAll('tr'));
  const sortedRows = rows.sort((a, b) => {
    const aColumnText = a.querySelector(`[data-${column}]`).textContent.trim();
    const bColumnText = b.querySelector(`[data-${column}]`).textContent.trim();

    if (order === 'asc') {
      return aColumnText.localeCompare(bColumnText);
    } else {
      return bColumnText.localeCompare(aColumnText);
    }
  });

  // Limpiar la tabla y agregar las filas ordenadas
  const tbody = document.getElementById('dataOutput');
  tbody.innerHTML = '';
  sortedRows.forEach(row => tbody.appendChild(row));
}

// Manejar el clic en los encabezados de la tabla para ordenar
document.querySelectorAll('th').forEach(header => {
  header.addEventListener('click', () => {
    const column = header.getAttribute('data-column');
    const order = header.getAttribute('data-order');
    sortTable(column, order);

    // Cambiar el orden para la próxima vez que se haga clic
    header.setAttribute('data-order', order === 'asc' ? 'desc' : 'asc');
  });
});

// Manejar el cambio en los filtros
document.getElementById('filterSelect').addEventListener('change', () => {
  const selectedType = document.getElementById('filterSelect').value;
  const selectedBrand = document.getElementById('filterMarca').value;
  loadData(selectedType, selectedBrand);
});

document.getElementById('filterMarca').addEventListener('change', () => {
  const selectedType = document.getElementById('filterSelect').value;
  const selectedBrand = document.getElementById('filterMarca').value;
  loadData(selectedType, selectedBrand);
});

// Manejar el clic en las filas de la tabla
document.getElementById('dataOutput').addEventListener('click', (event) => {
  const targetRow = event.target.closest('tr');
  if (targetRow) {
    const currentUrl = window.location.href;
    const type = targetRow.querySelector('[data-type]').textContent;
    const mappedType = typeMappings[type] || type;
    const docId = targetRow.querySelector('[data-id]').textContent;
    const addHash = document.getElementById('addHash').checked;
    const hashSuffix = addHash ? '#A' : '';
    const linkOutput = document.getElementById('linkOutput');
    linkOutput.innerHTML = `<a href="${currentUrl}public/${mappedType}.html?${docId}${hashSuffix}">Enlace: ${currentUrl}public/${mappedType}.html?${docId}${hashSuffix}</a>`;
  }
});

// Llamar a las funciones cuando se cargue la página
window.onload = async () => {
  await populateFilter();
  await populateBrandFilter();
  loadData(); // Cargar todos los datos al inicio
};

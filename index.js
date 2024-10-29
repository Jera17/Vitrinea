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

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Si usas Firestore
const storage = firebase.storage(); // Para las imágenes

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

// Cargar datos de la base de datos y crear tarjetas
async function cargarProductos() {
  const productContainer = document.getElementById('product-container');

  try {
    const querySnapshot = await db.collection("products").get();
    querySnapshot.forEach(async (doc) => {
      const data = doc.data();
      if (!data.arModel || !data.arModel.type) {
        return;
      }
      const imageUrl = data.main_photo;
      const productId = doc.id;
      const productType = data.arModel.type;

      // Crea la tarjeta HTML para cada producto
      const productCard = document.createElement('div');
      productCard.classList.add('relative', 'flex', 'w-80', 'flex-col', 'rounded-xl', 'bg-white', 'bg-clip-border', 'text-gray-700', 'shadow-md');

      productCard.innerHTML = `
        <div class="relative mx-4 mt-4 h-60 overflow-hidden rounded-xl bg-purple-gray-500 bg-clip-border text-white shadow-lg">
          <img src="${imageUrl}" alt="${data.name}" class="h-full w-full object-cover" />
        </div>
        <div class="p-6">
          <h5 class="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-purple-gray-900 antialiased">
            ${data.name}
          </h5>
          <p class="block font-sans text-base font-bold text-xs leading-relaxed antialiased">
            ${data.doc_ref}
          </p>
          <p class="block font-sans text-base font-light leading-relaxed text-inherit antialiased">
            ${data.discount}
          </p>
        </div>
        <div class="mt-auto p-6 pt-0">
          <button class="probar-btn select-none rounded-lg bg-purple-500 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg" data-type="${productId} data-id="${productType}">
            Probar
          </button>
        </div>
      `;

      // Añadir el evento click al botón
      productCard.querySelector('.probar-btn').addEventListener('click', function () {
        // Redirige a una nueva página con el ID del producto en la URL
        const mappedType = typeMappings[productType] || productType;
        // let linkToTryOn = `${window.location.href.substring(0, window.location.href.lastIndexOf('/'))}/public/${mappedType}.html?${productId}#T`;
        let linkToTryOn = `${window.location.href.substring(0, window.location.href.lastIndexOf('/'))}/public/${mappedType}.html?${productId}${window.location.hash}`;
        window.location.href = linkToTryOn
      });

      productContainer.appendChild(productCard);
    });
  } catch (error) {
    console.error("Error al cargar productos: ", error);
  }
}

// Llamamos a la función para cargar productos cuando se cargue la página
window.onload = cargarProductos;
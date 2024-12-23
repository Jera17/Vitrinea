// Importar MediaPipe Face Mesh
const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

// Configuración de Face Mesh
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

faceMesh.onResults(onResults);

// Inicialización de variables
const imageInput = document.getElementById('imageInput');
const canvasInput = document.getElementById('canvasInput');
const canvasOutput = document.getElementById('canvasOutput');
const downloadButton = document.getElementById('downloadButton');
const ctxInput = canvasInput.getContext('2d');
const ctxOutput = canvasOutput.getContext('2d');

// Elemento para mostrar el progreso
const progressText = document.getElementById('progressText');

// Variables para procesar las imágenes
const MOUTH_LANDMARKS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61];

// Cola de imágenes para procesar
let imageQueue = [];
let totalImages = 0;  // Total de imágenes subidas
let processedImages = 0;  // Número de imágenes procesadas

// Función para actualizar el progreso
function updateProgress() {
  progressText.textContent = `Fotos procesadas (${processedImages}/${totalImages})`;
}

// Función para procesar cada imagen
function processImage(file) {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    // Configurar canvas para la imagen
    canvasInput.width = img.width;
    canvasInput.height = img.height;
    ctxInput.drawImage(img, 0, 0, img.width, img.height);

    // Procesar con FaceMesh
    faceMesh.send({ image: img });
  };
}

// Función para procesar los resultados de Face Mesh
function onResults(results) {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    alert('No se detectó ningún rostro.');
    return;
  }

  // Obtener landmarks de la boca
  const faceLandmarks = results.multiFaceLandmarks[0];
  const mouthCoords = MOUTH_LANDMARKS.map(index => ({
    x: faceLandmarks[index].x * canvasInput.width,
    y: faceLandmarks[index].y * canvasInput.height
  }));

  // Calcular los límites de la boca
  const minX = Math.min(...mouthCoords.map(p => p.x));
  const maxX = Math.max(...mouthCoords.map(p => p.x));
  const minY = Math.min(...mouthCoords.map(p => p.y));
  const maxY = Math.max(...mouthCoords.map(p => p.y));
  const width = maxX - minX;
  const height = maxY - minY;

  // Aumentar el tamaño de la caja
  const padding = 20;
  const newMinX = Math.max(minX - padding, 0);
  const newMaxX = Math.min(maxX + padding, canvasInput.width);
  const newMinY = Math.max(minY - padding, 0);
  const newMaxY = Math.min(maxY + padding, canvasInput.height);

  // Calcular el nuevo tamaño del bounding box
  const newWidth = newMaxX - newMinX;
  const newHeight = newMaxY - newMinY;

  // Recortar y dibujar en el canvas de salida
  canvasOutput.width = newWidth;
  canvasOutput.height = newHeight;
  ctxOutput.clearRect(0, 0, newWidth, newHeight);
  ctxOutput.drawImage(canvasInput, newMinX, newMinY, newWidth, newHeight, 0, 0, newWidth, newHeight);

  // Descargar la imagen recortada
  const link = document.createElement('a');
  link.download = 'boca_recortada.png';
  link.href = canvasOutput.toDataURL();
  link.click();

  // Incrementar el contador de imágenes procesadas
  processedImages++;
  updateProgress();

  // Procesar la siguiente imagen si hay más archivos
  const nextFile = imageQueue.shift();
  if (nextFile) {
    processImage(nextFile);
  }
}

// Función para manejar la subida de múltiples imágenes
imageInput.addEventListener('change', (event) => {
  // Agregar todas las imágenes seleccionadas a la cola
  imageQueue = Array.from(event.target.files);
  totalImages = imageQueue.length;  // Establecer el total de imágenes subidas
  processedImages = 0;  // Reiniciar el contador de imágenes procesadas

  // Mostrar el progreso inicial
  updateProgress();

  // Iniciar el procesamiento de la primera imagen
  if (imageQueue.length > 0) {
    processImage(imageQueue.shift());
  }
});

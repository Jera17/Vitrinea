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

function drawPoint(ctx, x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath()
}

// Variables
const imageInput = document.getElementById('imageInput');
const canvasInput = document.getElementById('canvasInput');
const canvasOutput = document.getElementById('canvasOutput');
const downloadButton = document.getElementById('downloadButton');
const ctxInput = canvasInput.getContext('2d');
const ctxOutput = canvasOutput.getContext('2d');

// Índices de los landmarks de la boca
const MOUTH_LANDMARKS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61];

// Función principal
imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      canvasInput.width = img.width;
      canvasInput.height = img.height;
      ctxInput.drawImage(img, 0, 0, img.width, img.height);
      faceMesh.send({ image: img });
    };
  }
});

// Procesar resultados de Face Mesh
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

  // // Dibujar el rectángulo rojo alrededor de la boca
  // ctxInput.strokeStyle = 'red';
  // ctxInput.lineWidth = 3;
  // ctxInput.strokeRect(minX, minY, width, height);

  // // Dibujar puntos azules específicos de la boca
  // mouthCoords.forEach(point => {
  //   drawPoint(ctxInput, point.x, point.y, 5, 'red');
  // });
  
  // Recortar y dibujar en el canvas de salida
  canvasOutput.width = width;
  canvasOutput.height = height;
  ctxOutput.clearRect(0, 0, width, height);
  ctxOutput.drawImage(canvasInput, minX, minY, width, height, 0, 0, width, height);

  // Mostrar botón de descarga
  downloadButton.style.display = 'inline';
}

// Descargar la imagen de la boca
downloadButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'boca_recortada.png';
  link.href = canvasOutput.toDataURL();
  link.click();
});

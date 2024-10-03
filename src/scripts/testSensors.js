import { fetched } from "./Utils/dataBase.js"
import { initializePoseTracking2, currentCamera } from "./Utils/simulation.js"
import {
  handleWebLoaded, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel, drawPoint, crossProductFromPoints, updateCounterRotating
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let webLoaded = false;
let giroID = 0;
console.log(simulation.img);
updateModel(simulation.img, fetched);
updateSimulationConfig(fetched, simulation);

function onResultsPose(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  if (results.poseLandmarks) {
    results.poseLandmarks.forEach(poseLandmarks => {
      poseLandmarks.x *= video.videoWidth;
      poseLandmarks.y *= video.videoHeight;
      poseLandmarks.z *= video.videoWidth;
    });
    drawImage(results.poseLandmarks, 11, 23);

    // Dibujar la imagen original
    ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

    // Dibujar la máscara de segmentación
    if (results.segmentationMask) {
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'; // Color de la segmentación
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      // Cambiar de nuevo a modo de dibujado normal
      ctx.globalCompositeOperation = 'source-over';
    }

    // Obtener la línea central
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Definir la línea en el centro de la pantalla (mitad de la altura)
    const y = Math.floor(canvas.height / 2); // Línea en la mitad
    const yShoulders = (results.poseLandmarks[11].y + results.poseLandmarks[12].y)/2
    let bluePixels = 0;
    let otherPixels = 0;
    let firstRedPixel = -1; // Para determinar el porcentaje del primer píxel rojo

    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4; // Índice en el array de píxeles (cada píxel tiene 4 valores: R, G, B, A)
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const alpha = data[index + 3];

      // Comprobar si el píxel es rojo (esto puede ajustarse según los umbrales)
      if (red < 100 && green < 100 && blue > 200) {
        bluePixels++;
        // Guardar el primer píxel rojo
        if (firstRedPixel === -1) {
          firstRedPixel = x;
        }
      } else {
        otherPixels++;
      }
    }

    // Dibujar la línea roja en el centro de la pantalla
    
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(0, yShoulders);
    ctx.lineTo(canvas.width, yShoulders);
    ctx.stroke();
    
    // Calcular porcentajes
    const totalPixels = bluePixels + otherPixels;
    const bluePercentage = (bluePixels / totalPixels) * 100;
    const otherPercentage = (otherPixels / totalPixels) * 100;
    
    // Calcular en qué porcentaje del ancho aparece el primer píxel azul
    const firstRedPixelPercentage = (firstRedPixel / canvas.width) * 100;

    // Imprimir resultados en la consola
    console.log(`Porcentaje de píxeles azules: ${bluePercentage.toFixed(2)}%`);
    console.log(`Porcentaje de otros píxeles: ${otherPercentage.toFixed(2)}%`);
    if (firstRedPixel !== -1) {
      console.log(`Primer píxel azules empieza en el ${firstRedPixelPercentage.toFixed(2)}% del ancho.`);
    } else {
      console.log('No se encontraron píxeles azules en la línea.');
    }
    let profundidad = 1;
    let fov2 = 80;
    let fov = fov2/2;
    let fovRad = fov * (Math.PI / 180);
    let hipotenusa = profundidad/Math.cos(fovRad)
    let fondo = hipotenusa * Math.sin(fovRad)
    console.log('Hipotenusa es: ', hipotenusa);
    console.log('Fondo es: ', fondo);

    console.log('Tamaño de hombros: ', fondo * 2, (bluePercentage/100));
  }
}


setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched);
  });
});


function drawImage(rsl, node1, node2) {
  // try {
  const x0 = (rsl[node1].x) //hombro izquierdo
  const y0 = (rsl[node1].y)
  const x1 = (rsl[node1 + 1].x) //hombro derecho
  const y1 = (rsl[node1 + 1].y)
  const x2 = (rsl[node2].x) //cadera izquierdo
  const y2 = (rsl[node2].y)
  const x3 = (rsl[node2 + 1].x) //cadera derecha
  const y3 = (rsl[node2 + 1].y)
  const Xcenter = (x0 + x1 + x2 + x3) / 4
  const Ycenter = (y0 + y1 + y2 + y3) / 4

  const torsosHeight = Math.sqrt(Math.pow((x2 - x0), 2) + Math.pow((y2 - y0), 2)) * 1.3 * (1 + (simulation.config.zoomInAndOut * 0.05))
  const shoulderWidth = (torsosHeight * simulation.img.front.width) / simulation.img.front.height * 1.0

  drawPoint(ctx, x0, y0, 5, 'green');
  drawPoint(ctx, x1, y1, 5, 'green');
  drawPoint(ctx, x2, y2, 5, 'green');
  drawPoint(ctx, x3, y3, 5, 'green');
  drawPoint(ctx, canvas.width / 2, canvas.height / 2, 5, 'green');

  // } catch (error) {
  //   console.error('Error en simImage:', error);
  // }
}

initializePoseTracking2(video, onResultsPose);
import { fetched } from "./Utils/dataBase.js"
import { initializeFaceTracking } from "./Utils/simulation.js"
import {
  handleWebLoaded, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel, drawPoint
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let webLoaded = false;
updateModel(simulation.img, fetched);
updateSimulationConfig(fetched, simulation);

function onResultsFaceMesh(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  if (results.multiFaceLandmarks[0]) {
    results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
      multiFaceLandmarks.x *= video.videoWidth
      multiFaceLandmarks.y *= video.videoHeight
    });
    simImage(results.multiFaceLandmarks[0], 323, 361, 401, 1)
    simImage(results.multiFaceLandmarks[0], 93, 132, 177, -1)
  }
}

setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched);
  });
});
function simImage(rsl, Node1, Node2, Node3, Orientation) {
  try {
    const x0 = rsl[Node1].x;
    const y0 = rsl[Node1].y;
    const x1 = rsl[Node2].x;
    const y1 = rsl[Node2].y;
    const x2 = rsl[Node3].x;
    const y2 = rsl[Node3].y;
    const AuxOrigenX = ((x0 - x2) + (x0 + x2) / 2);
    const AuxOrigenY = (y0 + y1) / 2;

    const imageWidth = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * (1 + (simulation.config.zoomInAndOut * 0.1));
    const imageHeight = (simulation.img.front.height * imageWidth) / simulation.img.front.width;
    const translationX = AuxOrigenX - (imageWidth / 2) + ((simulation.config.leftAndRight * simulation.config.translationDistance) * Orientation);
    const translationY = AuxOrigenY - (imageWidth / 2) - (simulation.config.upAndDown * simulation.config.translationDistance);

    // Guardar el estado actual del contexto antes de aplicar transformaciones
    ctx.save();

    // Si la imagen debe girarse horizontalmente
    if (x0 * Orientation > x2 * Orientation) {
      // Dibujar la imagen invertida
      if (Orientation === -1) {
        // Trasladar el contexto al punto donde se dibujará la imagen invertida
        ctx.translate(translationX + imageWidth, translationY);
        // Invertir la imagen en el eje X
        ctx.scale(-1, 1);
        ctx.drawImage(simulation.img.front, 0, 0, imageWidth, imageHeight);

      }else if(Orientation === 1){
        ctx.drawImage(simulation.img.front, translationX, translationY, imageWidth, imageHeight);
      }
    }

    // Restaurar el estado original del contexto
    ctx.restore();
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

initializeFaceTracking(video, onResultsFaceMesh);
export let currentCamera;

function initializeCamera(video, trackingObject, onFrame) {
  console.log("Inicializando Camara")
  const camera = new Camera(video, {
    onFrame: async () => {
      await trackingObject.send({ image: video });
      onFrame();
    },
    // 480p:
    // width: 854,
    // height: 480,
    // qHD:
    // width: 960,
    // height: 540,
    // HD:
    // width: 1280,
    // height: 720,
    // 1080p:
    width: 1920,
    height: 1080,
    facingMode: "user"
    // facingMode: "environment"
  });
  camera.start();
  return camera;
}

export function initializeFaceTracking(video, onResultsFaceMesh) {
  console.log("Inicializando Face Tracking")
  const faceMesh = new FaceMesh({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
  });
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  faceMesh.onResults(onResultsFaceMesh);

  currentCamera = initializeCamera(video, faceMesh, () => { });
}

export function initializeHandTracking(video, onResultsHands) {
  console.log("Inicializando Hand Tracking")
  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  hands.onResults(onResultsHands);

  currentCamera = initializeCamera(video, hands, () => { });
}
export function initializeHandTracking2(video, onResultsHands) {
  console.log("Inicializando Hand Tracking")
  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 0,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  hands.onResults(onResultsHands);

  currentCamera = initializeCamera(video, hands, () => { });
}

export function initializePoseTracking(video, onResultsPose) {
  console.log("Inicializando Pose Tracking")
  const pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
  });
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  pose.onResults(onResultsPose);

  currentCamera = initializeCamera(video, pose, () => { });
}
export function initializePoseTracking2(video, onResultsPose) {
  console.log("Inicializando Pose Tracking")
  const pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
  });
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    enableSegmentation: true, // Habilitar segmentación
    smoothSegmentation: true, // Suavizar la máscara de segmentación
    outputSegmentationMasks: true, // Habilitar la salida de máscaras de segmentación
  });
  pose.onResults(onResultsPose);

  currentCamera = initializeCamera(video, pose, () => { });
}

export function flipCamera(video, canvas) {
  currentCamera.h.facingMode = currentCamera.h.facingMode === "user" ? "environment" : "user";
  console.log(currentCamera.h.facingMode)
  video.style.transform = canvas.style.transform = currentCamera.h.facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";
  currentCamera.stop();
  currentCamera.start();
}

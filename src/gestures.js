const { GestureDescription, Finger, FingerCurl, FingerDirection } = window.fp;

// ----------------------------------- Crear gestos -----------------------------------
const rockGesture = new GestureDescription('rock'); // ✊️
const paperGesture = new GestureDescription('paper'); // 🖐
const scissorsGesture = new GestureDescription('scissors'); // ✌️

// ------------------------- Crear propiedades de los gestos -------------------------
// thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0)
// thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.9)
// thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.9)

// -------------------------------------- Rock --------------------------------------

// thumb: half curled
// accept no curl with a bit lower confidence

// all other fingers: curled
for(let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    rockGesture.addCurl(finger, FingerCurl.FullCurl, 1.0);
    rockGesture.addCurl(finger, FingerCurl.HalfCurl, 0.5);
}

// ------------------------------------- Paper -------------------------------------

for(let finger of Finger.all) {
    paperGesture.addCurl(finger, FingerCurl.NoCurl, 1.0);
}

// ------------------------------------ Scissors ------------------------------------

// index and middle finger: stretched out
scissorsGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 0.9);
scissorsGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 0.9);

// ring: curled
scissorsGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
scissorsGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.8);

// pinky: curled
scissorsGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
scissorsGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.8);

// ------------------------------- Crear array de gestos -------------------------------
const gestures = [
  rockGesture, paperGesture, scissorsGesture
]

// ---------------------------------- Exportar gestos ----------------------------------
export {
    gestures
}
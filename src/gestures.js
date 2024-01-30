const { GestureDescription, Finger, FingerCurl, FingerDirection } = window.fp;

// ----------------------------------- Crear gestos -----------------------------------
const thumbsUpGesture = new GestureDescription('thumb_up'); // 👍
const rockGesture = new GestureDescription('rock'); // ✊️
const paperGesture = new GestureDescription('paper'); // 🖐
const scissorsGesture = new GestureDescription('scissors'); // ✌️
const dontGesture = new GestureDescription('dont'); // 🙅
const holeGesture = new GestureDescription('hole'); //  👌🤘

// ------------------------- Crear propiedades de los gestos -------------------------
// -------------------------------------- Thumb --------------------------------------
// thumb up: half curled
// accept no curl with a bit lower confidence
thumbsUpGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0)
thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.9)
thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.9)

// all other fingers: curled
for(let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  thumbsUpGesture.addCurl(finger, FingerCurl.FullCurl, 1.0);
  thumbsUpGesture.addCurl(finger, FingerCurl.HalfCurl, 0.9);
}

// -------------------------------------- Rock --------------------------------------

// thumb: half curled
// accept no curl with a bit lower confidence
rockGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
rockGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);

// all other fingers: curled
for(let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    rockGesture.addCurl(finger, FingerCurl.FullCurl, 1.0);
    rockGesture.addCurl(finger, FingerCurl.HalfCurl, 0.9);
}

// ------------------------------------- Paper -------------------------------------

for(let finger of Finger.all) {
    paperGesture.addCurl(finger, FingerCurl.NoCurl, 1.0);
}

// ------------------------------------ Scissors ------------------------------------

// index and middle finger: stretched out
scissorsGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
scissorsGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);

// ring: curled
scissorsGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
scissorsGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.9);

// pinky: curled
scissorsGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
scissorsGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.9);

// ------------------------------------- Dont 🙅 -------------------------------------

for(const finger of Finger.all) {
  dontGesture.addCurl(finger, FingerCurl.NoCurl, 1.0)
  dontGesture.addCurl(finger, FingerCurl.HalfCurl, 0.8)

  dontGesture.addDirection(finger, FingerDirection.DiagonalUpRight, 1.0)
  dontGesture.addDirection(finger, FingerDirection.DiagonalUpLeft, 1.0)

  dontGesture.addDirection(finger, FingerDirection.HorizontalRight, 1.0)
  dontGesture.addDirection(finger, FingerDirection.HorizontalLeft, 1.0)
}


// --------------------------------------- Hole ---------------------------------------

// pinky:
holeGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 0.9);
holeGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);

// ring:
holeGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 0.9);
holeGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);

// middle:
holeGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 0.9);
holeGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);

// index:
holeGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.9);

// thumb:
holeGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.9);
holeGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);

// ------------------------------- Crear array de gestos -------------------------------
const gestures = [
  rockGesture, paperGesture, scissorsGesture, dontGesture, holeGesture, thumbsUpGesture
]

// ---------------------------------- Exportar gestos ----------------------------------
export {
    gestures
}
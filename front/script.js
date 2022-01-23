const video = document.getElementById("webcam");
const image = document.querySelector("#snaped");
const flash = document.querySelector(".flash");

const request = new XMLHttpRequest();
const endpoint = "http://127.0.0.1:8000/";

function sendBase64(base64image) {
  let baseString = base64image.replace(/data:.*\/.*;base64,/, "");
  let json = { "image_string": baseString };
  let requestBody = JSON.stringify(json);
  request.open("post", endpoint + "uploadbase64");
  request.setRequestHeader("content-type", "application/json");
  request.send(requestBody);

  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      console.log(request.responseText);
    }
  };
}

let detectionInterval;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

let startDetection = video.addEventListener("play", () => {
  let isSnaped = false;
  let detectCount = 0;
  console.log("make ok");
  const canvas = faceapi.createCanvasFromMedia(video);
  document.querySelector(".container").append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  let startDetections = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    // console.log(detections);
    const resizedDetection = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetection);
    if (detections.length > 0 && isSnaped == false) {
      console.log(detections);
      detectCount += 1;
      if (detections[0].detection._score > 0.7 && detectCount > 3) {
        snapShot(video, canvas, canvas.getContext("2d"));
        flash.classList.add("active");
        isSnaped = true;
        setTimeout(() => {
          flash.classList.remove("active");
        }, 45);
        sendBase64(canvas.toDataURL("image/jpeg"));

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

        clearInterval(startDetections);
      }
    }
  }, 500);
});

function snapShot(videoElement, canvasElement, context) {
  context.drawImage(
    videoElement,
    0,
    0,
    videoElement.width,
    videoElement.height
  );
  image.src = canvasElement.toDataURL("image/jpeg");
}

// Route protection
if (!sessionStorage["loggedIn"]) {
  window.location.replace("/routes/login.html");
}

// Element declarations
const balanceElement = document.getElementById("balance");
const messageBoxElement = document.querySelector(".messageBox");
const loadingDotsElement = document.querySelector(".loadingDots");
const containerMessageElement = document.querySelector(".containerMessage");
const imageThumbnailElement = document.getElementById("imageThumbnail");
const videoThumbnailElement = document.getElementById("videoThumbnail");
const whiteboardThumbnailElement = document.getElementById(
  "whiteboardThumbnail"
);
const imageDeleteElement = document.getElementById("imageDelete");
const videoDeleteElement = document.getElementById("videoDelete");
const whiteboardDeleteElement = document.getElementById("whiteboardDelete");
const imageTextElement = document.getElementById("imageText");
const videoTextElement = document.getElementById("videoText");
const whiteboardTextElement = document.getElementById("whiteboardText");

// Event listeners
// Buttons
document.getElementById("image").addEventListener("click", saveInfo);
document.getElementById("video").addEventListener("click", saveInfo);
document.getElementById("whiteboard").addEventListener("click", saveInfo);
document.getElementById("submit").addEventListener("click", submit);

// Thumbnails
imageThumbnailElement.addEventListener("click", showImage);
videoThumbnailElement.addEventListener("click", showVideo);
whiteboardThumbnailElement.addEventListener("click", showWhiteboard);
imageDeleteElement.addEventListener("click", imageDelete);
videoDeleteElement.addEventListener("click", videoDelete);
whiteboardDeleteElement.addEventListener("click", whiteboardDelete);

// Loading UI
loadingDotsElement.style.display = "";
messageBoxElement.style.display = "none";
containerMessageElement.style.display = "none";

// Declaring the API endpoints
const API_GET =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/message/1"
    : "https://nitros-t-server.herokuapp.com/message/1";
const API_POST =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/message"
    : "https://nitros-t-server.herokuapp.com/message";
const API_BALANCE =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/get-balance"
    : "https://nitros-t-server.herokuapp.com/get-balance";
const API_SOCKET =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000"
    : "https://nitros-t-server.herokuapp.com";

// Connecting to the list of nodes
const socket = io.connect(API_SOCKET);
socket.on("response", function(msg) {
  console.log(msg);
});

// Geting the wallet balance
getBalance();

// Load the message
let message = sessionStorage.getItem("message");
if (message) setTextarea(message);

// Load the thumbnails
imageThumbnailElement.style.display = "none";
videoThumbnailElement.style.display = "none";
whiteboardThumbnailElement.style.display = "none";
imageDeleteElement.style.display = "none";
videoDeleteElement.style.display = "none";
whiteboardDeleteElement.style.display = "none";
imageDeleteElement.style.display = "none";
videoDeleteElement.style.display = "none";
whiteboardDeleteElement.style.display = "none";
imageTextElement.style.display = "none";
videoTextElement.style.display = "none";
whiteboardTextElement.style.display = "none";
getThumbnails();

function getThumbnails() {
  if (sessionStorage.getItem("image")) {
    imageThumbnailElement.style.display = "";
    imageDeleteElement.style.display = "";
    imageTextElement.style.display = "";
    imageThumbnailElement.src = sessionStorage
      .getItem("image")
      .replace(".png", "s.png");
  }
  if (sessionStorage.getItem("video")) {
    videoThumbnailElement.style.display = "";
    videoDeleteElement.style.display = "";
    videoTextElement.style.display = "";
    imageThumbnailElement.src = sessionStorage
      .getItem("video")
      .replace(".png", "s.png");
  }
  if (sessionStorage.getItem("whiteboard")) {
    whiteboardThumbnailElement.style.display = "";
    whiteboardDeleteElement.style.display = "";
    whiteboardTextElement.style.display = "";
    whiteboardThumbnailElement.src = sessionStorage
      .getItem("whiteboard")
      .replace(".png", "s.png");
  }
}

function getBalance() {
  fetch(API_BALANCE, {
    method: "GET",
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => res.json())
    .then(res => {
      sessionStorage["balance"] = res;
      sessionStorage["balance"] = res;
      const icon = document.createElement("i");
      icon.setAttribute("class", "fa fa-bitcoin");
      const text = document.createElement("a");
      text.append(icon);
      text.append(" ");
      text.append(res);
      balanceElement.append(text);
    });
}

listAllMessage();

function listAllMessage() {
  fetch(API_GET, {
    method: "GET",
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => res.json())
    .then(res => {
      res.posts.reverse().forEach((post, i) => {
        let outerDiv = document.createElement("div");
        outerDiv.setAttribute("class", "boxMessage");
        let innerDiv = document.createElement("div");
        innerDiv.setAttribute("class", "contentMessage");
        const header = document.createElement("h2");
        const headerSpan = document.createElement("span");

        const title = document.createElement("h3");
        const message = document.createElement("p");
        let link = document.createElement("a");
        link.setAttribute(
          "href",
          "../routes/post.html?postId=" + (res.posts.length - i - 1)
        );

        headerSpan.textContent = post.username;
        title.textContent = post.username;
        message.textContent = post.message;
        link.textContent = "See Post";

        header.appendChild(headerSpan);
        innerDiv.appendChild(header);
        innerDiv.appendChild(title);
        innerDiv.appendChild(message);
        innerDiv.appendChild(link);
        outerDiv.appendChild(innerDiv);
        containerMessageElement.appendChild(outerDiv);

        messageBoxElement.style.display = "";
        loadingDotsElement.style.display = "none";
        containerMessageElement.style.display = "";
      });
    });
}

function saveInfo() {
  let message = document.getElementById("message").value;
  sessionStorage.setItem("message", message);
}

function setTextarea(message) {
  document.getElementById("message").value = message;
}

async function submit() {
  const post = {
    message: document.getElementById("message").value,
    image: sessionStorage.getItem("image"),
    video: sessionStorage.getItem("video"),
    whiteboard: sessionStorage.getItem("whiteboard")
  };
  await fetch(API_POST, {
    method: "POST",
    body: JSON.stringify(post),
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => {
      containerMessageElement.innerHTML = "";
      balanceElement.innerHTML = "";
    })
    .catch(e => {
      console.log(e);
    });

  getBalance();
  listAllMessage();
  clearLocalStorage();
  setTextarea("");
}

function clearLocalStorage() {
  sessionStorage.setItem("message", "");
  sessionStorage.setItem("image", "");
  sessionStorage.setItem("video", "");
  sessionStorage.setItem("whiteboard", "");
}

function showImage() {
  window.open(sessionStorage.getItem("image"), "_blank");
}
function showVideo() {
  window.open(sessionStorage.getItem("video"), "_blank");
}
function showWhiteboard() {
  window.open(sessionStorage.getItem("whiteboard"), "_blank");
}
function imageDelete() {
  sessionStorage.setItem("image", "");
  window.location.replace("../routes/message.html");
}
function videoDelete() {
  sessionStorage.setItem("video", "");
  window.location.replace("../routes/message.html");
}
function whiteboardDelete() {
  sessionStorage.setItem("whiteboard", "");
  window.location.replace("../routes/message.html");
}

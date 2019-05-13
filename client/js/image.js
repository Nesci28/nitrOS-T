const balanceElement = document.getElementById("balance");
const preview = document.getElementById("imagePreview");

// Save, Reset, Cancel clicks
document.getElementById("save").addEventListener("click", saveImage);
document.getElementById("reset").addEventListener("click", clearImage);
document.getElementById("cancel").addEventListener("click", back);

// Route protection
if (!sessionStorage["loggedIn"]) {
  window.location.replace("/routes/login.html");
}

const API_BALANCE =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/get-balance"
    : "https://nitros.now.sh/get-balance";
const API_SOCKET =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000"
    : "https://nitros.now.sh";

// Connecting to the list of nodes
const socket = io.connect(API_SOCKET);
socket.on("response", function(msg) {
  console.log(msg);
});

// Geting the wallet balance
getBalance();

function getBalance() {
  if (sessionStorage["balance"]) {
    const icon = document.createElement("i");
    icon.setAttribute("class", "fa fa-bitcoin");
    const text = document.createElement("a");
    text.textContent = sessionStorage["balance"];
    balanceElement.append(icon);
    balanceElement.append(text);
  } else {
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
        const icon = document.createElement("i");
        icon.setAttribute("class", "fa fa-bitcoin");
        const text = document.createElement("a");
        text.append(icon);
        text.append(" ");
        text.append(res);
        balanceElement.append(text);
      });
  }
}

function previewFile() {
  var file = document.querySelector("input[type=file]").files[0];
  var reader = new FileReader();

  reader.onloadend = function() {
    preview.src = reader.result;
  };

  if (file) {
    preview.style.display = "";
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
  }
}

function saveImage() {
  let source = preview.getAttribute("src").split(",")[1];
  if (!source) {
    alert("No image selected");
    return;
  } else {
    let formData = new FormData();
    formData.append("type", "base64");
    formData.append("image", source);

    fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: new Headers({
        Authorization: "Client-ID 90ef1830bd083ba"
      }),
      body: formData
    })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          let link = result.data.link;
          sessionStorage.setItem("image", link);
          window.location.replace("../routes/message.html");
        } else {
          alert("Failed to upload the whiteboard image to imgur");
        }
      });
  }
}

function clearImage() {
  preview.src = "";
  preview.style.display = "none";
}

function back() {
  window.location.replace("/routes/message.html");
}

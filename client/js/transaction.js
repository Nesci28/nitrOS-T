// Route protection
if (!localStorage["loggedIn"]) {
  window.location.replace("/routes/login.html");
}

// Element declarations
const balanceElement = document.getElementById("balance");
const senderElement = document.getElementById("sender");
const receiverElement = document.getElementById("receiver");
const amountElement = document.getElementById("amount");
const submitElement = document.getElementById("submit");
const cancelElement = document.getElementById("cancel");
const firstElement = document.getElementById("first");
const secondElement = document.getElementById("second");
const secondSubmit = document.getElementById("secondSubmit");
const secondCancel = document.getElementById("secondCancel");
const alertRequiredElement = document.getElementById("alertRequired");
const alertHigherElement = document.getElementById("alertHigher");
const alertPasswordElement = document.getElementById("alertPassword");
const confirmPasswordElement = document.getElementById("confirmPassword");

// Event listeners
submitElement.addEventListener("click", validateForm);
cancelElement.addEventListener("click", cancelForm);
secondSubmit.addEventListener("click", submitTransaction);
secondCancel.addEventListener("click", showUI);

// Fix the UI
showUI();

function showUI() {
  firstElement.style.display = "";
  secondElement.style.display = "none";
  alertRequiredElement.style.display = "none";
  alertHigherElement.style.display = "none";
  alertPasswordElement.style.display = "none";
}

// Declaring the API endpoints
const API_BALANCE =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/get-balance"
    : "https://nitros.now.sh/get-balance";
const API_GET_USERNAME =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/get-username"
    : "https://nitros.now.sh/get-username";
const API_TRANSACTION =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/add-tx"
    : "https://nitros.now.sh/add-tx";

// Geting the wallet balance
getBalance();

function getBalance() {
  if (localStorage["balance"]) {
    const icon = document.createElement("i");
    icon.setAttribute("class", "fa fa-bitcoin");
    const text = document.createElement("a");
    text.textContent = localStorage["balance"];
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
        localStorage["balance"] = res;
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

// Getting the username
getUsername();

function getUsername() {
  fetch(API_GET_USERNAME, {
    method: "GET",
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => res.json())
    .then(res => {
      senderElement.textContent = res.message;
    });
}

function validateForm() {
  alertRequiredElement.style.display = "none";
  alertHigherElement.style.display = "none";
  if (!receiverElement.value) {
    alertRequiredElement.style.display = "";
    return;
  }
  if (!amountElement.value) {
    alertRequiredElement.style.display = "";
    return;
  }
  if (amountElement.value <= 0) {
    alertHigherElement.style.display = "";
    return;
  }
  firstElement.style.display = "none";
  secondElement.style.display = "";
}

function submitTransaction() {
  fetch(API_TRANSACTION, {
    method: "POST",
    body: JSON.stringify({
      sender: senderElement.value,
      password: confirmPasswordElement.value,
      receiver: receiverElement.value,
      amount: amountElement.value
    }),
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => res.json())
    .then(res => {
      if (res.message == "Invalid credentials") {
        alertPasswordElement.style.display = "";
      } else {
        window.location.replace("/routes/message.html");
      }
    })
    .catch(e => {
      console.log(e);
    });
}

function cancelForm() {
  window.location.replace("/routes/message.html");
}

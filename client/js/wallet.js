const firstElement = document.getElementById("first");
const secondElement = document.getElementById("second");
const balanceElement = document.getElementById("balance");
const nameElement = document.getElementById("name");
const publicKeyElement = document.getElementById("publicKey");
const privateKeyElement = document.getElementById("privateKey");
const balanceBoxElement = document.getElementById("balanceBox");
const encodedElement = document.getElementById("encoded");
const submitElement = document.getElementById("submit");
const cancelElement = document.getElementById("cancel");
const confirmPasswordElement = document.getElementById("confirmPassword");
const alertRequiredElement = document.getElementById("alertRequired");
const alertPasswordElement = document.getElementById("alertPassword");

alertRequiredElement.style.display = "none";
alertPasswordElement.style.display = "none";
firstElement.style.display = "";
secondElement.style.display = "none";
encodedElement.textContent = "Encoded private key:";

// Declairing the API endpoints
const API_WALLET =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/get-wallet"
    : "https://nitros.now.sh/get-wallet";
const API_ENCODED =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/decode"
    : "https://nitros.now.sh/decode";

// Event listeners
encodedElement.addEventListener("click", decodePK);
submitElement.addEventListener("click", submitForm);
cancelElement.addEventListener("click", cancelForm);

// Geting the wallet balance
getWalletInfo();

function getWalletInfo() {
  fetch(API_WALLET, {
    method: "GET",
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => res.json())
    .then(res => {
      if (!localStorage["balance"]) {
        localStorage["balance"] = res.balance;
      }
      const icon = document.createElement("i");
      icon.setAttribute("class", "fa fa-bitcoin");
      const text = document.createElement("a");
      text.append(icon);
      text.append(" ");
      text.append(res.balance);
      balanceElement.append(text);
      nameElement.textContent = res.username;
      publicKeyElement.textContent = res.publicKey;
      privateKeyElement.textContent = res.privateKey;
      balanceBoxElement.textContent = "Balance: " + res.balance;
    });
}

function decodePK() {
  firstElement.style.display = "none";
  secondElement.style.display = "";
}

function submitForm() {
  alertRequiredElement.style.display = "none";
  alertPasswordElement.style.display = "none";
  if (confirmPasswordElement.value) {
    fetch(API_ENCODED, {
      method: "POST",
      body: JSON.stringify({
        password: confirmPasswordElement.value
      }),
      headers: {
        "content-type": "application/json"
      },
      credentials: "include"
    })
      .then(res => res.json())
      .then(res => {
        if (res.message != "invalid credentials") {
          firstElement.style.display = "";
          secondElement.style.display = "none";
          encodedElement.textContent = "Private key";
          privateKeyElement.textContent = res.message;
        } else {
          alertPasswordElement.style.display = "";
        }
      })
      .catch(e => {
        console.log(e);
      });
  } else {
    alertRequiredElement.style.display = "";
  }
}

function cancelForm() {
  alertRequiredElement.style.display = "none";
  alertPasswordElement.style.display = "none";
  firstElement.style.display = "";
  secondElement.style.display = "none";
}

const alertCredentials = document.querySelector("#alertCredentials");
const alertUsername = document.querySelector("#alertUsername");
const alertPassword = document.querySelector("#alertPassword");

const API_URL =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/login"
    : "https://nitros-t-server.herokuapp.com/login";

alertCredentials.style.display = "none";
alertUsername.style.display = "none";
alertPassword.style.display = "none";

checkSession();

window.addEventListener("keypress", e => {
  if (e.keyCode == 13) show();
});
document.getElementById("btnLogin").addEventListener("click", show);

function checkSession() {
  fetch(API_URL, {
    method: "GET",
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => res.json())
    .then(res => {
      console.log(res.message);
      if (res.message == "Already logged in") {
        sessionStorage["loggedIn"] = true;
        window.location.replace("/routes/message.html");
      }
    });
}

async function show() {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  if (!email || !password) {
    alertCredentials.style.display = "";
  } else {
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        username: email,
        password: password
      }),
      headers: {
        "content-type": "application/json"
      },
      credentials: "include"
    })
      .then(res => res.json())
      .then(res => {
        if (res.message == "invalid credentials") {
          alertCredentials.style.display = "";
        } else {
          sessionStorage["loggedIn"] = true;
          window.location.replace("/routes/message.html");
        }
      })
      .catch(e => {
        console.log(e);
      });
    alertCredentials.style.display = "none";
  }
}

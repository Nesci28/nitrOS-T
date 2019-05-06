// import Axios from "axios";

const alertCredentials = document.querySelector("#alertCredentials");
const alertUsername = document.querySelector("#alertUsername");
const alertPassword = document.querySelector("#alertPassword");

const API_URL = "https://nos-server.now.sh/action/login";

alertCredentials.style.display = "none";
alertUsername.style.display = "none";
alertPassword.style.display = "none";

window.addEventListener("keypress", e => {
  if (e.keyCode == 13) show();
});
document.getElementById("btnLogin").addEventListener("click", show);

async function show() {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  if (!email || !password) {
    alertCredentials.style.display = "";
  } else {
    fetch(API_URL, {
      method: "POST",
      body: {
        username: email,
        password: password
      },
      headers: {
        "content-type": "application/json"
      }
    })
      .then(res => {
        if (res.data == "wrong username") alertUsername.style.display = "none";
        else if (res.data == "wrong password")
          alertPassword.style.display = "none";
        else window.location.replace("/message.html");
      })
      .catch(e => {
        console.log(e);
        window.location.replace("message.html");
      });
    alertCredentials.style.display = "none";
  }
}

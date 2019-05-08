const alertCredentials = document.querySelector("#alertCredentials");
const alertUsername = document.querySelector("#alertUsername");
const alertPassword = document.querySelector("#alertPassword");

const API_URL =
  window.location.hostname == "127.0.0.1"
    ? "http://localhost:5000/login"
    : "https://nitros.now.sh/login";

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
    console.log(API_URL);
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        username: email,
        password: password
      }),
      headers: {
        "content-type": "application/json"
      }
    })
      .then(res => res.json())
      .then(res => {
        console.log(res);
        if (res == "Account not found") {
          alertUsername.style.display = "";
          alertPassword.style.display = "none";
          alertCredentials.style.display = "none";
        } else if (res == "Wrong password!") {
          alertUsername.style.display = "none";
          alertPassword.style.display = "";
          alertCredentials.style.display = "none";
        } else {
          window.location.replace("/routes/message.html");
        }
      })
      .catch(e => {
        console.log(e);
        // window.location.replace("message.html");
      });
    alertCredentials.style.display = "none";
  }
}

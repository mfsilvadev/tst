function updateUserUI() {
  const user = getCurrentUser();

  const input = document.getElementById("username");
  const button = document.getElementById("login_btn");
  const label = document.getElementById("logged_user");

  if (user) {
    input.style.display = "none";
    button.style.display = "none";

    label.classList.remove("hidden");
    label.innerHTML = `👤 ${user} <button onclick="logoutUser()">Trocar</button>`;

    enableForm(true);
  } else {
    input.style.display = "block";
    button.style.display = "block";
    label.classList.add("hidden");

    enableForm(false);
  }
}

function enableForm(enabled) {
  ["device", "client_id", "ip_lan", "ip_mgmt"].forEach(id => {
    document.getElementById(id).disabled = !enabled;
  });
}

function copy(text, btn) {
  navigator.clipboard.writeText(text);

  if (btn) {
    btn.classList.add("copied");
    setTimeout(() => btn.classList.remove("copied"), 500);
  }
}
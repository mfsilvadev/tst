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
    const el = document.getElementById(id);
    if (el) el.disabled = !enabled;
  });
}

function copy(text, btn) {
  navigator.clipboard.writeText(text);

  if (btn) {
    btn.classList.add("copied");
    setTimeout(() => btn.classList.remove("copied"), 500);
  }
}

function showParser() {
  document.getElementById("parser_view").classList.remove("hidden");
  document.getElementById("result_view").classList.add("hidden");

  document.getElementById("tab-parser").classList.add("active");
  document.getElementById("tab-result").classList.remove("active");
}

function showResult() {
  document.getElementById("parser_view").classList.add("hidden");
  document.getElementById("result_view").classList.remove("hidden");

  document.getElementById("tab-result").classList.add("active");
  document.getElementById("tab-parser").classList.remove("active");
}

function renderAnalysis(data) {
  const el = document.getElementById("analysis");

  el.innerHTML = `
    <div class="analysis-grid">

      ${renderItem("Interface WAN", data.interface)}
      ${renderItem("ARP", data.arp)}

      ${renderItem("Ping", data.ping)}
      ${renderItem("Logs", data.logs)}

      ${renderItem("CRC", data.crc)}
      ${renderItem("Link", data.speed)}

      ${renderItem("Uptime", data.uptime)}

    </div>
  `;
}

function renderItem(label, data) {
  if (!data) return "";

  return `
    <div class="analysis-item ${data.status}">
      <strong>${label}</strong>
      <span>${data.value}</span>
    </div>
  `;
}

function toggleReport() {
  const box = document.querySelector(".report-box");
  const icon = document.getElementById("report_toggle_icon");

  box.classList.toggle("report-collapsed");

  icon.textContent = box.classList.contains("report-collapsed")
    ? "▶"
    : "▼";
}
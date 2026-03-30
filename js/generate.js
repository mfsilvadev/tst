let devicesMap = {};

async function loadDevices() {
  const res = await fetch("devices/devices.json");
  const list = await res.json();

  const select = document.getElementById("device");

  for (const dev of list) {
    const data = await fetch(`devices/${dev.file}`).then(r => r.json());

    devicesMap[dev.id] = data;

    const option = document.createElement("option");
    option.value = data.id;
    option.textContent = data.label;

    select.appendChild(option);
  }
}

function generatePassword(ip, config) {
  if (!config) return null;
  const parts = ip.split(".");
  return config.pattern
    .replace("{oct3}", parts[2])
    .replace("{oct4}", parts[3]);
}

function highlightCommand(text) {
  return text
    .replace(/\b\d{1,3}(\.\d{1,3}){3}\b/g, '<span class="hl-ip">$&</span>')
    .replace(/\b(down|error|fail)\b/gi, '<span class="hl-bad">$1</span>')
    .replace(/\b(up|ok)\b/gi, '<span class="hl-good">$1</span>');
}

function generate(fromHistory = false) {
  const deviceId = document.getElementById("device").value;
  const ipAccess = document.getElementById("ip_lan").value;
  const ipMgmt = document.getElementById("ip_mgmt").value;
  const clientId = document.getElementById("client_id").value;

  if (!isValidIP(ipAccess)) return alert("IP inválido");

  const device = devicesMap[deviceId];
  if (!device) return alert("Dispositivo não carregado");

  const commands = device.commands.map(c =>
    c.replace("{ip}", ipAccess)
  );

  const password = generatePassword(ipMgmt, device.password);

  if (!fromHistory) {
    saveToHistory({
      deviceId,
      clientId,
      ipAccess,
      ipMgmt,
      date: new Date().toISOString()
    });
  }

  const allText = [
    password ? `Senha: ${password}` : null,
    ...commands
  ].filter(Boolean).join("\\n");

  document.getElementById("output").innerHTML = `
    <div class="result-header">
      <button class="top-copy" onclick="copy(\`${allText}\`)">📋</button>
    </div>

    ${password ? `
      <div class="section">
        <h2 class="section-title">🔐 Senha</h2>
        <div class="command highlight">
          <span>${password}</span>
          <button onclick="copy('${password}')">📋</button>
        </div>
      </div>
    ` : ""}

    <div class="section">
      <h2 class="section-title">📟 Comandos</h2>
      ${commands.map(c => `
        <div class="command">
          <span>${highlightCommand(c)}</span>
          <button onclick="copy('${c}', this)">📋</button>
        </div>
      `).join("")}
    </div>
  `;

  setTimeout(() => {
    const firstButton = document.querySelector(".command button");
    if (firstButton) firstButton.focus();
  }, 50);
}
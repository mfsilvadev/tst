const PARSERS = {
  cisco_1121: parseCisco1121,
  mikrotik: parseMikrotik
};

let lastParsedResult = null

async function parseOutput() {
  const raw = document.getElementById("raw_output").value;
  const deviceId = document.getElementById("device").value;

  const parser = PARSERS[deviceId];

  if (!parser) {
    alert("Parser não encontrado 👀");
    return;
  }

  const result = await parser(raw); 

  lastParsedResult = result;

  renderAnalysis(result);
}

function generateReport() {
  let template = document.getElementById("report_template").value;
  const data = lastParsedResult || {};

  const variables = {
    clientId: document.getElementById("client_id").value || "-",
    ipAccess: document.getElementById("ip_lan").value || "-",
    interface: data.interface?.value || "-",
    ping: data.ping?.value || "-",
    crc: data.crc?.value || "-",
    arp: data.arp?.value || "-",
    speed: data.speed?.value || "-",
    uptime: data.uptime?.value || "-",
    logs: data.logs?.value || "-"
  };

  Object.entries(variables).forEach(([key, value]) => {
    template = template.replaceAll(`{${key}}`, value);
  });

  document.getElementById("report_template").value = template;
}

function copyReport() {
  const text = document.getElementById("report_template").value;

  navigator.clipboard.writeText(text).catch(() => {
    alert("Erro ao copiar 👀");
  });
}

function resetTemplate() {
  localStorage.removeItem("report_template");

  document.getElementById("report_template").value = defaultTemplate;
}
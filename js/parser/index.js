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
  const warning = `
Atenção: revise cuidadosamente o conteúdo gerado antes de utilizá-lo em qualquer registro oficial.

Esta ferramenta não se responsabiliza por informações incorretas, dados sensíveis expostos, formatação inadequada ou erros decorrentes de interpretação ou desatenção do usuário.

Utilize com responsabilidade e atenção.

Em caso de dúvidas, consulte o responsável indicado no rodapé da página.
`;

  const confirmCopy = confirm(warning);

  if (!confirmCopy) return;

  const text = document.getElementById("report_template").value;

  navigator.clipboard.writeText(text).then(() => {
    alert("Relatório copiado com sucesso 📋");
  }).catch(() => {
    alert("Erro ao copiar 👀");
  });
}

function resetTemplate() {
  localStorage.removeItem("report_template");

  document.getElementById("report_template").value = defaultTemplate;
}
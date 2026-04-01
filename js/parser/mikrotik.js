async function parseMikrotik(text) {
  return {
    uptime: parseMikrotikUptime(text),
    interface: parseMikrotikInterfaces(text),
    speed: parseMikrotikLink(text),
    crc: parseMikrotikErrors(text),
    arp: await parseMikrotikARP(text),
    logs: parseMikrotikLogs(text),
    ping: parseMikrotikPing(text)
  };
}

function parseMikrotikUptime(text) {
  const match = text.match(/uptime:\s*([^\n]+)/i);

  if (!match) return null;

  return {
    value: match[1],
    status: "gray"
  };
}

function parseMikrotikInterfaces(text) {
  const lines = text.split("\n");

  const interfaces = lines
    .filter(l => /^\s*\d+/.test(l))
    .map(line => {
      const parts = line.trim().split(/\s+/);

      return {
        status: parts[1], // R / X
        name: parts[2]
      };
    });

  const running = interfaces.filter(i => i.status.includes("R"));

  let status = "gray";

  if (running.length > 1) status = "green";
  else if (running.length === 1) status = "orange";
  else status = "red";

  const value = [
    "Interface   Status",
    ...interfaces.map(i =>
      `${i.name.padEnd(12)} ${i.status.includes("R") ? "up" : "down"}`
    )
  ].join("\n");

  return { value, status };
}

async function parseMikrotikARP(text) {
  const matches = [...text.matchAll(
    /(\d+\.\d+\.\d+\.\d+)\s+([A-F0-9:]{17})\s+(\S+)/gi
  )];

  if (!matches.length) {
    return { value: "empty", status: "red" };
  }

  const total = matches.length;

  const lines = await Promise.all(
    matches.slice(0, 5).map(async m => {
      const ip = m[1];
      const mac = m[2];
      const iface = m[3];

      const vendor = await getMacVendor(mac);

      return `${ip} - ${mac} (${vendor}) [${iface}]`;
    })
  );

  let value = lines.join("\n");

  if (total > 5) {
    value += `\n... +${total - 5} outros`;
  }

  value += `\nTotal: ${total}`;

  return {
    value,
    status: "green"
  };
}

function parseMikrotikPing(text) {
  const match = text.match(/sent=\d+ received=\d+ packet-loss=\d+%/i);

  if (!match) return null;

  return {
    value: match[0],
    status: match.includes("0%") ? "green" : "orange"
  };
}

function parseMikrotikPing(text) {
  const match = text.match(/(ping[\s\S]*?packet-loss=.*)/i);

  if (!match) return null;

  return {
    value: match[1].trim(),
    status: match[1].includes("0%") ? "green" : "orange"
  };
}

function parseMikrotikLink(text) {
  const rate = text.match(/rate:\s*([^\n]+)/i);
  const duplex = text.match(/full-duplex:\s*(yes|no)/i);

  if (!rate) return null;

  return {
    value: `${rate[1]} ${duplex ? (duplex[1] === "yes" ? "Full" : "Half") : ""}`,
    status: "green"
  };
}

function parseMikrotikErrors(text) {
  const match = text.match(/rx-fcs-error:\s*(\d+)/i);

  if (!match) return null;

  const value = parseInt(match[1]);

  return {
    value,
    status:
      value === 0 ? "green" :
      value < 10 ? "orange" :
      "red"
  };
}

function parseMikrotikLogs(text) {
  const lines = text.split("\n");

  const events = lines.filter(l => /link down/i.test(l));

  if (!events.length) {
    return {
      value: "Sem eventos",
      status: "green"
    };
  }

  const limited = events.slice(0, 5);

  let value = limited.join("\n");

  if (events.length > 5) {
    value += `\n... +${events.length - 5} eventos`;
  }

  return {
    value,
    status:
      events.length < 3 ? "orange" : "red"
  };
}
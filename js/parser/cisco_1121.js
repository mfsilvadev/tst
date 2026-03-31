async function parseCisco1121(text) {
  return {
    uptime: parseUptime(text),
    interface: parseInterfaceStatus(text),
    crc: parseCRC(text),
    arp: await parseARPCount(text),
    ping: parsePing(text),
    logs: parseInterfaceFlaps(text),
    speed: parseSpeed(text)
  };
}

// ================= PARSERS =================

function parseUptime(text) {
  const match = text.match(/uptime is ([^\n]+)/i);

  if (!match) return null;

  return {
    value: match[1].trim(),
    status: "gray"
  };
}

function parseInterfaceStatus(text) {
  const lines = text.split("\n");

  const interfaces = [];

  let capture = false;

  for (const line of lines) {
    if (line.includes("Interface") && line.includes("Protocol")) {
      capture = true;
      continue;
    }

    if (!capture) continue;

    if (!line.trim()) break;

    const match = line.match(/(\S+)\s+(up|down)\s+(up|down)\s+(.*)/);

    if (match) {
      interfaces.push({
        name: match[1],
        status: match[2],
        protocol: match[3],
        desc: match[4] || "-"
      });
    }
  }

  const upIfs = interfaces.filter(i => i.status === "up" && i.protocol === "up");

  const hasWAN = upIfs.some(i => i.name.includes("Gi0/0/0"));
  const hasOther = upIfs.some(i => !i.name.includes("Gi0/0/0") && i.name !== "Vlan1");
  const hasOnlyVlan =
    upIfs.length > 0 &&
    upIfs.every(i => i.name === "Gi0/0/0" || i.name === "Vlan1");

  let status = "gray";

  if (hasWAN && hasOther) status = "green";
  else if (hasWAN && hasOnlyVlan) status = "orange";
  else if (hasWAN) status = "red";

    const value = [
        "Interface      Status   Protocol  Description",
        ...interfaces.map(i =>
            `${i.name.padEnd(15)} ${i.status.padEnd(7)} ${i.protocol.padEnd(9)} ${i.desc}`
        )
    ].join("\n");

  return {
    value: value || "nenhuma interface up",
    status
  };
}

function parseCRC(text) {
  const match = text.match(/(\d+)\s+CRC/i);
  if (!match) return null;

  const value = parseInt(match[1]);

  return {
    value,
    status:
      value === 0 ? "green" :
      value < 100 ? "orange" :
      "red"
  };
}

async function parseARPCount(text) {
  const matches = [...text.matchAll(
    /Internet\s+(\d+\.\d+\.\d+\.\d+)\s+\S+\s+([a-fA-F0-9.]+)\s+\S+\s+(\S+)/gi
  )];

  if (!matches.length) {
    return { value: "empty", status: "red" };
  }

  const total = matches.length;
  const limited = matches.slice(0, 5);

  const lines = await Promise.all(
    limited.map(async (m) => {
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

function parsePing(text) {
  const match = text.match(/(ping[\s\S]*?Success rate[^\n]*)/i);

  if (!match) return null;

  let fullBlock = match[1].trim();

  // 👇 aplica formatação
  fullBlock = formatPingLines(fullBlock);

  const percentMatch = fullBlock.match(/Success rate is (\d+)/i);
  const percent = percentMatch ? parseInt(percentMatch[1]) : null;

  return {
    value: fullBlock,
    status:
      percent === 100 ? "green" :
      percent >= 98 ? "green" :
      percent >= 95 ? "orange" :
      "red"
  };
}

function formatPingLines(block) {
  return block
    .split("\n")
    .map(line => {
      // detecta linha só de ! . U etc
      if (/^[!\.\w]+$/.test(line.trim())) {
        const chunks = [];

        for (let i = 0; i < line.length; i += 70) {
          chunks.push(line.slice(i, i + 70));
        }

        return chunks.join("\n");
      }

      return line;
    })
    .join("\n");
}

function parseInterfaceFlaps(text) {
  const lines = text.split("\n");

  const events = lines
    .filter(line => /changed state to down/i.test(line))
    .map(line => {
      const iface = line.match(/Interface ([^,]+)/i);
      return iface ? `${iface[1]} → ${line}` : line;
    });

  if (!events.length) {
    return {
      value: "Sem eventos",
      status: "green"
    };
  }

  const limited = events.slice(0, 5); // evita poluir

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

function parseSpeed(text) {
  const match = text.match(/(Full-duplex|Half-duplex),\s*(\d+Mb\/s)/i);

  if (!match) return null;

  return {
    value: `${match[1]} ${match[2]}`,
    status: "green"
  };
}
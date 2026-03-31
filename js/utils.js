function sanitizeIP(input) {
  input.value = input.value.replace(/[^0-9.]/g, "");
}

function isValidIP(ip) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

const macCache = {};

async function getMacVendor(mac) {
  const normalized = mac.slice(0, 8).toUpperCase();

  if (macCache[normalized]) {
    return macCache[normalized];
  }

  try {
    const res = await fetch(`https://api.macvendors.com/${normalized}`);
    const vendor = await res.text();

    macCache[normalized] = vendor;

    return vendor;
  } catch {
    return "Unknown";
  }
}
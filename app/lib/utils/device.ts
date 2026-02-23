export function parseDevice(userAgent: string) {
  let device = "Unknown Device";
  let os = "Unknown OS";
  let browser = "Unknown Browser";

  // OS
  if (/Windows NT 10/.test(userAgent)) os = "Windows 10";
  else if (/Windows NT 11/.test(userAgent)) os = "Windows 11";
  else if (/Mac OS X/.test(userAgent)) os = "macOS";
  else if (/Android/.test(userAgent)) os = "Android";
  else if (/iPhone/.test(userAgent)) os = "iPhone (iOS)";
  else if (/iPad/.test(userAgent)) os = "iPad (iOS)";
  else if (/Linux/.test(userAgent)) os = "Linux";

  // Device
  if (/iPhone/.test(userAgent)) device = "iPhone";
  else if (/iPad/.test(userAgent)) device = "iPad";
  else if (/Android/.test(userAgent)) device = "Android Phone";
  else device = "Desktop / Laptop";

  // Browser
  if (/Chrome\/([0-9.]+)/.test(userAgent)) browser = "Chrome";
  else if (/Firefox\/([0-9.]+)/.test(userAgent)) browser = "Firefox";
  else if (/Safari\/([0-9.]+)/.test(userAgent) && !/Chrome/.test(userAgent))
    browser = "Safari";
  else if (/Edg/.test(userAgent)) browser = "Edge";

  return {
    device,
    os,
    browser,
  };
}

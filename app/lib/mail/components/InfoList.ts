export const InfoList = (data: Record<string, string>) =>
  `<ul>${Object.entries(data)
    .map(([k, v]) => `<li><b>${k}:</b> ${v}</li>`)
    .join("")}</ul>`;

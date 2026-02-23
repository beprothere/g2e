export const Button = (label: string, link: string) => `
  <a href="${link}" style="
    display:inline-block;
    background:#00c2ff;
    color:#000;
    padding:12px 18px;
    border-radius:8px;
    text-decoration:none;
    font-weight:bold">
    ${label}
  </a>
`;

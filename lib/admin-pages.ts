export type AdminPage = {
  key: string;
  label: string;
  path: string;
};

export const ADMIN_PAGES: AdminPage[] = [
  { key: "dashboard", label: "Dashboard", path: "/admin" },
  { key: "serum", label: "Serum Order", path: "/admin/serum-order" },
  { key: "rewards", label: "Rewards", path: "/admin/rewards" },
  { key: "users", label: "Users", path: "/admin/users" },
  { key: "referrals", label: "Referrals", path: "/admin/referrals" },
  { key: "investments", label: "Investments", path: "/admin/investments" },
  { key: "wallets", label: "Wallets", path: "/admin/wallets" },
  { key: "deposits", label: "Deposits", path: "/admin/deposits" },
  { key: "withdrawals", label: "Withdrawals", path: "/admin/withdrawals" },
  { key: "security", label: "Security", path: "/admin/security" },
];

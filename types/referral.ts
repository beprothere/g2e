export interface ReferralNode {
  id: string;
  name: string;
  email: string;
  earnings: number;
  level: number;
  status: "active" | "inactive" | "suspicious";
  children?: ReferralNode[];
}
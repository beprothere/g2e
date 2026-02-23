export const PLANS = {
  Free: {
    price: 0,
    commission: 30,
    team: 0,
  },
  Basic: {
    price: 100,
    commission: 45,
    team: 20,
  },
  Standard: {
    price: 200,
    commission: 55,
    team: 30,
  },
  Premium: {
    price: 500,
    commission: 65,
    team: 50,
  },
} as const;

export type PlanName = keyof typeof PLANS;

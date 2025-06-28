export interface User {
  id: number;
  name: string | null;
  email: string | null;
  registration_date: string | null;
  role: string;
  plan_duration: string;
  active: boolean;
}

export interface Metrics {
  total_users: number;
  active_users: number;
  expired_users: number;
  plan_distribution: { [key: string]: number };
  monthly_registrations?: { [key: string]: number };
  revenue_by_plan?: { [key: string]: number };
}
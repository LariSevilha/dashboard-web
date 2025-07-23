export interface User {
    id: number;
    name: string | null; // Changed from string | undefined to string | null
    email?: string;
    registration_date?: string;
    plan_duration?: string;
    role?: string;
    active?: boolean;
  }
  
  export interface MasterUser {
    id: number;
    name: string | null; // Align with User for consistency
    email: string;
    phone_number: string;
    cpf: string;
    cref: string;
    photo_url?: string;
    password?: string;
    photo?: File;
  }
  
  export interface Metrics {
    total_users: number;
    active_users: number;
    total_master_users: number;
    expired_users: number;
    plan_distribution: {
      monthly?: number;
      semi_annual?: number;
      annual?: number;
      unknown?: number;
    };
  }
  
  export interface DashboardSettings {
    id?: number;
    primary_color: string;
    secondary_color: string;
    tertiary_color: string;
    app_name: string;
    logo_url?: string;
  }

  
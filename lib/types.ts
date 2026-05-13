export interface AdminUser {
  email: string;
  name: string;
  picture?: string;
}

export interface OrganizationInfo {
  logo?: string;
  name: string;
  address: string;
  contact_number: string;
  secondary_contact_number?: string;
}

export interface OrganizationApi {
  client_secret: string;
  domain: string;
}

export interface OwnerInfo {
  name: string;
  contact_number: string;
  email?: string;
  address: string;
}

export interface Credentials {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  avatar?: string;
  created_at?: string;
}

export interface Organization {
  id: number;
  info: OrganizationInfo;
  api: OrganizationApi;
  owner: OwnerInfo;
  credentials: Credentials | null;
  packages: Record<string, 'activate' | 'deactivate'>;
  seeds: Record<string, Record<string, string>>;
  status: 'active' | 'closed';
  note?: string;
  logo_public_id?: string;
  created_at: string;
  update_at: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  limit: number;
  total: number;
  offset: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface CreateOrganizationPayload {
  organization: {
    name: string;
    contact_number: string;
    secondary_contact_number?: string;
    domain?: string;
    address: string;
    note?: string;
  };
  owner_info: {
    name: string;
    contact_number: string;
    email?: string;
    address: string;
  };
  user: {
    name: string;
    email: string;
    phone_number: string;
    password: string;
  };
  packages?: Record<string, 'activate' | 'deactivate'>;
  seeds?: Record<string, Record<string, string>>;
}
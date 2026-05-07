import axios, { AxiosInstance } from 'axios';
import type {
  AdminUser,
  ApiResponse,
  CreateOrganizationPayload,
  Organization,
  Pagination,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export const adminApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-redirect to login on 401
adminApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!path.startsWith('/admin/login') && !path.startsWith('/admin/auth')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

/* ========== Auth ========== */
export const adminAuth = {
  googleUrl: () =>
    adminApi
      .get<ApiResponse<{ url: string }>>('/admin/auth/google/url')
      .then((r) => r.data),

  // ❌ REMOVED — googleCallback (backend now handles redirect itself)

  me: () =>
    adminApi
      .get<ApiResponse<{ admin: AdminUser }>>('/admin/auth/me')
      .then((r) => r.data),

  logout: () => adminApi.post<ApiResponse>('/admin/auth/logout').then((r) => r.data),
};

/* ========== Organizations ========== */
export const adminOrgs = {
  defaults: () =>
    adminApi
      .get<ApiResponse<{ defaulTOrgPackages: Record<string, 'activate' | 'deactivate'>; defaultSeeds: Record<string, Record<string, string>> }>>(
        '/admin/organizations/defaults'
      )
      .then((r) => r.data),

  list: (params: { search?: string; sorts?: string; page?: number; limit?: number } = {}) =>
    adminApi
      .get<ApiResponse<{ organizations: Organization[]; pagination: Pagination }>>(
        '/admin/organizations',
        { params }
      )
      .then((r) => r.data),

  get: (id: number) =>
    adminApi
      .get<ApiResponse<{ organization: Organization }>>(`/admin/organizations/${id}`)
      .then((r) => r.data),

  create: (payload: CreateOrganizationPayload) =>
    adminApi
      .post<ApiResponse<{ organization: Organization }>>('/admin/organizations', payload)
      .then((r) => r.data),

  updateInfo: (id: number, data: { name: string; contact_number: string; secondary_contact_number?: string; address: string }) =>
    adminApi.patch<ApiResponse>(`/admin/organizations/${id}/info`, data).then((r) => r.data),

  updateOwner: (id: number, data: { name: string; contact_number: string; email?: string; address: string }) =>
    adminApi.patch<ApiResponse>(`/admin/organizations/${id}/owner`, data).then((r) => r.data),

  updateCredentials: (id: number, data: { name: string; email: string; phone_number: string; password?: string }) =>
    adminApi.patch<ApiResponse>(`/admin/organizations/${id}/credentials`, data).then((r) => r.data),

  updateNote: (id: number, note: string) =>
    adminApi.patch<ApiResponse>(`/admin/organizations/${id}/note`, { note }).then((r) => r.data),

  updateDomain: (id: number, domain: string) =>
    adminApi.patch<ApiResponse>(`/admin/organizations/${id}/domain`, { domain }).then((r) => r.data),

  updateStatus: (id: number, status: 'active' | 'closed') =>
    adminApi.patch<ApiResponse>(`/admin/organizations/${id}/status`, { status }).then((r) => r.data),

  updatePackages: (id: number, packages: Record<string, 'activate' | 'deactivate'>) =>
    adminApi.patch<ApiResponse>(`/admin/organizations/${id}/packages`, { packages }).then((r) => r.data),

  updateSeeds: (id: number, seeds: Record<string, Record<string, string>>) =>
    adminApi.patch<ApiResponse>(`/admin/organizations/${id}/seeds`, { seeds }).then((r) => r.data),

  regenerateClientSecret: (id: number) =>
    adminApi
      .post<ApiResponse<{ client_secret: string }>>(`/admin/organizations/${id}/client-secret`, {
        confirm: 'yes',
      })
      .then((r) => r.data),
};
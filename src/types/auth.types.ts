import { SunatEnvironment } from './enums';

export interface LoginRequest {
  ruc?: string;
  username: string;
  password: string;
}

export interface UserSession {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  role: 'super_admin' | 'admin';
}

export interface CompanySession {
  id: string;
  ruc: string;
  businessName: string;
  tradeName: string | null;
  address: string | null;
  ubigeo: string | null;
  phone: string | null;
  email: string | null;
  sunatEnvironment: SunatEnvironment;
  apiKey: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  user: UserSession;
  company: CompanySession;
}

export interface MeResponse {
  user: UserSession;
  company: CompanySession;
}

export interface ApiHeaders {
  'X-Api-Key': string;
  Authorization: `Bearer ${string}`;
}

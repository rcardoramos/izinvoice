import { 
  LoginRequest, 
  LoginResponse, 
  MeResponse 
} from '@/types/auth.types';
import { 
  CreateInvoiceRequest, 
  CreateBoletaRequest, 
  CreateNoteRequest, 
  CloseDailySummaryRequest, 
  VoidDailySummaryRequest, 
  VoidedDocumentsRequest,
  InvoiceCreatedResponse,
  BoletaCreatedResponse,
  NoteBillResponse,
  NoteSignedResponse,
  DailySummarySubmitResponse,
  DailySummaryDetail,
  DocumentDetail
} from '@/types/document.types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mind-billing-api.onrender.com/v1';

export class BillingApiClient {
  private static getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  private static setCookie(name: string, value: string, days = 7) {
    if (typeof window === 'undefined') return;
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
  }

  private static getHeaders(isFormData?: boolean): HeadersInit {
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // 1. Try reading from cookies first (per request interceptor)
    const token = this.getCookie('token');

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 2. Fallback to localStorage state if cookies aren't set
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('invoiceflow-auth');
      if (authData) {
        try {
          const state = JSON.parse(authData).state;
          if (!headers['Authorization'] && state?.accessToken) {
            headers['Authorization'] = `Bearer ${state.accessToken}`;
          }
          if (state?.company?.apiKey) {
            headers['X-Api-Key'] = state.company.apiKey;
          }
        } catch (e) {
          console.error('Error reading auth headers from localStorage', e);
        }
      }
    }

    return headers;
  }

  private static async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const isFormData = typeof window !== 'undefined' && options.body instanceof FormData;
    const baseHeaders = this.getHeaders(isFormData);
    const res = await fetch(`${BASE}${url}`, {
      ...options,
      headers: {
        ...baseHeaders,
        ...options.headers,
      },
    });

    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      const err = contentType && contentType.includes('application/json') 
        ? await res.json() 
        : { message: res.statusText };
      throw err;
    }

    return res.json() as Promise<T>;
  }

  // Auth
  static async login(body: LoginRequest): Promise<LoginResponse> {
    const res = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (res.accessToken) {
      this.setCookie('token', res.accessToken);
    }

    return res;
  }

  static async me(): Promise<MeResponse> {
    return this.request<MeResponse>('/auth/me');
  }

  // Invoices & Boletas
  static async createInvoice(body: CreateInvoiceRequest): Promise<InvoiceCreatedResponse> {
    return this.request<InvoiceCreatedResponse>('/invoices', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async createBoleta(body: CreateBoletaRequest): Promise<BoletaCreatedResponse> {
    return this.request<BoletaCreatedResponse>('/boletas', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Notes
  static async createCreditNote(body: CreateNoteRequest): Promise<NoteSignedResponse | NoteBillResponse> {
    return this.request<NoteSignedResponse | NoteBillResponse>('/credit-notes', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async createDebitNote(body: CreateNoteRequest): Promise<NoteSignedResponse | NoteBillResponse> {
    return this.request<NoteSignedResponse | NoteBillResponse>('/debit-notes', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Daily Summaries
  static async previewDailySummary(body: {
    referenceDate?: string;
    issueDate?: string;
    page?: number;
    limit?: number;
    includeXml?: boolean;
  } = {}): Promise<any> {
    return this.request<any>('/daily-summaries/preview', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async closeDailySummary(body: CloseDailySummaryRequest = {}): Promise<DailySummarySubmitResponse> {
    return this.request<DailySummarySubmitResponse>('/daily-summaries', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async voidDailySummary(body: VoidDailySummaryRequest): Promise<DailySummarySubmitResponse> {
    return this.request<DailySummarySubmitResponse>('/daily-summaries/void', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async voidedDocuments(body: VoidedDocumentsRequest): Promise<DailySummarySubmitResponse> {
    return this.request<DailySummarySubmitResponse>('/voided-documents', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async listDailySummaries(filters: {
    referenceDate?: string;
    issueDate?: string;
    from?: string;
    to?: string;
    summaryType?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    data: DailySummaryDetail[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams();
    if (filters.referenceDate) params.append('referenceDate', filters.referenceDate);
    if (filters.issueDate) params.append('issueDate', filters.issueDate);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.summaryType) params.append('summaryType', filters.summaryType);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    return this.request<any>(`/daily-summaries?${params.toString()}`);
  }

  static async getDailySummary(id: string): Promise<DailySummaryDetail> {
    return this.request<DailySummaryDetail>(`/daily-summaries/${id}`);
  }

  static async pollDailySummaryStatus(id: string): Promise<DailySummarySubmitResponse> {
    return this.request<DailySummarySubmitResponse>(`/daily-summaries/${id}/status`, {
      method: 'POST',
    });
  }

  // Documents
  static async getDocument(id: string): Promise<DocumentDetail> {
    return this.request<DocumentDetail>(`/documents/${id}`);
  }

  static async listDocuments(filters: { 
    docType?: string; 
    status?: string; 
    dailySummaryId?: string; 
    search?: string;
    page?: number;
    limit?: number;
    serie?: string;
    issueDate?: string;
    from?: string;
    to?: string;
    pendingRc?: boolean;
  } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (filters.docType) params.append('docType', filters.docType);
    if (filters.status) params.append('status', filters.status);
    if (filters.dailySummaryId) params.append('dailySummaryId', filters.dailySummaryId);
    if (filters.search) params.append('q', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.serie) params.append('serie', filters.serie);
    if (filters.issueDate) params.append('issueDate', filters.issueDate);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.pendingRc !== undefined) params.append('pendingRc', String(filters.pendingRc));
    
    return this.request<any>(`/documents?${params.toString()}`);
  }

  // Download helpers (return trigger links)
  static getXmlUrl(id: string): string {
    return `${BASE}/documents/${id}/xml`;
  }

  static getCdrUrl(id: string): string {
    return `${BASE}/documents/${id}/cdr`;
  }

  // Customers
  static async listCustomers(params: { q?: string; page?: number; limit?: number; isActive?: boolean } = {}): Promise<any> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.isActive !== undefined) query.append('isActive', String(params.isActive));
    const qs = query.toString();
    return this.request<any>(`/customers${qs ? '?' + qs : ''}`);
  }

  static async findCustomerByDoc(docNumber: string): Promise<any[]> {
    const res = await this.request<any>(`/customers?q=${docNumber}`);
    // External API returns { data: [], meta: {} }
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  static async getCustomerDetail(id: string): Promise<any> {
    return this.request<any>(`/customers/${id}`);
  }

  static async createCustomer(body: any): Promise<any> {
    return this.request<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async updateCustomer(id: string, body: any): Promise<any> {
    return this.request<any>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  static async deleteCustomer(id: string): Promise<any> {
    return this.request<any>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: false }),
    });
  }

  // Products
  static async listProducts(params: { q?: string; page?: number; limit?: number; isActive?: boolean } = {}): Promise<any> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.isActive !== undefined) query.append('isActive', String(params.isActive));
    const qs = query.toString();
    return this.request<any>(`/products${qs ? '?' + qs : ''}`);
  }

  static async getProduct(id: string): Promise<any> {
    return this.request<any>(`/products/${id}`);
  }

  static async createProduct(body: any): Promise<any> {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async updateProduct(id: string, body: any): Promise<any> {
    return this.request<any>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  static async deleteProduct(id: string): Promise<any> {
    return this.request<any>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: false }),
    });
  }

  // Series
  static async listSeries(params: { docType?: string; isActive?: boolean } = {}): Promise<any> {
    const query = new URLSearchParams();
    if (params.docType) query.append('docType', params.docType);
    if (params.isActive !== undefined) query.append('isActive', String(params.isActive));
    const qs = query.toString();
    return this.request<any>(`/series${qs ? '?' + qs : ''}`);
  }

  // Cancel documents (boletas signed pre-RC)
  static async cancelDocuments(documentIds: string[], cancelReason?: string): Promise<any> {
    return this.request<any>('/documents/cancel', {
      method: 'POST',
      body: JSON.stringify({ documentIds, cancelReason }),
    });
  }

  // Audit Logs & Notifications
  static async listAuditLogs(): Promise<any[]> {
    return this.request<any[]>('/audit-logs');
  }

  static async listNotifications(): Promise<any[]> {
    return this.request<any[]>('/notifications');
  }

  static async markNotificationRead(id?: string): Promise<any> {
    return this.request<any>('/notifications', {
      method: 'PUT',
      body: JSON.stringify({ id }),
    });
  }

  // SaaS Companies Administration
  static async listSaasCompanies(): Promise<any[]> {
    return this.request<any[]>('/saas/companies');
  }

  static async createSaasCompany(body: any): Promise<any> {
    return this.request<any>('/saas/companies', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async updateSaasCompany(body: any): Promise<any> {
    return this.request<any>('/saas/companies', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // Certificates
  static async listCertificates(params: { isActive?: boolean; page?: number; limit?: number } = {}): Promise<any> {
    const query = new URLSearchParams();
    if (params.isActive !== undefined) query.append('isActive', String(params.isActive));
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    return this.request<any>(`/certificates${qs ? '?' + qs : ''}`);
  }

  static async uploadCertificate(formData: FormData): Promise<any> {
    return this.request<any>('/certificates', {
      method: 'POST',
      body: formData,
    });
  }

  static async updateCertificate(id: string, body: { alias?: string; pfxPassword?: string; isActive?: boolean }): Promise<any> {
    return this.request<any>(`/certificates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  static async deleteCertificate(id: string): Promise<any> {
    return this.request<any>(`/certificates/${id}`, {
      method: 'DELETE',
    });
  }

  // Company Profile (Client)
  static async getCompanyProfile(id: string): Promise<any> {
    return this.request<any>(`/companies/${id}`);
  }

  static async updateCompanyProfile(id: string, body: any): Promise<any> {
    return this.request<any>(`/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}

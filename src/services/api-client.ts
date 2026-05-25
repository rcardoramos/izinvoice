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

const BASE = '/api/v1';

export class BillingApiClient {
  private static getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('invoiceflow-auth');
      if (authData) {
        try {
          const state = JSON.parse(authData).state;
          if (state?.accessToken) {
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
    const res = await fetch(`${BASE}${url}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
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
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
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

  static async getDailySummary(id: string): Promise<DailySummaryDetail> {
    return this.request<DailySummaryDetail>(`/daily-summaries/${id}`);
  }

  static async pollDailySummaryStatus(id: string): Promise<DailySummarySubmitResponse> {
    return this.request<DailySummarySubmitResponse>(`/daily-summaries/${id}/status`, {
      method: 'POST',
    });
  }

  static async listDailySummaries(summaryType?: 'RC' | 'RA'): Promise<DailySummaryDetail[]> {
    const query = summaryType ? `?summaryType=${summaryType}` : '';
    return this.request<DailySummaryDetail[]>(`/daily-summaries${query}`);
  }

  // Documents
  static async getDocument(id: string): Promise<DocumentDetail> {
    return this.request<DocumentDetail>(`/documents/${id}`);
  }

  static async listDocuments(filters: { docType?: string; status?: string; dailySummaryId?: string; search?: string } = {}): Promise<DocumentDetail[]> {
    const params = new URLSearchParams();
    if (filters.docType) params.append('docType', filters.docType);
    if (filters.status) params.append('status', filters.status);
    if (filters.dailySummaryId) params.append('dailySummaryId', filters.dailySummaryId);
    if (filters.search) params.append('search', filters.search);
    
    return this.request<DocumentDetail[]>(`/documents?${params.toString()}`);
  }

  // Download helpers (return trigger links)
  static getXmlUrl(id: string): string {
    const apiKey = this.getApiKey();
    return `${BASE}/documents/${id}/xml?apiKey=${apiKey}`;
  }

  static getCdrUrl(id: string): string {
    const apiKey = this.getApiKey();
    return `${BASE}/documents/${id}/cdr?apiKey=${apiKey}`;
  }

  private static getApiKey(): string {
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('invoiceflow-auth');
      if (authData) {
        try {
          return JSON.parse(authData).state?.company?.apiKey || '';
        } catch (e) {}
      }
    }
    return '';
  }

  // Customers
  static async listCustomers(search?: string): Promise<any[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<any[]>(`/customers${query}`);
  }

  static async findCustomerByDoc(docNumber: string): Promise<any[]> {
    return this.request<any[]>(`/customers?docNumber=${docNumber}`);
  }

  static async getCustomerDetail(id: string): Promise<{ customer: any; metrics: any }> {
    return this.request<{ customer: any; metrics: any }>(`/customers/${id}`);
  }

  static async createCustomer(body: any): Promise<any> {
    return this.request<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async updateCustomer(id: string, body: any): Promise<any> {
    return this.request<any>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static async deleteCustomer(id: string): Promise<any> {
    return this.request<any>(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Products
  static async listProducts(search?: string): Promise<any[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<any[]>(`/products${query}`);
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
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static async deleteProduct(id: string): Promise<any> {
    return this.request<any>(`/products/${id}`, {
      method: 'DELETE',
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
}

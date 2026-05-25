import { SunatDocType, DocumentStatus, DailySummaryType, DailySummaryStatus, IsoDate } from './enums';

export interface ClienteInput {
  tipoDoc: string;   // '1' DNI, '6' RUC
  numDoc: string;
  razonSocial: string;
  direccion?: string;
  correo?: string;
  telefono?: string;
}

export interface ItemInput {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  igv?: number; // IGV calculated for this item line
}

export interface DocumentoAfectadoRef {
  docType: SunatDocType;
  serie: string;
  correlativo: number;
}

export interface DocumentTotals {
  subtotal: number;
  igvTotal: number;
  total: number;
}

export interface DocumentPayload {
  cliente?: ClienteInput;
  moneda?: string;
  items?: ItemInput[];
  totals?: DocumentTotals;
  tipoOperacion?: string;
  formaPago?: string;
  motivoCodigo?: string;
  motivoDescripcion?: string;
  documentoAfectado?: DocumentoAfectadoRef;
  documentoAfectadoId?: string;
  _rcVoid?: {
    voidSummaryId: string;
    originalDailySummaryId: string | null;
  };
}

export interface CreateInvoiceRequest {
  serie: string;
  tipoOperacion: string;  // e.g. '0101'
  moneda: string;         // 'PEN'
  cliente: ClienteInput;
  items: ItemInput[];
  formaPago?: string;
}

export interface CreateBoletaRequest {
  serie: string;
  moneda: string;
  cliente: ClienteInput;
  items: ItemInput[];
  tipoOperacion?: string;
  formaPago?: string;
}

export interface CreateNoteRequest {
  serie: string;              // FC01/BC01 or FD01/BD01
  moneda: string;
  documentoAfectadoId: string; // UUID of affected doc
  cliente: ClienteInput;
  items: ItemInput[];
  motivoCodigo?: string;      // Catalogo 09/10
  motivoDescripcion?: string;
}

export interface CloseDailySummaryRequest {
  referenceDate?: IsoDate;
  issueDate?: IsoDate;
}

export interface VoidDailySummaryRequest {
  documentIds: string[];
  referenceDate?: IsoDate;
  issueDate?: IsoDate;
}

export interface VoidedDocumentsRequest {
  documentIds: string[];
  referenceDate?: IsoDate;
  issueDate?: IsoDate;
  motivoBaja?: string;
}

export interface BoletaCreatedResponse {
  id: string;
  docType: '03';
  serie: string;
  correlativo: number;
  status: 'signed';
  total: string;
  issueDate: string | null;
  message: string;
}

export interface SunatBillResult {
  statusCode: string | null;
  description: string | null;
  accepted: boolean;
  errorMessage: string | null;
}

export interface BaseDocumentCreatedResponse {
  id: string;
  serie: string;
  correlativo: number;
  status: DocumentStatus;
  total: string;
  sunat: SunatBillResult;
}

export interface InvoiceCreatedResponse extends BaseDocumentCreatedResponse {
  docType: '01';
}

export interface NoteBillResponse extends BaseDocumentCreatedResponse {
  docType: '07' | '08';
}

export interface NoteSignedResponse {
  id: string;
  docType: '07' | '08';
  serie: string;
  correlativo: number;
  status: 'signed';
  total: string;
  issueDate: string | null;
  documentoAfectado?: DocumentoAfectadoRef;
  message: string;
}

export interface DocumentSunatSummary {
  method: string;
  statusCode: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface DocumentDetail {
  id: string;
  docType: SunatDocType;
  serie: string;
  correlativo: number;
  status: DocumentStatus;
  total: string;
  issueDate: IsoDate | null;
  dailySummaryId: string | null;
  payload: DocumentPayload | null;
  createdAt: string;
  updatedAt: string;
  sunat: DocumentSunatSummary | null;
}

export interface DailySummaryDetail {
  id: string;
  summaryType: DailySummaryType;
  summaryCode: string;
  referenceDate: IsoDate;
  issueDate: IsoDate;
  correlativo: number;
  status: DailySummaryStatus;
  ticket: string | null;
  statusCode: string | null;
  errorMessage: string | null;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SunatSummaryPoll {
  statusCode: string | null;
  description: string | null;
  processing?: boolean;
  accepted?: boolean;
  documentCount?: number;
  voidedCount?: number;
}

export interface DailySummarySubmitResponse {
  id: string;
  summaryType: DailySummaryType;
  summaryCode: string;
  referenceDate?: IsoDate;
  issueDate?: IsoDate;
  correlativo?: number;
  status: DailySummaryStatus;
  ticket: string | null;
  statusCode?: string | null;
  errorMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
  sunat?: SunatSummaryPoll;
}

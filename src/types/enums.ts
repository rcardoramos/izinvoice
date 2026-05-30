/** ISO date YYYY-MM-DD */
export type IsoDate = `${number}-${number}-${number}`;

export type SunatEnvironment = 'beta' | 'homologacion' | 'production';

export type SunatDocType = '01' | '03' | '07' | '08';

export type DailySummaryType = 'RC' | 'RA';

export type DocumentStatus =
  | 'draft'
  | 'signed'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'failed'
  | 'observed'
  | 'voided'
  | 'cancelled';

export type DailySummaryStatus =
  | 'draft'
  | 'submitted'
  | 'processing'
  | 'accepted'
  | 'rejected'
  | 'failed';

export const DOC_TYPE_LABELS: Record<SunatDocType, string> = {
  '01': 'Factura',
  '03': 'Boleta',
  '07': 'Nota de Crédito',
  '08': 'Nota de Débito',
};

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Borrador',
  signed: 'Firmado',
  submitted: 'Enviado',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
  failed: 'Fallido',
  observed: 'Observado',
  voided: 'Anulado',
  cancelled: 'Cancelado',
};

export const SUMMARY_STATUS_LABELS: Record<DailySummaryStatus, string> = {
  draft: 'Borrador',
  submitted: 'Enviado',
  processing: 'En Proceso',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
  failed: 'Fallido',
};

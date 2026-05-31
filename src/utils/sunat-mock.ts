import fs from 'fs';
import path from 'path';
import { todayPE } from './date-pe';

const DOCS_DIR = path.join(process.cwd(), 'data', 'documents');

export interface MockBillResult {
  statusCode: string | null;
  description: string | null;
  accepted: boolean;
  errorMessage: string | null;
}

export class SunatMockService {
  private static ensureStorage(docId: string) {
    const dir = path.join(DOCS_DIR, docId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  // Generates dummy signed XML and stores it
  static generateAndStoreXml(docId: string, docType: string, serie: string, correlativo: number, payload: any): string {
    const dir = this.ensureStorage(docId);
    const xmlPath = path.join(dir, 'ubl.xml');
    
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${serie}-${correlativo}</cbc:ID>
  <cbc:IssueDate>${payload.issueDate || todayPE()}</cbc:IssueDate>
  <cbc:InvoiceTypeCode>${docType}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${payload.moneda || 'PEN'}</cbc:DocumentCurrencyCode>
  <cac:Signature>
    <cbc:ID>SignInvoiceFlow</cbc:ID>
    <cac:SignatoryParty>
      <cac:PartyIdentification>
        <cbc:ID>20000000001</cbc:ID>
      </cac:PartyIdentification>
    </cac:SignatoryParty>
    <cac:DigitalSignatureAttachment>
      <cac:ExternalReference>
        <cbc:URI>#Signature-InvoiceFlow</cbc:URI>
      </cac:ExternalReference>
    </cac:DigitalSignatureAttachment>
  </cac:Signature>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>INVOICEFLOW DEMO S.A.C.</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${payload.cliente?.razonSocial || 'CLIENTE DEMO'}</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <!-- Items count: ${payload.items?.length || 0} -->
</Invoice>`;

    fs.writeFileSync(xmlPath, xmlContent, 'utf-8');
    return xmlContent;
  }

  // Generates dummy CDR XML and stores it
  static generateAndStoreCdr(docId: string, docType: string, serie: string, correlativo: number, isAccepted = true, errorMsg = ''): string {
    const dir = this.ensureStorage(docId);
    const cdrPath = path.join(dir, 'cdr.xml');
    
    const cdrContent = `<?xml version="1.0" encoding="UTF-8"?>
<ApplicationResponse xmlns="urn:oasis:names:specification:ubl:schema:xsd:ApplicationResponse-2"
                     xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
                     xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>CDR-${serie}-${correlativo}</cbc:ID>
  <cbc:IssueDate>${todayPE()}</cbc:IssueDate>
  <cac:DocumentResponse>
    <cac:Response>
      <cbc:ResponseCode>${isAccepted ? '0' : '9999'}</cbc:ResponseCode>
      <cbc:Description>${isAccepted ? 'El comprobante ha sido ACEPTADO' : `El comprobante ha sido RECHAZADO: ${errorMsg}`}</cbc:Description>
    </cac:Response>
  </cac:DocumentResponse>
</ApplicationResponse>`;

    fs.writeFileSync(cdrPath, cdrContent, 'utf-8');
    return cdrContent;
  }

  // Simulates SOAP sendBill endpoint
  static sendBillMock(docType: string, serie: string, correlativo: number, total: number): MockBillResult {
    // Basic rules simulation:
    // If invoice total exceeds 50000 in demo, let's trigger an observation or error for testing.
    if (total > 50000) {
      return {
        statusCode: '3020',
        description: 'El monto total excede el límite permitido para esta serie de prueba.',
        accepted: false,
        errorMessage: 'SUNAT Rechazo 3020: Limite excedido.',
      };
    }

    return {
      statusCode: '0',
      description: 'El comprobante ha sido aceptado con éxito.',
      accepted: true,
      errorMessage: null,
    };
  }

  // Simulates SOAP sendSummary (returns ticket)
  static generateTicket(): string {
    return 'TKT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  // Simulates SOAP getStatus for Daily Summaries
  static pollSummaryStatusMock(ticket: string, attempt: number): {
    statusCode: string;
    description: string;
    processing: boolean;
    accepted: boolean;
  } {
    // In beta, the first attempt is often in progress, and the second attempt completes.
    // This allows testing the loader spinner and polling button!
    if (attempt < 2) {
      return {
        statusCode: '98', // SUNAT code for processing
        description: 'El resumen está siendo procesado por SUNAT.',
        processing: true,
        accepted: false,
      };
    }

    return {
      statusCode: '0',
      description: 'El resumen ha sido procesado y ACEPTADO.',
      processing: false,
      accepted: true,
    };
  }
}

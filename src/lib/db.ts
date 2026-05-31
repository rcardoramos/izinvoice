import fs from 'fs';
import path from 'path';

// Define the database path in the workspace
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Interface for DB Structure
export interface DbSchema {
  companies: any[];
  subscriptions: any[];
  users: any[];
  api_keys: any[];
  customers: any[];
  products: any[];
  document_series: any[];
  daily_summaries: any[];
  documents: any[];
  invoice_notes: any[];
  sunat_submissions: any[];
  notifications: any[];
  audit_logs: any[];
  certificates: any[];
}

const INITIAL_DB: DbSchema = {
  companies: [
    {
      id: '00000000-0000-4000-8000-000000000001',
      ruc: '20000000001',
      business_name: 'INVOICEFLOW DEMO S.A.C.',
      trade_name: 'InvoiceFlow Premium',
      address: 'Av. Javier Prado Este 1024, San Isidro, Lima, Perú',
      phone: '+51 987654321',
      email: 'demo@invoiceflow.pe',
      sunat_environment: 'beta',
      sol_username: '20000000001MODDATOS',
      sol_password: 'MODDATOS',
      api_key: 'mbak_dev00000000000000000000000001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  subscriptions: [
    {
      id: 'sub_dev_01',
      company_id: '00000000-0000-4000-8000-000000000001',
      plan_name: 'enterprise',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }
  ],
  users: [
    {
      id: 'invoiceflow_superadmin',
      company_id: null,
      username: 'invoiceflow',
      password_hash: 'invoiceflow123',
      full_name: 'SaaS Admin (InvoiceFlow)',
      email: 'admin@invoiceflow.pe',
      role: 'super_admin',
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'user_dev_id',
      company_id: '00000000-0000-4000-8000-000000000001',
      username: 'admin',
      password_hash: 'admin123',
      full_name: 'Ricardo Ramos (Cliente Admin)',
      email: 'ricardo@invoiceflow.pe',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
    }
  ],
  api_keys: [
    {
      id: 'apikey_dev_01',
      company_id: '00000000-0000-4000-8000-000000000001',
      key_value: 'mbak_dev00000000000000000000000001',
      name: 'Development API Key',
      status: 'active',
      created_at: new Date().toISOString(),
    }
  ],
  customers: [
    {
      id: 'cust_01',
      company_id: '00000000-0000-4000-8000-000000000001',
      doc_type: '6', // RUC
      doc_number: '20123456789',
      razon_social: 'ALICORP SOCIEDAD ANONIMA ABIERTA',
      nombre_comercial: 'Alicorp S.A.A.',
      direccion: 'Av. Argentina Nro. 4793, Carmen de la Legua, Callao',
      correo: 'facturacion@alicorp.com.pe',
      telefono: '01 315-0800',
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'cust_02',
      company_id: '00000000-0000-4000-8000-000000000001',
      doc_type: '1', // DNI
      doc_number: '44556677',
      razon_social: 'JUAN PEREZ GONZALES',
      direccion: 'Calle Los Jazmines 452, Lince, Lima',
      correo: 'juan.perez@gmail.com',
      telefono: '999888777',
      status: 'active',
      created_at: new Date().toISOString(),
    }
  ],
  products: [
    {
      id: 'prod_01',
      company_id: '00000000-0000-4000-8000-000000000001',
      codigo: 'PROD-001',
      nombre: 'Laptop Apple MacBook Pro 16" M3 Max',
      descripcion: 'Laptop premium con 64GB RAM, 1TB SSD, color Space Black',
      categoria: 'Hardware',
      unidad_medida: 'NIU',
      precio: 15499.00,
      igv_rate: 18.00,
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'prod_02',
      company_id: '00000000-0000-4000-8000-000000000001',
      codigo: 'PROD-002',
      nombre: 'Monitor Gamer Samsung Odyssey OLED G9',
      descripcion: 'Monitor curvo de 49 pulgadas, resolución DQHD y 240Hz',
      categoria: 'Monitores',
      unidad_medida: 'NIU',
      precio: 5299.00,
      igv_rate: 18.00,
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'prod_03',
      company_id: '00000000-0000-4000-8000-000000000001',
      codigo: 'SERV-001',
      nombre: 'Consultoría Especializada en Arquitectura Fintech',
      descripcion: 'Servicio de consultoría y diseño de API de facturación por hora',
      categoria: 'Servicios',
      unidad_medida: 'ZZ',
      precio: 250.00,
      igv_rate: 18.00,
      status: 'active',
      created_at: new Date().toISOString(),
    }
  ],
  document_series: [
    {
      id: 'ser_01',
      company_id: '00000000-0000-4000-8000-000000000001',
      doc_type: '01', // Factura
      serie: 'F001',
      correlativo: 24,
    },
    {
      id: 'ser_02',
      company_id: '00000000-0000-4000-8000-000000000001',
      doc_type: '03', // Boleta
      serie: 'B001',
      correlativo: 48,
    },
    {
      id: 'ser_03',
      company_id: '00000000-0000-4000-8000-000000000001',
      doc_type: '07', // NC
      serie: 'FC01', // NC factura
      correlativo: 3,
    },
    {
      id: 'ser_04',
      company_id: '00000000-0000-4000-8000-000000000001',
      doc_type: '07', // NC
      serie: 'BC01', // NC boleta
      correlativo: 1,
    },
    {
      id: 'ser_05',
      company_id: '00000000-0000-4000-8000-000000000001',
      doc_type: '08', // ND
      serie: 'FD01', // ND factura
      correlativo: 1,
    },
    {
      id: 'ser_06',
      company_id: '00000000-0000-4000-8000-000000000001',
      doc_type: '08', // ND
      serie: 'BD01', // ND boleta
      correlativo: 1,
    }
  ],
  daily_summaries: [],
  documents: [],
  invoice_notes: [],
  sunat_submissions: [],
  notifications: [
    {
      id: 'notif_01',
      company_id: '00000000-0000-4000-8000-000000000001',
      title: 'Sistema Iniciado',
      message: 'La base de datos local de INVOICEFLOW se ha inicializado con éxito.',
      type: 'info',
      read: false,
      created_at: new Date().toISOString(),
    }
  ],
  audit_logs: [
    {
      id: 'audit_01',
      company_id: '00000000-0000-4000-8000-000000000001',
      user_id: 'user_dev_id',
      action: 'INITIALIZE_DB',
      module: 'SYSTEM',
      ip_address: '127.0.0.1',
      result: 'success',
      details: 'Initial database seeds deployed successfully.',
      created_at: new Date().toISOString(),
    }
  ],
  certificates: [
    {
      id: 'cert_dev_01',
      company_id: '00000000-0000-4000-8000-000000000001',
      alias: 'Certificado de Pruebas IzInvoce',
      filename: 'dev-beta.pfx',
      validFrom: '2025-05-24',
      validTo: '2027-05-24',
      isActive: true,
      hasPfxContent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

// Database class
export class FileDb {
  private static init() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    }
  }

  static read(): DbSchema {
    this.init();
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading JSON DB, restoring default', e);
      return INITIAL_DB;
    }
  }

  static write(data: DbSchema) {
    this.init();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Generic helpers
  static getTable<K extends keyof DbSchema>(table: K): DbSchema[K] {
    const db = this.read();
    if (db[table] === undefined) {
      db[table] = (INITIAL_DB[table] || []) as any;
      this.write(db);
    }
    return db[table];
  }

  static saveTable<K extends keyof DbSchema>(table: K, data: DbSchema[K]) {
    const db = this.read();
    db[table] = data;
    this.write(db);
  }

  static findById<K extends keyof DbSchema>(table: K, id: string): any {
    const list = this.getTable(table);
    return list.find((item: any) => item.id === id);
  }

  static insert<K extends keyof DbSchema>(table: K, item: any): any {
    const list = this.getTable(table);
    const newItem = {
      id: item.id || Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...item,
    };
    list.push(newItem);
    this.saveTable(table, list);
    return newItem;
  }

  static update<K extends keyof DbSchema>(table: K, id: string, updates: any): any {
    const list = this.getTable(table);
    const index = list.findIndex((item: any) => item.id === id);
    if (index === -1) return null;
    
    const updatedItem = {
      ...list[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    list[index] = updatedItem;
    this.saveTable(table, list);
    return updatedItem;
  }

  static delete<K extends keyof DbSchema>(table: K, id: string): boolean {
    const list = this.getTable(table);
    const index = list.findIndex((item: any) => item.id === id);
    if (index === -1) return false;
    
    list.splice(index, 1);
    this.saveTable(table, list);
    return true;
  }
}

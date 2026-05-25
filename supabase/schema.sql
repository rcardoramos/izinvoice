-- PostgreSQL DDL schema for INVOICEFLOW

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Companies (Tenants)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ruc VARCHAR(11) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    sunat_environment VARCHAR(20) NOT NULL DEFAULT 'beta' CHECK (sunat_environment IN ('beta', 'homologacion', 'production')),
    sol_username VARCHAR(100) DEFAULT 'MODDATOS',
    sol_password VARCHAR(100) DEFAULT 'MODDATOS',
    pfx_path VARCHAR(255),
    pfx_password VARCHAR(255),
    api_key VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_name VARCHAR(50) NOT NULL DEFAULT 'starter' CHECK (plan_name IN ('starter', 'scale', 'enterprise')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Roles and Permissions
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL CHECK (name IN ('super_admin', 'admin', 'operator')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    role_id UUID NOT NULL REFERENCES roles(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_users_company_username UNIQUE (company_id, username)
);

-- 5. API Keys (For developer programmatic access)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    key_value VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    doc_type VARCHAR(2) NOT NULL CHECK (doc_type IN ('1', '6')), -- '1' DNI, '6' RUC
    doc_number VARCHAR(20) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),
    direccion TEXT,
    correo VARCHAR(255),
    telefono VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_customers_company_doc UNIQUE (company_id, doc_type, doc_number)
);

-- 7. Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    unidad_medida VARCHAR(20) NOT NULL DEFAULT 'NIU', -- NIU (Unidades), ZZ (Servicio), etc.
    precio NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    igv_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_products_company_codigo UNIQUE (company_id, codigo)
);

-- 8. Document Series (Correlativos)
CREATE TABLE IF NOT EXISTS document_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    doc_type VARCHAR(2) NOT NULL CHECK (doc_type IN ('01', '03', '07', '08')), -- 01 Factura, 03 Boleta, 07 NC, 08 ND
    serie VARCHAR(4) NOT NULL,
    correlativo INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_document_series UNIQUE (company_id, doc_type, serie)
);

-- 9. Daily Summaries (RC y RA)
CREATE TABLE IF NOT EXISTS daily_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    summary_type VARCHAR(2) NOT NULL CHECK (summary_type IN ('RC', 'RA')), -- RC (Boletas/Resumen), RA (Bajas Facturas)
    summary_code VARCHAR(50) UNIQUE NOT NULL, -- RC-20260524-1, RA-20260524-1
    reference_date DATE NOT NULL,
    issue_date DATE NOT NULL,
    correlativo INTEGER NOT NULL,
    ticket VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'processing', 'accepted', 'rejected', 'failed')),
    status_code VARCHAR(10),
    error_message TEXT,
    xml_content TEXT,
    cdr_xml TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Documents (Invoices / Boletas / Notes)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    doc_type VARCHAR(2) NOT NULL CHECK (doc_type IN ('01', '03', '07', '08')), -- 01 Factura, 03 Boleta, 07 NC, 08 ND
    serie VARCHAR(4) NOT NULL,
    correlativo INTEGER NOT NULL,
    customer_id UUID REFERENCES customers(id),
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'submitted', 'accepted', 'rejected', 'failed', 'observed', 'voided')),
    issue_date DATE NOT NULL,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    daily_summary_id UUID REFERENCES daily_summaries(id) ON DELETE SET NULL,
    payload JSONB NOT NULL, -- Contains items, subtotal, igv, paymentType, affectedDoc, etc.
    xml_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_documents_unique UNIQUE (company_id, doc_type, serie, correlativo)
);

-- 11. Credit Notes and Debit Notes (Trazabilidad)
CREATE TABLE IF NOT EXISTS invoice_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    note_id UUID UNIQUE NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    affected_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    motivo_codigo VARCHAR(2) NOT NULL, -- Catálogo 09 o 10
    motivo_descripcion TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. SUNAT Submissions (sendBill history for 01, and 07/08 on 01)
CREATE TABLE IF NOT EXISTS sunat_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID UNIQUE NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL DEFAULT 'sendBill',
    status_code VARCHAR(10),
    cdr_xml TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info', -- 'success', 'error', 'warning', 'info'
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    result VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (result IN ('success', 'failure')),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_company_status ON documents(company_id, status);
CREATE INDEX IF NOT EXISTS idx_documents_pending_rc ON documents(company_id, status, daily_summary_id) WHERE status = 'signed' AND daily_summary_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_daily_summaries_search ON daily_summaries(company_id, summary_type, issue_date);
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers(company_id, doc_type, doc_number);
CREATE INDEX IF NOT EXISTS idx_products_search ON products(company_id, codigo);
CREATE INDEX IF NOT EXISTS idx_audit_logs_search ON audit_logs(company_id, created_at DESC);

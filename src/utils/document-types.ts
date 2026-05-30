export interface DocTypeConfig {
  code: string;        // Catalog 06 code, e.g., "1" or "6"
  label: string;       // Display label, e.g., "DNI" or "RUC"
  minLength: number;
  maxLength: number;
  pattern: RegExp;     // Regex validator
  errorMessage: string;
  isNumeric: boolean;
}

export const DOCUMENT_TYPES: Record<string, DocTypeConfig> = {
  DNI: {
    code: '1',
    label: 'DNI',
    minLength: 8,
    maxLength: 8,
    pattern: /^\d{8}$/,
    errorMessage: 'El DNI debe contener exactamente 8 dígitos numéricos.',
    isNumeric: true,
  },
  RUC: {
    code: '6',
    label: 'RUC',
    minLength: 11,
    maxLength: 11,
    pattern: /^\d{11}$/,
    errorMessage: 'El RUC debe contener exactamente 11 dígitos numéricos.',
    isNumeric: true,
  },
  CE: {
    code: '4',
    label: 'Carnet de Extranjería',
    minLength: 4,
    maxLength: 12,
    pattern: /^[a-zA-Z0-9]{4,12}$/,
    errorMessage: 'El Carnet de Extranjería debe tener entre 4 y 12 caracteres alfanuméricos.',
    isNumeric: false,
  },
  PASAPORTE: {
    code: '7',
    label: 'Pasaporte',
    minLength: 4,
    maxLength: 12,
    pattern: /^[a-zA-Z0-9]{4,12}$/,
    errorMessage: 'El Pasaporte debe tener entre 4 y 12 caracteres alfanuméricos.',
    isNumeric: false,
  },
};

export function getDocTypeConfigByCode(code: string): DocTypeConfig | undefined {
  return Object.values(DOCUMENT_TYPES).find((config) => config.code === code);
}

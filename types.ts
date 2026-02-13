
export interface LaborRates {
  base: number;
  afterHours: number;
  emergency: number;
}

export interface MaterialItem {
  manufacturer: string;
  model: string;
  category: 'Material' | 'Equipment';
  quantity: number;
  msrp: number;
  unitOfMeasure?: string; // e.g., 'ft', 'ea'
  complexity: 'Low' | 'Medium' | 'High';
  notes?: string;
}

export interface LaborTask {
  class: string;
  task: string;
  hours: number;
  rateType: 'base' | 'afterHours' | 'emergency';
  notes?: string;
}

// Validation types for multi-brain pipeline
export interface ValidationWarning {
  type: 'pricing' | 'labor' | 'material' | 'cable' | 'manufacturer' | 'schema';
  severity: 'info' | 'warning' | 'error';
  message: string;
  itemIndex?: number; // index in materials or labor array
  autoCorrection?: string; // description of auto-applied fix
}

export interface PricingValidation {
  itemIndex: number;
  manufacturer: string;
  model: string;
  originalMsrp: number;
  validatedMsrp: number;
  source: string;
  confidence: number; // 0-100
  delta: number; // percentage difference
}

export interface ValidationResult {
  overallConfidence: number; // 0-100
  status: 'customer_ready' | 'review_recommended' | 'manual_review_required';
  warnings: ValidationWarning[];
  pricingValidations: PricingValidation[];
  autoCorrections: string[];
  qaIssues: string[];
  timestamp: string;
}

export interface ChangeOrderData {
  customer: string;
  contact: string;
  projectName: string;
  address: string;
  phone: string;
  projectNumber: string;
  rfiNumber: string;
  pcoNumber: string;
  coordinatorIntent: string;
  technicalScope: string;
  systemsImpacted: string[];
  materials: MaterialItem[];
  labor: LaborTask[];
  standardsReview: {
    standard: string;
    compliance: string;
    action?: string;
  }[];
  assumptions: string[];
  exclusions: string[];
  professionalNotes: string;
  confidenceScore: number;
  nextSteps: string[];
  validationResult?: ValidationResult;
}

export interface ProposalData {
  projectTitle: string;
  clientName: string;
  executiveSummary: string;
  problemStatement: string;
  solutionOverview: string;
  technicalHighlights: string[];
  valueProposition: string[];
  industryInsights: string[];
  investmentSummary: {
    laborTotal: number;
    materialsTotal: number;
    taxTotal: number;
    grandTotal: number;
  };
  companyCredentials: string[];
  whyChooseUs: string[];
  nextSteps: string[];
  callToAction: string;
  generatedDate: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  SETUP = 'SETUP',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  PROPOSAL = 'PROPOSAL'
}

export interface AdminData {
  customer: string;
  contact: string;
  projectName: string;
  address: string;
  phone: string;
  projectNumber: string;
  rfiNumber: string;
  pcoNumber: string;
}

export interface Financials {
  laborTotal: number;
  materialsTotal: number;
  taxTotal: number;
  grandTotal: number;
}


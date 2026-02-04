
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

export interface ProductSearchResult {
  manufacturer: string;
  model: string;
  partNumber: string;
  msrp: number;
  description: string;
  category: 'Material' | 'Equipment';
  unitOfMeasure: string;
  sourceUrl?: string;
  confidence: 'high' | 'medium' | 'low';
}


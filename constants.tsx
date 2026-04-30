
import React from 'react';

export const COLORS = {
  black: '#000000',
  gold: '#f2bc1c',
  teal: '#008a8a',
  goldDark: '#B8860B'
};

export const Icons = {
  Logo: ({ className = "" }: { className?: string }) => (
    <img
      src="/logo.png"
      alt="3D Technology Services"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  ),
  Check: () => (
    <svg className="w-5 h-5 text-[#f2bc1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-5 h-5 text-[#f2bc1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
};

export const SYSTEMS = [
  'AV Systems',
  'Structured Cabling',
  'CCTV',
  'Access Control',
  'Fire Alarm',
  'Intrusion'
];

export interface Office {
  id: string;
  name: string;
  address: string;
  cityState: string;
  salesTaxRate: number;
  taxJurisdictionLabel: string;
}

export const OFFICES: Office[] = [
  {
    id: 'rancho-cordova',
    name: 'Sacramento HQ',
    address: '11365 Sunrise Gold Circle',
    cityState: 'Rancho Cordova, CA 95742',
    salesTaxRate: 0.0825,
    taxJurisdictionLabel: 'Rancho Cordova',
  },
  {
    id: 'livermore',
    name: 'Bay Area',
    address: '7616 Las Positas Road',
    cityState: 'Livermore, CA 94551',
    salesTaxRate: 0.1025,
    taxJurisdictionLabel: 'Livermore',
  },
  {
    id: 'sparks',
    name: 'Northern Nevada',
    address: '1430 Greg Street, Suite 511',
    cityState: 'Sparks, NV 89431',
    salesTaxRate: 0.08265,
    taxJurisdictionLabel: 'Sparks',
  },
];

export const DEFAULT_OFFICE_ID = 'rancho-cordova';

export const getOffice = (id?: string): Office =>
  OFFICES.find(o => o.id === id) || OFFICES[0];

export const COMPANY_PHONE = '(916) 853-9111';
export const COMPANY_FAX = '(916) 853-9118';
export const COMPANY_LICENSE = '#875745';

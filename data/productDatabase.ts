/**
 * 3D Technology Services - Comprehensive Product Knowledge Base
 * 
 * This database provides accurate product information, installation requirements,
 * and accessory dependencies for generating 100% accurate change orders.
 * 
 * Categories: CCTV, Access Control, Structured Cabling, Fire/Life Safety, AV, Intrusion
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ProductDefinition {
    manufacturer: string;
    model: string;
    partNumber: string;
    category: 'Material' | 'Equipment';
    subcategory: string;
    msrp: number;
    unitOfMeasure: string;
    description: string;
    installationRequirements: InstallationRequirement[];
    accessories: AccessoryRequirement[];
    laborHours: number; // Base labor hours for installation
    complexity: 'Low' | 'Medium' | 'High';
}

export interface InstallationRequirement {
    type: 'consumable' | 'tool' | 'accessory';
    name: string;
    partNumber?: string;
    quantityPerUnit: number;
    msrp?: number;
    notes?: string;
}

export interface AccessoryRequirement {
    type: 'required' | 'recommended' | 'optional';
    name: string;
    manufacturer: string;
    partNumber: string;
    msrp: number;
    reason: string;
}

export interface CableCalculation {
    cableType: string;
    perCameraFeet: number;
    perDoorFeet: number;
    perDropFeet: number;
    jHookSpacingFeet: number;
    pullBoxIntervalFeet: number;
    wasteFactorPercent: number;
}

// =============================================================================
// CCTV / SURVEILLANCE PRODUCTS
// =============================================================================

export const CCTV_CAMERAS: ProductDefinition[] = [
    // AXIS CAMERAS
    {
        manufacturer: 'Axis',
        model: 'P3245-V',
        partNumber: '02326-001',
        category: 'Equipment',
        subcategory: 'IP Camera - Indoor Dome',
        msrp: 899.00,
        unitOfMeasure: 'ea',
        description: '2MP indoor dome with WDR, Lightfinder, and Forensic Capture',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Cable (per camera avg 150ft)', quantityPerUnit: 150, msrp: 0.45, notes: 'Per foot' },
            { type: 'consumable', name: 'RJ45 Cat6A Connector', quantityPerUnit: 2, msrp: 3.50 },
            { type: 'consumable', name: 'Cable Labels', quantityPerUnit: 2, msrp: 0.15 },
            { type: 'consumable', name: 'Velcro Cable Wrap (6in)', quantityPerUnit: 4, msrp: 0.25 },
            { type: 'consumable', name: 'Tapcon Concrete Anchor 1/4x1-3/4', quantityPerUnit: 4, msrp: 0.35 }
        ],
        accessories: [
            { type: 'recommended', name: 'Recessed Mount', manufacturer: 'Axis', partNumber: 'T94K01L', msrp: 89.00, reason: 'Drop ceiling installation' },
            { type: 'optional', name: 'Pendant Kit', manufacturer: 'Axis', partNumber: 'T94K01D', msrp: 105.00, reason: 'Exposed ceiling mount' }
        ],
        laborHours: 1.5,
        complexity: 'Low'
    },
    {
        manufacturer: 'Axis',
        model: 'P3265-V',
        partNumber: '02326-004',
        category: 'Equipment',
        subcategory: 'IP Camera - Indoor Dome',
        msrp: 1199.00,
        unitOfMeasure: 'ea',
        description: '4K indoor dome with WDR, Lightfinder 2.0, analytics',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Cable (per camera avg 150ft)', quantityPerUnit: 150, msrp: 0.45 },
            { type: 'consumable', name: 'RJ45 Cat6A Connector', quantityPerUnit: 2, msrp: 3.50 },
            { type: 'consumable', name: 'Cable Labels', quantityPerUnit: 2, msrp: 0.15 },
            { type: 'consumable', name: 'Velcro Cable Wrap (6in)', quantityPerUnit: 4, msrp: 0.25 },
            { type: 'consumable', name: 'Tapcon Concrete Anchor 1/4x1-3/4', quantityPerUnit: 4, msrp: 0.35 }
        ],
        accessories: [
            { type: 'recommended', name: 'Recessed Mount', manufacturer: 'Axis', partNumber: 'T94K01L', msrp: 89.00, reason: 'Drop ceiling installation' }
        ],
        laborHours: 1.5,
        complexity: 'Low'
    },
    {
        manufacturer: 'Axis',
        model: 'P3255-LVE',
        partNumber: '02099-001',
        category: 'Equipment',
        subcategory: 'IP Camera - Outdoor Dome',
        msrp: 1349.00,
        unitOfMeasure: 'ea',
        description: '2MP outdoor dome with deep learning, WDR, IK10/IP66',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Outdoor-Rated Cable', quantityPerUnit: 200, msrp: 0.65 },
            { type: 'consumable', name: 'RJ45 Cat6A Shielded Connector', quantityPerUnit: 2, msrp: 5.50 },
            { type: 'consumable', name: 'Waterproof Junction Box', quantityPerUnit: 1, msrp: 45.00 },
            { type: 'consumable', name: 'Silicone Sealant', quantityPerUnit: 0.25, msrp: 8.00, notes: 'Tube' },
            { type: 'consumable', name: 'Stainless Steel Tapcon 1/4x2-1/4', quantityPerUnit: 4, msrp: 0.85 }
        ],
        accessories: [
            { type: 'required', name: 'Wall Mount', manufacturer: 'Axis', partNumber: 'T91D61', msrp: 125.00, reason: 'Exterior wall mounting' },
            { type: 'recommended', name: 'Weathershield', manufacturer: 'Axis', partNumber: 'Q6010-E', msrp: 79.00, reason: 'Additional weather protection' }
        ],
        laborHours: 2.5,
        complexity: 'Medium'
    },
    {
        manufacturer: 'Axis',
        model: 'Q6135-LE',
        partNumber: '01958-004',
        category: 'Equipment',
        subcategory: 'IP Camera - PTZ',
        msrp: 5899.00,
        unitOfMeasure: 'ea',
        description: '2MP PTZ with 32x optical zoom, IR illumination, Speed Dry',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Cable', quantityPerUnit: 250, msrp: 0.45 },
            { type: 'consumable', name: 'RJ45 Cat6A Shielded Connector', quantityPerUnit: 2, msrp: 5.50 },
            { type: 'consumable', name: 'Weatherproof Junction Box Large', quantityPerUnit: 1, msrp: 85.00 },
            { type: 'consumable', name: 'Stainless Mounting Hardware Kit', quantityPerUnit: 1, msrp: 35.00 }
        ],
        accessories: [
            { type: 'required', name: 'Pole Mount', manufacturer: 'Axis', partNumber: 'T91A67', msrp: 285.00, reason: 'Pole installation' },
            { type: 'required', name: 'Conduit Back Box', manufacturer: 'Axis', partNumber: 'T94B01P', msrp: 95.00, reason: 'Cable protection' }
        ],
        laborHours: 4.0,
        complexity: 'High'
    },
    // HIKVISION CAMERAS
    {
        manufacturer: 'Hikvision',
        model: 'DS-2CD2143G2-IU',
        partNumber: 'DS-2CD2143G2-IU',
        category: 'Equipment',
        subcategory: 'IP Camera - Indoor Dome',
        msrp: 285.00,
        unitOfMeasure: 'ea',
        description: '4MP AcuSense dome with built-in mic, WDR 130dB',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6 Plenum Cable', quantityPerUnit: 150, msrp: 0.35 },
            { type: 'consumable', name: 'RJ45 Cat6 Connector', quantityPerUnit: 2, msrp: 1.50 },
            { type: 'consumable', name: 'Cable Labels', quantityPerUnit: 2, msrp: 0.15 },
            { type: 'consumable', name: 'Drywall Anchors', quantityPerUnit: 4, msrp: 0.20 }
        ],
        accessories: [
            { type: 'optional', name: 'In-Ceiling Mount', manufacturer: 'Hikvision', partNumber: 'DS-1241ZJ', msrp: 35.00, reason: 'Drop ceiling' }
        ],
        laborHours: 1.25,
        complexity: 'Low'
    },
    {
        manufacturer: 'Hikvision',
        model: 'DS-2CD2T47G2-L',
        partNumber: 'DS-2CD2T47G2-L',
        category: 'Equipment',
        subcategory: 'IP Camera - Outdoor Bullet',
        msrp: 425.00,
        unitOfMeasure: 'ea',
        description: '4MP ColorVu outdoor bullet with 24/7 color imaging',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6 Outdoor UV Cable', quantityPerUnit: 200, msrp: 0.55 },
            { type: 'consumable', name: 'RJ45 Cat6 Shielded Connector', quantityPerUnit: 2, msrp: 4.00 },
            { type: 'consumable', name: 'Outdoor Junction Box', quantityPerUnit: 1, msrp: 35.00 },
            { type: 'consumable', name: 'Silicone Sealant', quantityPerUnit: 0.25, msrp: 8.00 },
            { type: 'consumable', name: 'Stainless Lag Bolts 1/4x2', quantityPerUnit: 4, msrp: 0.65 }
        ],
        accessories: [
            { type: 'optional', name: 'Wall Mount Bracket', manufacturer: 'Hikvision', partNumber: 'DS-1272ZJ-110', msrp: 28.00, reason: 'Wall standoff' }
        ],
        laborHours: 2.0,
        complexity: 'Medium'
    }
];

export const NVR_SYSTEMS: ProductDefinition[] = [
    {
        manufacturer: 'Axis',
        model: 'S1116 Racked',
        partNumber: '0202-004',
        category: 'Equipment',
        subcategory: 'NVR - Enterprise',
        msrp: 4299.00,
        unitOfMeasure: 'ea',
        description: '16-channel NVR with 8TB storage, RAID support',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Patch Cable 3ft', quantityPerUnit: 16, msrp: 8.00 },
            { type: 'consumable', name: 'Rack Screws with Cage Nuts', quantityPerUnit: 8, msrp: 0.75 },
            { type: 'consumable', name: 'Cable Management D-Ring', quantityPerUnit: 2, msrp: 12.00 }
        ],
        accessories: [
            { type: 'required', name: 'UPS Battery Backup 1500VA', manufacturer: 'APC', partNumber: 'SMT1500RM2U', msrp: 895.00, reason: 'Power protection' },
            { type: 'recommended', name: 'Additional 8TB HDD', manufacturer: 'Seagate', partNumber: 'ST8000VE001', msrp: 185.00, reason: 'Extended storage' }
        ],
        laborHours: 3.0,
        complexity: 'Medium'
    },
    {
        manufacturer: 'Hikvision',
        model: 'DS-7616NXI-K2/16P',
        partNumber: 'DS-7616NXI-K2/16P',
        category: 'Equipment',
        subcategory: 'NVR - Commercial',
        msrp: 649.00,
        unitOfMeasure: 'ea',
        description: '16-channel NVR with 16 PoE ports, AcuSense, 4K output',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6 Patch Cable 1ft', quantityPerUnit: 16, msrp: 3.50 },
            { type: 'consumable', name: 'Rack Shelf 2U', quantityPerUnit: 1, msrp: 45.00 },
            { type: 'consumable', name: 'Power Strip Rack Mount', quantityPerUnit: 1, msrp: 35.00 }
        ],
        accessories: [
            { type: 'required', name: 'Surveillance HDD 6TB', manufacturer: 'WD', partNumber: 'WD60PURX', msrp: 155.00, reason: 'Recording storage' },
            { type: 'recommended', name: 'UPS 850VA', manufacturer: 'CyberPower', partNumber: 'CP850PFCLCD', msrp: 159.00, reason: 'Power backup' }
        ],
        laborHours: 2.5,
        complexity: 'Medium'
    }
];

// =============================================================================
// ACCESS CONTROL PRODUCTS
// =============================================================================

export const ACCESS_READERS: ProductDefinition[] = [
    {
        manufacturer: 'HID',
        model: 'Signo 40',
        partNumber: '40TKS-02-000000',
        category: 'Equipment',
        subcategory: 'Access Reader - Contactless',
        msrp: 425.00,
        unitOfMeasure: 'ea',
        description: 'Signo reader with keypad, OSDP, mobile credentials',
        installationRequirements: [
            { type: 'consumable', name: '6-Conductor 18AWG Cable', quantityPerUnit: 50, msrp: 0.85, notes: 'Per foot for Wiegand' },
            { type: 'consumable', name: 'Cable Labels', quantityPerUnit: 4, msrp: 0.15 },
            { type: 'consumable', name: 'Junction Box Single Gang', quantityPerUnit: 1, msrp: 4.50 },
            { type: 'consumable', name: 'Tapcon 1/4x1-1/4', quantityPerUnit: 4, msrp: 0.30 }
        ],
        accessories: [
            { type: 'optional', name: 'Metal Spacer Plate', manufacturer: 'HID', partNumber: 'SPACER-HID', msrp: 15.00, reason: 'Metal door optimization' }
        ],
        laborHours: 2.0,
        complexity: 'Medium'
    },
    {
        manufacturer: 'HID',
        model: 'Signo 20',
        partNumber: '20TKS-02-000000',
        category: 'Equipment',
        subcategory: 'Access Reader - Contactless',
        msrp: 285.00,
        unitOfMeasure: 'ea',
        description: 'Signo reader, OSDP, iCLASS SE, mobile ready',
        installationRequirements: [
            { type: 'consumable', name: '6-Conductor 18AWG Cable', quantityPerUnit: 50, msrp: 0.85 },
            { type: 'consumable', name: 'Cable Labels', quantityPerUnit: 4, msrp: 0.15 },
            { type: 'consumable', name: 'Junction Box Single Gang', quantityPerUnit: 1, msrp: 4.50 },
            { type: 'consumable', name: 'Drywall Anchors', quantityPerUnit: 4, msrp: 0.20 }
        ],
        accessories: [],
        laborHours: 1.75,
        complexity: 'Medium'
    }
];

export const DOOR_HARDWARE: ProductDefinition[] = [
    {
        manufacturer: 'HES',
        model: '1006CLB-12/24D-630',
        partNumber: '1006CLB-12/24D-630',
        category: 'Equipment',
        subcategory: 'Electric Strike - Fail Secure',
        msrp: 195.00,
        unitOfMeasure: 'ea',
        description: 'Electric strike, fail-secure, 12/24VDC, stainless',
        installationRequirements: [
            { type: 'consumable', name: '18/2 Plenum Power Cable', quantityPerUnit: 75, msrp: 0.45 },
            { type: 'consumable', name: 'Strike Shim Kit', quantityPerUnit: 1, msrp: 12.00 },
            { type: 'consumable', name: 'Door Frame Prep Template', quantityPerUnit: 1, msrp: 0, notes: 'Included' }
        ],
        accessories: [
            { type: 'recommended', name: 'Faceplate Option Pack', manufacturer: 'HES', partNumber: 'FP-100', msrp: 25.00, reason: 'Various door preps' }
        ],
        laborHours: 3.0,
        complexity: 'High'
    },
    {
        manufacturer: 'Securitron',
        model: 'M62',
        partNumber: 'M62',
        category: 'Equipment',
        subcategory: 'Magnetic Lock - 1200lb',
        msrp: 285.00,
        unitOfMeasure: 'ea',
        description: '1200lb magnetic lock, 12/24VDC, with bond sensor',
        installationRequirements: [
            { type: 'consumable', name: '18/4 Plenum Cable', quantityPerUnit: 75, msrp: 0.55 },
            { type: 'consumable', name: 'Z-Bracket Kit', quantityPerUnit: 1, msrp: 45.00 },
            { type: 'consumable', name: 'Power Transfer Hinge', quantityPerUnit: 1, msrp: 125.00 },
            { type: 'consumable', name: 'Lag Bolts 1/4x3', quantityPerUnit: 6, msrp: 0.75 }
        ],
        accessories: [
            { type: 'required', name: 'L-Bracket', manufacturer: 'Securitron', partNumber: 'M-LBK', msrp: 35.00, reason: 'Outswing door' }
        ],
        laborHours: 3.5,
        complexity: 'High'
    },
    {
        manufacturer: 'Seco-Larm',
        model: 'SD-995C-D1Q',
        partNumber: 'SD-995C-D1Q',
        category: 'Equipment',
        subcategory: 'Request to Exit - PIR',
        msrp: 55.00,
        unitOfMeasure: 'ea',
        description: 'PIR request-to-exit sensor, adjustable timing',
        installationRequirements: [
            { type: 'consumable', name: '22/4 Cable', quantityPerUnit: 25, msrp: 0.25 },
            { type: 'consumable', name: 'Drywall Anchors', quantityPerUnit: 2, msrp: 0.20 }
        ],
        accessories: [],
        laborHours: 0.75,
        complexity: 'Low'
    },
    {
        manufacturer: 'Seco-Larm',
        model: 'SM-226L-3Q',
        partNumber: 'SM-226L-3Q',
        category: 'Equipment',
        subcategory: 'Door Contact - Surface Mount',
        msrp: 12.00,
        unitOfMeasure: 'ea',
        description: 'Surface mount door contact, N/C, wide gap',
        installationRequirements: [
            { type: 'consumable', name: '22/2 Cable', quantityPerUnit: 25, msrp: 0.20 },
            { type: 'consumable', name: 'Wire Staples', quantityPerUnit: 10, msrp: 0.05 }
        ],
        accessories: [],
        laborHours: 0.5,
        complexity: 'Low'
    }
];

export const ACCESS_PANELS: ProductDefinition[] = [
    {
        manufacturer: 'Mercury',
        model: 'LP1502',
        partNumber: 'LP1502',
        category: 'Equipment',
        subcategory: 'Access Panel - 2 Door',
        msrp: 595.00,
        unitOfMeasure: 'ea',
        description: '2-door intelligent controller, PoE+, OSDP',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6 Cable to Switch', quantityPerUnit: 50, msrp: 0.35 },
            { type: 'consumable', name: 'Wallmount Enclosure', quantityPerUnit: 1, msrp: 85.00 },
            { type: 'consumable', name: 'DIN Rail', quantityPerUnit: 1, msrp: 15.00 },
            { type: 'consumable', name: 'Terminal Blocks', quantityPerUnit: 8, msrp: 2.50 }
        ],
        accessories: [
            { type: 'required', name: 'Power Supply 12VDC 5A', manufacturer: 'Altronix', partNumber: 'AL600ULACM', msrp: 285.00, reason: 'Lock power' },
            { type: 'required', name: 'Battery Backup 12V 7Ah', manufacturer: 'Power Sonic', partNumber: 'PS-1270', msrp: 25.00, reason: 'Backup power' }
        ],
        laborHours: 4.0,
        complexity: 'High'
    }
];

// =============================================================================
// STRUCTURED CABLING PRODUCTS
// =============================================================================

export const CABLING_PRODUCTS: ProductDefinition[] = [
    // CAT6A CABLE
    {
        manufacturer: 'Panduit',
        model: 'PUP6AV04BU-UG',
        partNumber: 'PUP6AV04BU-UG',
        category: 'Material',
        subcategory: 'Cat6A Cable - Plenum',
        msrp: 0.85,
        unitOfMeasure: 'ft',
        description: 'Cat6A UTP plenum cable, blue, 1000ft box',
        installationRequirements: [
            { type: 'consumable', name: 'J-Hook 2" CAT-HP (every 5ft)', quantityPerUnit: 0.2, msrp: 3.50, notes: '1 per 5 feet' },
            { type: 'consumable', name: 'Cable Tie Velcro (every 3ft)', quantityPerUnit: 0.33, msrp: 0.25 },
            { type: 'consumable', name: 'Cable Labels', quantityPerUnit: 0.01, msrp: 0.15, notes: '2 per run' }
        ],
        accessories: [],
        laborHours: 0.02, // Per foot
        complexity: 'Low'
    },
    {
        manufacturer: 'Belden',
        model: '10GXS12',
        partNumber: '10GXS12-0041000',
        category: 'Material',
        subcategory: 'Cat6A Cable - Plenum',
        msrp: 0.95,
        unitOfMeasure: 'ft',
        description: 'Cat6A F/UTP plenum cable, blue, 1000ft reel',
        installationRequirements: [
            { type: 'consumable', name: 'J-Hook 2" CAT-HP (every 5ft)', quantityPerUnit: 0.2, msrp: 3.50 },
            { type: 'consumable', name: 'Velcro Strap (every 3ft)', quantityPerUnit: 0.33, msrp: 0.25 }
        ],
        accessories: [],
        laborHours: 0.02,
        complexity: 'Low'
    },
    // PATCH PANELS
    {
        manufacturer: 'Leviton',
        model: '6A586-U24',
        partNumber: '6A586-U24',
        category: 'Equipment',
        subcategory: 'Patch Panel - Cat6A 24-Port',
        msrp: 533.99,
        unitOfMeasure: 'ea',
        description: 'Cat6A+ 24-port patch panel with cable management bar',
        installationRequirements: [
            { type: 'consumable', name: 'Cage Nuts and Screws', quantityPerUnit: 8, msrp: 0.50 },
            { type: 'consumable', name: 'Horizontal Cable Manager 1U', quantityPerUnit: 1, msrp: 45.00 },
            { type: 'consumable', name: 'Panel Labels', quantityPerUnit: 24, msrp: 0.10 }
        ],
        accessories: [],
        laborHours: 1.5,
        complexity: 'Medium'
    },
    {
        manufacturer: 'Leviton',
        model: '6A586-U48',
        partNumber: '6A586-U48',
        category: 'Equipment',
        subcategory: 'Patch Panel - Cat6A 48-Port',
        msrp: 744.42,
        unitOfMeasure: 'ea',
        description: 'Cat6A+ 48-port patch panel with cable management',
        installationRequirements: [
            { type: 'consumable', name: 'Cage Nuts and Screws', quantityPerUnit: 12, msrp: 0.50 },
            { type: 'consumable', name: 'Horizontal Cable Manager 2U', quantityPerUnit: 1, msrp: 65.00 },
            { type: 'consumable', name: 'Panel Labels', quantityPerUnit: 48, msrp: 0.10 }
        ],
        accessories: [],
        laborHours: 2.5,
        complexity: 'Medium'
    },
    // KEYSTONE JACKS
    {
        manufacturer: 'Leviton',
        model: 'eXtreme Cat6A Jack',
        partNumber: '6110G-RW6',
        category: 'Material',
        subcategory: 'Keystone Jack - Cat6A',
        msrp: 13.50,
        unitOfMeasure: 'ea',
        description: 'eXtreme Cat6A QuickPort jack, white',
        installationRequirements: [
            { type: 'consumable', name: 'Punchdown Blade 110', quantityPerUnit: 0.1, msrp: 5.00, notes: 'Blade life ~10 jacks' }
        ],
        accessories: [],
        laborHours: 0.15, // 9 minutes per jack
        complexity: 'Low'
    },
    // FACEPLATES
    {
        manufacturer: 'Leviton',
        model: 'QuickPort 2-Port',
        partNumber: '41080-2WP',
        category: 'Material',
        subcategory: 'Faceplate - 2 Port',
        msrp: 3.25,
        unitOfMeasure: 'ea',
        description: 'QuickPort 2-port faceplate, white',
        installationRequirements: [
            { type: 'consumable', name: 'Low Voltage Mounting Bracket', quantityPerUnit: 1, msrp: 1.50 }
        ],
        accessories: [],
        laborHours: 0.1,
        complexity: 'Low'
    }
];

// =============================================================================
// PATHWAY & SUPPORT PRODUCTS
// =============================================================================

export const PATHWAY_PRODUCTS: ProductDefinition[] = [
    {
        manufacturer: 'nVent CADDY',
        model: 'CAT HP J-Hook 2"',
        partNumber: 'CAT21HP',
        category: 'Material',
        subcategory: 'J-Hook - Cat6A Rated',
        msrp: 3.85,
        unitOfMeasure: 'ea',
        description: '2" J-hook with 3" bend radius for Cat6A',
        installationRequirements: [
            { type: 'consumable', name: 'Beam Clamp or Threaded Rod', quantityPerUnit: 1, msrp: 2.50 }
        ],
        accessories: [],
        laborHours: 0.1,
        complexity: 'Low'
    },
    {
        manufacturer: 'nVent CADDY',
        model: 'CAT HP J-Hook 4"',
        partNumber: 'CAT41HP',
        category: 'Material',
        subcategory: 'J-Hook - Cat6A Rated',
        msrp: 5.25,
        unitOfMeasure: 'ea',
        description: '4" J-hook with 3" bend radius for Cat6A, high capacity',
        installationRequirements: [
            { type: 'consumable', name: 'Beam Clamp or Threaded Rod', quantityPerUnit: 1, msrp: 2.50 }
        ],
        accessories: [],
        laborHours: 0.1,
        complexity: 'Low'
    },
    {
        manufacturer: 'B-Line',
        model: 'Bridle Ring 2"',
        partNumber: 'BR-20-4W',
        category: 'Material',
        subcategory: 'Bridle Ring',
        msrp: 1.85,
        unitOfMeasure: 'ea',
        description: '2" bridle ring for cable support',
        installationRequirements: [
            { type: 'consumable', name: 'Toggle Bolt or Beam Clip', quantityPerUnit: 1, msrp: 1.25 }
        ],
        accessories: [],
        laborHours: 0.08,
        complexity: 'Low'
    }
];

// =============================================================================
// INSTALLATION CONSUMABLES - ALWAYS INCLUDE
// =============================================================================

export const CONSUMABLES_KIT: ProductDefinition = {
    manufacturer: '3D TSI',
    model: 'Standard Consumables Kit',
    partNumber: '3DTSI-CONSUMABLES',
    category: 'Material',
    subcategory: 'Installation Consumables',
    msrp: 0, // Calculated
    unitOfMeasure: 'kit',
    description: 'Standard installation consumables package',
    installationRequirements: [],
    accessories: [],
    laborHours: 0,
    complexity: 'Low'
};

export const STANDARD_CONSUMABLES = [
    { name: 'Cable Ties 8" Black (bag of 100)', partNumber: 'CT-8-100', msrp: 8.50, perProject: true },
    { name: 'Velcro Cable Straps 6" (25 pack)', partNumber: 'VCS-6-25', msrp: 15.00, perProject: true },
    { name: 'Cable Labels (roll of 100)', partNumber: 'CL-100', msrp: 12.00, perProject: true },
    { name: 'Tapcon Anchors 1/4x1-3/4 (box of 100)', partNumber: 'TA-1434-100', msrp: 35.00, perCameraSet: 6 },
    { name: 'Drywall Anchors Assorted (kit)', partNumber: 'DA-KIT', msrp: 18.00, perProject: true },
    { name: 'Wire Nuts Assorted (bag of 50)', partNumber: 'WN-50', msrp: 8.00, perProject: true },
    { name: 'Electrical Tape 3/4" (3 pack)', partNumber: 'ET-34-3', msrp: 12.00, perProject: true },
    { name: 'Silicone Sealant Clear (tube)', partNumber: 'SS-CLR', msrp: 8.50, perOutdoorCamera: 1 },
    { name: 'Split Loom Tubing 1" (10ft)', partNumber: 'SL-1-10', msrp: 15.00, perProject: true },
    { name: 'Heat Shrink Assortment Kit', partNumber: 'HS-KIT', msrp: 22.00, perProject: true }
];

// =============================================================================
// CABLE CALCULATION STANDARDS
// =============================================================================

export const CABLE_STANDARDS: CableCalculation = {
    cableType: 'Cat6A',
    perCameraFeet: 150,    // Average cable run per camera
    perDoorFeet: 200,      // Average cable run per access door (reader + lock + sensors)
    perDropFeet: 100,      // Average cable run per network drop
    jHookSpacingFeet: 5,   // J-hooks every 5 feet per TIA-569
    pullBoxIntervalFeet: 100, // Pull box every 100 feet for long runs
    wasteFactorPercent: 15 // 15% waste factor for terminations and pulls
};

// =============================================================================
// LABOR HOUR CALCULATIONS
// =============================================================================

export const LABOR_STANDARDS = {
    // CCTV
    indoorDomeCamera: 1.5,
    outdoorDomeCamera: 2.5,
    ptzCamera: 4.0,
    bulletCamera: 2.0,
    nvrRackMount: 3.0,
    nvrDesktop: 1.5,

    // Access Control
    readerInstall: 2.0,
    electricStrike: 3.0,
    magLock: 3.5,
    controlPanel: 4.0,
    doorContact: 0.5,
    rexSensor: 0.75,

    // Cabling
    cablePullPerRun: 0.5,    // Base time per cable run
    cablePullPer50Ft: 0.25,  // Additional time per 50 feet
    terminationPerEnd: 0.15, // Time per termination
    patchPanelPer24: 1.5,    // Time per 24-port panel install

    // Pathway
    jHookInstall: 0.1,       // Per J-hook
    ladderRackPer10Ft: 0.5,  // Per 10 feet of ladder rack
    conduitPer10Ft: 0.75     // Per 10 feet of conduit
};

// =============================================================================
// CALCULATION FUNCTIONS
// =============================================================================

export function calculateCableRequirements(
    cameras: number,
    doors: number,
    drops: number,
    averageRunFeet: number = 150
): {
    totalCableFeet: number;
    jHooksNeeded: number;
    terminationsNeeded: number;
    consumablesCost: number;
} {
    const totalRuns = cameras + doors + drops;
    const rawCableFeet = totalRuns * averageRunFeet;
    const totalCableFeet = Math.ceil(rawCableFeet * (1 + CABLE_STANDARDS.wasteFactorPercent / 100));

    const jHooksNeeded = Math.ceil(totalCableFeet / CABLE_STANDARDS.jHookSpacingFeet);
    const terminationsNeeded = totalRuns * 2; // Both ends

    const consumablesCost = calculateConsumablesCost(cameras, doors, drops);

    return {
        totalCableFeet,
        jHooksNeeded,
        terminationsNeeded,
        consumablesCost
    };
}

export function calculateConsumablesCost(
    cameras: number,
    doors: number,
    drops: number
): number {
    const outdoorCameras = Math.ceil(cameras * 0.3); // Assume 30% outdoor

    let cost = 0;

    // Per-project items
    cost += 8.50;  // Cable ties
    cost += 15.00; // Velcro straps
    cost += 12.00; // Labels
    cost += 18.00; // Drywall anchors
    cost += 8.00;  // Wire nuts
    cost += 12.00; // Electrical tape
    cost += 15.00; // Split loom
    cost += 22.00; // Heat shrink

    // Per-camera items
    cost += Math.ceil(cameras / 6) * 35.00; // Tapcon anchors per 6 cameras
    cost += outdoorCameras * 8.50;          // Silicone per outdoor camera

    return cost;
}

export function calculateLaborHours(
    indoorCameras: number,
    outdoorCameras: number,
    ptzCameras: number,
    doors: number,
    cableRuns: number,
    averageRunFeet: number = 150
): number {
    let hours = 0;

    // Camera installation
    hours += indoorCameras * LABOR_STANDARDS.indoorDomeCamera;
    hours += outdoorCameras * LABOR_STANDARDS.outdoorDomeCamera;
    hours += ptzCameras * LABOR_STANDARDS.ptzCamera;

    // Door hardware (reader + strike/maglock + REX + contact)
    hours += doors * (LABOR_STANDARDS.readerInstall +
        LABOR_STANDARDS.electricStrike +
        LABOR_STANDARDS.rexSensor +
        LABOR_STANDARDS.doorContact);

    // Cabling
    const totalRunFeet = cableRuns * averageRunFeet;
    hours += cableRuns * LABOR_STANDARDS.cablePullPerRun;
    hours += (totalRunFeet / 50) * LABOR_STANDARDS.cablePullPer50Ft;
    hours += (cableRuns * 2) * LABOR_STANDARDS.terminationPerEnd;

    // J-hooks
    const jHooks = Math.ceil(totalRunFeet / CABLE_STANDARDS.jHookSpacingFeet);
    hours += jHooks * LABOR_STANDARDS.jHookInstall;

    return Math.ceil(hours * 10) / 10; // Round to nearest 0.1
}

// =============================================================================
// PRODUCT LOOKUP HELPERS
// =============================================================================

export function findProduct(manufacturer: string, model: string): ProductDefinition | undefined {
    const allProducts = [
        ...CCTV_CAMERAS,
        ...NVR_SYSTEMS,
        ...ACCESS_READERS,
        ...DOOR_HARDWARE,
        ...ACCESS_PANELS,
        ...CABLING_PRODUCTS,
        ...PATHWAY_PRODUCTS
    ];

    return allProducts.find(p =>
        p.manufacturer.toLowerCase() === manufacturer.toLowerCase() &&
        p.model.toLowerCase().includes(model.toLowerCase())
    );
}

export function getInstallationMaterials(product: ProductDefinition, quantity: number = 1): {
    materials: { name: string; quantity: number; unitCost: number; totalCost: number }[];
    totalMaterialCost: number;
} {
    const materials = product.installationRequirements
        .filter(r => r.type === 'consumable')
        .map(r => ({
            name: r.name,
            quantity: Math.ceil(r.quantityPerUnit * quantity),
            unitCost: r.msrp || 0,
            totalCost: Math.ceil(r.quantityPerUnit * quantity) * (r.msrp || 0)
        }));

    const totalMaterialCost = materials.reduce((sum, m) => sum + m.totalCost, 0);

    return { materials, totalMaterialCost };
}

export function getRequiredAccessories(product: ProductDefinition): AccessoryRequirement[] {
    return product.accessories.filter(a => a.type === 'required');
}

export function getRecommendedAccessories(product: ProductDefinition): AccessoryRequirement[] {
    return product.accessories.filter(a => a.type === 'recommended' || a.type === 'optional');
}

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
        msrp: 529.00,
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
        msrp: 18.45,
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
        msrp: 5.86,
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
// CONSUMABLE PRODUCTS — Full ProductDefinition[] for pricing validator matching
// These mirror STANDARD_CONSUMABLES but as proper ProductDefinitions so the
// pricing validator recognizes them at 100% confidence.
// =============================================================================

export const CONSUMABLE_PRODUCTS: ProductDefinition[] = [
    {
        manufacturer: 'Panduit',
        model: 'Cable Ties 8" Black (bag of 100)',
        partNumber: 'PLT2S-M0',
        category: 'Material',
        subcategory: 'Cable Management',
        msrp: 8.50,
        unitOfMeasure: 'ea',
        description: '8" nylon cable ties, 50lb tensile, 100/bag',
        installationRequirements: [],
        accessories: [],
        laborHours: 0,
        complexity: 'Low'
    },
    {
        manufacturer: 'Velcro',
        model: 'ONE-WRAP Thin Ties (25 pack)',
        partNumber: '95172',
        category: 'Material',
        subcategory: 'Cable Management',
        msrp: 15.00,
        unitOfMeasure: 'ea',
        description: 'Reusable hook-and-loop cable straps, 8" x 1/2", 25/pack',
        installationRequirements: [],
        accessories: [],
        laborHours: 0,
        complexity: 'Low'
    },
    {
        manufacturer: 'Brady',
        model: 'Cable Labels (roll of 100)',
        partNumber: 'M21-500-499',
        category: 'Material',
        subcategory: 'Labeling',
        msrp: 12.00,
        unitOfMeasure: 'ea',
        description: 'Self-laminating vinyl cable labels, roll of 100',
        installationRequirements: [],
        accessories: [],
        laborHours: 0,
        complexity: 'Low'
    },
    {
        manufacturer: 'Tapcon',
        model: 'Concrete Anchors 1/4x1-3/4 (box of 100)',
        partNumber: '24355',
        category: 'Material',
        subcategory: 'Fasteners',
        msrp: 35.00,
        unitOfMeasure: 'ea',
        description: '1/4" x 1-3/4" hex-head concrete anchors, 100/box',
        installationRequirements: [],
        accessories: [],
        laborHours: 0,
        complexity: 'Low'
    },
    {
        manufacturer: 'Toggler',
        model: 'Drywall Anchors Assorted (kit)',
        partNumber: 'DA-KIT',
        category: 'Material',
        subcategory: 'Fasteners',
        msrp: 18.00,
        unitOfMeasure: 'ea',
        description: 'Assorted drywall anchors kit for mounting',
        installationRequirements: [],
        accessories: [],
        laborHours: 0,
        complexity: 'Low'
    },
    {
        manufacturer: 'Ideal',
        model: 'Wire Nuts Assorted (bag of 50)',
        partNumber: '30-072',
        category: 'Material',
        subcategory: 'Electrical',
        msrp: 8.00,
        unitOfMeasure: 'ea',
        description: 'Assorted wire connectors, 50/bag',
        installationRequirements: [],
        accessories: [],
        laborHours: 0,
        complexity: 'Low'
    },
    {
        manufacturer: '3M',
        model: 'Electrical Tape 3/4" (3 pack)',
        partNumber: '6132-BA-10',
        category: 'Material',
        subcategory: 'Electrical',
        msrp: 12.00,
        unitOfMeasure: 'ea',
        description: 'Scotch Super 33+ vinyl electrical tape, 3/4" x 66ft, 3-pack',
        installationRequirements: [],
        accessories: [],
        laborHours: 0,
        complexity: 'Low'
    },
    {
        manufacturer: 'DAP',
        model: 'Silicone Sealant Clear (tube)',
        partNumber: '08641',
        category: 'Material',
        subcategory: 'Sealants',
        msrp: 8.50,
        unitOfMeasure: 'ea',
        description: 'Clear 100% silicone sealant for outdoor camera entries, 10.1oz',
        installationRequirements: [],
        accessories: [],
        laborHours: 0,
        complexity: 'Low'
    },
    {
        manufacturer: 'Panduit',
        model: 'Split Loom Tubing 1" (10ft)',
        partNumber: 'CLT100F-X20',
        category: 'Material',
        subcategory: 'Cable Protection',
        msrp: 15.00,
        unitOfMeasure: 'ea',
        description: 'Corrugated split loom tubing 1" ID, 10ft section',
        installationRequirements: [],
        accessories: [],
        laborHours: 0,
        complexity: 'Low'
    },
    {
        manufacturer: 'Qualtek',
        model: 'Heat Shrink Assortment Kit',
        partNumber: 'Q2-KIT',
        category: 'Material',
        subcategory: 'Electrical',
        msrp: 22.00,
        unitOfMeasure: 'ea',
        description: 'Assorted heat shrink tubing kit, multiple sizes',
        installationRequirements: [],
        accessories: [],
        laborHours: 0,
        complexity: 'Low'
    },
    {
        manufacturer: '3M',
        model: 'Fire Barrier Sealant CP 25WB+',
        partNumber: 'CP-25WB-PLUS',
        category: 'Material',
        subcategory: 'Firestop',
        msrp: 19.79,
        unitOfMeasure: 'ea',
        description: 'Intumescent firestop sealant, 10.1oz cartridge, up to 4-hour rating',
        installationRequirements: [],
        accessories: [],
        laborHours: 0.25,
        complexity: 'Low'
    },
];

// =============================================================================
// CAMERA MOUNT PRODUCTS — Standalone entries for pricing validator matching
// =============================================================================

export const CAMERA_MOUNT_PRODUCTS: ProductDefinition[] = [
    {
        manufacturer: 'Axis',
        model: 'Recessed Mount T94K01L',
        partNumber: 'T94K01L',
        category: 'Material',
        subcategory: 'Camera Mount - Recessed',
        msrp: 89.00,
        unitOfMeasure: 'ea',
        description: 'Indoor recessed ceiling mount for Axis dome cameras (drop ceiling)',
        installationRequirements: [],
        accessories: [],
        laborHours: 0.5,
        complexity: 'Low'
    },
    {
        manufacturer: 'Axis',
        model: 'Pendant Kit T94A01D',
        partNumber: 'T94A01D',
        category: 'Material',
        subcategory: 'Camera Mount - Pendant',
        msrp: 59.00,
        unitOfMeasure: 'ea',
        description: 'Pendant mount kit for Axis dome cameras (exposed ceiling)',
        installationRequirements: [],
        accessories: [],
        laborHours: 0.5,
        complexity: 'Low'
    },
    {
        manufacturer: 'Axis',
        model: 'Wall Mount Bracket T91L61',
        partNumber: 'T91L61',
        category: 'Material',
        subcategory: 'Camera Mount - Wall',
        msrp: 119.00,
        unitOfMeasure: 'ea',
        description: 'Wall and pole mount for Axis PTZ/dome cameras, IP66, replaces T91B61',
        installationRequirements: [],
        accessories: [],
        laborHours: 0.75,
        complexity: 'Low'
    },
    {
        manufacturer: 'Axis',
        model: 'Corner Mount Bracket T94N01G',
        partNumber: 'T94N01G',
        category: 'Material',
        subcategory: 'Camera Mount - Corner/Pole',
        msrp: 95.00,
        unitOfMeasure: 'ea',
        description: 'Corner/pole mount adapter for Axis outdoor cameras',
        installationRequirements: [],
        accessories: [],
        laborHours: 0.75,
        complexity: 'Low'
    },
    {
        manufacturer: 'Axis',
        model: 'Wall Bracket T91B61',
        partNumber: '5504-621',
        category: 'Material',
        subcategory: 'Camera Mount - Wall',
        msrp: 45.00,
        unitOfMeasure: 'ea',
        description: 'Stainless steel wall bracket for Axis bullet/fixed cameras',
        installationRequirements: [],
        accessories: [],
        laborHours: 0.5,
        complexity: 'Low'
    },
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
    wasteFactorPercent: 10 // 10% waste factor for terminations and pulls (matches prompt rule)
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
    conduitPer10Ft: 0.75,    // Per 10 feet of conduit

    // AV Systems
    displayMount: 2.0,       // Per display (wall mount)
    dspInstall: 2.5,         // Per DSP unit
    amplifierInstall: 1.5,   // Per amplifier
    speakerInstall: 1.0,     // Per speaker (ceiling)
    encoderDecoder: 1.5,     // Per encoder/decoder
    controlProcessor: 3.0,   // Per control processor
    microphoneInstall: 0.75, // Per microphone

    // Intrusion Detection
    motionDetector: 0.5,     // Per detector
    glassBreak: 0.5,         // Per glass break sensor
    intrusionPanel: 3.0,     // Per panel
    keypad: 1.0,             // Per keypad
    siren: 0.75,             // Per siren

    // Fire Alarm
    smokeDetector: 0.5,      // Per detector
    heatDetector: 0.5,       // Per detector
    pullStation: 0.75,       // Per station
    hornStrobe: 0.75,        // Per notification appliance
    firePanel: 4.0,          // Per FACP
};

// =============================================================================
// AV SYSTEM PRODUCTS
// =============================================================================

export const AV_PRODUCTS: ProductDefinition[] = [
    {
        manufacturer: 'Crestron',
        model: 'DM-NVX-363',
        partNumber: 'DM-NVX-363',
        category: 'Equipment',
        subcategory: 'AV over IP - Encoder/Decoder',
        msrp: 2495.00,
        unitOfMeasure: 'ea',
        description: '4K60 4:4:4 HDR encoder/decoder with Dante audio',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Cable', quantityPerUnit: 100, msrp: 0.45 },
            { type: 'consumable', name: 'HDMI 2.0 Cable 6ft', quantityPerUnit: 1, msrp: 15.00 },
            { type: 'consumable', name: 'Rack Ears', quantityPerUnit: 1, msrp: 25.00 },
            { type: 'consumable', name: 'Cage Nuts', quantityPerUnit: 4, msrp: 0.50 }
        ],
        accessories: [
            { type: 'required', name: 'PoE Switch Port', manufacturer: 'Network', partNumber: 'N/A', msrp: 0, reason: 'Requires PoE+ switch port' }
        ],
        laborHours: 1.5,
        complexity: 'Medium'
    },
    {
        manufacturer: 'Crestron',
        model: 'DM-NVX-E30',
        partNumber: 'DM-NVX-E30',
        category: 'Equipment',
        subcategory: 'AV over IP - Encoder',
        msrp: 1295.00,
        unitOfMeasure: 'ea',
        description: '4K60 4:2:0 encoder with USB routing',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Cable', quantityPerUnit: 100, msrp: 0.45 },
            { type: 'consumable', name: 'HDMI Cable 6ft', quantityPerUnit: 1, msrp: 12.00 },
            { type: 'consumable', name: 'Rack Ears', quantityPerUnit: 1, msrp: 25.00 }
        ],
        accessories: [],
        laborHours: 1.5,
        complexity: 'Medium'
    },
    {
        manufacturer: 'Crestron',
        model: 'CP4-R',
        partNumber: 'CP4-R',
        category: 'Equipment',
        subcategory: 'AV Control Processor',
        msrp: 3995.00,
        unitOfMeasure: 'ea',
        description: '4-Series rack mount control system processor',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Cable', quantityPerUnit: 50, msrp: 0.45 },
            { type: 'consumable', name: 'Cage Nuts and Screws', quantityPerUnit: 4, msrp: 0.50 }
        ],
        accessories: [],
        laborHours: 3.0,
        complexity: 'High'
    },
    {
        manufacturer: 'Biamp',
        model: 'TesiraFORTÉ AI',
        partNumber: 'TESIRA-FORTE-AI',
        category: 'Equipment',
        subcategory: 'DSP - Audio Processor',
        msrp: 4695.00,
        unitOfMeasure: 'ea',
        description: '12-input DSP with AEC and Dante, 1U rack mount',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Cable', quantityPerUnit: 50, msrp: 0.45 },
            { type: 'consumable', name: 'XLR Cable 25ft', quantityPerUnit: 4, msrp: 18.00 },
            { type: 'consumable', name: 'Cage Nuts and Screws', quantityPerUnit: 4, msrp: 0.50 }
        ],
        accessories: [],
        laborHours: 2.5,
        complexity: 'High'
    },
    {
        manufacturer: 'Biamp',
        model: 'TesiraFORTÉ DAN',
        partNumber: 'TESIRA-FORTE-DAN',
        category: 'Equipment',
        subcategory: 'DSP - Dante Audio Processor',
        msrp: 3295.00,
        unitOfMeasure: 'ea',
        description: 'Dante-enabled DSP, 1U rack mount',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Cable', quantityPerUnit: 50, msrp: 0.45 },
            { type: 'consumable', name: 'Cage Nuts', quantityPerUnit: 4, msrp: 0.50 }
        ],
        accessories: [],
        laborHours: 2.5,
        complexity: 'High'
    },
    {
        manufacturer: 'Samsung',
        model: 'QM55C',
        partNumber: 'LH55QMCEBGCXGO',
        category: 'Equipment',
        subcategory: 'Commercial Display - 55"',
        msrp: 1299.00,
        unitOfMeasure: 'ea',
        description: '55" 4K UHD commercial display, 500 nit, 24/7 rated',
        installationRequirements: [
            { type: 'consumable', name: 'Tilting Wall Mount', quantityPerUnit: 1, msrp: 85.00 },
            { type: 'consumable', name: 'HDMI Cable 15ft', quantityPerUnit: 1, msrp: 18.00 },
            { type: 'consumable', name: 'Toggle Bolts 1/4x3', quantityPerUnit: 4, msrp: 1.25 },
            { type: 'consumable', name: 'Power Cord 10ft', quantityPerUnit: 1, msrp: 8.00 }
        ],
        accessories: [
            { type: 'recommended', name: 'Media Player', manufacturer: 'Samsung', partNumber: 'SBB-SS08', msrp: 295.00, reason: 'Signage content playback' }
        ],
        laborHours: 2.0,
        complexity: 'Medium'
    },
    {
        manufacturer: 'Samsung',
        model: 'QM75C',
        partNumber: 'LH75QMCEBGCXGO',
        category: 'Equipment',
        subcategory: 'Commercial Display - 75"',
        msrp: 2199.00,
        unitOfMeasure: 'ea',
        description: '75" 4K UHD commercial display, 500 nit, 24/7 rated',
        installationRequirements: [
            { type: 'consumable', name: 'Heavy Duty Wall Mount', quantityPerUnit: 1, msrp: 145.00 },
            { type: 'consumable', name: 'HDMI Cable 15ft', quantityPerUnit: 1, msrp: 18.00 },
            { type: 'consumable', name: 'Structural Toggle Bolts', quantityPerUnit: 6, msrp: 2.50 },
            { type: 'consumable', name: 'Power Cord 10ft', quantityPerUnit: 1, msrp: 8.00 }
        ],
        accessories: [],
        laborHours: 2.5,
        complexity: 'Medium'
    },
    {
        manufacturer: 'Atlas Sound',
        model: 'FAP63T-W',
        partNumber: 'FAP63T-W',
        category: 'Equipment',
        subcategory: 'Ceiling Speaker - 70V',
        msrp: 189.00,
        unitOfMeasure: 'ea',
        description: '6" 2-way ceiling speaker, 70V/100V, white',
        installationRequirements: [
            { type: 'consumable', name: '16/2 Plenum Speaker Wire', quantityPerUnit: 75, msrp: 0.35, notes: 'Per foot' },
            { type: 'consumable', name: 'Speaker Wire Nuts', quantityPerUnit: 2, msrp: 0.50 },
            { type: 'consumable', name: 'Ceiling Support Rails', quantityPerUnit: 1, msrp: 8.00 }
        ],
        accessories: [],
        laborHours: 1.0,
        complexity: 'Low'
    },
    {
        manufacturer: 'Atlas Sound',
        model: 'AA240PHD',
        partNumber: 'AA240PHD',
        category: 'Equipment',
        subcategory: 'Amplifier - 240W',
        msrp: 895.00,
        unitOfMeasure: 'ea',
        description: '240W 70V/100V mixer amplifier with PHD',
        installationRequirements: [
            { type: 'consumable', name: 'Rack Ears', quantityPerUnit: 1, msrp: 25.00 },
            { type: 'consumable', name: 'Power Cord', quantityPerUnit: 1, msrp: 8.00 },
            { type: 'consumable', name: 'Speaker Wire 16/2', quantityPerUnit: 100, msrp: 0.35 }
        ],
        accessories: [],
        laborHours: 1.5,
        complexity: 'Medium'
    },
    {
        manufacturer: 'Shure',
        model: 'MXA920-S',
        partNumber: 'MXA920AL-S',
        category: 'Equipment',
        subcategory: 'Ceiling Microphone Array',
        msrp: 3199.00,
        unitOfMeasure: 'ea',
        description: 'Ceiling array microphone, IntelliMix, Dante',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Cable', quantityPerUnit: 75, msrp: 0.45 },
            { type: 'consumable', name: 'Ceiling Tile Rail Kit', quantityPerUnit: 1, msrp: 35.00 },
            { type: 'consumable', name: 'Safety Wire', quantityPerUnit: 1, msrp: 5.00 }
        ],
        accessories: [
            { type: 'required', name: 'PoE Injector', manufacturer: 'Shure', partNumber: 'ANIUSB-MATRIX', msrp: 125.00, reason: 'Required PoE power' }
        ],
        laborHours: 1.5,
        complexity: 'Medium'
    }
];

// =============================================================================
// INTRUSION DETECTION PRODUCTS
// =============================================================================

export const INTRUSION_PANELS: ProductDefinition[] = [
    {
        manufacturer: 'Bosch',
        model: 'B5512',
        partNumber: 'B5512-CP-930',
        category: 'Equipment',
        subcategory: 'Intrusion Panel - 48 Point',
        msrp: 495.00,
        unitOfMeasure: 'ea',
        description: '48-point IP alarm panel with Ethernet',
        installationRequirements: [
            { type: 'consumable', name: 'Metal Enclosure', quantityPerUnit: 1, msrp: 65.00 },
            { type: 'consumable', name: '22/4 Alarm Cable', quantityPerUnit: 200, msrp: 0.20, notes: 'Per foot' },
            { type: 'consumable', name: 'Cat6 Cable to Network', quantityPerUnit: 50, msrp: 0.35 },
            { type: 'consumable', name: 'Terminal Strips', quantityPerUnit: 4, msrp: 3.50 }
        ],
        accessories: [
            { type: 'required', name: 'Transformer 16.5VAC', manufacturer: 'Altronix', partNumber: 'T1656', msrp: 24.00, reason: 'Panel power' },
            { type: 'required', name: 'Battery 12V 7Ah', manufacturer: 'Power Sonic', partNumber: 'PS-1270', msrp: 25.00, reason: 'Backup power' }
        ],
        laborHours: 3.0,
        complexity: 'High'
    },
    {
        manufacturer: 'Bosch',
        model: 'B9512G',
        partNumber: 'B9512G-E',
        category: 'Equipment',
        subcategory: 'Intrusion Panel - 599 Point',
        msrp: 1295.00,
        unitOfMeasure: 'ea',
        description: '599-point enterprise alarm panel, 32 areas',
        installationRequirements: [
            { type: 'consumable', name: 'Large Metal Enclosure', quantityPerUnit: 1, msrp: 95.00 },
            { type: 'consumable', name: '22/4 Alarm Cable', quantityPerUnit: 500, msrp: 0.20 },
            { type: 'consumable', name: 'Cat6 Cable', quantityPerUnit: 75, msrp: 0.35 },
            { type: 'consumable', name: 'Terminal Strips', quantityPerUnit: 8, msrp: 3.50 }
        ],
        accessories: [
            { type: 'required', name: 'Transformer 16.5VAC 40VA', manufacturer: 'Altronix', partNumber: 'T2428', msrp: 32.00, reason: 'Panel power' },
            { type: 'required', name: 'Battery 12V 12Ah', manufacturer: 'Power Sonic', partNumber: 'PS-12120', msrp: 38.00, reason: 'Backup power' }
        ],
        laborHours: 5.0,
        complexity: 'High'
    },
    {
        manufacturer: 'DSC',
        model: 'PowerSeries Neo HS2064',
        partNumber: 'HS2064NKCP01',
        category: 'Equipment',
        subcategory: 'Intrusion Panel - 64 Zone',
        msrp: 285.00,
        unitOfMeasure: 'ea',
        description: '64-zone hybrid panel with IP communicator',
        installationRequirements: [
            { type: 'consumable', name: 'Metal Cabinet', quantityPerUnit: 1, msrp: 45.00 },
            { type: 'consumable', name: '22/4 Alarm Cable', quantityPerUnit: 200, msrp: 0.20 },
            { type: 'consumable', name: 'Cat6 Cable', quantityPerUnit: 50, msrp: 0.35 }
        ],
        accessories: [
            { type: 'required', name: 'Transformer 16.5VAC', manufacturer: 'DSC', partNumber: 'PTD1640U', msrp: 18.00, reason: 'Panel power' },
            { type: 'required', name: 'Battery 12V 7Ah', manufacturer: 'Power Sonic', partNumber: 'PS-1270', msrp: 25.00, reason: 'Backup power' }
        ],
        laborHours: 3.0,
        complexity: 'High'
    }
];

export const INTRUSION_SENSORS: ProductDefinition[] = [
    {
        manufacturer: 'Bosch',
        model: 'ISC-BPR2-W12',
        partNumber: 'ISC-BPR2-W12',
        category: 'Equipment',
        subcategory: 'PIR Motion Detector',
        msrp: 65.00,
        unitOfMeasure: 'ea',
        description: 'Commercial PIR motion detector, 40ft range',
        installationRequirements: [
            { type: 'consumable', name: '22/4 Alarm Cable', quantityPerUnit: 50, msrp: 0.20 },
            { type: 'consumable', name: 'Wire Staples', quantityPerUnit: 10, msrp: 0.05 },
            { type: 'consumable', name: 'Drywall Anchors', quantityPerUnit: 2, msrp: 0.20 }
        ],
        accessories: [],
        laborHours: 0.5,
        complexity: 'Low'
    },
    {
        manufacturer: 'Bosch',
        model: 'DS778Z',
        partNumber: 'DS778Z',
        category: 'Equipment',
        subcategory: 'Dual-Tech Motion Detector',
        msrp: 125.00,
        unitOfMeasure: 'ea',
        description: 'PIR + microwave dual-tech, commercial grade',
        installationRequirements: [
            { type: 'consumable', name: '22/4 Alarm Cable', quantityPerUnit: 50, msrp: 0.20 },
            { type: 'consumable', name: 'Wire Staples', quantityPerUnit: 10, msrp: 0.05 },
            { type: 'consumable', name: 'Drywall Anchors', quantityPerUnit: 2, msrp: 0.20 }
        ],
        accessories: [],
        laborHours: 0.75,
        complexity: 'Low'
    },
    {
        manufacturer: 'Honeywell',
        model: 'FG-1625',
        partNumber: 'FG-1625',
        category: 'Equipment',
        subcategory: 'Glass Break Detector',
        msrp: 75.00,
        unitOfMeasure: 'ea',
        description: 'FlexGuard glass break sensor, 25ft range',
        installationRequirements: [
            { type: 'consumable', name: '22/2 Alarm Cable', quantityPerUnit: 50, msrp: 0.18 },
            { type: 'consumable', name: 'Drywall Anchors', quantityPerUnit: 2, msrp: 0.20 }
        ],
        accessories: [],
        laborHours: 0.5,
        complexity: 'Low'
    },
    {
        manufacturer: 'Honeywell',
        model: '997',
        partNumber: '997',
        category: 'Equipment',
        subcategory: 'Surface Door Contact',
        msrp: 8.50,
        unitOfMeasure: 'ea',
        description: 'Surface mount door contact, N/C, brown',
        installationRequirements: [
            { type: 'consumable', name: '22/2 Alarm Cable', quantityPerUnit: 25, msrp: 0.18 },
            { type: 'consumable', name: 'Wire Staples', quantityPerUnit: 8, msrp: 0.05 }
        ],
        accessories: [],
        laborHours: 0.35,
        complexity: 'Low'
    },
    {
        manufacturer: 'DSC',
        model: 'HS2TCHPRO',
        partNumber: 'HS2TCHPRO',
        category: 'Equipment',
        subcategory: 'Alarm Keypad - Touchscreen',
        msrp: 245.00,
        unitOfMeasure: 'ea',
        description: '7" touchscreen alarm keypad with Prox reader',
        installationRequirements: [
            { type: 'consumable', name: '22/4 Alarm Cable', quantityPerUnit: 50, msrp: 0.20 },
            { type: 'consumable', name: 'Low Voltage Bracket', quantityPerUnit: 1, msrp: 1.50 },
            { type: 'consumable', name: 'Drywall Anchors', quantityPerUnit: 4, msrp: 0.20 }
        ],
        accessories: [],
        laborHours: 1.0,
        complexity: 'Medium'
    },
    {
        manufacturer: 'Wheelock',
        model: 'STR',
        partNumber: 'STR-W',
        category: 'Equipment',
        subcategory: 'Alarm Siren/Strobe',
        msrp: 85.00,
        unitOfMeasure: 'ea',
        description: 'Indoor siren/strobe, 12/24VDC, wall mount',
        installationRequirements: [
            { type: 'consumable', name: '18/2 Cable', quantityPerUnit: 50, msrp: 0.35 },
            { type: 'consumable', name: 'Junction Box', quantityPerUnit: 1, msrp: 4.50 },
            { type: 'consumable', name: 'Drywall Anchors', quantityPerUnit: 2, msrp: 0.20 }
        ],
        accessories: [],
        laborHours: 0.75,
        complexity: 'Low'
    }
];

// =============================================================================
// FIRE ALARM PRODUCTS
// =============================================================================

export const FIRE_ALARM_PRODUCTS: ProductDefinition[] = [
    {
        manufacturer: 'Notifier',
        model: 'NFS2-3030',
        partNumber: 'NFS2-3030',
        category: 'Equipment',
        subcategory: 'Fire Alarm Control Panel',
        msrp: 5895.00,
        unitOfMeasure: 'ea',
        description: 'Intelligent fire alarm control panel, expandable',
        installationRequirements: [
            { type: 'consumable', name: 'FPLP 2-Conductor 14AWG', quantityPerUnit: 500, msrp: 0.65, notes: 'Per foot' },
            { type: 'consumable', name: 'FPLP 4-Conductor 14AWG', quantityPerUnit: 300, msrp: 0.85, notes: 'Per foot - NAC circuits' },
            { type: 'consumable', name: 'Red Junction Box', quantityPerUnit: 10, msrp: 6.50 },
            { type: 'consumable', name: 'Red EMT 3/4"', quantityPerUnit: 100, msrp: 1.25, notes: 'Per foot' }
        ],
        accessories: [
            { type: 'required', name: 'Battery Set 12V 18Ah', manufacturer: 'Power Sonic', partNumber: 'PS-12180', msrp: 65.00, reason: 'Backup power (2 required)' },
            { type: 'required', name: 'Remote Annunciator', manufacturer: 'Notifier', partNumber: 'FDU-80', msrp: 895.00, reason: 'Fire command center' }
        ],
        laborHours: 8.0,
        complexity: 'High'
    },
    {
        manufacturer: 'System Sensor',
        model: 'SPSCW',
        partNumber: 'SPSCW',
        category: 'Equipment',
        subcategory: 'Smoke Detector - Addressable',
        msrp: 95.00,
        unitOfMeasure: 'ea',
        description: 'Addressable photoelectric smoke detector, white',
        installationRequirements: [
            { type: 'consumable', name: 'FPLP 2-Conductor Shielded', quantityPerUnit: 75, msrp: 0.65 },
            { type: 'consumable', name: 'Detector Base', quantityPerUnit: 1, msrp: 12.00 },
            { type: 'consumable', name: 'Red Junction Box 4"', quantityPerUnit: 1, msrp: 6.50 }
        ],
        accessories: [],
        laborHours: 0.5,
        complexity: 'Low'
    },
    {
        manufacturer: 'System Sensor',
        model: '5251H',
        partNumber: '5251H',
        category: 'Equipment',
        subcategory: 'Heat Detector - Rate of Rise',
        msrp: 55.00,
        unitOfMeasure: 'ea',
        description: 'Rate of rise/fixed heat detector, 135°F',
        installationRequirements: [
            { type: 'consumable', name: 'FPLP 2-Conductor', quantityPerUnit: 75, msrp: 0.55 },
            { type: 'consumable', name: 'Detector Base', quantityPerUnit: 1, msrp: 8.00 },
            { type: 'consumable', name: 'Red Junction Box 4"', quantityPerUnit: 1, msrp: 6.50 }
        ],
        accessories: [],
        laborHours: 0.5,
        complexity: 'Low'
    },
    {
        manufacturer: 'Notifier',
        model: 'NBG-12LX',
        partNumber: 'NBG-12LX',
        category: 'Equipment',
        subcategory: 'Pull Station - Addressable',
        msrp: 145.00,
        unitOfMeasure: 'ea',
        description: 'Addressable manual pull station, dual action',
        installationRequirements: [
            { type: 'consumable', name: 'FPLP 2-Conductor', quantityPerUnit: 75, msrp: 0.55 },
            { type: 'consumable', name: 'Red Surface Backbox', quantityPerUnit: 1, msrp: 15.00 },
            { type: 'consumable', name: 'Conduit 3/4" EMT', quantityPerUnit: 10, msrp: 1.25 }
        ],
        accessories: [],
        laborHours: 0.75,
        complexity: 'Low'
    },
    {
        manufacturer: 'Gentex',
        model: 'GCS24CW',
        partNumber: 'GCS24CW',
        category: 'Equipment',
        subcategory: 'Horn/Strobe - Ceiling Mount',
        msrp: 85.00,
        unitOfMeasure: 'ea',
        description: 'Ceiling mount horn/strobe, 24VDC, 15/75cd, white',
        installationRequirements: [
            { type: 'consumable', name: 'FPLP 4-Conductor 14AWG', quantityPerUnit: 75, msrp: 0.85 },
            { type: 'consumable', name: 'Red Junction Box 4-11/16"', quantityPerUnit: 1, msrp: 8.50 },
            { type: 'consumable', name: 'Red Conduit 3/4" EMT', quantityPerUnit: 10, msrp: 1.25 }
        ],
        accessories: [],
        laborHours: 0.75,
        complexity: 'Low'
    },
    {
        manufacturer: 'Gentex',
        model: 'GES24CW',
        partNumber: 'GES24CW',
        category: 'Equipment',
        subcategory: 'Strobe - Wall Mount',
        msrp: 65.00,
        unitOfMeasure: 'ea',
        description: 'Wall mount strobe, 24VDC, 15/75cd, white',
        installationRequirements: [
            { type: 'consumable', name: 'FPLP 4-Conductor 14AWG', quantityPerUnit: 75, msrp: 0.85 },
            { type: 'consumable', name: 'Red Backbox', quantityPerUnit: 1, msrp: 8.00 }
        ],
        accessories: [],
        laborHours: 0.5,
        complexity: 'Low'
    }
];

// =============================================================================
// FIRE ALARM CABLE
// =============================================================================

export const FIRE_ALARM_CABLE: ProductDefinition[] = [
    {
        manufacturer: 'Genesis',
        model: '4502 FPLP 2C 14AWG',
        partNumber: '4502',
        category: 'Material',
        subcategory: 'Fire Alarm Cable - 2 Conductor',
        msrp: 0.55,
        unitOfMeasure: 'ft',
        description: '2-conductor 14AWG shielded plenum fire alarm cable, red',
        installationRequirements: [
            { type: 'consumable', name: 'Fire Alarm Cable Labels (red)', quantityPerUnit: 0.01, msrp: 0.25 },
            { type: 'consumable', name: 'Red EMT 3/4" (per ft)', quantityPerUnit: 0.2, msrp: 1.25, notes: 'Required in some jurisdictions' }
        ],
        accessories: [],
        laborHours: 0.015,
        complexity: 'Low'
    },
    {
        manufacturer: 'Genesis',
        model: '4504 FPLP 4C 14AWG',
        partNumber: '4504',
        category: 'Material',
        subcategory: 'Fire Alarm Cable - 4 Conductor',
        msrp: 0.85,
        unitOfMeasure: 'ft',
        description: '4-conductor 14AWG shielded plenum fire alarm cable, red',
        installationRequirements: [
            { type: 'consumable', name: 'Fire Alarm Cable Labels (red)', quantityPerUnit: 0.01, msrp: 0.25 }
        ],
        accessories: [],
        laborHours: 0.015,
        complexity: 'Low'
    }
];

// =============================================================================
// ADDITIONAL CCTV CAMERAS (VERKADA)
// =============================================================================

export const VERKADA_CAMERAS: ProductDefinition[] = [
    {
        manufacturer: 'Verkada',
        model: 'CD52-E',
        partNumber: 'CD52-E',
        category: 'Equipment',
        subcategory: 'IP Camera - Outdoor Dome (Cloud)',
        msrp: 1299.00,
        unitOfMeasure: 'ea',
        description: '5MP outdoor dome with cloud management, edge storage',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Outdoor Cable', quantityPerUnit: 200, msrp: 0.55 },
            { type: 'consumable', name: 'RJ45 Cat6A Connector', quantityPerUnit: 2, msrp: 3.50 },
            { type: 'consumable', name: 'Weatherproof Junction Box', quantityPerUnit: 1, msrp: 45.00 },
            { type: 'consumable', name: 'Silicone Sealant', quantityPerUnit: 0.25, msrp: 8.00 }
        ],
        accessories: [
            { type: 'required', name: 'Verkada License (annual)', manufacturer: 'Verkada', partNumber: 'LIC-CD52', msrp: 199.00, reason: 'Cloud management license required' }
        ],
        laborHours: 2.0,
        complexity: 'Medium'
    },
    {
        manufacturer: 'Verkada',
        model: 'CD42',
        partNumber: 'CD42',
        category: 'Equipment',
        subcategory: 'IP Camera - Indoor Dome (Cloud)',
        msrp: 899.00,
        unitOfMeasure: 'ea',
        description: '5MP indoor dome with cloud management, AI analytics',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Cable', quantityPerUnit: 150, msrp: 0.45 },
            { type: 'consumable', name: 'RJ45 Cat6A Connector', quantityPerUnit: 2, msrp: 3.50 },
            { type: 'consumable', name: 'Cable Labels', quantityPerUnit: 2, msrp: 0.15 }
        ],
        accessories: [
            { type: 'required', name: 'Verkada License (annual)', manufacturer: 'Verkada', partNumber: 'LIC-CD42', msrp: 199.00, reason: 'Cloud management license required' }
        ],
        laborHours: 1.5,
        complexity: 'Low'
    }
];

// =============================================================================
// BERK-TEK CABLE (Referenced in rules but was absent from DB)
// =============================================================================

export const BERKTEK_CABLE: ProductDefinition[] = [
    {
        manufacturer: 'Berk-Tek',
        model: 'LANmark-10G2',
        partNumber: '11074918',
        category: 'Material',
        subcategory: 'Cat6A Cable - Plenum (Leviton Warranty)',
        msrp: 0.81,
        unitOfMeasure: 'ft',
        description: 'Cat6A UTP plenum cable - REQUIRED for Leviton warranty compliance',
        installationRequirements: [
            { type: 'consumable', name: 'J-Hook 2" CAT-HP (every 5ft)', quantityPerUnit: 0.2, msrp: 3.50 },
            { type: 'consumable', name: 'Velcro Strap (every 3ft)', quantityPerUnit: 0.33, msrp: 0.25 },
            { type: 'consumable', name: 'Cable Labels', quantityPerUnit: 0.01, msrp: 0.15 }
        ],
        accessories: [],
        laborHours: 0.02,
        complexity: 'Low'
    },
    {
        manufacturer: 'Berk-Tek',
        model: 'LANmark-6',
        partNumber: '10032106',
        category: 'Material',
        subcategory: 'Cat6 Cable - Plenum (Leviton Warranty)',
        msrp: 0.42,
        unitOfMeasure: 'ft',
        description: 'Cat6 UTP plenum cable - Leviton warranty compliant',
        installationRequirements: [
            { type: 'consumable', name: 'J-Hook 2" (every 5ft)', quantityPerUnit: 0.2, msrp: 3.25 },
            { type: 'consumable', name: 'Velcro Strap (every 3ft)', quantityPerUnit: 0.33, msrp: 0.25 }
        ],
        accessories: [],
        laborHours: 0.018,
        complexity: 'Low'
    }
];

// =============================================================================
// POE SWITCHES
// =============================================================================

export const POE_SWITCHES: ProductDefinition[] = [
    {
        manufacturer: 'Cisco',
        model: 'CBS350-24FP-4G',
        partNumber: 'CBS350-24FP-4G-NA',
        category: 'Equipment',
        subcategory: 'PoE Switch - 24 Port',
        msrp: 1095.00,
        unitOfMeasure: 'ea',
        description: '24-port PoE+ managed switch, 370W budget, 4x SFP',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Patch Cable 3ft', quantityPerUnit: 24, msrp: 8.00 },
            { type: 'consumable', name: 'Cage Nuts and Screws', quantityPerUnit: 4, msrp: 0.50 },
            { type: 'consumable', name: 'Cable Management 1U', quantityPerUnit: 1, msrp: 35.00 }
        ],
        accessories: [
            { type: 'recommended', name: 'UPS 1500VA Rack', manufacturer: 'APC', partNumber: 'SMT1500RM2U', msrp: 895.00, reason: 'Power protection' }
        ],
        laborHours: 2.0,
        complexity: 'Medium'
    },
    {
        manufacturer: 'Cisco',
        model: 'CBS350-48FP-4G',
        partNumber: 'CBS350-48FP-4G-NA',
        category: 'Equipment',
        subcategory: 'PoE Switch - 48 Port',
        msrp: 1995.00,
        unitOfMeasure: 'ea',
        description: '48-port PoE+ managed switch, 740W budget, 4x SFP',
        installationRequirements: [
            { type: 'consumable', name: 'Cat6A Patch Cable 3ft', quantityPerUnit: 48, msrp: 8.00 },
            { type: 'consumable', name: 'Cage Nuts and Screws', quantityPerUnit: 4, msrp: 0.50 },
            { type: 'consumable', name: 'Cable Management 2U', quantityPerUnit: 1, msrp: 45.00 }
        ],
        accessories: [
            { type: 'recommended', name: 'UPS 2200VA Rack', manufacturer: 'APC', partNumber: 'SMT2200RM2U', msrp: 1295.00, reason: 'Power protection' }
        ],
        laborHours: 2.5,
        complexity: 'Medium'
    }
];

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

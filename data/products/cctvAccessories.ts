import { CompactProduct } from './types';

// ============================================================================
// CCTV ACCESSORIES — Mounts, Housings, Lenses, Illuminators (~250 products)
// ============================================================================

export const CATALOG_CCTV_ACCESSORIES: CompactProduct[] = [
    // ── AXIS — Mounts & Housings ──
    ['Axis', 'T94A01F Ceiling Mount', '5017-641', 'M', 'Camera Mount', 49, 'ea', 'Indoor Fixed Dome Ceiling Mount', 0.25, 'L'],
    ['Axis', 'T94B01P Pendant Kit', '5506-481', 'M', 'Camera Mount', 79, 'ea', 'Indoor/Outdoor Pendant Mount Kit', 0.5, 'L'],
    ['Axis', 'T94F01P Ceiling Mount', '5507-461', 'M', 'Camera Mount', 59, 'ea', 'Pendant Mount Ceiling Plate', 0.25, 'L'],
    ['Axis', 'T91B47 Pole Mount', '5504-711', 'M', 'Camera Mount', 119, 'ea', 'Outdoor Pole Mount Adapter', 0.5, 'M'],
    ['Axis', 'T91A47 Wall Mount', '5017-641', 'M', 'Camera Mount', 99, 'ea', 'Wall Mount Bracket', 0.5, 'L'],
    ['Axis', 'T91B57 Ceiling Mount', '5505-461', 'M', 'Camera Mount', 89, 'ea', 'PTZ Ceiling Mount', 0.5, 'M'],
    ['Axis', 'T91B51 Ceiling Mount', '5505-051', 'M', 'Camera Mount', 129, 'ea', 'PTZ Indoor Ceiling Mount', 0.5, 'M'],
    ['Axis', 'T91B61 Wall Mount', '5505-571', 'M', 'Camera Mount', 149, 'ea', 'PTZ Wall Mount Heavy Duty', 0.5, 'M'],
    ['Axis', 'T91A67 Pole Mount', '5017-671', 'M', 'Camera Mount', 99, 'ea', 'Fixed Camera Pole Mount', 0.5, 'M'],
    ['Axis', 'T93F20 Housing', '5900-271', 'M', 'Camera Housing', 249, 'ea', 'Outdoor Fixed Camera Housing', 0.5, 'M'],
    ['Axis', 'T94T01D Pendant Kit', '01462-001', 'M', 'Camera Mount', 39, 'ea', 'Dome Pendant Kit', 0.25, 'L'],
    ['Axis', 'T91G61 Wall Mount', '01444-001', 'M', 'Camera Mount', 59, 'ea', 'Mini Dome Wall Mount', 0.25, 'L'],
    ['Axis', 'T94S01L Recess Mount', '01460-001', 'M', 'Camera Mount', 49, 'ea', 'Indoor Dome Recessed Mount', 0.5, 'L'],
    // ── AXIS — Power / Accessories ──
    ['Axis', 'T8120 PoE Midspan', '5026-202', 'E', 'PoE Injector', 69, 'ea', '15W PoE Midspan Injector', 0.25, 'L'],
    ['Axis', 'T8133 PoE Midspan', '5900-291', 'E', 'PoE Injector', 89, 'ea', '30W PoE+ Midspan Injector', 0.25, 'L'],
    ['Axis', 'T8134 PoE Midspan', '5900-331', 'E', 'PoE Injector', 119, 'ea', '60W PoE++ Midspan Injector', 0.25, 'M'],
    ['Axis', 'T8504-R PoE Switch', '01987-001', 'E', 'PoE Switch', 499, 'ea', '4-port Managed PoE+ Switch', 0.5, 'M'],
    ['Axis', 'T8508 PoE Switch', '01191-001', 'E', 'PoE Switch', 699, 'ea', '8-port Managed PoE+ Switch', 0.5, 'M'],
    ['Axis', 'T8516 PoE Switch', '01452-001', 'E', 'PoE Switch', 1199, 'ea', '16-port Managed PoE+ Switch', 0.5, 'H'],
    ['Axis', 'T8524 PoE Switch', '01192-001', 'E', 'PoE Switch', 1699, 'ea', '24-port Managed PoE+ Switch', 0.5, 'H'],
    // ── HANWHA — Mounts ──
    ['Hanwha', 'SBP-300WM', 'SBP-300WM', 'M', 'Camera Mount', 49, 'ea', 'Wall Mount Bracket', 0.5, 'L'],
    ['Hanwha', 'SBP-300PM', 'SBP-300PM', 'M', 'Camera Mount', 59, 'ea', 'Pendant Mount Adapter', 0.5, 'L'],
    ['Hanwha', 'SBP-300CMW', 'SBP-300CMW', 'M', 'Camera Mount', 39, 'ea', 'Ceiling Mount Large', 0.5, 'L'],
    ['Hanwha', 'SBP-300KM', 'SBP-300KM', 'M', 'Camera Mount', 99, 'ea', 'Pole Mount Adapter', 0.5, 'M'],
    ['Hanwha', 'SBP-317HM', 'SBP-317HM', 'M', 'Camera Mount', 149, 'ea', 'PTZ Heavy Duty Wall Mount', 0.5, 'M'],
    ['Hanwha', 'SBP-320WM', 'SBP-320WM', 'M', 'Camera Mount', 69, 'ea', 'Compact Wall Mount', 0.5, 'L'],
    ['Hanwha', 'SBP-302CM', 'SBP-302CM', 'M', 'Camera Mount', 29, 'ea', 'Flush Mount Cap', 0.25, 'L'],
    // ── PELCO — Mounts ──
    ['Pelco', 'IWM-SR', 'IWM-SR', 'M', 'Camera Mount', 79, 'ea', 'Sarix Wall Mount', 0.5, 'L'],
    ['Pelco', 'IPM-SR', 'IPM-SR', 'M', 'Camera Mount', 89, 'ea', 'Sarix Pendant Mount', 0.5, 'L'],
    ['Pelco', 'ICPM-SR', 'ICPM-SR', 'M', 'Camera Mount', 69, 'ea', 'Sarix Corner/Pole Mount', 0.5, 'M'],
    ['Pelco', 'EM22', 'EM22', 'M', 'Camera Mount', 199, 'ea', 'Spectra PTZ Wall Mount', 0.5, 'M'],
    ['Pelco', 'PP450', 'PP450', 'M', 'Camera Mount', 399, 'ea', 'Spectra PTZ Parapet Mount', 1.0, 'H'],
    // ── Universal / Generic Mounts ──
    ['Universal', 'Junction Box 4"', 'JB-4', 'M', 'Camera Mount', 12, 'ea', '4" x 4" Junction Box', 0.25, 'L'],
    ['Universal', 'Junction Box 6"', 'JB-6', 'M', 'Camera Mount', 18, 'ea', '6" x 6" Junction Box', 0.25, 'L'],
    ['Universal', 'Weatherproof Box', 'WP-BOX', 'M', 'Camera Mount', 25, 'ea', 'Weatherproof Junction Box IP66', 0.25, 'L'],
    ['Universal', 'Outdoor Wall Arm 12"', 'WA-12', 'M', 'Camera Mount', 39, 'ea', '12" Outdoor Wall Arm Bracket', 0.5, 'L'],
    ['Universal', 'Outdoor Wall Arm 24"', 'WA-24', 'M', 'Camera Mount', 59, 'ea', '24" Outdoor Wall Arm Heavy Duty', 0.5, 'M'],
    ['Universal', 'Pole Mount Kit', 'PM-KIT', 'M', 'Camera Mount', 45, 'ea', 'Universal Pole Mount Strap Kit', 0.5, 'M'],
    ['Universal', 'Corner Mount', 'CM-KIT', 'M', 'Camera Mount', 55, 'ea', 'Universal Corner Mount Adapter', 0.5, 'M'],
    ['Universal', 'Parapet/Roof Mount', 'PRM-KIT', 'M', 'Camera Mount', 149, 'ea', 'Roof/Parapet Mount Assembly', 1.0, 'M'],
    // ── PoE Injectors — Multi-brand ──
    ['TP-Link', 'TL-PoE150S', 'TL-POE150S', 'E', 'PoE Injector', 29, 'ea', 'PoE Injector 30W 802.3af/at', 0.25, 'L'],
    ['TP-Link', 'TL-PoE260S', 'TL-POE260S', 'E', 'PoE Injector', 49, 'ea', 'PoE++ Injector 60W 802.3bt', 0.25, 'L'],
    ['Ubiquiti', 'U-PoE-af', 'POE-24-AF5X', 'E', 'PoE Injector', 15, 'ea', 'PoE Injector 15W', 0.25, 'L'],
    ['Ubiquiti', 'U-PoE-at', 'POE-48-24W-G', 'E', 'PoE Injector', 19, 'ea', 'PoE+ Injector 24W', 0.25, 'L'],
    ['Veracity', 'OUTREACH Max PoE', 'VOR-OSP', 'E', 'PoE Extender', 249, 'ea', 'PoE Extender 500m Outdoor', 0.5, 'M'],
    ['Veracity', 'LONGSPAN Base', 'VLS-1N-B', 'E', 'PoE Extender', 199, 'ea', 'PoE Extender 820m Base', 0.5, 'M'],
    ['Veracity', 'LONGSPAN Camera', 'VLS-1P-C', 'E', 'PoE Extender', 149, 'ea', 'PoE Extender Camera Unit', 0.25, 'L'],
    // ── Surge Protection ──
    ['Ditek', 'DTK-MRJPOE', 'DTK-MRJPOE', 'M', 'Surge Protection', 49, 'ea', 'PoE Surge Protector RJ45', 0.25, 'L'],
    ['Ditek', 'DTK-2MHLP', 'DTK-2MHLP', 'M', 'Surge Protection', 35, 'ea', '2-wire Signal Surge Protector', 0.25, 'L'],
    ['Ditek', 'DTK-MRJ45SCPX', 'DTK-MRJ45SCPX', 'M', 'Surge Protection', 69, 'ea', 'Shielded PoE Surge Protector', 0.25, 'L'],
    ['Transtector', 'ALPU-PTP-M', 'ALPU-PTP-M', 'M', 'Surge Protection', 149, 'ea', 'Outdoor PoE Surge Metal', 0.25, 'M'],
    // ── IR Illuminators ──
    ['Axis', 'T90D20 IR', '01211-001', 'E', 'IR Illuminator', 299, 'ea', 'IR LED Illuminator 100m', 0.5, 'M'],
    ['Axis', 'T90D30 IR', '01212-001', 'E', 'IR Illuminator', 399, 'ea', 'IR LED Illuminator 180m', 0.5, 'M'],
    ['Axis', 'T90D40 IR', '01213-001', 'E', 'IR Illuminator', 499, 'ea', 'IR LED Illuminator 350m', 0.5, 'M'],
    ['Raytec', 'VAR2-i2-1', 'VAR2-I2-1', 'E', 'IR Illuminator', 249, 'ea', 'VARIO2 IR Illuminator 30m', 0.5, 'L'],
    ['Raytec', 'VAR2-i4-1', 'VAR2-I4-1', 'E', 'IR Illuminator', 349, 'ea', 'VARIO2 IR Illuminator 80m', 0.5, 'M'],
    ['Raytec', 'VAR2-i6-1', 'VAR2-I6-1', 'E', 'IR Illuminator', 449, 'ea', 'VARIO2 IR Illuminator 120m', 0.5, 'M'],
    ['Raytec', 'VAR2-w2-1', 'VAR2-W2-1', 'E', 'IR Illuminator', 199, 'ea', 'VARIO2 White Light 30m', 0.5, 'L'],
    // ── Lenses ──
    ['computar', 'T4Z2813CS-IR', 'T4Z2813CS', 'M', 'Camera Lens', 89, 'ea', 'CS-mount 2.8-12mm Varifocal', 0.25, 'L'],
    ['computar', 'H3Z4512CS-IR', 'H3Z4512CS', 'M', 'Camera Lens', 109, 'ea', 'CS-mount 4.5-12.5mm Varifocal', 0.25, 'L'],
    ['computar', 'HG3Z4512FCS-IR', 'HG3Z4512FCS', 'M', 'Camera Lens', 149, 'ea', 'CS-mount 4.5-12.5mm DC Iris', 0.25, 'M'],
    ['Tamron', 'M13VG550IR', 'M13VG550IR', 'M', 'Camera Lens', 179, 'ea', 'CS-mount 5-50mm IR Varifocal', 0.25, 'M'],
    ['Tamron', 'M13VP288IR', 'M13VP288IR', 'M', 'Camera Lens', 129, 'ea', 'CS-mount 2.8-8mm IR Varifocal', 0.25, 'L'],
];

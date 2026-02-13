import { CompactProduct } from './types';

// ============================================================================
// PATHWAY & INFRASTRUCTURE — Panduit, B-Line, Wiremold, Legrand (~350)
// J-hooks, Conduit, Cable Tray, Wireways, Firestop, Labels
// ============================================================================

export const CATALOG_PATHWAY: CompactProduct[] = [
    // ── PANDUIT — J-Hooks ──
    ['Panduit', 'J-Pro JP131W-L20', 'JP131W-L20', 'M', 'J-Hook', 2.50, 'ea', 'J-Hook 1-5/16" Wall Mount', 0.1, 'L'],
    ['Panduit', 'J-Pro JP2W-L20', 'JP2W-L20', 'M', 'J-Hook', 3.50, 'ea', 'J-Hook 2" Wall Mount', 0.1, 'L'],
    ['Panduit', 'J-Pro JP3W-L20', 'JP3W-L20', 'M', 'J-Hook', 4.50, 'ea', 'J-Hook 3" Wall Mount', 0.1, 'L'],
    ['Panduit', 'J-Pro JP4W-L20', 'JP4W-L20', 'M', 'J-Hook', 5.50, 'ea', 'J-Hook 4" Wall Mount', 0.1, 'L'],
    ['Panduit', 'J-Hook Clip JP131-L20', 'JP131-L20', 'M', 'J-Hook', 2, 'ea', 'J-Hook 1-5/16" Rod', 0.1, 'L'],
    ['Panduit', 'J-Hook Clip JP2-L20', 'JP2-L20', 'M', 'J-Hook', 3, 'ea', 'J-Hook 2" Rod', 0.1, 'L'],
    ['Panduit', 'J-Hook Clip JP3-L20', 'JP3-L20', 'M', 'J-Hook', 4, 'ea', 'J-Hook 3" Rod', 0.1, 'L'],
    ['Panduit', 'J-Hook Clip JP4-L20', 'JP4-L20', 'M', 'J-Hook', 5, 'ea', 'J-Hook 4" Rod', 0.1, 'L'],
    ['Panduit', 'J-Hook Multi JP2WMT-L20', 'JP2WMT-L20', 'M', 'J-Hook', 4.50, 'ea', 'Multi-tier J-Hook 2" + 4"', 0.15, 'L'],
    // ── PANDUIT — Cable Tray / Wireways ──
    ['Panduit', 'Wyr-Grid 6"x2"x10ft', 'WGF6BL10', 'M', 'Cable Tray', 89, 'ea', '6"W x 2"H Wire Basket 10ft', 0.5, 'M'],
    ['Panduit', 'Wyr-Grid 12"x2"x10ft', 'WGF12BL10', 'M', 'Cable Tray', 129, 'ea', '12"W x 2"H Wire Basket 10ft', 0.5, 'M'],
    ['Panduit', 'Wyr-Grid 18"x4"x10ft', 'WGF18BL10', 'M', 'Cable Tray', 179, 'ea', '18"W x 4"H Wire Basket 10ft', 0.5, 'M'],
    ['Panduit', 'Wyr-Grid 24"x4"x10ft', 'WGF24BL10', 'M', 'Cable Tray', 229, 'ea', '24"W x 4"H Wire Basket 10ft', 0.5, 'H'],
    ['Panduit', 'Wyr-Grid Support Bracket', 'WGSB12', 'M', 'Cable Tray', 19, 'ea', 'Trapeze Support Bracket 12"', 0.1, 'L'],
    ['Panduit', 'Wyr-Grid Wall Bracket', 'WGR12BL', 'M', 'Cable Tray', 15, 'ea', 'Wall Support Bracket 12"', 0.1, 'L'],
    // ── PANDUIT — Duct / Wiring Duct ──
    ['Panduit', 'Panduct 2x2 6ft', 'F2X2LG6', 'M', 'Wiring Duct', 19, 'ea', '2"x2" Lead-Free Wiring Duct 6ft', 0.25, 'L'],
    ['Panduit', 'Panduct 2x4 6ft', 'F2X4LG6', 'M', 'Wiring Duct', 29, 'ea', '2"x4" Lead-Free Wiring Duct 6ft', 0.25, 'L'],
    ['Panduit', 'Panduct 3x3 6ft', 'F3X3LG6', 'M', 'Wiring Duct', 25, 'ea', '3"x3" Lead-Free Wiring Duct 6ft', 0.25, 'L'],
    ['Panduit', 'Panduct 4x4 6ft', 'F4X4LG6', 'M', 'Wiring Duct', 35, 'ea', '4"x4" Lead-Free Wiring Duct 6ft', 0.25, 'M'],
    ['Panduit', 'Panduct Cover 2" 6ft', 'C2LG6', 'M', 'Wiring Duct', 9, 'ea', '2" Wiring Duct Cover 6ft', 0, 'L'],
    ['Panduit', 'Panduct Cover 4" 6ft', 'C4LG6', 'M', 'Wiring Duct', 14, 'ea', '4" Wiring Duct Cover 6ft', 0, 'L'],
    // ── PANDUIT — Labels ──
    ['Panduit', 'LJSL5-Y2', 'LJSL5-Y2', 'M', 'Label', 0.15, 'ea', 'Self-laminating Label Yellow', 0, 'L'],
    ['Panduit', 'LJSL9-Y2', 'LJSL9-Y2', 'M', 'Label', 0.20, 'ea', 'Self-laminating Label Large Yellow', 0, 'L'],
    ['Panduit', 'S100X150VAC', 'S100X150VAC', 'M', 'Label', 49, 'ea', 'Vinyl Label Cassette 1"x1.5"', 0, 'L'],
    ['Panduit', 'TDP43ME', 'TDP43ME', 'E', 'Label Printer', 499, 'ea', 'Thermal Transfer Label Printer', 0, 'M'],
    ['Panduit', 'MP300', 'MP300', 'E', 'Label Printer', 699, 'ea', 'Mobile Label Printer', 0, 'M'],
    ['Brady', 'BMP41', 'BMP41', 'E', 'Label Printer', 599, 'ea', 'Portable Label Printer', 0, 'M'],
    ['Brady', 'BMP71', 'BMP71', 'E', 'Label Printer', 1299, 'ea', 'Industrial Label Printer', 0, 'H'],
    ['Brother', 'PT-E550W', 'PT-E550W', 'E', 'Label Printer', 179, 'ea', 'Industrial Wireless Label Printer', 0, 'L'],

    // ── B-LINE (Eaton) — Supports ──
    ['B-Line', 'BCH32-RB', 'BCH32-RB', 'M', 'J-Hook', 2.50, 'ea', '2" J-Hook Retaining Clip', 0.1, 'L'],
    ['B-Line', 'BCH64-RB', 'BCH64-RB', 'M', 'J-Hook', 3.50, 'ea', '4" J-Hook Retaining Clip', 0.1, 'L'],
    ['B-Line', 'BCH21', 'BCH21', 'M', 'J-Hook', 2, 'ea', '1-5/16" J-Hook Beam Clip', 0.1, 'L'],
    ['B-Line', 'BCH32', 'BCH32', 'M', 'J-Hook', 2.50, 'ea', '2" J-Hook Beam Clip', 0.1, 'L'],
    ['B-Line', 'BCH64', 'BCH64', 'M', 'J-Hook', 3.50, 'ea', '4" J-Hook Beam Clip', 0.1, 'L'],
    ['B-Line', 'B22A Strut', 'B22A-10', 'M', 'Strut Channel', 29, 'ea', '1-5/8" x 1-5/8" Strut 10ft', 0.25, 'L'],
    ['B-Line', 'B22SH Strut', 'B22SH-10', 'M', 'Strut Channel', 19, 'ea', '1-5/8" x 13/16" Half Strut 10ft', 0.25, 'L'],
    ['B-Line', 'B24A Strut', 'B24A-10', 'M', 'Strut Channel', 35, 'ea', '1-5/8" x 2-7/16" Deep Strut 10ft', 0.25, 'M'],
    // ── B-LINE — Cable Tray ──
    ['B-Line', 'Flextray 6"x10ft', 'FT2X06X10', 'M', 'Cable Tray', 79, 'ea', '6" Wire Basket Tray 10ft', 0.5, 'M'],
    ['B-Line', 'Flextray 12"x10ft', 'FT2X12X10', 'M', 'Cable Tray', 109, 'ea', '12" Wire Basket Tray 10ft', 0.5, 'M'],
    ['B-Line', 'Flextray 18"x10ft', 'FT4X18X10', 'M', 'Cable Tray', 149, 'ea', '18" Wire Basket Tray 10ft', 0.5, 'M'],
    ['B-Line', 'Flextray 24"x10ft', 'FT4X24X10', 'M', 'Cable Tray', 199, 'ea', '24" Wire Basket Tray 10ft', 0.5, 'H'],
    ['B-Line', 'B297-ZN', 'B297-ZN', 'M', 'Cable Tray', 5, 'ea', 'Universal Tray Clamp', 0.05, 'L'],
    ['B-Line', 'BH Hanger', 'B297A-ZN', 'M', 'Cable Tray', 7, 'ea', 'Tray Support Hanger', 0.1, 'L'],

    // ── WIREMOLD / Legrand — Surface Raceway ──
    ['Wiremold', 'V500', 'V500', 'M', 'Raceway', 8, 'ea', '500 Series Raceway 5ft Steel', 0.25, 'L'],
    ['Wiremold', 'V700', 'V700', 'M', 'Raceway', 12, 'ea', '700 Series Raceway 5ft Steel', 0.25, 'L'],
    ['Wiremold', 'V2400', 'V2400', 'M', 'Raceway', 19, 'ea', '2400 Series Raceway 5ft Steel', 0.25, 'M'],
    ['Wiremold', 'NM2048', 'NM2048', 'M', 'Raceway', 7, 'ea', 'Non-metallic Raceway 48" White', 0.15, 'L'],
    ['Wiremold', 'NM2044', 'NM2044', 'M', 'Raceway', 6, 'ea', 'Non-metallic Raceway 44" White', 0.15, 'L'],
    ['Wiremold', 'V5785', 'V5785', 'M', 'Raceway', 25, 'ea', 'Pancake Overfloor Raceway 5ft', 0.25, 'M'],
    ['Wiremold', 'V5751-2', 'V5751-2', 'M', 'Raceway', 12, 'ea', '2-gang Device Box Steel', 0.25, 'M'],
    ['Wiremold', 'V711', 'V711', 'M', 'Raceway', 3, 'ea', '700 Series Elbow', 0.1, 'L'],
    ['Wiremold', 'V511', 'V511', 'M', 'Raceway', 2.50, 'ea', '500 Series Elbow', 0.1, 'L'],

    // ── CONDUIT & Fittings ──
    ['Generic', 'EMT 3/4" x 10ft', 'EMT-075-10', 'M', 'Conduit', 8, 'ea', '3/4" EMT Conduit 10ft', 0, 'L'],
    ['Generic', 'EMT 1" x 10ft', 'EMT-100-10', 'M', 'Conduit', 12, 'ea', '1" EMT Conduit 10ft', 0, 'L'],
    ['Generic', 'EMT 1-1/4" x 10ft', 'EMT-125-10', 'M', 'Conduit', 18, 'ea', '1-1/4" EMT Conduit 10ft', 0, 'L'],
    ['Generic', 'EMT 1-1/2" x 10ft', 'EMT-150-10', 'M', 'Conduit', 22, 'ea', '1-1/2" EMT Conduit 10ft', 0, 'M'],
    ['Generic', 'EMT 2" x 10ft', 'EMT-200-10', 'M', 'Conduit', 29, 'ea', '2" EMT Conduit 10ft', 0, 'M'],
    ['Generic', 'EMT Connector 3/4"', 'EMT-C-075', 'M', 'Conduit Fitting', 0.75, 'ea', '3/4" EMT Compression Connector', 0, 'L'],
    ['Generic', 'EMT Connector 1"', 'EMT-C-100', 'M', 'Conduit Fitting', 1, 'ea', '1" EMT Compression Connector', 0, 'L'],
    ['Generic', 'EMT Coupling 3/4"', 'EMT-CP-075', 'M', 'Conduit Fitting', 0.60, 'ea', '3/4" EMT Compression Coupling', 0, 'L'],
    ['Generic', 'EMT Coupling 1"', 'EMT-CP-100', 'M', 'Conduit Fitting', 0.80, 'ea', '1" EMT Compression Coupling', 0, 'L'],
    ['Generic', 'LB 3/4"', 'LB-075', 'M', 'Conduit Fitting', 6, 'ea', '3/4" Conduit Body LB', 0.1, 'L'],
    ['Generic', 'LB 1"', 'LB-100', 'M', 'Conduit Fitting', 8, 'ea', '1" Conduit Body LB', 0.1, 'L'],
    ['Generic', 'ENT 3/4" x 200ft', 'ENT-075-200', 'M', 'Conduit', 59, 'ea', '3/4" ENT Flex Conduit 200ft', 0, 'L'],
    ['Generic', 'ENT 1" x 200ft', 'ENT-100-200', 'M', 'Conduit', 89, 'ea', '1" ENT Flex Conduit 200ft', 0, 'L'],

    // ── FIRESTOP ──
    ['STI', 'SpecSeal SSP', 'SSP-100', 'M', 'Firestop', 15, 'ea', 'Firestop Putty Pad 4"x8"', 0.15, 'L'],
    ['STI', 'SpecSeal SSS', 'SSS-100', 'M', 'Firestop', 29, 'ea', 'Firestop Sealant 10.1oz', 0.15, 'L'],
    ['3M', 'Fire Barrier Sealant CP25', 'CP-25WB', 'M', 'Firestop', 25, 'ea', 'Firestop Sealant 10.1oz', 0.15, 'L'],
    ['3M', 'Fire Barrier Pillow', 'FB-249', 'M', 'Firestop', 15, 'ea', 'Firestop Pillow 2"x4"x9"', 0.1, 'L'],
    ['Hilti', 'CFS-SP WB', 'CFS-SP-WB', 'M', 'Firestop', 35, 'ea', 'Firestop Joint Sealant 20oz', 0.15, 'M'],
    ['Hilti', 'CFS-CID', 'CFS-CID', 'M', 'Firestop', 19, 'ea', 'Cast-in Device 3/4"', 0.1, 'L'],

    // ── Testing / Misc ──
    ['Fluke', 'DSX2-5000', 'DSX2-5000', 'E', 'Test Equipment', 14999, 'ea', 'Cat6A/Class FA Copper Certifier', 0, 'H'],
    ['Fluke', 'DSX2-8000', 'DSX2-8000', 'E', 'Test Equipment', 19999, 'ea', 'Cat8 Copper Certifier', 0, 'H'],
    ['Fluke', 'CertiFiber Pro', 'CFP2-100-M', 'E', 'Test Equipment', 7999, 'ea', 'Fiber Optic Loss Certifier', 0, 'H'],
    ['Fluke', 'MicroScanner PoE', 'MS-POE', 'E', 'Test Equipment', 499, 'ea', 'Cable Verifier + PoE', 0, 'L'],
    ['Fluke', 'IntelliTone Pro 200', 'MT-8200-60-KIT', 'E', 'Test Equipment', 299, 'ea', 'Toner & Probe Kit', 0, 'L'],
    // ── Tie Wraps / Velcro ──
    ['Panduit', 'PLT2S-C0', 'PLT2S-C0', 'M', 'Cable Tie', 0.05, 'ea', 'Cable Tie 7.4" Black', 0, 'L'],
    ['Panduit', 'PLT4S-C0', 'PLT4S-C0', 'M', 'Cable Tie', 0.08, 'ea', 'Cable Tie 14.5" Black', 0, 'L'],
    ['Panduit', 'PLT2S-M', 'PLT2S-M', 'M', 'Cable Tie', 0.06, 'ea', 'Cable Tie 7.4" Natural', 0, 'L'],
    ['Velcro', 'ONE-WRAP 8" Black', 'VEL-OW64300', 'M', 'Cable Tie', 0.25, 'ea', 'One-Wrap Tie 8" Black', 0, 'L'],
    ['Velcro', 'ONE-WRAP 12" Black', 'VEL-OW64500', 'M', 'Cable Tie', 0.35, 'ea', 'One-Wrap Tie 12" Black', 0, 'L'],
    ['Panduit', 'HLS-15R0', 'HLS-15R0', 'M', 'Cable Tie', 49, 'ea', 'Hook & Loop Roll 15ft Black', 0, 'L'],
];

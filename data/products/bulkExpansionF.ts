import { CompactProduct } from './types';

// Bulk expansion F: massive cross-category expansion
export const CATALOG_BULK_EXPANSION_F: CompactProduct[] = [
    // ══════════ CCTV — License Plate Recognition, Body Worn, Thermal ══════════
    ['Axis', 'P1445-LE-3 License Plate', '02339-001', 'E', 'LPR Camera', 1299, 'ea', '2MP LPR Bullet IR', 2.5, 'H'],
    ['Axis', 'P1455-LE-3 License Plate', '02341-001', 'E', 'LPR Camera', 1499, 'ea', '2MP LPR Bullet IR 50m', 2.5, 'H'],
    ['Hikvision', 'iDS-2CD7A46G0/P-IZHSY', 'iDS-2CD7A46G0P', 'E', 'LPR Camera', 999, 'ea', '4MP LPR DeepInView VF', 2.5, 'H'],
    ['Hikvision', 'DS-2CD4A26FWD-IZS/P', 'DS-2CD4A26FWD-P', 'E', 'LPR Camera', 699, 'ea', '2MP LPR Bullet DarkFighter', 2.5, 'H'],
    ['Hanwha', 'XNO-6120R/LPR', 'XNO-6120R-LPR', 'E', 'LPR Camera', 799, 'ea', '2MP LPR Bullet IR', 2.5, 'H'],
    ['Avigilon', '2.0LP-H5A-BO1-IR', '2.0LP-H5A-BO1', 'E', 'LPR Camera', 1499, 'ea', '2MP LPR H5A Analytics IR', 2.5, 'H'],
    ['Digital Watchdog', 'DWC-MBLPRTD', 'DWC-MBLPRTD', 'E', 'LPR Camera', 999, 'ea', 'LPR Bullet 2MP IR', 2.5, 'H'],
    // ── Explosion-Proof ──
    ['Axis', 'XP40-Q1942', '02229-001', 'E', 'CCTV Camera', 9999, 'ea', 'Explosion-Proof Thermal/Visual', 5.0, 'H'],
    ['Axis', 'XP40-Q1765', '02230-001', 'E', 'CCTV Camera', 7999, 'ea', 'Explosion-Proof 1080p VF', 5.0, 'H'],
    ['Pelco', 'ExSite Enhanced', 'EXS-P', 'E', 'CCTV Camera', 5999, 'ea', 'Explosion-Proof PTZ', 6.0, 'H'],
    ['Bosch', 'MIC-ILA Explosion-proof', 'MIC-ILA', 'E', 'CCTV Camera', 8999, 'ea', 'MIC Explosion-proof PTZ', 6.0, 'H'],
    // ── Covert / Specialty ──
    ['Axis', 'P1275 MkII', '02585-001', 'E', 'CCTV Camera', 449, 'ea', 'Covert Network Camera HDTV', 1.0, 'M'],
    ['Axis', 'P12 MkII', '02586-001', 'E', 'CCTV Camera', 399, 'ea', 'Covert Pinhole Camera', 1.0, 'M'],
    ['Hikvision', 'DS-2CD6425G1-30', 'DS-2CD6425G1-30', 'E', 'CCTV Camera', 249, 'ea', 'Covert 2MP Pinhole Camera', 1.0, 'M'],
    // ── Additional NVR/Storage ──
    ['Axis', 'S3008', '01580-004', 'E', 'NVR', 899, 'ea', 'Camera Station S3008 8ch 4TB', 2.0, 'H'],
    ['Axis', 'S3016', '01580-005', 'E', 'NVR', 1499, 'ea', 'Camera Station S3016 16ch 8TB', 2.0, 'H'],
    ['Axis', 'S3048', '01580-006', 'E', 'NVR', 4999, 'ea', 'Camera Station S3048 48ch 32TB', 3.0, 'H'],
    ['Digital Watchdog', 'DW-VP163T16P', 'DW-VP163T16P', 'E', 'NVR', 1999, 'ea', 'VMAX IP Plus 16ch PoE 3TB', 2.0, 'H'],
    ['Digital Watchdog', 'DW-VP1612T16P', 'DW-VP1612T16P', 'E', 'NVR', 2999, 'ea', 'VMAX IP Plus 16ch PoE 12TB', 2.0, 'H'],
    ['Synology', 'RS1221+', 'RS1221+', 'E', 'NAS', 999, 'ea', '8-bay NAS Rackmount 4-core', 2.0, 'H'],
    ['Synology', 'RS3621xs+', 'RS3621xs+', 'E', 'NAS', 2999, 'ea', '12-bay NAS Rackmount Xeon', 3.0, 'H'],
    ['Synology', 'Surveillance Station Per Cam', 'SSPC-01', 'E', 'VMS License', 49, 'ea', 'Per Camera License', 0, 'M'],

    // ══════════ ACCESS CONTROL — Elevator Control, Parking ══════════
    ['Mercury', 'MR62e', 'MR62E', 'E', 'Access Panel', 799, 'ea', 'Elevator Controller 64-floor', 3.0, 'H'],
    ['Mercury', 'MR62eF', 'MR62EF', 'E', 'Access Panel', 499, 'ea', 'Floor Select 16-floor', 1.5, 'M'],
    ['GAI-Tronics', 'ICP-9000E', 'ICP-9000E', 'E', 'Elevator Phone', 399, 'ea', 'Elevator Emergency Phone IP', 1.0, 'M'],
    ['Kings III', 'Elevator Phone', 'K3-EP', 'E', 'Elevator Phone', 299, 'ea', 'ADA Elevator Emergency Phone', 1.0, 'M'],
    // ── Parking ──
    ['HySecurity', 'HydraSwing 50', 'HS-50', 'E', 'Gate Operator', 4999, 'ea', 'Hydraulic Swing Gate 50ft', 6.0, 'H'],
    ['HySecurity', 'StrongArm M50', 'SA-M50', 'E', 'Gate Operator', 3999, 'ea', 'Barrier Arm 29ft Max', 5.0, 'H'],
    ['LiftMaster', 'CSL24UL', 'CSL24UL', 'E', 'Gate Operator', 2999, 'ea', 'Commercial Slide Gate 40ft', 5.0, 'H'],
    ['LiftMaster', 'MEGA ARM TOWER', 'MATS', 'E', 'Gate Operator', 4999, 'ea', 'Barrier Arm 33ft Max', 5.0, 'H'],
    ['LiftMaster', 'LA500PKGUL', 'LA500PKGUL', 'E', 'Gate Operator', 1999, 'ea', 'Linear Actuator Swing Gate', 4.0, 'H'],
    ['Magnetic AutoControl', 'MIB30', 'MIB30', 'E', 'Gate Operator', 3499, 'ea', 'Vehicle Barrier 30ft Arm', 5.0, 'H'],

    // ══════════ INTRUSION — Supplemental sensors/accessories ══════════
    ['Honeywell', '5898', '5898', 'E', 'Siren', 89, 'ea', 'Wireless Indoor Siren', 0.5, 'M'],
    ['Honeywell', '5800MINI', '5800MINI', 'M', 'Contact Sensor', 35, 'ea', 'Super-mini Wireless Contact', 0.25, 'L'],
    ['Honeywell', '5899', '5899', 'E', 'Sensor', 79, 'ea', 'Wireless Smoke/Heat Combo', 0.5, 'M'],
    ['Honeywell', '5822T', '5822T', 'M', 'Contact Sensor', 49, 'ea', 'Wireless Tilt Sensor Garage', 0.25, 'L'],
    ['Honeywell', '5800FLOOD', '5800FLOOD', 'E', 'Sensor', 69, 'ea', 'Wireless Flood Detector', 0.25, 'M'],
    ['Honeywell', '5800SS1', '5800SS1', 'E', 'Sensor', 79, 'ea', 'Wireless Shock Sensor', 0.5, 'M'],
    ['DSC', 'PG9949', 'PG9949', 'M', 'Contact Sensor', 69, 'ea', 'PowerG Vanishing Contact', 0.25, 'M'],
    ['DSC', 'PG9920', 'PG9920', 'E', 'Smoke Detector', 99, 'ea', 'PowerG Wireless Smoke', 0.5, 'M'],
    ['DSC', 'PG9916', 'PG9916', 'E', 'CO Detector', 99, 'ea', 'PowerG Wireless CO', 0.5, 'M'],
    ['DSC', 'PG9905', 'PG9905', 'E', 'Sensor', 79, 'ea', 'PowerG Wireless Flood', 0.25, 'M'],
    ['DSC', 'PG9975', 'PG9975', 'E', 'Motion Detector', 99, 'ea', 'PowerG Wireless Mirror PIR', 0.5, 'M'],
    ['DSC', 'PG9862', 'PG9862', 'E', 'Sensor', 89, 'ea', 'PowerG Shock Sensor', 0.5, 'M'],

    // ══════════ FIRE ALARM — Duct, Beam, VESDA, Sprinkler ══════════
    ['System Sensor', 'D2W', 'D2W', 'E', 'Duct Smoke', 149, 'ea', '2-wire Conventional Duct Smoke', 1.5, 'M'],
    ['System Sensor', 'D4120', 'D4120', 'E', 'Duct Smoke', 199, 'ea', '4-wire Duct Smoke', 1.5, 'M'],
    ['System Sensor', 'InnovairFlex D4120', 'IF-D4120', 'E', 'Duct Smoke', 249, 'ea', 'InnovairFlex Duct Smoke 4-wire', 1.5, 'H'],
    ['System Sensor', 'BEAM1224S', 'BEAM1224S', 'E', 'Beam Detector', 899, 'ea', 'Projected Beam Smoke 100m', 3.0, 'H'],
    ['System Sensor', 'BEAM200S', 'BEAM200S', 'E', 'Beam Detector', 599, 'ea', 'Projected Beam Smoke 60m', 2.0, 'M'],
    ['Xtralis', 'VESDA-E VEA-040', 'VEA-040-A00', 'E', 'Aspirating', 1999, 'ea', 'VESDA-E VEA Aspirating Low', 3.0, 'H'],
    ['Xtralis', 'VESDA-E VEP-A00', 'VEP-A00-P', 'E', 'Aspirating', 2999, 'ea', 'VESDA-E VEP Aspirating Standard', 3.0, 'H'],
    ['Xtralis', 'VESDA-E VEU', 'VEU-A00-P', 'E', 'Aspirating', 4999, 'ea', 'VESDA-E VEU Aspirating Industrial', 4.0, 'H'],
    ['Hochiki', 'SPC-24R', 'SPC-24R', 'E', 'Speaker', 79, 'ea', 'Ceiling Speaker/Strobe Red', 1.0, 'M'],
    ['Hochiki', 'HB-RG', 'HB-RG', 'E', 'Pull Station', 39, 'ea', 'Manual Pull Station Red', 0.5, 'L'],

    // ══════════ PATHWAY — Cable Tray, Ladders, J-hooks extended ══════════
    ['Panduit', 'J-Pro JP2W-L20', 'JP2W-L20', 'M', 'J-Hook', 3.50, 'ea', '2" J-Hook Wall Mount', 0.1, 'L'],
    ['Panduit', 'J-Pro JP3W-L20', 'JP3W-L20', 'M', 'J-Hook', 4.50, 'ea', '3" J-Hook Wall Mount', 0.1, 'L'],
    ['Panduit', 'J-Pro JP4W-L20', 'JP4W-L20', 'M', 'J-Hook', 5.50, 'ea', '4" J-Hook Wall Mount', 0.1, 'L'],
    ['Panduit', 'J-Pro JP131-L20', 'JP131-L20', 'M', 'J-Hook', 2.50, 'ea', '1-5/16" J-Hook Beam Clip', 0.1, 'L'],
    ['Panduit', 'J-Pro JP2SBC25-X', 'JP2SBC25-X', 'M', 'J-Hook', 5.00, 'ea', '2" J-Hook with Rod Clip', 0.1, 'L'],
    ['B-Line', 'BCH64', 'BCH64', 'M', 'J-Hook', 4.50, 'ea', '4" Cable Hook with Clip', 0.1, 'L'],
    ['B-Line', 'BCH21', 'BCH21', 'M', 'J-Hook', 2.50, 'ea', '1-5/16" Cable Hook Clip', 0.1, 'L'],
    ['B-Line', 'BCH32', 'BCH32', 'M', 'J-Hook', 3.50, 'ea', '2" Cable Hook Clip', 0.1, 'L'],
    ['B-Line', 'B22A Framing Channel', 'B22A-10-ZN', 'M', 'Unistrut', 29, 'ea', '1-5/8 x 1-5/8 Strut 10ft ZN', 0.5, 'L'],
    ['B-Line', 'B22 Framing Channel', 'B22-10-ZN', 'M', 'Unistrut', 22, 'ea', '1-5/8 x 1-5/8 Strut 10ft SS', 0.5, 'L'],
    ['B-Line', 'B100-ZN Pipe Clamp', 'B100-1-ZN', 'M', 'Conduit Fitting', 1.50, 'ea', '1" Pipe Clamp Zinc', 0.05, 'L'],
    ['B-Line', 'B100-ZN 1-1/4', 'B100-114-ZN', 'M', 'Conduit Fitting', 1.75, 'ea', '1-1/4" Pipe Clamp Zinc', 0.05, 'L'],
    // ── Panduit Labels Extended ──
    ['Panduit', 'S100X150VAC', 'S100X150VAC', 'M', 'Label', 49, 'ea', 'Self-lam Label 1x1.5" 200/roll', 0, 'L'],
    ['Panduit', 'S100X150VARY', 'S100X150VARY', 'M', 'Label', 49, 'ea', 'Self-lam Label Yellow 200/roll', 0, 'L'],
    ['Panduit', 'T050X000RPF-BK', 'T050XRPF-BK', 'M', 'Label', 39, 'ea', 'Thermal Printable Label 1/2"', 0, 'L'],
    ['Panduit', 'PCMB-7', 'PCMB-7', 'M', 'Label', 29, 'ea', 'Pre-printed Marker Book A-Z', 0, 'L'],
    ['Panduit', 'H000X044H1C', 'H000X044H1C', 'M', 'Label', 69, 'ea', 'Heat Shrink Label 100/cassette', 0, 'L'],
    ['Brady', 'BMP21-PLUS', 'BMP21-PLUS', 'E', 'Label Printer', 199, 'ea', 'Portable Label Printer', 0, 'M'],
    ['Brady', 'M710', 'M710', 'E', 'Label Printer', 999, 'ea', 'Portable Label Printer Pro', 0, 'H'],
    ['Brother', 'PT-E550W', 'PT-E550W', 'E', 'Label Printer', 179, 'ea', 'Industrial Labeler WiFi', 0, 'M'],
    ['Dymo', 'Rhino 6000+', 'RHINO-6000+', 'E', 'Label Printer', 249, 'ea', 'Industrial Labeler Pro', 0, 'M'],
];

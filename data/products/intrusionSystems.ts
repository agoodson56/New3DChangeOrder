import { CompactProduct } from './types';

// ============================================================================
// INTRUSION DETECTION — Bosch, DSC, Honeywell, DMP (~300 products)
// ============================================================================

export const CATALOG_INTRUSION: CompactProduct[] = [
    // ── BOSCH — Panels ──
    ['Bosch', 'B9512G', 'B9512G', 'E', 'Intrusion Panel', 899, 'ea', '599-point Commercial Panel', 4.0, 'H'],
    ['Bosch', 'B5512', 'B5512', 'E', 'Intrusion Panel', 449, 'ea', '48-point Commercial Panel', 3.0, 'H'],
    ['Bosch', 'B4512', 'B4512', 'E', 'Intrusion Panel', 299, 'ea', '28-point Commercial Panel', 3.0, 'M'],
    ['Bosch', 'B3512', 'B3512', 'E', 'Intrusion Panel', 199, 'ea', '16-point Panel', 2.5, 'M'],
    ['Bosch', 'B6512', 'B6512', 'E', 'Intrusion Panel', 549, 'ea', '96-point IP Panel', 3.0, 'H'],
    ['Bosch', 'B8512G', 'B8512G', 'E', 'Intrusion Panel', 699, 'ea', '199-point Panel', 3.5, 'H'],
    // ── BOSCH — Keypads / Modules ──
    ['Bosch', 'B942', 'B942', 'E', 'Intrusion Keypad', 149, 'ea', 'LCD Keypad', 0.5, 'L'],
    ['Bosch', 'B920', 'B920', 'E', 'Intrusion Keypad', 129, 'ea', 'Basic LCD Keypad', 0.5, 'L'],
    ['Bosch', 'B930', 'B930', 'E', 'Intrusion Keypad', 179, 'ea', 'Touch Keypad 4.3"', 0.75, 'M'],
    ['Bosch', 'B915', 'B915', 'E', 'Intrusion Keypad', 199, 'ea', 'Graphic Touch Keypad', 0.75, 'M'],
    ['Bosch', 'B208', 'B208', 'E', 'Intrusion Module', 99, 'ea', '8-point Input Expansion', 0.5, 'M'],
    ['Bosch', 'B308', 'B308', 'E', 'Intrusion Module', 129, 'ea', '8-output Expansion Module', 0.5, 'M'],
    ['Bosch', 'B426', 'B426', 'E', 'Intrusion Module', 199, 'ea', 'Ethernet Communication Module', 0.5, 'M'],
    ['Bosch', 'B450', 'B450', 'E', 'Intrusion Module', 179, 'ea', 'Cellular Communicator 4G-LTE', 0.5, 'M'],
    // ── BOSCH — Sensors ──
    ['Bosch', 'ISC-BDL2-WP12G', 'ISC-BDL2-WP12G', 'E', 'Motion Detector', 79, 'ea', 'TriTech Motion Detector', 0.75, 'M'],
    ['Bosch', 'ISC-BPR2-WP12', 'ISC-BPR2-WP12', 'E', 'Motion Detector', 59, 'ea', 'PIR Motion Detector', 0.75, 'L'],
    ['Bosch', 'ISC-BPQ2-W12', 'ISC-BPQ2-W12', 'E', 'Motion Detector', 89, 'ea', 'Quad PIR Motion Detector', 0.75, 'M'],
    ['Bosch', 'ISC-CDL1-W15G', 'ISC-CDL1-W15G', 'E', 'Motion Detector', 129, 'ea', 'Ceiling Mount TriTech 360°', 0.75, 'M'],
    ['Bosch', 'DS9370', 'DS9370', 'E', 'Motion Detector', 49, 'ea', 'PIR Curtain Detector', 0.5, 'L'],
    ['Bosch', 'DS160', 'DS160', 'E', 'Motion Detector', 99, 'ea', 'Long Range PIR 60ft', 0.75, 'M'],
    ['Bosch', 'ISC-PPR1-WA16G', 'ISC-PPR1-WA16G', 'E', 'Motion Detector', 149, 'ea', 'Outdoor PIR/Microwave 50ft', 1.0, 'H'],
    ['Bosch', 'DS161', 'DS161', 'E', 'Glass Break', 69, 'ea', 'Glassbreak Detector', 0.5, 'L'],
    ['Bosch', 'DS1101i', 'DS1101I', 'E', 'Glass Break', 89, 'ea', 'Glassbreak Detector FlexGuard', 0.5, 'M'],
    ['Bosch', 'ISN-GMX-P0', 'ISN-GMX-P0', 'M', 'Contact Sensor', 9, 'ea', 'Surface Door/Window Contact', 0.25, 'L'],
    ['Bosch', 'ISN-SM-50', 'ISN-SM-50', 'M', 'Contact Sensor', 7, 'ea', 'Small Surface Contact', 0.25, 'L'],
    ['Bosch', 'ISN-CSD70-W', 'ISN-CSD70-W', 'M', 'Contact Sensor', 12, 'ea', 'Overhead Door Contact', 0.5, 'L'],

    // ── DSC — Panels ──
    ['DSC', 'HS3128', 'HS3128', 'E', 'Intrusion Panel', 399, 'ea', 'Neo 128-zone Hybrid Panel', 3.0, 'H'],
    ['DSC', 'HS3032', 'HS3032', 'E', 'Intrusion Panel', 249, 'ea', 'Neo 32-zone Hybrid Panel', 2.5, 'M'],
    ['DSC', 'HS2128', 'HS2128', 'E', 'Intrusion Panel', 349, 'ea', 'PowerSeries Neo 128-zone', 3.0, 'H'],
    ['DSC', 'HS2064', 'HS2064', 'E', 'Intrusion Panel', 249, 'ea', 'PowerSeries Neo 64-zone', 2.5, 'M'],
    ['DSC', 'HS2032', 'HS2032', 'E', 'Intrusion Panel', 179, 'ea', 'PowerSeries Neo 32-zone', 2.5, 'M'],
    ['DSC', 'HS2016', 'HS2016', 'E', 'Intrusion Panel', 129, 'ea', 'PowerSeries Neo 16-zone', 2.0, 'L'],
    // ── DSC — Keypads / Modules ──
    ['DSC', 'HS2LCDRF9', 'HS2LCDRF9', 'E', 'Intrusion Keypad', 149, 'ea', 'Neo LCD RF Keypad', 0.5, 'M'],
    ['DSC', 'HS2TCHP', 'HS2TCHP', 'E', 'Intrusion Keypad', 299, 'ea', 'Neo 7" Touchscreen Keypad', 0.75, 'M'],
    ['DSC', 'HS2LCDE9', 'HS2LCDE9', 'E', 'Intrusion Keypad', 99, 'ea', 'Neo LCD Keypad English', 0.5, 'L'],
    ['DSC', 'HSM2108', 'HSM2108', 'E', 'Intrusion Module', 79, 'ea', '8-zone Input Module', 0.5, 'M'],
    ['DSC', 'HSM2204', 'HSM2204', 'E', 'Intrusion Module', 89, 'ea', '4-output Relay Module', 0.5, 'M'],
    ['DSC', 'HSM2300', 'HSM2300', 'E', 'Intrusion Module', 99, 'ea', 'Audio Verification Module', 0.5, 'M'],
    ['DSC', 'TL405LE-IAT', 'TL405LE-IAT', 'E', 'Intrusion Module', 199, 'ea', 'Internet/LTE Communicator', 0.5, 'H'],
    ['DSC', 'LE4010-AT', 'LE4010-AT', 'E', 'Intrusion Module', 179, 'ea', 'LTE Cellular Communicator', 0.5, 'M'],
    // ── DSC — Sensors ──
    ['DSC', 'LC-104', 'LC-104', 'E', 'Motion Detector', 39, 'ea', 'PIR Motion Detector 40ft', 0.5, 'L'],
    ['DSC', 'LC-171', 'LC-171', 'E', 'Motion Detector', 49, 'ea', 'PIR Ceiling Mount 360°', 0.5, 'L'],
    ['DSC', 'LC-151', 'LC-151', 'E', 'Motion Detector', 69, 'ea', 'Dual-Tech Motion Detector', 0.75, 'M'],
    ['DSC', 'AC-100', 'AC-100', 'E', 'Glass Break', 49, 'ea', 'Glassbreak Detector', 0.5, 'L'],

    // ── HONEYWELL — Panels ──
    ['Honeywell', 'VISTA-128BPT', 'VISTA-128BPT', 'E', 'Intrusion Panel', 399, 'ea', 'VISTA 128-zone Commercial', 3.0, 'H'],
    ['Honeywell', 'VISTA-250BPT', 'VISTA-250BPT', 'E', 'Intrusion Panel', 549, 'ea', 'VISTA 250-zone Commercial', 3.5, 'H'],
    ['Honeywell', 'VISTA-21iP', 'VISTA-21IP', 'E', 'Intrusion Panel', 199, 'ea', 'VISTA 48-zone Internet Panel', 2.5, 'M'],
    ['Honeywell', 'ProSeries PROA7PLUS', 'PROA7PLUS', 'E', 'Intrusion Panel', 449, 'ea', 'All-in-One 7" Panel WiFi/Z-Wave', 2.0, 'H'],
    ['Honeywell', 'LynxTouch L7000', 'L7000', 'E', 'Intrusion Panel', 349, 'ea', 'All-in-One Touch Panel', 2.0, 'M'],
    // ── HONEYWELL — Keypads / Modules ──
    ['Honeywell', '6160RF', '6160RF', 'E', 'Intrusion Keypad', 149, 'ea', 'Alpha Keypad with Transceiver', 0.5, 'M'],
    ['Honeywell', '6150', '6150', 'E', 'Intrusion Keypad', 79, 'ea', 'Fixed English Keypad', 0.5, 'L'],
    ['Honeywell', '6160', '6160', 'E', 'Intrusion Keypad', 99, 'ea', 'Alpha Display Keypad', 0.5, 'L'],
    ['Honeywell', '4208U', '4208U', 'E', 'Intrusion Module', 79, 'ea', '8-zone Expansion Module', 0.5, 'M'],
    ['Honeywell', '4204', '4204', 'E', 'Intrusion Module', 69, 'ea', '4-relay Output Module', 0.5, 'M'],
    ['Honeywell', 'IGSM-4G', 'IGSM-4G', 'E', 'Intrusion Module', 179, 'ea', 'Internet/GSM Communicator', 0.5, 'M'],
    // ── HONEYWELL — Sensors ──
    ['Honeywell', 'IS3035', 'IS3035', 'E', 'Motion Detector', 69, 'ea', 'PIR Motion 35ft', 0.5, 'L'],
    ['Honeywell', 'DT8035', 'DT8035', 'E', 'Motion Detector', 99, 'ea', 'Dual-Tech Motion 35ft', 0.75, 'M'],
    ['Honeywell', 'DT8050', 'DT8050', 'E', 'Motion Detector', 119, 'ea', 'Dual-Tech Motion 50ft', 0.75, 'M'],
    ['Honeywell', 'IS312B', 'IS312B', 'E', 'Motion Detector', 79, 'ea', 'PIR 360° Ceiling', 0.5, 'M'],
    ['Honeywell', 'FG1625', 'FG1625', 'E', 'Glass Break', 59, 'ea', 'FlexGuard Glassbreak', 0.5, 'L'],
    ['Honeywell', 'FG1625T', 'FG1625T', 'E', 'Glass Break', 69, 'ea', 'FlexGuard Glassbreak w/Test', 0.5, 'L'],
    ['Honeywell', '7940', '7940', 'M', 'Contact Sensor', 9, 'ea', 'Surface Mount Contact N/C', 0.25, 'L'],
    ['Honeywell', '951WG-WH', '951WG-WH', 'M', 'Contact Sensor', 11, 'ea', 'Recessed Contact', 0.5, 'L'],
    // ── HONEYWELL — Sirens ──
    ['Honeywell', '747', '747', 'E', 'Siren', 49, 'ea', 'Indoor Siren 106dB', 0.5, 'L'],
    ['Honeywell', '702', '702', 'E', 'Siren', 59, 'ea', 'Outdoor Siren Self-contained', 0.75, 'M'],
    ['Honeywell', 'WAVE-2', 'WAVE-2', 'E', 'Siren', 39, 'ea', 'Indoor Siren Slim', 0.5, 'L'],
    ['Wheelock', 'STR', 'STR', 'E', 'Siren', 69, 'ea', 'Horn/Strobe Combination', 0.75, 'M'],

    // ── DMP — Panels ──
    ['DMP', 'XR550', 'XR550', 'E', 'Intrusion Panel', 699, 'ea', '550-zone IP Panel', 3.5, 'H'],
    ['DMP', 'XR150', 'XR150', 'E', 'Intrusion Panel', 399, 'ea', '150-zone IP Panel', 3.0, 'H'],
    ['DMP', 'XR500', 'XR500', 'E', 'Intrusion Panel', 549, 'ea', '500-zone Panel', 3.0, 'H'],
    ['DMP', 'XT50', 'XT50', 'E', 'Intrusion Panel', 249, 'ea', '50-zone Panel', 2.5, 'M'],
    ['DMP', '7060', '7060', 'E', 'Intrusion Keypad', 129, 'ea', 'LCD Keypad', 0.5, 'L'],
    ['DMP', '7160', '7160', 'E', 'Intrusion Keypad', 199, 'ea', 'Graphic Touchscreen Keypad', 0.75, 'M'],
    ['DMP', '714', '714', 'E', 'Intrusion Module', 79, 'ea', '8-zone Expansion Module', 0.5, 'M'],
    ['DMP', '734', '734', 'E', 'Intrusion Module', 89, 'ea', 'Output Module', 0.5, 'M'],
];

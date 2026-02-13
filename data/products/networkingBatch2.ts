import { CompactProduct } from './types';

// Batch 2: Additional Networking — Firewalls, WAP controllers, SFPs, switches
export const CATALOG_NETWORKING_BATCH2: CompactProduct[] = [
    // ── CISCO — Firewalls / Routers ──
    ['Cisco', 'FPR1010-NGFW-K9', 'FPR1010-NGFW-K9', 'E', 'Firewall', 599, 'ea', 'Firepower 1010 NGFW 8-port', 2.0, 'H'],
    ['Cisco', 'FPR1120-NGFW-K9', 'FPR1120-NGFW-K9', 'E', 'Firewall', 1999, 'ea', 'Firepower 1120 NGFW', 2.0, 'H'],
    ['Cisco', 'FPR1150-NGFW-K9', 'FPR1150-NGFW-K9', 'E', 'Firewall', 3499, 'ea', 'Firepower 1150 NGFW', 2.0, 'H'],
    ['Cisco', 'ISR1111-8P', 'ISR1111-8P', 'E', 'Router', 699, 'ea', 'ISR 1100 8-port Dual WAN', 1.5, 'M'],
    ['Cisco', 'ISR4331-K9', 'ISR4331-K9', 'E', 'Router', 3999, 'ea', 'ISR 4331 Integrated Router', 2.0, 'H'],
    ['Cisco', 'ISR4351-K9', 'ISR4351-K9', 'E', 'Router', 7999, 'ea', 'ISR 4351 Integrated Router', 2.0, 'H'],
    // ── MERAKI — Firewalls ──
    ['Meraki', 'MX68', 'MX68-HW', 'E', 'Firewall', 499, 'ea', 'MX68 Cloud Managed Security', 1.5, 'M'],
    ['Meraki', 'MX68W', 'MX68W-HW', 'E', 'Firewall', 599, 'ea', 'MX68W Cloud Managed Security WiFi', 1.5, 'M'],
    ['Meraki', 'MX75', 'MX75-HW', 'E', 'Firewall', 899, 'ea', 'MX75 Cloud Managed Security', 1.5, 'H'],
    ['Meraki', 'MX85', 'MX85-HW', 'E', 'Firewall', 1499, 'ea', 'MX85 Cloud Managed Security', 1.5, 'H'],
    ['Meraki', 'MX95', 'MX95-HW', 'E', 'Firewall', 2499, 'ea', 'MX95 Cloud Managed Security', 1.5, 'H'],
    ['Meraki', 'MX105', 'MX105-HW', 'E', 'Firewall', 3999, 'ea', 'MX105 Cloud Managed Security', 2.0, 'H'],
    // ── FORTINET ──
    ['Fortinet', 'FortiGate 40F', 'FG-40F', 'E', 'Firewall', 395, 'ea', 'NGFW 5Gbps 5-port GE', 1.5, 'M'],
    ['Fortinet', 'FortiGate 60F', 'FG-60F', 'E', 'Firewall', 695, 'ea', 'NGFW 10Gbps 10-port GE', 1.5, 'H'],
    ['Fortinet', 'FortiGate 80F', 'FG-80F', 'E', 'Firewall', 1295, 'ea', 'NGFW 10Gbps 8-GE 2-SFP+', 1.5, 'H'],
    ['Fortinet', 'FortiGate 100F', 'FG-100F', 'E', 'Firewall', 2695, 'ea', 'NGFW 20Gbps 18-GE 4-SFP+', 2.0, 'H'],
    ['Fortinet', 'FortiGate 200F', 'FG-200F', 'E', 'Firewall', 5995, 'ea', 'NGFW 27Gbps 18-GE 8-SFP+', 2.0, 'H'],
    ['Fortinet', 'FortiSwitch 124F-FPOE', 'FS-124F-FPOE', 'E', 'PoE Switch', 1495, 'ea', '24-port GbE PoE+ 370W FortiLink', 1.5, 'H'],
    ['Fortinet', 'FortiSwitch 148F-FPOE', 'FS-148F-FPOE', 'E', 'PoE Switch', 2995, 'ea', '48-port GbE PoE+ 740W FortiLink', 1.5, 'H'],
    ['Fortinet', 'FortiAP 231F', 'FAP-231F', 'E', 'Wireless AP', 599, 'ea', 'FortiAP Wi-Fi 6 Indoor', 1.5, 'M'],
    ['Fortinet', 'FortiAP 431F', 'FAP-431F', 'E', 'Wireless AP', 1199, 'ea', 'FortiAP Wi-Fi 6 Indoor Tri-radio', 1.5, 'H'],
    ['Fortinet', 'FortiAP 234F', 'FAP-234F', 'E', 'Wireless AP', 999, 'ea', 'FortiAP Wi-Fi 6 Outdoor', 2.0, 'H'],
    // ── PALO ALTO ──
    ['Palo Alto', 'PA-440', 'PA-440', 'E', 'Firewall', 1495, 'ea', 'NGFW 2.4Gbps ML-Powered', 2.0, 'H'],
    ['Palo Alto', 'PA-450', 'PA-450', 'E', 'Firewall', 3995, 'ea', 'NGFW 3.8Gbps ML-Powered', 2.0, 'H'],
    ['Palo Alto', 'PA-460', 'PA-460', 'E', 'Firewall', 5995, 'ea', 'NGFW 4.7Gbps ML-Powered', 2.0, 'H'],
    // ── SonicWall ──
    ['SonicWall', 'TZ270', 'TZ270', 'E', 'Firewall', 399, 'ea', 'Next-Gen Firewall 2Gbps', 1.5, 'M'],
    ['SonicWall', 'TZ370', 'TZ370', 'E', 'Firewall', 599, 'ea', 'Next-Gen Firewall 3Gbps', 1.5, 'M'],
    ['SonicWall', 'TZ470', 'TZ470', 'E', 'Firewall', 999, 'ea', 'Next-Gen Firewall 3.5Gbps', 1.5, 'H'],
    ['SonicWall', 'TZ570', 'TZ570', 'E', 'Firewall', 1499, 'ea', 'Next-Gen Firewall 4Gbps', 1.5, 'H'],
    ['SonicWall', 'NSa 2700', 'NSa-2700', 'E', 'Firewall', 3999, 'ea', 'Next-Gen Firewall 5.5Gbps', 2.0, 'H'],
    // ── Additional Switches / SFPs ──
    ['Cisco', 'SFP-10G-SR-S', 'SFP-10G-SR-S', 'E', 'SFP Module', 249, 'ea', '10G SFP+ SR 300m Stack', 0.1, 'M'],
    ['Cisco', 'GLC-T', 'GLC-T', 'E', 'SFP Module', 99, 'ea', '1G SFP RJ45 Copper 100m', 0.1, 'L'],
    ['Cisco', 'SFP-25G-SR-S', 'SFP-25G-SR-S', 'E', 'SFP Module', 499, 'ea', '25G SFP28 SR 100m', 0.1, 'H'],
    ['HPE Aruba', 'J9150D', 'J9150D', 'E', 'SFP Module', 149, 'ea', '1G SFP SX LC MM', 0.1, 'L'],
    ['HPE Aruba', 'J4859D', 'J4859D', 'E', 'SFP Module', 199, 'ea', '1G SFP LX LC SM', 0.1, 'L'],
    ['HPE Aruba', 'J9151E', 'J9151E', 'E', 'SFP Module', 299, 'ea', '10G SFP+ LR SM 10km', 0.1, 'M'],
    ['FS.com', 'SFP-10G-SR', 'SFP-10GSR-85', 'E', 'SFP Module', 19, 'ea', 'Generic 10G SFP+ SR MM', 0.1, 'L'],
    ['FS.com', 'SFP-10G-LR', 'SFP-10GLR-31', 'E', 'SFP Module', 29, 'ea', 'Generic 10G SFP+ LR SM', 0.1, 'L'],
    ['FS.com', 'SFP-1G-SX', 'SFP-1GSX-85', 'E', 'SFP Module', 9, 'ea', 'Generic 1G SFP SX MM', 0.1, 'L'],
    ['FS.com', 'SFP-1G-LX', 'SFP-1GLX-31', 'E', 'SFP Module', 12, 'ea', 'Generic 1G SFP LX SM', 0.1, 'L'],
    // ── Media Converters ──
    ['TP-Link', 'MC220L', 'MC220L', 'E', 'Media Converter', 39, 'ea', 'Gigabit SFP to RJ45', 0.25, 'L'],
    ['TP-Link', 'MC210CS', 'MC210CS', 'E', 'Media Converter', 49, 'ea', 'GbE Single-mode SC 20km', 0.25, 'L'],
    ['Transition Networks', 'TNSFP-LX1', 'TNSFP-LX1', 'E', 'Media Converter', 79, 'ea', '1G SFP to Copper Converter', 0.25, 'M'],
    ['Transition Networks', 'S4TEF1029-200', 'S4TEF1029-200', 'E', 'Media Converter', 99, 'ea', '10G SFP+ to Copper', 0.25, 'M'],
    // ── Industrial/Outdoor Switches ──
    ['Cisco', 'IE-1000-8P2S-LM', 'IE-1000-8P2S-LM', 'E', 'PoE Switch', 1299, 'ea', 'Industrial 8-port PoE Switch', 1.5, 'H'],
    ['Cisco', 'IE-4000-8P4G-E', 'IE-4000-8P4G-E', 'E', 'PoE Switch', 3499, 'ea', 'Industrial 8P PoE 4G Uplink', 2.0, 'H'],
    ['Comnet', 'CWGE10FX2TX8MS', 'CWGE10FX2TX8MS', 'E', 'PoE Switch', 699, 'ea', '8-port PoE Managed Switch', 1.0, 'M'],
    ['Comnet', 'CNGE4+2SMS/M', 'CNGE4-2SMS-M', 'E', 'PoE Switch', 499, 'ea', '4-port PoE Mini Switch', 0.5, 'M'],
    ['Comnet', 'CNGE2+2SMS/M', 'CNGE2-2SMS-M', 'E', 'PoE Switch', 349, 'ea', '2-port PoE Mini Switch', 0.5, 'L'],
    ['Veracity', 'VHW-1', 'VHW-1', 'E', 'PoE Extender', 129, 'ea', 'HIGHWIRE PoE over Coax', 0.25, 'M'],
    ['Veracity', 'VLS-1P-C', 'VLS-1P-C', 'E', 'PoE Extender', 179, 'ea', 'LONGSPAN PoE Extender 500m', 0.25, 'M'],
    ['NVT Phybridge', 'EC-Link', 'NV-EC-04', 'E', 'PoE Extender', 149, 'ea', 'PoE over UTP Extender 1km', 0.25, 'M'],
];

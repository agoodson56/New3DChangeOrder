import { CompactProduct } from './types';

// ============================================================================
// ACCESS CONTROL — Readers, Controllers, Locks, Credentials, Power (~500 products)
// ============================================================================

export const CATALOG_ACCESS_CONTROL: CompactProduct[] = [
    // ── HID — Readers ──
    ['HID', 'iCLASS SE R10', '900NTNNEK00000', 'E', 'Card Reader', 159, 'ea', 'Contactless Smart Reader Mini', 1.0, 'L'],
    ['HID', 'iCLASS SE R15', '910NTNNEK00000', 'E', 'Card Reader', 179, 'ea', 'Contactless Smart Reader Mid', 1.0, 'L'],
    ['HID', 'iCLASS SE R40', '920NTNNEK00000', 'E', 'Card Reader', 199, 'ea', 'Contactless Smart Reader', 1.0, 'M'],
    ['HID', 'iCLASS SE RK40', '921NTNNEK00000', 'E', 'Card Reader', 249, 'ea', 'Contactless Smart Reader w/Keypad', 1.5, 'M'],
    ['HID', 'iCLASS SE R90', '940NTNNEK00000', 'E', 'Card Reader', 299, 'ea', 'Contactless Smart Reader Long Range', 1.5, 'M'],
    ['HID', 'multiCLASS SE RP10', 'RP10-H', 'E', 'Card Reader', 189, 'ea', 'Multi-tech Reader Prox+Smart', 1.0, 'M'],
    ['HID', 'multiCLASS SE RP15', 'RP15-H', 'E', 'Card Reader', 209, 'ea', 'Multi-tech Reader Mid Prox+Smart', 1.0, 'M'],
    ['HID', 'multiCLASS SE RP40', 'RP40-H', 'E', 'Card Reader', 259, 'ea', 'Multi-tech Reader Standard', 1.0, 'M'],
    ['HID', 'multiCLASS SE RPK40', 'RPK40-H', 'E', 'Card Reader', 299, 'ea', 'Multi-tech Reader w/Keypad', 1.5, 'M'],
    ['HID', 'Signo 20', '20-KNTKNN', 'E', 'Card Reader', 179, 'ea', 'Signo Reader Mini', 1.0, 'M'],
    ['HID', 'Signo 20K', '20K-KNTKNN', 'E', 'Card Reader', 229, 'ea', 'Signo Reader Mini w/Keypad', 1.5, 'M'],
    ['HID', 'Signo 40', '40-KNTKNN', 'E', 'Card Reader', 219, 'ea', 'Signo Reader Standard', 1.0, 'M'],
    ['HID', 'Signo 40K', '40K-KNTKNN', 'E', 'Card Reader', 279, 'ea', 'Signo Reader Standard w/Keypad', 1.5, 'M'],
    ['HID', 'ProxPoint Plus', '6005BGB00', 'E', 'Card Reader', 99, 'ea', 'Proximity Reader Mini', 1.0, 'L'],
    ['HID', 'ProxPro', '5355AGN00', 'E', 'Card Reader', 149, 'ea', 'Proximity Reader Standard', 1.0, 'L'],
    ['HID', 'MaxiProx', '5375AGN00', 'E', 'Card Reader', 449, 'ea', 'Long Range Proximity Reader', 1.5, 'M'],
    ['HID', 'EDGE EVO Solo ESH400', 'ESH400-K', 'E', 'Card Reader', 599, 'ea', 'Standalone IP Reader Controller', 2.0, 'H'],
    // ── HID — Credentials ──
    ['HID', 'iCLASS SE Card', '3100PGGMN', 'M', 'Credential', 6.50, 'ea', 'iCLASS SE Clamshell Card', 0, 'L'],
    ['HID', 'iCLASS SE Fob', '3250PGGMN', 'M', 'Credential', 8.50, 'ea', 'iCLASS SE Key Fob', 0, 'L'],
    ['HID', 'SEOS Card', '5006PGGMN', 'M', 'Credential', 8, 'ea', 'SEOS 8K Smart Card', 0, 'L'],
    ['HID', 'ProxCard II', '1326LGSMN', 'M', 'Credential', 3.50, 'ea', 'ProxCard II Clamshell', 0, 'L'],
    ['HID', 'ProxKey III', '1346LNSMN', 'M', 'Credential', 5, 'ea', 'ProxKey III Key Fob', 0, 'L'],
    ['HID', 'FARGO DTC1250e', '050000', 'E', 'Credential', 1499, 'ea', 'ID Card Printer Single-Side', 1.0, 'H'],
    ['HID', 'FARGO DTC4250e', '052000', 'E', 'Credential', 2999, 'ea', 'ID Card Printer Dual-Side', 1.0, 'H'],

    // ── MERCURY — Panels & Modules ──
    ['Mercury', 'LP4502', 'LP4502', 'E', 'Access Panel', 1299, 'ea', '2-door Intelligent Controller', 3.0, 'H'],
    ['Mercury', 'LP1502', 'LP1502', 'E', 'Access Panel', 899, 'ea', 'Single-door Intelligent Controller', 2.5, 'H'],
    ['Mercury', 'EP4502', 'EP4502', 'E', 'Access Panel', 999, 'ea', '2-door Expansion Board', 1.5, 'H'],
    ['Mercury', 'EP2500', 'EP2500', 'E', 'Access Panel', 599, 'ea', '2-door Input/Output Module', 1.5, 'M'],
    ['Mercury', 'EP1501', 'EP1501', 'E', 'Access Panel', 449, 'ea', 'Single-door Expansion Board', 1.0, 'M'],
    ['Mercury', 'EP1502', 'EP1502', 'E', 'Access Panel', 349, 'ea', 'Input Monitor Module 16pt', 1.0, 'M'],
    ['Mercury', 'EP2500 PoE', 'EP2500-POE', 'E', 'Access Panel', 699, 'ea', '2-door Module PoE Powered', 1.5, 'M'],
    ['Mercury', 'MR50', 'MR50', 'E', 'Access Panel', 199, 'ea', 'MR50 OSDP Reader Interface', 0.5, 'M'],
    ['Mercury', 'MR51e', 'MR51E', 'E', 'Access Panel', 249, 'ea', 'MR51e Enhanced Reader Module', 0.5, 'M'],
    ['Mercury', 'MR62e', 'MR62E', 'E', 'Access Panel', 349, 'ea', '2-reader OSDP Interface PoE', 0.5, 'M'],
    ['Mercury', 'SSP-CA', 'SSP-CA', 'M', 'Access Panel', 49, 'ea', 'Cabinet Adapter Kit', 0.25, 'L'],

    // ── ASSA ABLOY / HES — Electric Strikes ──
    ['HES', '1006CLB', '1006CLB-630', 'E', 'Electric Strike', 189, 'ea', 'Surface Strike 12/24VDC', 2.0, 'M'],
    ['HES', '1006CDB', '1006CDB-630', 'E', 'Electric Strike', 199, 'ea', 'Surface Strike Fail Secure', 2.0, 'M'],
    ['HES', '5000C', '5000C-630', 'E', 'Electric Strike', 249, 'ea', 'Compact Electric Strike', 2.0, 'M'],
    ['HES', '5200', '5200-630', 'E', 'Electric Strike', 299, 'ea', 'Heavy Duty Surface Strike', 2.5, 'M'],
    ['HES', '9600', '9600-630', 'E', 'Electric Strike', 349, 'ea', 'Electric Strike 1500lb', 2.5, 'H'],
    ['HES', '9500', '9500-630', 'E', 'Electric Strike', 399, 'ea', 'Surface Electric Strike Heavy', 2.5, 'H'],
    ['HES', '8000C', '8000C-630', 'E', 'Electric Strike', 399, 'ea', 'Fire Rated Electric Strike', 2.5, 'H'],
    ['HES', '8300C', '8300C-630', 'E', 'Electric Strike', 449, 'ea', 'Concealed Electric Strike', 3.0, 'H'],
    ['HES', '9400', '9400-630', 'E', 'Electric Strike', 449, 'ea', 'Electric Strike Windstorm Rated', 2.5, 'H'],
    ['HES', '310-2', '310-2-630', 'E', 'Electric Strike', 129, 'ea', 'Mini Electric Strike', 1.5, 'L'],
    // ── ASSA ABLOY — Maglocks ──
    ['Securitron', 'M62', 'M62-D', 'E', 'Mag Lock', 299, 'ea', '1200lb Single Maglock', 2.0, 'M'],
    ['Securitron', 'M62D', 'M62D-D', 'E', 'Mag Lock', 499, 'ea', '1200lb Double Maglock', 2.5, 'H'],
    ['Securitron', 'M32', 'M32-D', 'E', 'Mag Lock', 199, 'ea', '600lb Single Maglock', 1.5, 'M'],
    ['Securitron', 'M32D', 'M32D-D', 'E', 'Mag Lock', 349, 'ea', '600lb Double Maglock', 2.0, 'M'],
    ['Securitron', 'M82', 'M82-D', 'E', 'Mag Lock', 449, 'ea', '1600lb Single Maglock', 2.5, 'H'],
    ['Securitron', 'MCL', 'MCL-D', 'E', 'Mag Lock', 599, 'ea', '2000lb Shear Lock', 3.0, 'H'],
    // ── ASSA ABLOY — Electric Locks ──
    ['ASSA ABLOY', 'IN120', 'IN120-PD', 'E', 'Electric Lock', 799, 'ea', 'WiFi Enabled Cylindrical Lock', 2.5, 'H'],
    ['ASSA ABLOY', 'IN220', 'IN220-PD', 'E', 'Electric Lock', 899, 'ea', 'WiFi Enabled Mortise Lock', 3.0, 'H'],
    ['ASSA ABLOY', 'AD-400', 'AD-400', 'E', 'Electric Lock', 1299, 'ea', 'Networked Cylindrical Lock', 2.5, 'H'],
    ['ASSA ABLOY', 'AD-500', 'AD-500', 'E', 'Electric Lock', 1499, 'ea', 'Networked Mortise Lock', 3.0, 'H'],

    // ── ALLEGION (Schlage) — Electric Locks ──
    ['Schlage', 'NDE', 'NDE80PD-RHO', 'E', 'Electric Lock', 599, 'ea', 'NDE Wireless Cylindrical Lock', 2.0, 'M'],
    ['Schlage', 'LE', 'LE-MOR-RHO', 'E', 'Electric Lock', 799, 'ea', 'LE Mobile Enabled Lock', 2.0, 'M'],
    ['Schlage', 'CO-100', 'CO-100-CY', 'E', 'Electric Lock', 449, 'ea', 'Standalone Cylindrical Lock', 2.0, 'M'],
    ['Schlage', 'CO-200', 'CO-200-MS', 'E', 'Electric Lock', 599, 'ea', 'Standalone Mortise Lock', 2.5, 'M'],
    ['Schlage', 'CO-250', 'CO-250-MS', 'E', 'Electric Lock', 699, 'ea', 'Networked Mortise Lock', 2.5, 'H'],
    ['Schlage', 'AD-300', 'AD-300-CY', 'E', 'Electric Lock', 899, 'ea', 'Networked Cylindrical Lock', 2.5, 'H'],
    ['Schlage', 'AD-400', 'AD-400-CY', 'E', 'Electric Lock', 1099, 'ea', 'Wireless Networked Lock', 2.5, 'H'],
    ['Schlage', 'PIV Reader', 'MT15-ALP', 'E', 'Card Reader', 399, 'ea', 'Multi-technology PIV Reader', 1.5, 'H'],
    // ── ALLEGION — Exit Devices ──
    ['Von Duprin', '99EO', '99EO-26D', 'E', 'Exit Device', 599, 'ea', 'Rim Exit Device', 2.5, 'M'],
    ['Von Duprin', '99NL', '99NL-26D', 'E', 'Exit Device', 749, 'ea', 'Rim Exit Device Night Latch', 2.5, 'M'],
    ['Von Duprin', '98EO', '98EO-26D', 'E', 'Exit Device', 549, 'ea', 'Rim Exit Device Value', 2.5, 'M'],
    ['Von Duprin', 'QEL', 'QEL-99-26D', 'E', 'Exit Device', 899, 'ea', 'Quiet Electric Latch Retraction', 3.0, 'H'],
    ['Von Duprin', 'EL', 'EL-99-26D', 'E', 'Exit Device', 799, 'ea', 'Electric Latch Retraction', 3.0, 'H'],
    ['Von Duprin', '6211', '6211-DS', 'E', 'Electric Strike', 349, 'ea', 'Electric Strike for Exit Device', 2.5, 'H'],

    // ── RCI — Door Holders / Maglocks ──
    ['RCI', '8310', '8310-28', 'E', 'Mag Lock', 249, 'ea', '600lb Surface Maglock', 1.5, 'M'],
    ['RCI', '8371', '8371-28', 'E', 'Mag Lock', 399, 'ea', '1200lb Surface Maglock', 2.0, 'M'],
    ['RCI', '8372', '8372-28', 'E', 'Mag Lock', 549, 'ea', '1200lb Double Maglock', 2.5, 'H'],
    ['RCI', 'FB-01', 'FB-01-28', 'E', 'Mag Lock', 79, 'ea', 'Filler Bar Maglock', 0.25, 'L'],

    // ── ALTRONIX — Power Supplies ──
    ['Altronix', 'AL600ULACM', 'AL600ULACM', 'E', 'Power Supply', 299, 'ea', '6A 12/24VDC Power Supply/Charger', 1.5, 'M'],
    ['Altronix', 'AL400ULACM', 'AL400ULACM', 'E', 'Power Supply', 249, 'ea', '4A 12/24VDC Power Supply/Charger', 1.5, 'M'],
    ['Altronix', 'SMP7', 'SMP7', 'E', 'Power Supply', 179, 'ea', '6A 12/24VDC Compact Power Supply', 1.0, 'M'],
    ['Altronix', 'SMP5', 'SMP5', 'E', 'Power Supply', 149, 'ea', '4A 12/24VDC Compact Power Supply', 1.0, 'M'],
    ['Altronix', 'SMP3', 'SMP3', 'E', 'Power Supply', 119, 'ea', '2.5A 12/24VDC Compact Power Supply', 1.0, 'L'],
    ['Altronix', 'AL1024ULXPD16', 'AL1024ULXPD16', 'E', 'Power Supply', 549, 'ea', '10A 24VDC 16-output Power Supply', 2.0, 'H'],
    ['Altronix', 'AL1012ULXPD16', 'AL1012ULXPD16', 'E', 'Power Supply', 499, 'ea', '10A 12VDC 16-output Power Supply', 2.0, 'H'],
    ['Altronix', 'AL600UL3X', 'AL600UL3X', 'E', 'Power Supply', 399, 'ea', '6A 12/24VDC Power Supply Triple Out', 1.5, 'H'],
    ['Altronix', 'MAXIMAL33D', 'MAXIMAL33D', 'E', 'Power Supply', 899, 'ea', '16-output Rack Power Supply 12/24VDC', 2.0, 'H'],
    ['Altronix', 'MAXIMAL77D', 'MAXIMAL77D', 'E', 'Power Supply', 1199, 'ea', '16-output Rack Power Supply 20A', 2.0, 'H'],
    // ── Batteries ──
    ['Altronix', 'BT1212', 'BT1212', 'M', 'Battery', 29, 'ea', '12V 12Ah SLA Battery', 0.25, 'L'],
    ['Altronix', 'BT126', 'BT126', 'M', 'Battery', 19, 'ea', '12V 7Ah SLA Battery', 0.25, 'L'],
    ['Altronix', 'BT1218', 'BT1218', 'M', 'Battery', 39, 'ea', '12V 18Ah SLA Battery', 0.25, 'L'],

    // ── REX / Sensors / Misc ──
    ['Securitron', 'EEB2', 'EEB2', 'M', 'REX Device', 49, 'ea', 'Emergency Exit Button Green', 0.5, 'L'],
    ['Securitron', 'PB4L', 'PB4L', 'M', 'REX Device', 39, 'ea', 'Push Button Illuminated', 0.5, 'L'],
    ['Alarm Controls', 'TS-2T', 'TS-2T', 'M', 'REX Device', 35, 'ea', 'REX Push Button with Timer', 0.5, 'L'],
    ['Alarm Controls', 'SN-1', 'SN-1', 'M', 'REX Device', 29, 'ea', 'REX Button Standard', 0.25, 'L'],
    ['Bosch', 'ISN-AP1', 'ISN-AP1', 'E', 'REX Device', 49, 'ea', 'PIR REX Motion Sensor', 0.5, 'L'],
    ['Optex', 'CX-702', 'CX-702', 'E', 'REX Device', 69, 'ea', 'Outdoor PIR REX Sensor', 0.5, 'M'],
    ['GRI', '28AWG-W', '28AWG-W', 'M', 'Door Contact', 8, 'ea', 'Surface Mount Door Contact', 0.5, 'L'],
    ['GRI', '4400-A', '4400-A', 'M', 'Door Contact', 12, 'ea', 'Recessed Door Contact', 0.5, 'L'],
    ['GRI', '29A-W', '29A-W', 'M', 'Door Contact', 15, 'ea', 'Heavy Duty Door Contact', 0.5, 'L'],
    ['Nascom', 'N85TWGDW', 'N85TWGDW', 'M', 'Door Contact', 19, 'ea', 'Overhead Door Contact', 0.75, 'M'],
    ['Nascom', 'N205AU-ST', 'N205AU-ST', 'M', 'Door Contact', 35, 'ea', 'Armored Door Contact', 0.5, 'M'],

    // ── DoorKing — Gate / Intercom ──
    ['DoorKing', '1812-Plus', '1812-096', 'E', 'Intercom', 1999, 'ea', 'Telephone Entry System Plus', 4.0, 'H'],
    ['DoorKing', '1834', '1834-080', 'E', 'Intercom', 3499, 'ea', 'PC Programmable Telephone Entry', 4.0, 'H'],
    ['DoorKing', '1837', '1837-080', 'E', 'Intercom', 4499, 'ea', 'Full Feature Telephone Entry TCP/IP', 4.0, 'H'],
    ['DoorKing', '1838', '1838-080', 'E', 'Intercom', 5499, 'ea', 'Video Telephone Entry TCP/IP', 5.0, 'H'],
    ['DoorKing', '9210', '9210-080', 'E', 'Gate Operator', 2999, 'ea', 'Slide Gate Operator 1HP', 8.0, 'H'],
    ['DoorKing', '9550', '9550-080', 'E', 'Gate Operator', 3999, 'ea', 'Swing Gate Operator', 8.0, 'H'],
    ['DoorKing', '1815', '1815-080', 'E', 'Intercom', 599, 'ea', 'Single Line Intercom', 2.0, 'M'],

    // ── Aiphone — Intercoms ──
    ['Aiphone', 'IX-2', 'IX-2', 'E', 'Intercom', 449, 'ea', 'IP Video Door Station', 2.0, 'M'],
    ['Aiphone', 'IX-MV7-HB', 'IX-MV7-HB', 'E', 'Intercom', 599, 'ea', '7" Video Master Station', 1.5, 'M'],
    ['Aiphone', 'IX-DV', 'IX-DV', 'E', 'Intercom', 549, 'ea', 'IP Video Door Station Vandal', 2.5, 'H'],
    ['Aiphone', 'IX-DA', 'IX-DA', 'E', 'Intercom', 349, 'ea', 'IP Audio Door Station', 2.0, 'M'],
    ['Aiphone', 'IX-SS-2G', 'IX-SS-2G', 'E', 'Intercom', 999, 'ea', 'IP Stainless Door Station 2-Gang', 3.0, 'H'],
    ['Aiphone', 'GT-1A', 'GT-1A', 'E', 'Intercom', 249, 'ea', 'Audio Tenant Station', 1.0, 'L'],
    ['Aiphone', 'GT-1C', 'GT-1C', 'E', 'Intercom', 399, 'ea', 'Video Tenant Station', 1.0, 'M'],
    ['Aiphone', 'JO-1MD', 'JO-1MD', 'E', 'Intercom', 199, 'ea', 'Video Intercom Set', 1.5, 'M'],
];

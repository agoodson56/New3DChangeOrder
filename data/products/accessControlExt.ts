import { CompactProduct } from './types';

// Extension: Additional Access Control products
export const CATALOG_ACCESS_CONTROL_EXT: CompactProduct[] = [
    // ── HID — Extended Readers ──
    ['HID', 'iCLASS SE R30', '930NTNNEK00000', 'E', 'Card Reader', 189, 'ea', 'Contactless Smart Reader Slim', 1.0, 'M'],
    ['HID', 'Signo 25B', '25B-KNTKNN', 'E', 'Card Reader', 159, 'ea', 'Signo Reader 25B Bluetooth', 1.0, 'M'],
    ['HID', 'Signo 40B', '40B-KNTKNN', 'E', 'Card Reader', 239, 'ea', 'Signo Reader 40B Bluetooth', 1.0, 'M'],
    ['HID', 'iCLASS SE RHK40', '921NHRNEK00000', 'E', 'Card Reader', 279, 'ea', 'Smart Reader w/Keypad Housing', 1.5, 'M'],
    ['HID', 'EDGE EVO ESH400-K', 'ESH400-K-EVO', 'E', 'Card Reader', 649, 'ea', 'Edge EVO Solo IP Controller', 2.0, 'H'],
    ['HID', 'iCLASS SE Express R10', '900NWNTEKE000P', 'E', 'Card Reader', 179, 'ea', 'Express R10 Mobile Ready', 1.0, 'M'],
    ['HID', 'pivCLASS R40-H', 'R40PIV', 'E', 'Card Reader', 349, 'ea', 'FICAM PIV Smart Reader', 1.5, 'H'],
    // ── HID — Additional Credentials ──
    ['HID', 'iCLASS Clamshell 2K', '2100PGGMN', 'M', 'Credential', 5, 'ea', '2K Bit iCLASS Card', 0, 'L'],
    ['HID', 'SEOS Mobile', '5006PHGMN', 'M', 'Credential', 3, 'ea', 'SEOS Mobile ID per user', 0, 'L'],
    ['HID', 'DuoProx II', '1336LGSMN', 'M', 'Credential', 4, 'ea', 'DuoProx II Combo Card', 0, 'L'],
    ['HID', 'MiniProx', '5365EGP00', 'E', 'Card Reader', 129, 'ea', 'Proximity Reader Mullion', 1.0, 'L'],
    // ── Mercury — Extended ──
    ['Mercury', 'LP2502', 'LP2502', 'E', 'Access Panel', 799, 'ea', '2-reader Controller Compact', 2.5, 'H'],
    ['Mercury', 'LP4502-M', 'LP4502-M', 'E', 'Access Panel', 1399, 'ea', '2-door Controller PoE Managed', 3.0, 'H'],
    ['Mercury', 'EP3502', 'EP3502', 'E', 'Access Panel', 749, 'ea', '2-reader Expander Board', 1.5, 'H'],
    ['Mercury', 'MR16IN', 'MR16IN', 'E', 'Access Panel', 299, 'ea', '16-input Monitor Module', 0.5, 'M'],
    ['Mercury', 'MR16OUT', 'MR16OUT', 'E', 'Access Panel', 349, 'ea', '16-output Relay Module', 0.5, 'M'],
    // ── ASSA ABLOY / HES — Extended ──
    ['HES', '1006CS', '1006CS-630', 'E', 'Electric Strike', 179, 'ea', 'Surface Strike 12V Only', 2.0, 'M'],
    ['HES', '4500C', '4500C-630', 'E', 'Electric Strike', 199, 'ea', 'Compact Electric Strike', 2.0, 'M'],
    ['HES', '9600-12/24D', '9600-12/24D-630', 'E', 'Electric Strike', 379, 'ea', 'Electric Strike 1500lb 12/24V', 2.5, 'H'],
    ['HES', 'KM-2', 'KM-2-630', 'M', 'Electric Strike', 39, 'ea', 'Keeper Magnet Strike Accessory', 0.25, 'L'],
    ['ASSA ABLOY', 'Aperio H100', 'H100-626', 'E', 'Electric Lock', 599, 'ea', 'Aperio Wireless Hub 16-lock', 2.0, 'H'],
    ['ASSA ABLOY', 'Aperio C100', 'C100-626', 'E', 'Electric Lock', 399, 'ea', 'Aperio Wireless Cylinder', 1.5, 'H'],
    ['ASSA ABLOY', 'IN480', 'IN480-PD', 'E', 'Electric Lock', 1499, 'ea', 'IP Enabled Mortise Lock POE', 3.0, 'H'],
    // ── Securitron — Extended ──
    ['Securitron', 'M62DG', 'M62DG-D', 'E', 'Mag Lock', 549, 'ea', '1200lb Double Mag with Gate Bracket', 2.5, 'H'],
    ['Securitron', 'M62FG', 'M62FG-D', 'E', 'Mag Lock', 449, 'ea', '1200lb Single Mag Face Drill', 2.0, 'H'],
    ['Securitron', 'GL1', 'GL1-D', 'E', 'Mag Lock', 699, 'ea', 'Glass Door Lock 1500lb', 3.0, 'H'],
    ['Securitron', 'BPS-12/24-1', 'BPS-12/24-1', 'E', 'Power Supply', 149, 'ea', 'Boxed Power Supply 1A', 1.0, 'M'],
    ['Securitron', 'BPS-12/24-3', 'BPS-12/24-3', 'E', 'Power Supply', 199, 'ea', 'Boxed Power Supply 3A', 1.0, 'M'],
    // ── Schlage — Extended ──
    ['Schlage', 'MT20', 'MT20-ALP', 'E', 'Card Reader', 299, 'ea', 'Multi-tech Reader Proximity', 1.0, 'M'],
    ['Schlage', 'ENGAGE Gateway', 'ENGAGE-GW', 'E', 'Electric Lock', 499, 'ea', 'Engage Cloud Gateway', 1.0, 'H'],
    ['Schlage', 'Control Smart Lock', 'BE467-CEN', 'E', 'Electric Lock', 299, 'ea', 'Deadbolt Smart Lock', 1.5, 'M'],
    ['Schlage', 'LE-MOR Wireless', 'LE-MOR-RHO-W', 'E', 'Electric Lock', 999, 'ea', 'LE Wireless Lock Mortise WiFi', 2.5, 'H'],
    // ── Von Duprin — Extended ──
    ['Von Duprin', '33A-EO', '33A-EO-26D', 'E', 'Exit Device', 449, 'ea', 'Rim Exit Device 3ft', 2.5, 'M'],
    ['Von Duprin', '35A-NL', '35A-NL-26D', 'E', 'Exit Device', 599, 'ea', 'Rim Exit Device 3ft Night Latch', 2.5, 'M'],
    ['Von Duprin', 'CD98EO', 'CD98EO-26D', 'E', 'Exit Device', 699, 'ea', 'Concealed Vertical Rod Exit', 3.0, 'H'],
    ['Von Duprin', '8827L', '8827L-26D', 'E', 'Exit Device', 499, 'ea', 'Mortise Lock Exit Device', 3.0, 'H'],
    ['Von Duprin', '6211AL', '6211AL-DS', 'E', 'Electric Strike', 399, 'ea', 'Electric Strike Aluminum Frame', 2.5, 'H'],
    ['Von Duprin', 'PS914-2RS', 'PS914-2RS', 'E', 'Power Supply', 249, 'ea', 'Von Duprin Power Supply 4A', 1.0, 'M'],
    // ── Door Closers ──
    ['LCN', '4041 DEL', '4041-DEL-DK', 'E', 'Door Closer', 299, 'ea', 'Heavy Duty Door Closer', 1.5, 'M'],
    ['LCN', '4040XP', '4040XP-DK', 'E', 'Door Closer', 349, 'ea', 'Extra Heavy Duty Door Closer', 1.5, 'H'],
    ['Norton', 'CLP7500', 'CLP7500-693', 'E', 'Door Closer', 249, 'ea', 'Multi-size Door Closer', 1.5, 'M'],
    ['Dorma', 'TS93', 'TS93-EN', 'E', 'Door Closer', 399, 'ea', 'Concealed Door Closer', 2.0, 'H'],
    ['Dorma', 'ED900', 'ED900', 'E', 'Door Operator', 2999, 'ea', 'Automatic Door Operator', 4.0, 'H'],
    // ── Additional Devices ──
    ['Alarm Controls', 'TS-7T', 'TS-7T', 'M', 'REX Device', 45, 'ea', 'REX Push Button with Timer LED', 0.5, 'L'],
    ['Alarm Controls', 'RP-46', 'RP-46', 'M', 'REX Device', 39, 'ea', 'Remote Plate Double Gang', 0.25, 'L'],
    ['Camden', 'CM-1100', 'CM-1100', 'M', 'REX Device', 29, 'ea', 'Exit Push Button Flush', 0.25, 'L'],
    ['Camden', 'CM-30E', 'CM-30E', 'M', 'REX Device', 35, 'ea', 'REX Push Button Standard', 0.25, 'L'],
    ['Camden', 'CM-54CBL', 'CM-54CBL', 'M', 'REX Device', 49, 'ea', 'Lazerpoint REX Button Blue LED', 0.5, 'L'],
    ['STI', 'STI-7550-AED', 'STI-7550-AED', 'M', 'Door Guard', 49, 'ea', 'Rex Stopper with Alarm', 0.5, 'L'],
    ['STI', '2100-KB', 'STI-2100-KB', 'M', 'Door Guard', 89, 'ea', 'Door Prop Alarm Battery', 0.5, 'M'],
    // ── Transfer Hinges / Hardware ──
    ['McKinney', 'ElectroLynx QC12', 'QC12P-4.5X4.5', 'M', 'Transfer Hinge', 149, 'ea', 'Electric Transfer Hinge 12-wire', 1.5, 'M'],
    ['McKinney', 'ElectroLynx QC8', 'QC8P-4.5X4.5', 'M', 'Transfer Hinge', 119, 'ea', 'Electric Transfer Hinge 8-wire', 1.5, 'M'],
    ['Securitron', 'TSB-C++', 'TSB-C-PLUS', 'M', 'Transfer Hinge', 99, 'ea', 'Tailpiece High Security', 0.5, 'M'],
    ['Von Duprin', 'EPT-10', 'EPT-10', 'M', 'Transfer Hinge', 79, 'ea', 'Electric Power Transfer Loop', 1.0, 'M'],
];

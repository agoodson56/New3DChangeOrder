import { CompactProduct } from './types';

// New category: Wireless Access Points, Controllers, Bridges
export const CATALOG_WIRELESS: CompactProduct[] = [
    // ── CISCO — Meraki ──
    ['Meraki', 'MR36', 'MR36-HW', 'E', 'Wireless AP', 699, 'ea', 'Wi-Fi 6 Indoor AP', 1.5, 'M'],
    ['Meraki', 'MR46', 'MR46-HW', 'E', 'Wireless AP', 999, 'ea', 'Wi-Fi 6 Indoor AP Tri-Band', 1.5, 'H'],
    ['Meraki', 'MR46E', 'MR46E-HW', 'E', 'Wireless AP', 1199, 'ea', 'Wi-Fi 6 Indoor AP External Ant', 1.5, 'H'],
    ['Meraki', 'MR56', 'MR56-HW', 'E', 'Wireless AP', 1499, 'ea', 'Wi-Fi 6 Indoor AP 4x4 8-stream', 1.5, 'H'],
    ['Meraki', 'MR86', 'MR86-HW', 'E', 'Wireless AP', 1699, 'ea', 'Wi-Fi 6 Outdoor AP', 2.0, 'H'],
    ['Meraki', 'MR45', 'MR45-HW', 'E', 'Wireless AP', 799, 'ea', 'Wi-Fi 6 Indoor AP Value', 1.5, 'M'],
    ['Meraki', 'MR28', 'MR28-HW', 'E', 'Wireless AP', 499, 'ea', 'Wi-Fi 6 Indoor AP Entry', 1.5, 'M'],
    ['Meraki', 'MR57', 'MR57-HW', 'E', 'Wireless AP', 1999, 'ea', 'Wi-Fi 6E Indoor AP', 1.5, 'H'],
    // ── CISCO — Catalyst ──
    ['Cisco', 'CW9162I', 'CW9162I-B', 'E', 'Wireless AP', 899, 'ea', 'Wi-Fi 6E AP Indoor', 1.5, 'H'],
    ['Cisco', 'CW9164I', 'CW9164I-B', 'E', 'Wireless AP', 1299, 'ea', 'Wi-Fi 6E AP Indoor Tri-Band', 1.5, 'H'],
    ['Cisco', 'CW9166I', 'CW9166I-B', 'E', 'Wireless AP', 1699, 'ea', 'Wi-Fi 6E AP Indoor 6GHz', 1.5, 'H'],
    ['Cisco', 'CW9166D', 'CW9166D-B', 'E', 'Wireless AP', 1799, 'ea', 'Wi-Fi 6E AP Directional', 2.0, 'H'],
    ['Cisco', 'CW9163E', 'CW9163E-B', 'E', 'Wireless AP', 1299, 'ea', 'Wi-Fi 6E AP Outdoor', 2.0, 'H'],
    ['Cisco', 'CW9178I', 'CW9178I-B', 'E', 'Wireless AP', 2499, 'ea', 'Wi-Fi 7 AP Indoor Premium', 1.5, 'H'],
    // ── HPE ARUBA ──
    ['HPE Aruba', 'AP-615', 'R7J46A', 'E', 'Wireless AP', 899, 'ea', 'Wi-Fi 6E AP Indoor', 1.5, 'H'],
    ['HPE Aruba', 'AP-635', 'R7J47A', 'E', 'Wireless AP', 1499, 'ea', 'Wi-Fi 6E AP Indoor Tri-radio', 1.5, 'H'],
    ['HPE Aruba', 'AP-655', 'R7J48A', 'E', 'Wireless AP', 1999, 'ea', 'Wi-Fi 6E AP Indoor Premium', 1.5, 'H'],
    ['HPE Aruba', 'AP-575', 'R4W52A', 'E', 'Wireless AP', 1299, 'ea', 'Wi-Fi 6E AP Outdoor', 2.0, 'H'],
    ['HPE Aruba', 'AP-505', 'R2H28A', 'E', 'Wireless AP', 449, 'ea', 'Wi-Fi 6 AP Indoor Value', 1.5, 'M'],
    ['HPE Aruba', 'AP-515', 'R2H29A', 'E', 'Wireless AP', 699, 'ea', 'Wi-Fi 6 AP Indoor', 1.5, 'M'],
    ['HPE Aruba', 'AP-535', 'JZ336A', 'E', 'Wireless AP', 999, 'ea', 'Wi-Fi 6 AP Indoor Premium', 1.5, 'H'],
    ['HPE Aruba', 'AP-567', 'R4W44A', 'E', 'Wireless AP', 999, 'ea', 'Wi-Fi 6 AP Outdoor', 2.0, 'H'],
    // ── RUCKUS ──
    ['Ruckus', 'R350', 'R350', 'E', 'Wireless AP', 399, 'ea', 'Wi-Fi 6 Indoor AP Entry', 1.5, 'M'],
    ['Ruckus', 'R550', 'R550', 'E', 'Wireless AP', 599, 'ea', 'Wi-Fi 6 Indoor AP', 1.5, 'M'],
    ['Ruckus', 'R650', 'R650', 'E', 'Wireless AP', 799, 'ea', 'Wi-Fi 6 Indoor AP 2.5G', 1.5, 'H'],
    ['Ruckus', 'R750', 'R750', 'E', 'Wireless AP', 1299, 'ea', 'Wi-Fi 6 Indoor AP 4x4', 1.5, 'H'],
    ['Ruckus', 'R770', 'R770', 'E', 'Wireless AP', 1499, 'ea', 'Wi-Fi 6E Indoor AP', 1.5, 'H'],
    ['Ruckus', 'T350c', 'T350c', 'E', 'Wireless AP', 799, 'ea', 'Wi-Fi 6 Outdoor AP', 2.0, 'H'],
    ['Ruckus', 'T750', 'T750', 'E', 'Wireless AP', 1799, 'ea', 'Wi-Fi 6 Outdoor AP Premium', 2.0, 'H'],
    ['Ruckus', 'SmartZone 100', 'SZ100', 'E', 'Wireless Controller', 4999, 'ea', 'Controller up to 1000 APs', 2.0, 'H'],
    ['Ruckus', 'SmartZone 300', 'SZ300', 'E', 'Wireless Controller', 9999, 'ea', 'Controller up to 10000 APs', 2.0, 'H'],
    // ── JUNIPER MIST ──
    ['Juniper', 'AP45', 'AP45', 'E', 'Wireless AP', 999, 'ea', 'Mist Wi-Fi 6E AP Indoor', 1.5, 'H'],
    ['Juniper', 'AP34', 'AP34', 'E', 'Wireless AP', 599, 'ea', 'Mist Wi-Fi 6 AP Indoor', 1.5, 'M'],
    ['Juniper', 'AP33', 'AP33', 'E', 'Wireless AP', 499, 'ea', 'Mist Wi-Fi 6 AP Indoor Entry', 1.5, 'M'],
    ['Juniper', 'AP63', 'AP63', 'E', 'Wireless AP', 1299, 'ea', 'Mist Wi-Fi 6E AP Outdoor', 2.0, 'H'],
    ['Juniper', 'AP24', 'AP24', 'E', 'Wireless AP', 299, 'ea', 'Mist Wi-Fi 6 AP Wall-plate', 1.0, 'L'],
    // ── UBIQUITI ──
    ['Ubiquiti', 'U6-Pro', 'U6-Pro', 'E', 'Wireless AP', 149, 'ea', 'Wi-Fi 6 Pro Indoor AP', 1.0, 'L'],
    ['Ubiquiti', 'U6-Enterprise', 'U6-Enterprise', 'E', 'Wireless AP', 349, 'ea', 'Wi-Fi 6 Enterprise AP', 1.5, 'M'],
    ['Ubiquiti', 'U6-Enterprise-IW', 'U6-IW', 'E', 'Wireless AP', 179, 'ea', 'Wi-Fi 6 In-Wall AP', 1.0, 'L'],
    ['Ubiquiti', 'U7-Pro', 'U7-Pro', 'E', 'Wireless AP', 189, 'ea', 'Wi-Fi 7 Pro Indoor AP', 1.0, 'M'],
    ['Ubiquiti', 'U7-Pro-Max', 'U7-Pro-Max', 'E', 'Wireless AP', 249, 'ea', 'Wi-Fi 7 Max Indoor AP', 1.0, 'M'],
    ['Ubiquiti', 'U6-Mesh', 'U6-Mesh', 'E', 'Wireless AP', 159, 'ea', 'Wi-Fi 6 Outdoor AP', 2.0, 'M'],
    ['Ubiquiti', 'UDR', 'UDR', 'E', 'Wireless AP', 199, 'ea', 'Dream Router WiFi 6', 1.0, 'M'],
    ['Ubiquiti', 'UDM-SE', 'UDM-SE', 'E', 'Wireless Controller', 499, 'ea', 'Dream Machine SE Gateway', 1.0, 'H'],
    ['Ubiquiti', 'UDM-Pro-Max', 'UDM-Pro-Max', 'E', 'Wireless Controller', 699, 'ea', 'Dream Machine Pro Max', 1.0, 'H'],
    // ── TP-LINK — Enterprise ──
    ['TP-Link', 'EAP670', 'EAP670', 'E', 'Wireless AP', 179, 'ea', 'Wi-Fi 6 AX5400 AP', 1.0, 'M'],
    ['TP-Link', 'EAP660 HD', 'EAP660-HD', 'E', 'Wireless AP', 229, 'ea', 'Wi-Fi 6 AX3600 AP', 1.0, 'M'],
    ['TP-Link', 'EAP680', 'EAP680', 'E', 'Wireless AP', 249, 'ea', 'Wi-Fi 6E AX6600 AP', 1.0, 'M'],
    ['TP-Link', 'EAP615-Outdoor', 'EAP615-O', 'E', 'Wireless AP', 149, 'ea', 'Wi-Fi 6 Outdoor AP AX1800', 2.0, 'M'],
    ['TP-Link', 'Omada OC300', 'OC300', 'E', 'Wireless Controller', 229, 'ea', 'Omada Cloud Controller', 1.0, 'M'],
    // ── Wireless Accessories ──
    ['Ventev', 'V12106-01130', 'V12106-01130', 'M', 'AP Mount', 29, 'ea', 'UniversAP Ceiling Mount', 0.25, 'L'],
    ['Ventev', 'V12106-21130', 'V12106-21130', 'M', 'AP Mount', 39, 'ea', 'UniversAP Wall Mount', 0.25, 'L'],
    ['Ventev', 'V12106-31130', 'V12106-31130', 'M', 'AP Mount', 49, 'ea', 'UniversAP Flush Wall Mount', 0.5, 'L'],
    ['Oberon', 'OBR-1064-014', 'OBR-1064', 'M', 'AP Mount', 39, 'ea', 'AP Ceiling Enclosure Dome', 0.5, 'M'],
    ['Oberon', 'OBR-1024', 'OBR-1024', 'M', 'AP Mount', 49, 'ea', 'AP Ceiling Mount Bracket', 0.25, 'L'],
];

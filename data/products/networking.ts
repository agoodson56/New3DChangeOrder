import { CompactProduct } from './types';

// ============================================================================
// NETWORKING — PoE Switches, Cisco, HPE/Aruba, Juniper, Meraki, Ruckus (~350)
// ============================================================================

export const CATALOG_NETWORKING: CompactProduct[] = [
    // ── CISCO — Catalyst 1000 ──
    ['Cisco', 'C1000-8T-2G-L', 'C1000-8T-2G-L', 'E', 'Network Switch', 399, 'ea', '8-port GbE Switch 2x SFP', 1.0, 'M'],
    ['Cisco', 'C1000-8P-2G-L', 'C1000-8P-2G-L', 'E', 'PoE Switch', 599, 'ea', '8-port GbE PoE+ 67W 2x SFP', 1.0, 'M'],
    ['Cisco', 'C1000-8FP-2G-L', 'C1000-8FP-2G-L', 'E', 'PoE Switch', 799, 'ea', '8-port GbE PoE+ 120W 2x SFP', 1.0, 'M'],
    ['Cisco', 'C1000-24T-4G-L', 'C1000-24T-4G-L', 'E', 'Network Switch', 699, 'ea', '24-port GbE Switch 4x SFP', 1.5, 'M'],
    ['Cisco', 'C1000-24P-4G-L', 'C1000-24P-4G-L', 'E', 'PoE Switch', 999, 'ea', '24-port GbE PoE+ 195W', 1.5, 'M'],
    ['Cisco', 'C1000-24FP-4G-L', 'C1000-24FP-4G-L', 'E', 'PoE Switch', 1499, 'ea', '24-port GbE PoE+ 370W', 1.5, 'H'],
    ['Cisco', 'C1000-48T-4G-L', 'C1000-48T-4G-L', 'E', 'Network Switch', 999, 'ea', '48-port GbE Switch 4x SFP', 1.5, 'H'],
    ['Cisco', 'C1000-48P-4G-L', 'C1000-48P-4G-L', 'E', 'PoE Switch', 1699, 'ea', '48-port GbE PoE+ 370W', 1.5, 'H'],
    ['Cisco', 'C1000-48FP-4G-L', 'C1000-48FP-4G-L', 'E', 'PoE Switch', 2199, 'ea', '48-port GbE PoE+ 740W', 1.5, 'H'],
    // ── CISCO — Catalyst 1300 ──
    ['Cisco', 'C1300-8T-E-2G', 'C1300-8T-E-2G', 'E', 'Network Switch', 499, 'ea', '8-port GbE Managed 2x SFP', 1.0, 'M'],
    ['Cisco', 'C1300-8P-E-2G', 'C1300-8P-E-2G', 'E', 'PoE Switch', 699, 'ea', '8-port GbE PoE+ Managed', 1.0, 'M'],
    ['Cisco', 'C1300-8FP-2G', 'C1300-8FP-2G', 'E', 'PoE Switch', 899, 'ea', '8-port GbE PoE+ 120W Managed', 1.0, 'M'],
    ['Cisco', 'C1300-24T-4G', 'C1300-24T-4G', 'E', 'Network Switch', 799, 'ea', '24-port GbE Managed 4x SFP', 1.5, 'M'],
    ['Cisco', 'C1300-24P-4G', 'C1300-24P-4G', 'E', 'PoE Switch', 1199, 'ea', '24-port GbE PoE+ Managed', 1.5, 'H'],
    ['Cisco', 'C1300-24FP-4G', 'C1300-24FP-4G', 'E', 'PoE Switch', 1699, 'ea', '24-port GbE PoE+ 370W Managed', 1.5, 'H'],
    ['Cisco', 'C1300-48T-4G', 'C1300-48T-4G', 'E', 'Network Switch', 1199, 'ea', '48-port GbE Managed', 1.5, 'H'],
    ['Cisco', 'C1300-48P-4G', 'C1300-48P-4G', 'E', 'PoE Switch', 1999, 'ea', '48-port GbE PoE+ 370W Managed', 1.5, 'H'],
    ['Cisco', 'C1300-48FP-4G', 'C1300-48FP-4G', 'E', 'PoE Switch', 2499, 'ea', '48-port GbE PoE+ 740W Managed', 1.5, 'H'],
    // ── CISCO — Catalyst 9200 ──
    ['Cisco', 'C9200L-24P-4G-E', 'C9200L-24P-4G-E', 'E', 'PoE Switch', 3499, 'ea', '24-port GbE PoE+ 370W DNA', 2.0, 'H'],
    ['Cisco', 'C9200L-24P-4X-E', 'C9200L-24P-4X-E', 'E', 'PoE Switch', 4499, 'ea', '24-port GbE PoE+ 4x 10G DNA', 2.0, 'H'],
    ['Cisco', 'C9200L-48P-4G-E', 'C9200L-48P-4G-E', 'E', 'PoE Switch', 5499, 'ea', '48-port GbE PoE+ 370W DNA', 2.0, 'H'],
    ['Cisco', 'C9200L-48P-4X-E', 'C9200L-48P-4X-E', 'E', 'PoE Switch', 6999, 'ea', '48-port GbE PoE+ 740W 10G DNA', 2.0, 'H'],
    // ── CISCO — CBS (Catalyst Business) ──
    ['Cisco', 'CBS250-8P-E-2G', 'CBS250-8P-E-2G', 'E', 'PoE Switch', 349, 'ea', '8-port GbE PoE+ Smart', 1.0, 'M'],
    ['Cisco', 'CBS250-24P-4G', 'CBS250-24P-4G', 'E', 'PoE Switch', 599, 'ea', '24-port GbE PoE+ Smart', 1.0, 'M'],
    ['Cisco', 'CBS250-48P-4G', 'CBS250-48P-4G', 'E', 'PoE Switch', 999, 'ea', '48-port GbE PoE+ Smart', 1.5, 'H'],
    ['Cisco', 'CBS350-8P-E-2G', 'CBS350-8P-E-2G', 'E', 'PoE Switch', 449, 'ea', '8-port GbE PoE+ Managed', 1.0, 'M'],
    ['Cisco', 'CBS350-24P-4G', 'CBS350-24P-4G', 'E', 'PoE Switch', 799, 'ea', '24-port GbE PoE+ Managed', 1.5, 'M'],
    ['Cisco', 'CBS350-48P-4G', 'CBS350-48P-4G', 'E', 'PoE Switch', 1299, 'ea', '48-port GbE PoE+ Managed', 1.5, 'H'],
    ['Cisco', 'CBS350-8MGP-2X', 'CBS350-8MGP-2X', 'E', 'PoE Switch', 599, 'ea', '8-port Multigigabit PoE+ 2x 10G', 1.0, 'H'],
    ['Cisco', 'CBS350-24MGP-4X', 'CBS350-24MGP-4X', 'E', 'PoE Switch', 1499, 'ea', '24-port Multigigabit PoE+ 4x 10G', 1.5, 'H'],
    // ── CISCO — SFP Modules ──
    ['Cisco', 'GLC-LH-SMD', 'GLC-LH-SMD', 'E', 'SFP Module', 199, 'ea', '1G SFP LX/LH SM 10km', 0.1, 'L'],
    ['Cisco', 'GLC-SX-MMD', 'GLC-SX-MMD', 'E', 'SFP Module', 149, 'ea', '1G SFP SX MM 550m', 0.1, 'L'],
    ['Cisco', 'SFP-10G-SR', 'SFP-10G-SR', 'E', 'SFP Module', 299, 'ea', '10G SFP+ SR MM 300m', 0.1, 'M'],
    ['Cisco', 'SFP-10G-LR', 'SFP-10G-LR', 'E', 'SFP Module', 499, 'ea', '10G SFP+ LR SM 10km', 0.1, 'M'],

    // ── HPE / ARUBA ──
    ['HPE Aruba', '1930 8G 2SFP', 'JL680A', 'E', 'Network Switch', 349, 'ea', '8-port GbE Smart 2x SFP', 1.0, 'M'],
    ['HPE Aruba', '1930 8G PoE 2SFP', 'JL681A', 'E', 'PoE Switch', 549, 'ea', '8-port GbE PoE+ 120W 2x SFP', 1.0, 'M'],
    ['HPE Aruba', '1930 24G 4SFP', 'JL682A', 'E', 'Network Switch', 599, 'ea', '24-port GbE Smart 4x SFP', 1.5, 'M'],
    ['HPE Aruba', '1930 24G PoE 4SFP', 'JL683A', 'E', 'PoE Switch', 899, 'ea', '24-port GbE PoE+ 195W', 1.5, 'M'],
    ['HPE Aruba', '1930 24G PoE 4SFP 370W', 'JL684A', 'E', 'PoE Switch', 1199, 'ea', '24-port GbE PoE+ 370W', 1.5, 'H'],
    ['HPE Aruba', '1930 48G 4SFP', 'JL685A', 'E', 'Network Switch', 899, 'ea', '48-port GbE Smart', 1.5, 'H'],
    ['HPE Aruba', '1930 48G PoE 4SFP 370W', 'JL686A', 'E', 'PoE Switch', 1699, 'ea', '48-port GbE PoE+ 370W', 1.5, 'H'],
    ['HPE Aruba', '6100 24G PoE 4SFP+', 'JL677A', 'E', 'PoE Switch', 2999, 'ea', '24-port GbE PoE+ L3 4x 10G', 2.0, 'H'],
    ['HPE Aruba', '6100 48G PoE 4SFP+', 'JL675A', 'E', 'PoE Switch', 4999, 'ea', '48-port GbE PoE+ L3 4x 10G', 2.0, 'H'],
    ['HPE Aruba', '6300M 24G PoE 4SFP56', 'R8S89A', 'E', 'PoE Switch', 6999, 'ea', '24-port GbE PoE+ L3 Modular', 2.0, 'H'],

    // ── JUNIPER / MIST ──
    ['Juniper', 'EX2300-24P', 'EX2300-24P', 'E', 'PoE Switch', 2499, 'ea', '24-port GbE PoE+ L2/L3', 2.0, 'H'],
    ['Juniper', 'EX2300-48P', 'EX2300-48P', 'E', 'PoE Switch', 3999, 'ea', '48-port GbE PoE+ L2/L3', 2.0, 'H'],
    ['Juniper', 'EX2300-C-12P', 'EX2300-C-12P', 'E', 'PoE Switch', 1499, 'ea', '12-port GbE PoE+ Compact', 1.0, 'H'],
    ['Juniper', 'EX4100-24P', 'EX4100-24P', 'E', 'PoE Switch', 4999, 'ea', '24-port GbE PoE+ Campus', 2.0, 'H'],
    ['Juniper', 'EX4100-48P', 'EX4100-48P', 'E', 'PoE Switch', 7999, 'ea', '48-port GbE PoE+ Campus', 2.0, 'H'],

    // ── RUCKUS ──
    ['Ruckus', 'ICX 7150-24P', '7150-24P', 'E', 'PoE Switch', 1999, 'ea', '24-port GbE PoE+ 370W', 1.5, 'H'],
    ['Ruckus', 'ICX 7150-48P', '7150-48P', 'E', 'PoE Switch', 3499, 'ea', '48-port GbE PoE+ 740W', 1.5, 'H'],
    ['Ruckus', 'ICX 7150-C08P', '7150-C08P', 'E', 'PoE Switch', 799, 'ea', '8-port GbE PoE+ Compact', 1.0, 'M'],
    ['Ruckus', 'ICX 7650-48P', '7650-48P', 'E', 'PoE Switch', 5999, 'ea', '48-port GbE PoE+ L3', 2.0, 'H'],

    // ── MERAKI ──
    ['Meraki', 'MS120-8FP', 'MS120-8FP-HW', 'E', 'PoE Switch', 699, 'ea', '8-port GbE PoE+ Cloud Managed', 1.0, 'M'],
    ['Meraki', 'MS120-24P', 'MS120-24P-HW', 'E', 'PoE Switch', 1399, 'ea', '24-port GbE PoE+ Cloud Managed', 1.5, 'H'],
    ['Meraki', 'MS120-48FP', 'MS120-48FP-HW', 'E', 'PoE Switch', 2999, 'ea', '48-port GbE PoE+ Cloud Managed', 1.5, 'H'],
    ['Meraki', 'MS130-8P', 'MS130-8P-HW', 'E', 'PoE Switch', 899, 'ea', '8-port GbE PoE+ Cloud L2', 1.0, 'M'],
    ['Meraki', 'MS130-24P', 'MS130-24P-HW', 'E', 'PoE Switch', 1699, 'ea', '24-port GbE PoE+ Cloud L2', 1.5, 'H'],
    ['Meraki', 'MS130-48P', 'MS130-48P-HW', 'E', 'PoE Switch', 3499, 'ea', '48-port GbE PoE+ Cloud L2', 1.5, 'H'],

    // ── TP-LINK (Budget) ──
    ['TP-Link', 'TL-SG1008P', 'TL-SG1008P', 'E', 'PoE Switch', 69, 'ea', '8-port GbE PoE+ 64W Unmanaged', 0.5, 'L'],
    ['TP-Link', 'TL-SG1016PE', 'TL-SG1016PE', 'E', 'PoE Switch', 179, 'ea', '16-port GbE PoE+ Smart', 0.5, 'M'],
    ['TP-Link', 'TL-SG1024PE', 'TL-SG1024PE', 'E', 'PoE Switch', 249, 'ea', '24-port GbE PoE+ Smart', 1.0, 'M'],
    ['TP-Link', 'TL-SG2428P', 'TL-SG2428P', 'E', 'PoE Switch', 399, 'ea', '24-port GbE PoE+ 250W Managed', 1.0, 'M'],

    // ── Network Racks / Cabinets ──
    ['Middle Atlantic', 'WRK-24SA-32', 'WRK-24SA-32', 'E', 'Network Rack', 599, 'ea', '24U Floor Standing Rack', 3.0, 'H'],
    ['Middle Atlantic', 'WRK-44SA-32', 'WRK-44SA-32', 'E', 'Network Rack', 899, 'ea', '44U Floor Standing Rack', 4.0, 'H'],
    ['Middle Atlantic', 'DWR-12-22', 'DWR-12-22', 'E', 'Network Rack', 299, 'ea', '12U Wall Mount Rack', 2.0, 'M'],
    ['Middle Atlantic', 'DWR-18-22', 'DWR-18-22', 'E', 'Network Rack', 399, 'ea', '18U Wall Mount Rack', 2.0, 'M'],
    ['Middle Atlantic', 'EWR-12-17SD', 'EWR-12-17SD', 'E', 'Network Rack', 249, 'ea', '12U Swing Wall Rack', 2.0, 'M'],
    ['Vertical Cable', '047-WHS-1270', '047-WHS-1270', 'E', 'Network Rack', 199, 'ea', '12U Swing Wall Rack Economy', 2.0, 'M'],
    // ── Rack Accessories ──
    ['Middle Atlantic', 'PD-915R', 'PD-915R', 'M', 'Rack Accessory', 99, 'ea', '15-outlet Rack PDU 15A', 0.5, 'L'],
    ['Middle Atlantic', 'PD-920R', 'PD-920R', 'M', 'Rack Accessory', 149, 'ea', '20-outlet Rack PDU 20A', 0.5, 'L'],
    ['CyberPower', 'PDU15B6F8R', 'PDU15B6F8R', 'M', 'Rack Accessory', 79, 'ea', '14-outlet Basic PDU 15A', 0.5, 'L'],
    ['CyberPower', 'PDU30BT8F10R', 'PDU30BT8F10R', 'M', 'Rack Accessory', 149, 'ea', '18-outlet Basic PDU 30A', 0.5, 'L'],
    ['APC', 'AP7900B', 'AP7900B', 'M', 'Rack Accessory', 549, 'ea', '8-outlet Switched PDU 20A', 0.5, 'M'],
    ['Middle Atlantic', 'QUTR-4-14', 'QUTR-4-14', 'M', 'Rack Accessory', 29, 'ea', '1U Rack Shelf Vented', 0.25, 'L'],
    ['Middle Atlantic', 'U2V', 'U2V', 'M', 'Rack Accessory', 19, 'ea', '2U Vent Panel', 0.1, 'L'],
    ['Middle Atlantic', 'UB1', 'UB1', 'M', 'Rack Accessory', 9, 'ea', '1U Blank Panel', 0.1, 'L'],
    ['Vertical Cable', 'Horizontal Wire Manager 2U', '047-WMH-2U', 'M', 'Rack Accessory', 29, 'ea', '2U Horizontal Wire Manager', 0.25, 'L'],
];

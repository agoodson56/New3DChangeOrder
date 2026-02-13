import { CompactProduct } from './types';

// ============================================================================
// FIRE ALARM — Notifier, System Sensor, Gentex, EST, Hochiki (~400 products)
// ============================================================================

export const CATALOG_FIRE_ALARM: CompactProduct[] = [
    // ── NOTIFIER — Panels / FACPs ──
    ['Notifier', 'NFS2-3030', 'NFS2-3030', 'E', 'FACP', 4999, 'ea', 'Intelligent Fire Alarm Panel', 8.0, 'H'],
    ['Notifier', 'NFS-320', 'NFS-320', 'E', 'FACP', 2499, 'ea', 'Intelligent FACP 159-pt SLC', 6.0, 'H'],
    ['Notifier', 'NFS-320SYS', 'NFS-320SYS', 'E', 'FACP', 2999, 'ea', 'Intelligent FACP System', 6.0, 'H'],
    ['Notifier', 'NFS-320C', 'NFS-320C', 'E', 'FACP', 3499, 'ea', 'Intelligent FACP w/Cabinet', 6.0, 'H'],
    ['Notifier', 'NFS2-640', 'NFS2-640', 'E', 'FACP', 3999, 'ea', 'Intelligent FACP 318-pt', 8.0, 'H'],
    ['Notifier', 'NFS2-640E', 'NFS2-640E', 'E', 'FACP', 4499, 'ea', 'Economy Intelligent FACP', 8.0, 'H'],
    ['Notifier', 'NCA-2', 'NCA-2', 'E', 'FACP', 1999, 'ea', 'Network Control Annunciator', 4.0, 'H'],
    ['Notifier', 'ONYX FirstVision', 'ONYXFirstVision', 'E', 'FACP', 6999, 'ea', 'Graphic Annunciator Display', 4.0, 'H'],
    // ── NOTIFIER — Initiating Devices ──
    ['Notifier', 'FSP-951', 'FSP-951', 'E', 'Smoke Detector', 99, 'ea', 'Photoelectric Smoke Detector Intelligent', 0.75, 'M'],
    ['Notifier', 'FSP-951R', 'FSP-951R', 'E', 'Smoke Detector', 119, 'ea', 'Photoelectric Smoke w/Relay', 0.75, 'M'],
    ['Notifier', 'FST-951', 'FST-951', 'E', 'Heat Detector', 89, 'ea', 'Intelligent Thermal Detector', 0.75, 'M'],
    ['Notifier', 'FST-951R', 'FST-951R', 'E', 'Heat Detector', 109, 'ea', 'Intelligent Thermal w/Relay', 0.75, 'M'],
    ['Notifier', 'FSP-951T', 'FSP-951T', 'E', 'Smoke Detector', 129, 'ea', 'Photo/Thermal Multi-criteria', 0.75, 'M'],
    ['Notifier', 'FAPT-851', 'FAPT-851', 'E', 'Smoke Detector', 139, 'ea', 'Acclimate Plus Multi-criteria', 0.75, 'H'],
    ['Notifier', 'FDM-1', 'FDM-1', 'E', 'Smoke Detector', 159, 'ea', 'Duct Smoke Detector Housing', 1.5, 'H'],
    ['Notifier', 'SD-355', 'SD-355', 'E', 'Smoke Detector', 179, 'ea', 'Duct Smoke Detector Intelligent', 1.5, 'H'],
    ['Notifier', 'DNR', 'DNR', 'E', 'Smoke Detector', 79, 'ea', 'Conventional Smoke Detector', 0.5, 'L'],
    ['Notifier', 'NBG-12LX', 'NBG-12LX', 'E', 'Pull Station', 49, 'ea', 'Addressable Pull Station', 0.5, 'L'],
    ['Notifier', 'NBG-12L', 'NBG-12L', 'E', 'Pull Station', 39, 'ea', 'Conventional Pull Station', 0.5, 'L'],
    ['Notifier', 'NBG-12LRA', 'NBG-12LRA', 'E', 'Pull Station', 59, 'ea', 'Addressable Pull Station w/Relay', 0.5, 'M'],
    // ── NOTIFIER — Modules ──
    ['Notifier', 'FMM-1', 'FMM-1', 'E', 'Fire Module', 69, 'ea', 'Monitor Module Addressable', 0.5, 'M'],
    ['Notifier', 'FMM-101', 'FMM-101', 'E', 'Fire Module', 79, 'ea', 'Mini Monitor Module', 0.5, 'M'],
    ['Notifier', 'FCM-1', 'FCM-1', 'E', 'Fire Module', 79, 'ea', 'Control Module Addressable', 0.5, 'M'],
    ['Notifier', 'FRM-1', 'FRM-1', 'E', 'Fire Module', 89, 'ea', 'Relay Module Addressable', 0.5, 'M'],
    ['Notifier', 'FZM-1', 'FZM-1', 'E', 'Fire Module', 99, 'ea', 'Zone Adapter Module', 0.5, 'M'],
    ['Notifier', 'NCM-W', 'NCM-W', 'E', 'Fire Module', 299, 'ea', 'Network Communications Module WiFi', 1.0, 'H'],
    ['Notifier', 'NCM-F', 'NCM-F', 'E', 'Fire Module', 349, 'ea', 'Network Communications Module Fiber', 1.0, 'H'],

    // ── SYSTEM SENSOR — Smoke/Heat Detectors ──
    ['System Sensor', 'i3 Smoke', '2251B', 'E', 'Smoke Detector', 79, 'ea', 'Intelligent Photoelectric Smoke', 0.5, 'M'],
    ['System Sensor', 'i3 Thermal', '5251B', 'E', 'Heat Detector', 69, 'ea', 'Intelligent Thermal Detector', 0.5, 'M'],
    ['System Sensor', 'i3 Multi', '2251TM', 'E', 'Smoke Detector', 99, 'ea', 'Multi-criteria Smoke/Thermal', 0.5, 'M'],
    ['System Sensor', 'i3 Photo/Thermal', '2251CTLE', 'E', 'Smoke Detector', 119, 'ea', 'Low Flow Photoelectric', 0.5, 'M'],
    ['System Sensor', '2W-B', '2W-B', 'E', 'Smoke Detector', 39, 'ea', 'Conventional 2-wire Smoke', 0.5, 'L'],
    ['System Sensor', '5601P', '5601P', 'E', 'Heat Detector', 29, 'ea', 'Conventional Heat 135°F', 0.5, 'L'],
    ['System Sensor', '5602', '5602', 'E', 'Heat Detector', 29, 'ea', 'Conventional Heat 194°F', 0.5, 'L'],
    ['System Sensor', '5601A', '5601A', 'E', 'Heat Detector', 39, 'ea', 'Conventional Rate-of-Rise', 0.5, 'L'],
    ['System Sensor', 'DNRW', 'DNRW', 'E', 'Smoke Detector', 139, 'ea', 'Duct Smoke Detector 2-wire', 1.5, 'H'],
    ['System Sensor', 'D4120', 'D4120', 'E', 'Smoke Detector', 179, 'ea', 'Duct Smoke Detector 4-wire', 1.5, 'H'],
    ['System Sensor', 'D4S', 'D4S', 'E', 'Smoke Detector', 199, 'ea', 'Duct Smoke Intelligent', 1.5, 'H'],
    ['System Sensor', 'B501', 'B501', 'M', 'Detector Base', 9, 'ea', 'Standard Detector Base', 0.1, 'L'],
    ['System Sensor', 'B502', 'B502', 'M', 'Detector Base', 14, 'ea', 'Relay Detector Base', 0.1, 'L'],
    ['System Sensor', 'B200S', 'B200S', 'M', 'Detector Base', 39, 'ea', 'Sounder Base Addressable', 0.25, 'M'],
    ['System Sensor', 'B224RB', 'B224RB', 'M', 'Detector Base', 29, 'ea', 'Relay Base 2-wire', 0.1, 'L'],
    // ── SYSTEM SENSOR — Beam Detectors ──
    ['System Sensor', 'BEAM1224', 'BEAM1224', 'E', 'Smoke Detector', 499, 'ea', 'Projected Beam Smoke Detector', 2.0, 'H'],
    ['System Sensor', 'BEAM1224S', 'BEAM1224S', 'E', 'Smoke Detector', 599, 'ea', 'Reflected Beam Smoke Detector', 2.0, 'H'],

    // ── GENTEX — Notification Appliances ──
    ['Gentex', 'GES3-24WR', 'GES3-24WR', 'E', 'Horn/Strobe', 69, 'ea', 'Horn/Strobe Wall Red 24V', 0.75, 'M'],
    ['Gentex', 'GES3-24WW', 'GES3-24WW', 'E', 'Horn/Strobe', 69, 'ea', 'Horn/Strobe Wall White 24V', 0.75, 'M'],
    ['Gentex', 'GES3-24CR', 'GES3-24CR', 'E', 'Horn/Strobe', 79, 'ea', 'Horn/Strobe Ceiling Red 24V', 0.75, 'M'],
    ['Gentex', 'GEC3-24WR', 'GEC3-24WR', 'E', 'Horn/Strobe', 79, 'ea', 'Ceiling Horn/Strobe Red', 0.75, 'M'],
    ['Gentex', 'GOS3-24WR', 'GOS3-24WR', 'E', 'Horn/Strobe', 59, 'ea', 'Strobe Only Wall Red 24V', 0.5, 'L'],
    ['Gentex', 'GOS3-24WW', 'GOS3-24WW', 'E', 'Horn/Strobe', 59, 'ea', 'Strobe Only Wall White 24V', 0.5, 'L'],
    ['Gentex', 'WGES3-24WR', 'WGES3-24WR', 'E', 'Horn/Strobe', 79, 'ea', 'Weatherproof Horn/Strobe Red', 1.0, 'M'],
    // ── SYSTEM SENSOR — Notification ──
    ['System Sensor', 'P2R', 'P2R', 'E', 'Horn/Strobe', 59, 'ea', 'Horn/Strobe Wall Red', 0.75, 'M'],
    ['System Sensor', 'P2W', 'P2W', 'E', 'Horn/Strobe', 59, 'ea', 'Horn/Strobe Wall White', 0.75, 'M'],
    ['System Sensor', 'P2R-P', 'P2R-P', 'E', 'Horn/Strobe', 64, 'ea', 'Horn/Strobe Plain Wall Red', 0.75, 'M'],
    ['System Sensor', 'PC2R', 'PC2R', 'E', 'Horn/Strobe', 69, 'ea', 'Horn/Strobe Ceiling Red', 0.75, 'M'],
    ['System Sensor', 'SR', 'SR', 'E', 'Horn/Strobe', 49, 'ea', 'Strobe Only Wall Red', 0.5, 'L'],
    ['System Sensor', 'SW', 'SW', 'E', 'Horn/Strobe', 49, 'ea', 'Strobe Only Wall White', 0.5, 'L'],
    ['System Sensor', 'SPSW', 'SPSW', 'E', 'Horn/Strobe', 99, 'ea', 'Speaker/Strobe Wall White', 1.0, 'H'],
    ['System Sensor', 'SPSRL', 'SPSRL', 'E', 'Horn/Strobe', 109, 'ea', 'Speaker/Strobe Wall Red Low', 1.0, 'H'],
    ['System Sensor', 'SPSR', 'SPSR', 'E', 'Horn/Strobe', 99, 'ea', 'Speaker/Strobe Wall Red', 1.0, 'H'],
    ['System Sensor', 'SP2R1224MC', 'SP2R1224MC', 'E', 'Horn/Strobe', 119, 'ea', 'Speaker Wall Red Multi-candela', 1.0, 'H'],

    // ── EST / Edwards — Panels & Devices ──
    ['EST', 'EST3', 'EST3', 'E', 'FACP', 7999, 'ea', 'Life Safety Platform', 12.0, 'H'],
    ['EST', 'EST3X', 'EST3X', 'E', 'FACP', 5999, 'ea', 'Enhanced Life Safety Platform', 10.0, 'H'],
    ['EST', 'EST4', 'EST4', 'E', 'FACP', 9999, 'ea', 'Life Safety Platform Gen4', 12.0, 'H'],
    ['EST', 'iO1000', 'IO1000', 'E', 'FACP', 1999, 'ea', 'Intelligent Panel 50-pt', 6.0, 'H'],
    ['EST', 'iO500', 'IO500', 'E', 'FACP', 1499, 'ea', 'Intelligent Panel 25-pt', 5.0, 'H'],
    ['EST', 'SIGA-PS', 'SIGA-PS', 'E', 'Smoke Detector', 89, 'ea', 'Intelligent Photoelectric Smoke', 0.5, 'M'],
    ['EST', 'SIGA-PHS', 'SIGA-PHS', 'E', 'Smoke Detector', 109, 'ea', 'Intelligent Photo/Heat Multi', 0.5, 'M'],
    ['EST', 'SIGA-HFS', 'SIGA-HFS', 'E', 'Heat Detector', 79, 'ea', 'Intelligent Heat Detector', 0.5, 'M'],
    ['EST', 'SIGA-278', 'SIGA-278', 'E', 'Pull Station', 49, 'ea', 'Addressable Pull Station', 0.5, 'L'],
    ['EST', 'SIGA-CT1', 'SIGA-CT1', 'E', 'Fire Module', 69, 'ea', 'Control Module Single', 0.5, 'M'],
    ['EST', 'SIGA-CR', 'SIGA-CR', 'E', 'Fire Module', 79, 'ea', 'Control Module Relay', 0.5, 'M'],

    // ── Fire Alarm Cable ──
    ['Genesis', 'FPLP 14/2', '4402', 'M', 'Fire Cable', 0.39, 'ft', '14/2 FPLP Fire Alarm Cable', 0, 'L'],
    ['Genesis', 'FPLP 16/2', '4502', 'M', 'Fire Cable', 0.29, 'ft', '16/2 FPLP Fire Alarm Cable', 0, 'L'],
    ['Genesis', 'FPLP 16/4', '4504', 'M', 'Fire Cable', 0.42, 'ft', '16/4 FPLP Fire Alarm Cable', 0, 'L'],
    ['Genesis', 'FPLP 18/2', '4602', 'M', 'Fire Cable', 0.22, 'ft', '18/2 FPLP Fire Alarm Cable', 0, 'L'],
    ['Genesis', 'FPLP 18/4', '4604', 'M', 'Fire Cable', 0.35, 'ft', '18/4 FPLP Fire Alarm Cable', 0, 'L'],
    ['Genesis', 'FPLR 14/2', '5402', 'M', 'Fire Cable', 0.35, 'ft', '14/2 FPLR Riser Fire Cable', 0, 'L'],
    ['Genesis', 'FPLR 16/2', '5502', 'M', 'Fire Cable', 0.25, 'ft', '16/2 FPLR Riser Fire Cable', 0, 'L'],
    ['West Penn', 'FPLP 60992B', '60992B', 'M', 'Fire Cable', 0.32, 'ft', '16/2 Shielded Fire Cable', 0, 'L'],
    ['West Penn', 'FPLP 60993B', '60993B', 'M', 'Fire Cable', 0.45, 'ft', '16/4 Shielded Fire Cable', 0, 'L'],
    ['West Penn', 'FPLP 60991B', '60991B', 'M', 'Fire Cable', 0.21, 'ft', '18/2 Fire Cable', 0, 'L'],
];

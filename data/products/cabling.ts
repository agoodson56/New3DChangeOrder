import { CompactProduct } from './types';

// ============================================================================
// STRUCTURED CABLING — Berk-Tek, Leviton, Panduit, CommScope, Corning (~800)
// Copper, Fiber & Connectivity combined
// ============================================================================

export const CATALOG_CABLING: CompactProduct[] = [
    // ══════════════════════════════════════════════════════════════
    // COPPER CABLE
    // ══════════════════════════════════════════════════════════════

    // ── BERK-TEK — Cat6A ──
    ['Berk-Tek', 'LANmark-10G2 Cat6A', '10032426', 'M', 'Cat6A Cable', 0.59, 'ft', 'Cat6A UTP Plenum Blue', 0, 'L'],
    ['Berk-Tek', 'LANmark-10G2 Cat6A Wht', '10032427', 'M', 'Cat6A Cable', 0.59, 'ft', 'Cat6A UTP Plenum White', 0, 'L'],
    ['Berk-Tek', 'LANmark-10G2 Cat6A Grn', '10032428', 'M', 'Cat6A Cable', 0.59, 'ft', 'Cat6A UTP Plenum Green', 0, 'L'],
    ['Berk-Tek', 'LANmark-10G2 Cat6A Yel', '10032429', 'M', 'Cat6A Cable', 0.59, 'ft', 'Cat6A UTP Plenum Yellow', 0, 'L'],
    ['Berk-Tek', 'LANmark-10G2 Cat6A Org', '10032430', 'M', 'Cat6A Cable', 0.59, 'ft', 'Cat6A UTP Plenum Orange', 0, 'L'],
    ['Berk-Tek', 'LANmark-10G2 Cat6A STP', '10032450', 'M', 'Cat6A Cable', 0.79, 'ft', 'Cat6A STP Plenum Blue', 0, 'L'],
    ['Berk-Tek', 'LANmark-10G2 Cat6A Riser', '10032460', 'M', 'Cat6A Cable', 0.45, 'ft', 'Cat6A UTP Riser Blue', 0, 'L'],
    ['Berk-Tek', 'LANmark-10G2 Cat6A Riser Wht', '10032461', 'M', 'Cat6A Cable', 0.45, 'ft', 'Cat6A UTP Riser White', 0, 'L'],
    // ── BERK-TEK — Cat6 ──
    ['Berk-Tek', 'LANmark-6 Cat6', '11074726', 'M', 'Cat6 Cable', 0.35, 'ft', 'Cat6 UTP Plenum Blue', 0, 'L'],
    ['Berk-Tek', 'LANmark-6 Cat6 Wht', '11074727', 'M', 'Cat6 Cable', 0.35, 'ft', 'Cat6 UTP Plenum White', 0, 'L'],
    ['Berk-Tek', 'LANmark-6 Cat6 Org', '11074730', 'M', 'Cat6 Cable', 0.35, 'ft', 'Cat6 UTP Plenum Orange', 0, 'L'],
    ['Berk-Tek', 'LANmark-6 Cat6 Riser', '11074740', 'M', 'Cat6 Cable', 0.25, 'ft', 'Cat6 UTP Riser Blue', 0, 'L'],
    // ── BERK-TEK — Cat5e ──
    ['Berk-Tek', 'LANmark-350 Cat5e', '10034662', 'M', 'Cat5e Cable', 0.22, 'ft', 'Cat5e UTP Plenum Blue', 0, 'L'],
    ['Berk-Tek', 'LANmark-350 Cat5e Wht', '10034663', 'M', 'Cat5e Cable', 0.22, 'ft', 'Cat5e UTP Plenum White', 0, 'L'],
    ['Berk-Tek', 'LANmark-350 Cat5e Riser', '10034670', 'M', 'Cat5e Cable', 0.15, 'ft', 'Cat5e UTP Riser Blue', 0, 'L'],
    // ── COMMSCOPE — Cat6A ──
    ['CommScope', 'SYSTIMAX 2091B Cat6A', '760152543', 'M', 'Cat6A Cable', 0.69, 'ft', 'Cat6A U/UTP Plenum Blue', 0, 'L'],
    ['CommScope', 'SYSTIMAX 2091B Cat6A Wht', '760152544', 'M', 'Cat6A Cable', 0.69, 'ft', 'Cat6A U/UTP Plenum White', 0, 'L'],
    ['CommScope', 'SYSTIMAX 2091A Cat6A STP', '760152550', 'M', 'Cat6A Cable', 0.89, 'ft', 'Cat6A F/UTP Plenum Blue', 0, 'L'],
    ['CommScope', 'SYSTIMAX 2071B Cat6A Riser', '760152560', 'M', 'Cat6A Cable', 0.52, 'ft', 'Cat6A U/UTP Riser Blue', 0, 'L'],
    // ── COMMSCOPE — Cat6 ──
    ['CommScope', 'SYSTIMAX GigaSPEED XL Cat6', '760041543', 'M', 'Cat6 Cable', 0.39, 'ft', 'Cat6 UTP Plenum Blue', 0, 'L'],
    ['CommScope', 'SYSTIMAX GigaSPEED XL Cat6 Wht', '760041544', 'M', 'Cat6 Cable', 0.39, 'ft', 'Cat6 UTP Plenum White', 0, 'L'],
    ['CommScope', 'SYSTIMAX GigaSPEED Cat6 Riser', '760041560', 'M', 'Cat6 Cable', 0.29, 'ft', 'Cat6 UTP Riser Blue', 0, 'L'],
    // ── SUPERIOR ESSEX — Cable ──
    ['Superior Essex', 'Cat6A 10GXS', '77-240-2A', 'M', 'Cat6A Cable', 0.55, 'ft', 'Cat6A UTP Plenum Blue', 0, 'L'],
    ['Superior Essex', 'Cat6A 10GXS Wht', '77-240-2B', 'M', 'Cat6A Cable', 0.55, 'ft', 'Cat6A UTP Plenum White', 0, 'L'],
    ['Superior Essex', 'Cat6 LSZH', '51-240-2A', 'M', 'Cat6 Cable', 0.32, 'ft', 'Cat6 UTP Plenum Blue', 0, 'L'],
    ['Superior Essex', 'Cat5e', '51-240-2C', 'M', 'Cat5e Cable', 0.19, 'ft', 'Cat5e UTP Plenum Blue', 0, 'L'],
    // ── GENERAL CABLE / Southwire ──
    ['General Cable', 'GenSPEED 6 Plenum', '2133601E', 'M', 'Cat6 Cable', 0.33, 'ft', 'Cat6 UTP Plenum Blue', 0, 'L'],
    ['General Cable', 'GenSPEED 6A Plenum', '2136001E', 'M', 'Cat6A Cable', 0.56, 'ft', 'Cat6A UTP Plenum Blue', 0, 'L'],
    ['General Cable', 'GenSPEED 5e Plenum', '2131601E', 'M', 'Cat5e Cable', 0.19, 'ft', 'Cat5e UTP Plenum Blue', 0, 'L'],
    // ── Low Voltage Cable (18/2, 22/4, etc) ──
    ['General Cable', '22/4 Stranded Plenum', '5012310E', 'M', 'Low Voltage Cable', 0.12, 'ft', '22/4 Stranded Plenum Shield', 0, 'L'],
    ['General Cable', '22/2 Stranded Plenum', '5012314E', 'M', 'Low Voltage Cable', 0.09, 'ft', '22/2 Stranded Plenum Shield', 0, 'L'],
    ['General Cable', '18/2 Stranded Plenum', '5012210E', 'M', 'Low Voltage Cable', 0.14, 'ft', '18/2 Stranded Plenum Shield', 0, 'L'],
    ['General Cable', '18/4 Stranded Plenum', '5012214E', 'M', 'Low Voltage Cable', 0.22, 'ft', '18/4 Stranded Plenum Shield', 0, 'L'],

    // ══════════════════════════════════════════════════════════════
    // FIBER CABLE
    // ══════════════════════════════════════════════════════════════

    // ── CORNING ──
    ['Corning', '6F SM Plenum', '006K88-31130-29', 'M', 'Fiber Cable', 0.99, 'ft', '6-fiber SM OS2 Plenum', 0, 'M'],
    ['Corning', '12F SM Plenum', '012K88-31130-29', 'M', 'Fiber Cable', 1.49, 'ft', '12-fiber SM OS2 Plenum', 0, 'M'],
    ['Corning', '24F SM Plenum', '024K88-31130-29', 'M', 'Fiber Cable', 1.99, 'ft', '24-fiber SM OS2 Plenum', 0, 'M'],
    ['Corning', '48F SM Plenum', '048K88-31130-29', 'M', 'Fiber Cable', 2.99, 'ft', '48-fiber SM OS2 Plenum', 0, 'M'],
    ['Corning', '6F OM3 Plenum', '006K81-31130-29', 'M', 'Fiber Cable', 0.89, 'ft', '6-fiber MM OM3 Plenum', 0, 'M'],
    ['Corning', '12F OM3 Plenum', '012K81-31130-29', 'M', 'Fiber Cable', 1.29, 'ft', '12-fiber MM OM3 Plenum', 0, 'M'],
    ['Corning', '12F OM4 Plenum', '012K81-31130-A4', 'M', 'Fiber Cable', 1.59, 'ft', '12-fiber MM OM4 Plenum', 0, 'M'],
    ['Corning', '6F SM Riser', '006K88-31130-R2', 'M', 'Fiber Cable', 0.79, 'ft', '6-fiber SM OS2 Riser', 0, 'M'],
    ['Corning', '12F SM Riser', '012K88-31130-R2', 'M', 'Fiber Cable', 1.19, 'ft', '12-fiber SM OS2 Riser', 0, 'M'],
    // ── CORNING — Fiber Enclosures ──
    ['Corning', 'CCH-01U', 'CCH-01U', 'E', 'Fiber Enclosure', 149, 'ea', '1U Rack Housing 2 panels', 1.0, 'M'],
    ['Corning', 'CCH-02U', 'CCH-02U', 'E', 'Fiber Enclosure', 199, 'ea', '2U Rack Housing 4 panels', 1.0, 'M'],
    ['Corning', 'CCH-04U', 'CCH-04U', 'E', 'Fiber Enclosure', 349, 'ea', '4U Rack Housing 8 panels', 1.5, 'H'],
    ['Corning', 'WCH-02P', 'WCH-02P', 'E', 'Fiber Enclosure', 89, 'ea', 'Wall Mount Housing 2 panels', 0.75, 'L'],
    ['Corning', 'WCH-04P', 'WCH-04P', 'E', 'Fiber Enclosure', 129, 'ea', 'Wall Mount Housing 4 panels', 1.0, 'M'],
    // ── CORNING — Fiber Panels ──
    ['Corning', 'CCH-CP12-A9', 'CCH-CP12-A9', 'M', 'Fiber Panel', 49, 'ea', 'LC Duplex Panel 12-fiber SM', 0.5, 'M'],
    ['Corning', 'CCH-CP24-A9', 'CCH-CP24-A9', 'M', 'Fiber Panel', 79, 'ea', 'LC Duplex Panel 24-fiber SM', 0.5, 'M'],
    ['Corning', 'CCH-CP12-59', 'CCH-CP12-59', 'M', 'Fiber Panel', 49, 'ea', 'LC Duplex Panel 12-fiber MM', 0.5, 'M'],
    // ── CORNING — Fiber Pigtails / Connectors ──
    ['Corning', 'UniCam LC SM', '95-050-99-SP', 'M', 'Fiber Connector', 19, 'ea', 'UniCam LC Connector SM', 0.25, 'M'],
    ['Corning', 'UniCam LC MM', '95-050-51-SP', 'M', 'Fiber Connector', 17, 'ea', 'UniCam LC Connector MM', 0.25, 'M'],
    ['Corning', 'UniCam SC SM', '95-000-99-SP', 'M', 'Fiber Connector', 21, 'ea', 'UniCam SC Connector SM', 0.25, 'M'],
    ['Corning', 'UniCam Tool Kit', '95-050-99-TK', 'E', 'Fiber Tool', 799, 'ea', 'UniCam Installation Tool Kit', 0, 'H'],

    // ══════════════════════════════════════════════════════════════
    // CONNECTIVITY — Jacks, Patch Panels, Patch Cables, Keystones
    // ══════════════════════════════════════════════════════════════

    // ── LEVITON — Jacks ──
    ['Leviton', 'eXtreme Cat6A Jack Blue', '6110G-RL6', 'M', 'Jack', 16, 'ea', 'Cat6A UTP Jack Blue', 0.15, 'L'],
    ['Leviton', 'eXtreme Cat6A Jack White', '6110G-RW6', 'M', 'Jack', 16, 'ea', 'Cat6A UTP Jack White', 0.15, 'L'],
    ['Leviton', 'eXtreme Cat6A Jack Ivory', '6110G-RI6', 'M', 'Jack', 16, 'ea', 'Cat6A UTP Jack Ivory', 0.15, 'L'],
    ['Leviton', 'eXtreme Cat6A Jack Orange', '6110G-RO6', 'M', 'Jack', 16, 'ea', 'Cat6A UTP Jack Orange', 0.15, 'L'],
    ['Leviton', 'eXtreme Cat6 Jack Blue', '61110-RL6', 'M', 'Jack', 9, 'ea', 'Cat6 UTP Jack Blue', 0.15, 'L'],
    ['Leviton', 'eXtreme Cat6 Jack White', '61110-RW6', 'M', 'Jack', 9, 'ea', 'Cat6 UTP Jack White', 0.15, 'L'],
    ['Leviton', 'eXtreme Cat6 Jack Ivory', '61110-RI6', 'M', 'Jack', 9, 'ea', 'Cat6 UTP Jack Ivory', 0.15, 'L'],
    ['Leviton', 'eXtreme Cat5e Jack Blue', '5G108-RL5', 'M', 'Jack', 6, 'ea', 'Cat5e UTP Jack Blue', 0.15, 'L'],
    ['Leviton', 'eXtreme Cat5e Jack White', '5G108-RW5', 'M', 'Jack', 6, 'ea', 'Cat5e UTP Jack White', 0.15, 'L'],
    // ── LEVITON — Patch Panels ──
    ['Leviton', '49255-H48', '49255-H48', 'E', 'Patch Panel', 249, 'ea', '48-port Cat6A Flat Patch Panel', 2.0, 'M'],
    ['Leviton', '49255-H24', '49255-H24', 'E', 'Patch Panel', 149, 'ea', '24-port Cat6A Flat Patch Panel', 1.5, 'M'],
    ['Leviton', '49255-L48', '49255-L48', 'E', 'Patch Panel', 199, 'ea', '48-port Cat6 Flat Patch Panel', 2.0, 'M'],
    ['Leviton', '49255-L24', '49255-L24', 'E', 'Patch Panel', 119, 'ea', '24-port Cat6 Flat Patch Panel', 1.5, 'M'],
    ['Leviton', '49255-S48', '49255-S48', 'E', 'Patch Panel', 109, 'ea', '48-port Cat5e Patch Panel', 2.0, 'L'],
    ['Leviton', '49255-S24', '49255-S24', 'E', 'Patch Panel', 69, 'ea', '24-port Cat5e Patch Panel', 1.5, 'L'],
    // ── LEVITON — Faceplates ──
    ['Leviton', '1-Port Faceplate White', '41080-1WP', 'M', 'Faceplate', 2, 'ea', 'QuickPort 1-Port White', 0.1, 'L'],
    ['Leviton', '2-Port Faceplate White', '41080-2WP', 'M', 'Faceplate', 2.50, 'ea', 'QuickPort 2-Port White', 0.1, 'L'],
    ['Leviton', '4-Port Faceplate White', '41080-4WP', 'M', 'Faceplate', 3, 'ea', 'QuickPort 4-Port White', 0.1, 'L'],
    ['Leviton', '6-Port Faceplate White', '41080-6WP', 'M', 'Faceplate', 3.50, 'ea', 'QuickPort 6-Port White', 0.1, 'L'],
    ['Leviton', '1-Port Faceplate Ivory', '41080-1IP', 'M', 'Faceplate', 2, 'ea', 'QuickPort 1-Port Ivory', 0.1, 'L'],
    ['Leviton', '2-Port Faceplate Ivory', '41080-2IP', 'M', 'Faceplate', 2.50, 'ea', 'QuickPort 2-Port Ivory', 0.1, 'L'],
    ['Leviton', '2-Port Surface Box White', '41089-2WP', 'M', 'Surface Box', 4, 'ea', 'Surface Mount Box 2-Port White', 0.1, 'L'],
    // ── LEVITON — Patch Cables ──
    ['Leviton', 'Cat6A Patch 3ft Blue', '6A460-03L', 'M', 'Patch Cable', 12, 'ea', 'Cat6A Slim Patch 3ft Blue', 0, 'L'],
    ['Leviton', 'Cat6A Patch 5ft Blue', '6A460-05L', 'M', 'Patch Cable', 15, 'ea', 'Cat6A Slim Patch 5ft Blue', 0, 'L'],
    ['Leviton', 'Cat6A Patch 7ft Blue', '6A460-07L', 'M', 'Patch Cable', 18, 'ea', 'Cat6A Slim Patch 7ft Blue', 0, 'L'],
    ['Leviton', 'Cat6A Patch 10ft Blue', '6A460-10L', 'M', 'Patch Cable', 22, 'ea', 'Cat6A Slim Patch 10ft Blue', 0, 'L'],
    ['Leviton', 'Cat6 Patch 3ft Blue', '62460-03L', 'M', 'Patch Cable', 6, 'ea', 'Cat6 Patch 3ft Blue', 0, 'L'],
    ['Leviton', 'Cat6 Patch 5ft Blue', '62460-05L', 'M', 'Patch Cable', 8, 'ea', 'Cat6 Patch 5ft Blue', 0, 'L'],
    ['Leviton', 'Cat6 Patch 7ft Blue', '62460-07L', 'M', 'Patch Cable', 10, 'ea', 'Cat6 Patch 7ft Blue', 0, 'L'],
    ['Leviton', 'Cat6 Patch 10ft Blue', '62460-10L', 'M', 'Patch Cable', 13, 'ea', 'Cat6 Patch 10ft Blue', 0, 'L'],

    // ── PANDUIT — Jacks ──
    ['Panduit', 'CJ688TGBL', 'CJ688TGBL', 'M', 'Jack', 11, 'ea', 'Mini-Com Cat6 Jack Blue', 0.15, 'L'],
    ['Panduit', 'CJ688TGWH', 'CJ688TGWH', 'M', 'Jack', 11, 'ea', 'Mini-Com Cat6 Jack White', 0.15, 'L'],
    ['Panduit', 'CJ688TGIW', 'CJ688TGIW', 'M', 'Jack', 11, 'ea', 'Mini-Com Cat6 Jack Off-White', 0.15, 'L'],
    ['Panduit', 'CJ688TGOR', 'CJ688TGOR', 'M', 'Jack', 11, 'ea', 'Mini-Com Cat6 Jack Orange', 0.15, 'L'],
    ['Panduit', 'CJ6X88TGBL', 'CJ6X88TGBL', 'M', 'Jack', 18, 'ea', 'Mini-Com Cat6A Jack Blue', 0.15, 'L'],
    ['Panduit', 'CJ6X88TGWH', 'CJ6X88TGWH', 'M', 'Jack', 18, 'ea', 'Mini-Com Cat6A Jack White', 0.15, 'L'],
    ['Panduit', 'CJ6X88TGIW', 'CJ6X88TGIW', 'M', 'Jack', 18, 'ea', 'Mini-Com Cat6A Jack Off-White', 0.15, 'L'],
    ['Panduit', 'CJ5E88TGBL', 'CJ5E88TGBL', 'M', 'Jack', 7, 'ea', 'Mini-Com Cat5e Jack Blue', 0.15, 'L'],
    ['Panduit', 'CJ5E88TGWH', 'CJ5E88TGWH', 'M', 'Jack', 7, 'ea', 'Mini-Com Cat5e Jack White', 0.15, 'L'],
    // ── PANDUIT — Patch Panels ──
    ['Panduit', 'CPPLA48WBLY', 'CPPLA48WBLY', 'E', 'Patch Panel', 199, 'ea', '48-port Angled Patch Panel', 2.0, 'M'],
    ['Panduit', 'CPPL48WBLY', 'CPPL48WBLY', 'E', 'Patch Panel', 179, 'ea', '48-port Flat Patch Panel', 2.0, 'M'],
    ['Panduit', 'CPPLA24WBLY', 'CPPLA24WBLY', 'E', 'Patch Panel', 119, 'ea', '24-port Angled Patch Panel', 1.5, 'M'],
    ['Panduit', 'CPPL24WBLY', 'CPPL24WBLY', 'E', 'Patch Panel', 99, 'ea', '24-port Flat Patch Panel', 1.5, 'L'],
    // ── PANDUIT — Faceplates ──
    ['Panduit', 'CFPE2IWY', 'CFPE2IWY', 'M', 'Faceplate', 2.50, 'ea', '2-Port Faceplate Off-White', 0.1, 'L'],
    ['Panduit', 'CFPE2WHY', 'CFPE2WHY', 'M', 'Faceplate', 2.50, 'ea', '2-Port Faceplate White', 0.1, 'L'],
    ['Panduit', 'CFPE4IWY', 'CFPE4IWY', 'M', 'Faceplate', 3, 'ea', '4-Port Faceplate Off-White', 0.1, 'L'],
    ['Panduit', 'CBXF6IW-AY', 'CBXF6IW-AY', 'M', 'Surface Box', 5, 'ea', '6-port Surface Mount Box', 0.1, 'L'],
    // ── PANDUIT — Patch Cables ──
    ['Panduit', 'UTPSP3BUY Cat6 3ft', 'UTPSP3BUY', 'M', 'Patch Cable', 5, 'ea', 'Cat6 Patch 3ft Blue', 0, 'L'],
    ['Panduit', 'UTPSP5BUY Cat6 5ft', 'UTPSP5BUY', 'M', 'Patch Cable', 7, 'ea', 'Cat6 Patch 5ft Blue', 0, 'L'],
    ['Panduit', 'UTPSP7BUY Cat6 7ft', 'UTPSP7BUY', 'M', 'Patch Cable', 9, 'ea', 'Cat6 Patch 7ft Blue', 0, 'L'],
    ['Panduit', 'UTP6AX3BU Cat6A 3ft', 'UTP6AX3BU', 'M', 'Patch Cable', 14, 'ea', 'Cat6A Patch 3ft Blue', 0, 'L'],
    ['Panduit', 'UTP6AX5BU Cat6A 5ft', 'UTP6AX5BU', 'M', 'Patch Cable', 17, 'ea', 'Cat6A Patch 5ft Blue', 0, 'L'],
    ['Panduit', 'UTP6AX7BU Cat6A 7ft', 'UTP6AX7BU', 'M', 'Patch Cable', 21, 'ea', 'Cat6A Patch 7ft Blue', 0, 'L'],

    // ── HUBBELL — Jacks & Panels ──
    ['Hubbell', 'HJ6A1 Cat6A Jack Blue', 'HJ6A1', 'M', 'Jack', 14, 'ea', 'SpeedGain Cat6A Jack Blue', 0.15, 'L'],
    ['Hubbell', 'HJ6A1W Cat6A Jack White', 'HJ6A1W', 'M', 'Jack', 14, 'ea', 'SpeedGain Cat6A Jack White', 0.15, 'L'],
    ['Hubbell', 'HJ61 Cat6 Jack Blue', 'HJ61', 'M', 'Jack', 8, 'ea', 'SpeedGain Cat6 Jack Blue', 0.15, 'L'],
    ['Hubbell', 'HP648 48-port Panel', 'HP648', 'E', 'Patch Panel', 169, 'ea', '48-port Angled Panel', 2.0, 'M'],
    ['Hubbell', 'HP624 24-port Panel', 'HP624', 'E', 'Patch Panel', 99, 'ea', '24-port Angled Panel', 1.5, 'L'],

    // ── Fiber Patch Cables ──
    ['Corning', 'LC-LC SM 1m', '002781', 'M', 'Fiber Patch', 15, 'ea', 'LC Duplex SM OS2 Patch 1m', 0, 'L'],
    ['Corning', 'LC-LC SM 3m', '002783', 'M', 'Fiber Patch', 19, 'ea', 'LC Duplex SM OS2 Patch 3m', 0, 'L'],
    ['Corning', 'LC-LC SM 5m', '002785', 'M', 'Fiber Patch', 25, 'ea', 'LC Duplex SM OS2 Patch 5m', 0, 'L'],
    ['Corning', 'LC-LC OM3 1m', '002791', 'M', 'Fiber Patch', 13, 'ea', 'LC Duplex OM3 Patch 1m Aqua', 0, 'L'],
    ['Corning', 'LC-LC OM3 3m', '002793', 'M', 'Fiber Patch', 17, 'ea', 'LC Duplex OM3 Patch 3m Aqua', 0, 'L'],
    ['Corning', 'LC-LC OM4 3m', '002797', 'M', 'Fiber Patch', 22, 'ea', 'LC Duplex OM4 Patch 3m Aqua', 0, 'L'],
    ['Corning', 'SC-SC SM 3m', '003783', 'M', 'Fiber Patch', 22, 'ea', 'SC Duplex SM OS2 Patch 3m', 0, 'L'],
    ['Corning', 'MPO-MPO SM 10m', '002881', 'M', 'Fiber Patch', 149, 'ea', 'MPO Trunk SM 12F 10m', 0, 'M'],
    ['Corning', 'MPO-MPO OM4 10m', '002891', 'M', 'Fiber Patch', 139, 'ea', 'MPO Trunk OM4 12F 10m', 0, 'M'],
];

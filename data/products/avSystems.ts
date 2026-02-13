import { CompactProduct } from './types';

// ============================================================================
// AV SYSTEMS — Crestron, Biamp, QSC, Extron, Shure, Atlas, Samsung, JBL, Crown, Bose (~500)
// ============================================================================

export const CATALOG_AV_SYSTEMS: CompactProduct[] = [
    // ── CRESTRON — Control Processors ──
    ['Crestron', 'CP4N', 'CP4N', 'E', 'AV Control', 3999, 'ea', '4-Series Control Processor', 4.0, 'H'],
    ['Crestron', 'CP4', 'CP4', 'E', 'AV Control', 2999, 'ea', '4-Series Entry Control Processor', 3.0, 'H'],
    ['Crestron', 'RMC4', 'RMC4', 'E', 'AV Control', 1999, 'ea', 'Room Media Controller', 3.0, 'H'],
    ['Crestron', 'MC4-R', 'MC4-R', 'E', 'AV Control', 4499, 'ea', '4-Series Media Controller Rack', 4.0, 'H'],
    ['Crestron', 'AirMedia AM-3200', 'AM-3200', 'E', 'AV Control', 1699, 'ea', 'AirMedia Wireless Presentation', 2.0, 'H'],
    ['Crestron', 'AirMedia AM-3100-WF', 'AM-3100-WF', 'E', 'AV Control', 1299, 'ea', 'AirMedia Receiver WiFi', 2.0, 'M'],
    // ── CRESTRON — Touch Panels ──
    ['Crestron', 'TSW-760', 'TSW-760-B-S', 'E', 'AV Touch Panel', 1799, 'ea', '7" Touch Screen Black', 2.0, 'H'],
    ['Crestron', 'TSW-1060', 'TSW-1060-B-S', 'E', 'AV Touch Panel', 2499, 'ea', '10" Touch Screen Black', 2.0, 'H'],
    ['Crestron', 'TSW-1070', 'TSW-1070-B-S', 'E', 'AV Touch Panel', 2999, 'ea', '10" Touch Screen Gen3', 2.0, 'H'],
    ['Crestron', 'TST-902', 'TST-902-B-S', 'E', 'AV Touch Panel', 1299, 'ea', 'Tabletop Touch Screen', 1.5, 'M'],
    // ── CRESTRON — Switching & Distribution ──
    ['Crestron', 'DM-NVX-350', 'DM-NVX-350', 'E', 'AV Encoder', 2499, 'ea', '4K60 Network AV Encoder/Decoder', 2.0, 'H'],
    ['Crestron', 'DM-NVX-360', 'DM-NVX-360', 'E', 'AV Encoder', 2999, 'ea', '4K60 4:4:4 Network AV Encoder', 2.0, 'H'],
    ['Crestron', 'DM-NVX-E30', 'DM-NVX-E30', 'E', 'AV Encoder', 1499, 'ea', '4K30 Network AV Encoder', 1.5, 'M'],
    ['Crestron', 'DM-NVX-D30', 'DM-NVX-D30', 'E', 'AV Decoder', 1499, 'ea', '4K30 Network AV Decoder', 1.5, 'M'],
    ['Crestron', 'HD-DA2-4KZ-E', 'HD-DA2-4KZ-E', 'E', 'AV Distribution', 499, 'ea', '1x2 4K HDMI Distribution Amp', 0.5, 'L'],
    ['Crestron', 'HD-DA4-4KZ-E', 'HD-DA4-4KZ-E', 'E', 'AV Distribution', 699, 'ea', '1x4 4K HDMI Distribution Amp', 0.5, 'M'],
    ['Crestron', 'HD-MD4X2-4KZ-E', 'HD-MD4X2-4KZ-E', 'E', 'AV Switcher', 1299, 'ea', '4x2 4K HDMI Matrix Switcher', 1.5, 'H'],
    ['Crestron', 'DM-MD8X8', 'DM-MD8X8', 'E', 'AV Switcher', 7999, 'ea', '8x8 DigitalMedia Matrix', 4.0, 'H'],
    ['Crestron', 'DM-MD16X16', 'DM-MD16X16', 'E', 'AV Switcher', 14999, 'ea', '16x16 DigitalMedia Matrix', 6.0, 'H'],
    ['Crestron', 'DM-MD32X32', 'DM-MD32X32', 'E', 'AV Switcher', 24999, 'ea', '32x32 DigitalMedia Matrix', 8.0, 'H'],

    // ── BIAMP — DSPs ──
    ['Biamp', 'TesiraFORTE AI', 'TesiraFORTE-AI', 'E', 'AV DSP', 3499, 'ea', '12x8 DSP AVB Dante', 3.0, 'H'],
    ['Biamp', 'TesiraFORTE DAN', 'TesiraFORTE-DAN', 'E', 'AV DSP', 4499, 'ea', 'DSP Dante I/O', 3.0, 'H'],
    ['Biamp', 'TesiraFORTE VT', 'TesiraFORTE-VT', 'E', 'AV DSP', 3999, 'ea', 'DSP USB/Dante VoIP', 3.0, 'H'],
    ['Biamp', 'TesiraFORTE CI', 'TesiraFORTE-CI', 'E', 'AV DSP', 4999, 'ea', 'Conferencing DSP Dante', 3.0, 'H'],
    ['Biamp', 'Tesira SERVER', 'TESIRA-SERVER', 'E', 'AV DSP', 7999, 'ea', 'DSP Server 48 channels', 4.0, 'H'],
    ['Biamp', 'Tesira SERVER-IO', 'TESIRA-SERVER-IO', 'E', 'AV DSP', 5999, 'ea', 'DSP Server I/O', 4.0, 'H'],
    // ── BIAMP — Amplifiers ──
    ['Biamp', 'Tesira AMP-450P', 'AMP-450P', 'E', 'AV Amplifier', 2999, 'ea', '4ch 450W PoE+ Amplifier', 2.0, 'H'],
    ['Biamp', 'Tesira AMP-450BP', 'AMP-450BP', 'E', 'AV Amplifier', 3499, 'ea', '4ch 450W Dante Amplifier', 2.0, 'H'],
    ['Biamp', 'Community AMP-460', 'AMP-460', 'E', 'AV Amplifier', 1999, 'ea', '4ch 60W Compact Amplifier', 1.5, 'M'],
    // ── BIAMP — Microphones ──
    ['Biamp', 'Parlé TCM-X', 'TCM-X-A-W', 'E', 'AV Microphone', 899, 'ea', 'Ceiling Beamtracking Mic', 2.0, 'H'],
    ['Biamp', 'Parlé TCM-XA', 'TCM-XA-A-W', 'E', 'AV Microphone', 1199, 'ea', 'Ceiling Beamtracking Mic Dante', 2.0, 'H'],
    ['Biamp', 'Parlé TTM-X', 'TTM-X-W', 'E', 'AV Microphone', 499, 'ea', 'Tabletop Beamtracking Mic', 0.5, 'M'],

    // ── QSC — Processors / DSP ──
    ['QSC', 'Core 110f', 'CORE-110F', 'E', 'AV DSP', 4999, 'ea', 'Q-SYS Core Processor', 4.0, 'H'],
    ['QSC', 'Core 510i', 'CORE-510I', 'E', 'AV DSP', 7999, 'ea', 'Q-SYS Core Processor Enterprise', 4.0, 'H'],
    ['QSC', 'Core Nano', 'CORE-NANO', 'E', 'AV DSP', 1999, 'ea', 'Q-SYS Compact Core Processor', 3.0, 'H'],
    ['QSC', 'Core 8 Flex', 'CORE-8-FLEX', 'E', 'AV DSP', 2999, 'ea', 'Q-SYS 8-channel Core Processor', 3.0, 'H'],
    ['QSC', 'I/O-8 Flex', 'IO-8-FLEX', 'E', 'AV DSP', 999, 'ea', 'Q-SYS 8ch I/O Expander', 1.5, 'M'],
    // ── QSC — Amplifiers ──
    ['QSC', 'CX-302V', 'CX302V', 'E', 'AV Amplifier', 599, 'ea', '2ch 200W Power Amplifier', 1.5, 'M'],
    ['QSC', 'CX-502', 'CX502', 'E', 'AV Amplifier', 799, 'ea', '2ch 300W Power Amplifier', 1.5, 'M'],
    ['QSC', 'CX-902', 'CX902', 'E', 'AV Amplifier', 1199, 'ea', '2ch 550W Power Amplifier', 1.5, 'H'],
    ['QSC', 'CXD4.3', 'CXD4.3', 'E', 'AV Amplifier', 1999, 'ea', '4ch 400W Dante Amplifier', 2.0, 'H'],
    ['QSC', 'CXD4.5', 'CXD4.5', 'E', 'AV Amplifier', 2499, 'ea', '4ch 700W Dante Amplifier', 2.0, 'H'],
    ['QSC', 'SPA2-200', 'SPA2-200', 'E', 'AV Amplifier', 499, 'ea', '2ch 200W Install Amplifier', 1.5, 'M'],
    // ── QSC — Speakers ──
    ['QSC', 'AD-C4T', 'AD-C4T-BK', 'E', 'AV Speaker', 179, 'ea', '4" Ceiling Speaker 70/100V', 1.0, 'L'],
    ['QSC', 'AD-C6T', 'AD-C6T-BK', 'E', 'AV Speaker', 249, 'ea', '6.5" Ceiling Speaker 70/100V', 1.0, 'M'],
    ['QSC', 'AD-C8T', 'AD-C8T-BK', 'E', 'AV Speaker', 349, 'ea', '8" Ceiling Speaker 70/100V', 1.0, 'M'],
    ['QSC', 'AD-S4T', 'AD-S4T-BK', 'E', 'AV Speaker', 179, 'ea', '4" Surface Speaker 70/100V', 1.0, 'L'],
    ['QSC', 'AD-S6T', 'AD-S6T-BK', 'E', 'AV Speaker', 249, 'ea', '6.5" Surface Speaker 70/100V', 1.0, 'M'],
    ['QSC', 'AD-S8T', 'AD-S8T-BK', 'E', 'AV Speaker', 349, 'ea', '8" Surface Speaker 70/100V', 1.0, 'M'],
    ['QSC', 'AD-S82H', 'AD-S82H-BK', 'E', 'AV Speaker', 499, 'ea', '8" Surface Speaker High Output', 1.5, 'M'],
    ['QSC', 'AC-C6T', 'AC-C6T', 'E', 'AV Speaker', 399, 'ea', '6.5" Ceiling Speaker Premium', 1.0, 'M'],

    // ── EXTRON — Switching & Signal Processing ──
    ['Extron', 'DTP CrossPoint 84 4K', 'DTP-CP-84-4K', 'E', 'AV Switcher', 9999, 'ea', '8x4 4K Matrix Switcher DTP', 4.0, 'H'],
    ['Extron', 'DTP CrossPoint 108 4K', 'DTP-CP-108-4K', 'E', 'AV Switcher', 14999, 'ea', '10x8 4K Matrix Switcher DTP', 6.0, 'H'],
    ['Extron', 'IN1608', 'IN1608', 'E', 'AV Switcher', 3499, 'ea', '8-input Scaling Presentation Switcher', 3.0, 'H'],
    ['Extron', 'IN1604 DTP', 'IN1604-DTP', 'E', 'AV Switcher', 2499, 'ea', '4-input Scaling Presentation Switcher', 2.0, 'H'],
    ['Extron', 'SW4 HD 4K Plus', 'SW4-HD-4K-PLUS', 'E', 'AV Switcher', 499, 'ea', '4-input HDMI Switcher 4K', 0.5, 'L'],
    ['Extron', 'SW6 HD 4K Plus', 'SW6-HD-4K-PLUS', 'E', 'AV Switcher', 699, 'ea', '6-input HDMI Switcher 4K', 0.5, 'M'],
    ['Extron', 'DTP T HD4K 230', 'DTP-T-HD4K-230', 'E', 'AV Encoder', 799, 'ea', 'DTP Transmitter 4K 230ft', 1.0, 'M'],
    ['Extron', 'DTP R HD4K 230', 'DTP-R-HD4K-230', 'E', 'AV Decoder', 599, 'ea', 'DTP Receiver 4K 230ft', 1.0, 'M'],
    ['Extron', 'NAV Pro AVoIP', 'NAV-E-501', 'E', 'AV Encoder', 1999, 'ea', 'NAV Pro 4K AV over IP Encoder', 2.0, 'H'],
    ['Extron', 'NAV Pro Decoder', 'NAV-D-501', 'E', 'AV Decoder', 1999, 'ea', 'NAV Pro 4K AV over IP Decoder', 2.0, 'H'],
    // ── EXTRON — Amplifiers ──
    ['Extron', 'XPA 2001-60', 'XPA-2001-60', 'E', 'AV Amplifier', 799, 'ea', '2ch 60W Power Amplifier', 1.5, 'M'],
    ['Extron', 'XPA 2001-100', 'XPA-2001-100', 'E', 'AV Amplifier', 999, 'ea', '2ch 100W Power Amplifier', 1.5, 'M'],
    ['Extron', 'XPA U 1002', 'XPA-U-1002', 'E', 'AV Amplifier', 499, 'ea', 'Half-rack 100W Mono Amplifier', 1.0, 'M'],

    // ── SHURE — Microphones ──
    ['Shure', 'MXA910', 'MXA910AL-60CM', 'E', 'AV Microphone', 3999, 'ea', 'Ceiling Array Microphone Dante', 3.0, 'H'],
    ['Shure', 'MXA920', 'MXA920AL-S', 'E', 'AV Microphone', 4499, 'ea', 'Ceiling Array Microphone IntelliMix', 3.0, 'H'],
    ['Shure', 'MXA710-2FT', 'MXA710-2FT', 'E', 'AV Microphone', 2499, 'ea', 'Linear Array Microphone 2ft', 2.0, 'H'],
    ['Shure', 'MXA710-4FT', 'MXA710-4FT', 'E', 'AV Microphone', 2999, 'ea', 'Linear Array Microphone 4ft', 2.0, 'H'],
    ['Shure', 'MXA310', 'MXA310-AL', 'E', 'AV Microphone', 1499, 'ea', 'Table Array Microphone Dante', 0.5, 'H'],
    ['Shure', 'MX395', 'MX395/C-LED', 'E', 'AV Microphone', 299, 'ea', 'Boundary Microphone Cardioid', 0.5, 'M'],
    ['Shure', 'MX412', 'MX412/C', 'E', 'AV Microphone', 299, 'ea', 'Gooseneck Microphone 12"', 0.5, 'M'],
    ['Shure', 'MX418', 'MX418/C', 'E', 'AV Microphone', 329, 'ea', 'Gooseneck Microphone 18"', 0.5, 'M'],
    ['Shure', 'P300', 'P300-IMX', 'E', 'AV DSP', 1499, 'ea', 'IntelliMix P300 Audio Conferencing Processor', 2.0, 'H'],
    ['Shure', 'ANIUSB-MATRIX', 'ANIUSB-MATRIX', 'E', 'AV DSP', 999, 'ea', 'Dante/USB Audio Network Interface', 1.0, 'H'],

    // ── SAMSUNG — Displays ──
    ['Samsung', 'QM55B', 'LH55QMCEBGCXZA', 'E', 'AV Display', 1299, 'ea', '55" 4K Smart Signage Display', 2.0, 'M'],
    ['Samsung', 'QM65B', 'LH65QMCEBGCXZA', 'E', 'AV Display', 1699, 'ea', '65" 4K Smart Signage Display', 2.0, 'M'],
    ['Samsung', 'QM75B', 'LH75QMCEBGCXZA', 'E', 'AV Display', 2299, 'ea', '75" 4K Smart Signage Display', 2.5, 'H'],
    ['Samsung', 'QM85B', 'LH85QMCEBGCXZA', 'E', 'AV Display', 3499, 'ea', '85" 4K Smart Signage Display', 3.0, 'H'],
    ['Samsung', 'QM98B', 'LH98QMCEBGCXZA', 'E', 'AV Display', 5999, 'ea', '98" 4K Smart Signage Display', 3.0, 'H'],
    ['Samsung', 'QB55B', 'LH55QBCEBGCXZA', 'E', 'AV Display', 899, 'ea', '55" 4K Pro Display', 2.0, 'M'],
    ['Samsung', 'QB65B', 'LH65QBCEBGCXZA', 'E', 'AV Display', 1099, 'ea', '65" 4K Pro Display', 2.0, 'M'],
    ['Samsung', 'QB75B', 'LH75QBCEBGCXZA', 'E', 'AV Display', 1499, 'ea', '75" 4K Pro Display', 2.5, 'M'],
    ['Samsung', 'QMR Series 49"', 'LH49QMREBGCXZA', 'E', 'AV Display', 999, 'ea', '49" Video Wall Display', 2.0, 'H'],
    ['Samsung', 'QMR Series 55"', 'LH55QMREBGCXZA', 'E', 'AV Display', 1399, 'ea', '55" Video Wall Display', 2.0, 'H'],
    // ── LG — Displays ──
    ['LG', '55UH5J-H', '55UH5J-H', 'E', 'AV Display', 849, 'ea', '55" 4K UHD Signage Display', 2.0, 'M'],
    ['LG', '65UH5J-H', '65UH5J-H', 'E', 'AV Display', 1099, 'ea', '65" 4K UHD Signage Display', 2.0, 'M'],
    ['LG', '75UH5J-H', '75UH5J-H', 'E', 'AV Display', 1799, 'ea', '75" 4K UHD Signage Display', 2.5, 'M'],
    ['LG', '86UH5J-H', '86UH5J-H', 'E', 'AV Display', 2999, 'ea', '86" 4K UHD Signage Display', 3.0, 'H'],

    // ── ATLAS — Speakers ──
    ['Atlas', 'FAP42T-DERA', 'FAP42T-DERA', 'E', 'AV Speaker', 149, 'ea', '4" Ceiling Speaker 70V PoE+', 1.0, 'L'],
    ['Atlas', 'FAP62T-DERA', 'FAP62T-DERA', 'E', 'AV Speaker', 199, 'ea', '6" Ceiling Speaker 70V PoE+', 1.0, 'M'],
    ['Atlas', 'FAP42TC', 'FAP42TC', 'E', 'AV Speaker', 99, 'ea', '4" Ceiling Speaker 70V', 1.0, 'L'],
    ['Atlas', 'FAP62TC', 'FAP62TC', 'E', 'AV Speaker', 129, 'ea', '6" Ceiling Speaker 70V', 1.0, 'L'],
    ['Atlas', 'FAP82TC', 'FAP82TC', 'E', 'AV Speaker', 179, 'ea', '8" Ceiling Speaker 70V', 1.0, 'M'],
    ['Atlas', 'SM82T', 'SM82T-B', 'E', 'AV Speaker', 199, 'ea', '8" Surface Mount Speaker', 1.0, 'M'],
    ['Atlas', 'SM42T', 'SM42T-B', 'E', 'AV Speaker', 129, 'ea', '4" Surface Mount Speaker', 1.0, 'L'],
    ['Atlas', 'FS12T-99', 'FS12T-99', 'E', 'AV Speaker', 129, 'ea', '12" Outdoor Horn Speaker', 1.5, 'M'],
    // ── ATLAS — Amplifiers ──
    ['Atlas', 'PA601', 'PA601', 'E', 'AV Amplifier', 299, 'ea', '1ch 60W Amplifier', 1.0, 'M'],
    ['Atlas', 'PA1001', 'PA1001', 'E', 'AV Amplifier', 449, 'ea', '1ch 100W Amplifier', 1.0, 'M'],
    ['Atlas', 'DPA2402', 'DPA2402', 'E', 'AV Amplifier', 1699, 'ea', '4ch 240W Network Amplifier', 2.0, 'H'],
    ['Atlas', 'DPA804', 'DPA804', 'E', 'AV Amplifier', 1299, 'ea', '4ch 80W Network Amplifier', 1.5, 'H'],

    // ── JBL — Speakers ──
    ['JBL', 'Control 14C/T', 'JBL-14CT', 'E', 'AV Speaker', 99, 'ea', '4" Ceiling Speaker 70V', 1.0, 'L'],
    ['JBL', 'Control 16C/T', 'JBL-16CT', 'E', 'AV Speaker', 139, 'ea', '6.5" Ceiling Speaker 70V', 1.0, 'L'],
    ['JBL', 'Control 18C/T', 'JBL-18CT', 'E', 'AV Speaker', 189, 'ea', '8" Ceiling Speaker 70V', 1.0, 'M'],
    ['JBL', 'Control 26C', 'JBL-26C', 'E', 'AV Speaker', 179, 'ea', '6.5" Ceiling Speaker Pair', 1.0, 'M'],
    ['JBL', 'Control 25-1', 'JBL-25-1', 'E', 'AV Speaker', 149, 'ea', '5" Surface Speaker 70V', 1.0, 'L'],
    ['JBL', 'Control 28-1', 'JBL-28-1', 'E', 'AV Speaker', 249, 'ea', '8" Surface Speaker 70V', 1.0, 'M'],
    ['JBL', 'VMA1240', 'JBL-VMA1240', 'E', 'AV Amplifier', 799, 'ea', '4ch Mixer/Amplifier 240W', 1.5, 'M'],
    ['JBL', 'CSMA 280', 'JBL-CSMA280', 'E', 'AV Amplifier', 499, 'ea', '2ch Mixer/Amplifier 80W', 1.0, 'M'],

    // ── Display Mounts ──
    ['Chief', 'LTM1U', 'LTM1U', 'M', 'Display Mount', 179, 'ea', 'Large Tilt Wall Mount', 1.5, 'M'],
    ['Chief', 'LSMU', 'LSMU', 'M', 'Display Mount', 249, 'ea', 'Large Fixed Wall Mount', 1.5, 'M'],
    ['Chief', 'PDR2000', 'PDR2000', 'M', 'Display Mount', 399, 'ea', 'Dual Ceiling Mount', 2.5, 'H'],
    ['Chief', 'FUSION XTM1U', 'XTM1U', 'M', 'Display Mount', 129, 'ea', 'Medium Tilt Mount', 1.0, 'L'],
    ['Chief', 'LCM1U', 'LCM1U', 'M', 'Display Mount', 299, 'ea', 'Large Ceiling Mount', 2.0, 'M'],
    ['Peerless-AV', 'SF680', 'SF680', 'M', 'Display Mount', 159, 'ea', 'Universal Flat Wall Mount', 1.0, 'L'],
    ['Peerless-AV', 'ST680', 'ST680', 'M', 'Display Mount', 199, 'ea', 'Universal Tilt Wall Mount', 1.0, 'M'],
    ['Peerless-AV', 'DS-VW765-LAND', 'DS-VW765-L', 'M', 'Display Mount', 449, 'ea', 'Video Wall Mount', 2.0, 'H'],
    // ── AV Cables & Adapters ──
    ['Liberty', 'HDMI-AOC-30M', 'DL-AR-30M', 'M', 'AV Cable', 199, 'ea', 'Active Optical HDMI Cable 30m', 0.5, 'M'],
    ['Liberty', 'HDMI-AOC-15M', 'DL-AR-15M', 'M', 'AV Cable', 99, 'ea', 'Active Optical HDMI Cable 15m', 0.5, 'L'],
    ['Crestron', 'CBL-HD-6', 'CBL-HD-6', 'M', 'AV Cable', 35, 'ea', 'HDMI 2.0 Cable 6ft', 0.1, 'L'],
    ['Crestron', 'CBL-HD-12', 'CBL-HD-12', 'M', 'AV Cable', 49, 'ea', 'HDMI 2.0 Cable 12ft', 0.1, 'L'],
    ['Crestron', 'CBL-HD-20', 'CBL-HD-20', 'M', 'AV Cable', 79, 'ea', 'HDMI 2.0 Cable 20ft', 0.1, 'L'],
];

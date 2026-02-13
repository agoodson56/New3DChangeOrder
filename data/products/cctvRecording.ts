import { CompactProduct } from './types';

// ============================================================================
// CCTV RECORDING — NVRs, VMS Servers, Encoders, Storage (~200 products)
// ============================================================================

export const CATALOG_CCTV_RECORDING: CompactProduct[] = [
    // ── AXIS — NVR / Recording ──
    ['Axis', 'S3008 Mk II', '02406-001', 'E', 'NVR', 899, 'ea', '8ch Desktop Recorder 4TB', 2.0, 'M'],
    ['Axis', 'S3016', '01964-001', 'E', 'NVR', 1499, 'ea', '16ch Desktop Recorder 8TB', 2.0, 'M'],
    ['Axis', 'S3048', '01965-001', 'E', 'NVR', 2999, 'ea', '48ch Rack Recorder 24TB', 3.0, 'H'],
    ['Axis', 'S1148', '01615-001', 'E', 'NVR', 4999, 'ea', '48ch Rack Server 24TB RAID', 3.0, 'H'],
    ['Axis', 'S1148 64TB', '01616-001', 'E', 'NVR', 7999, 'ea', '48ch Rack Server 64TB RAID', 3.0, 'H'],
    ['Axis', 'S1232', '01621-001', 'E', 'NVR', 3499, 'ea', '32ch Tower Recorder 16TB', 3.0, 'H'],
    ['Axis', 'S1264', '01622-001', 'E', 'NVR', 5999, 'ea', '64ch Tower Recorder 32TB', 3.0, 'H'],
    // ── HANWHA — NVR ──
    ['Hanwha', 'XRN-810S', 'XRN-810S', 'E', 'NVR', 549, 'ea', '8ch NVR 4TB PoE', 2.0, 'M'],
    ['Hanwha', 'XRN-1610S', 'XRN-1610S', 'E', 'NVR', 999, 'ea', '16ch NVR 8TB PoE', 2.0, 'M'],
    ['Hanwha', 'XRN-1610SA', 'XRN-1610SA', 'E', 'NVR', 1299, 'ea', '16ch NVR 8TB PoE AI', 2.0, 'H'],
    ['Hanwha', 'XRN-3210', 'XRN-3210', 'E', 'NVR', 2999, 'ea', '32ch NVR 16TB Rack', 3.0, 'H'],
    ['Hanwha', 'XRN-6410', 'XRN-6410', 'E', 'NVR', 4999, 'ea', '64ch NVR 48TB Rack RAID', 3.0, 'H'],
    ['Hanwha', 'PRN-6400', 'PRN-6400', 'E', 'NVR', 6999, 'ea', '64ch NVR 64TB Rack RAID AI', 3.0, 'H'],
    ['Hanwha', 'PRN-6401', 'PRN-6401', 'E', 'NVR', 8999, 'ea', '64ch NVR 100TB Rack RAID AI Pro', 3.0, 'H'],
    // ── AVIGILON — Recording ──
    ['Avigilon', 'NVR4 Standard 8TB', 'VMA-AS3-8P08', 'E', 'NVR', 2999, 'ea', 'ACC NVR4 Standard 8TB', 3.0, 'H'],
    ['Avigilon', 'NVR4 Standard 16TB', 'VMA-AS3-8P16', 'E', 'NVR', 4499, 'ea', 'ACC NVR4 Standard 16TB', 3.0, 'H'],
    ['Avigilon', 'NVR4 Standard 24TB', 'VMA-AS3-8P24', 'E', 'NVR', 5999, 'ea', 'ACC NVR4 Standard 24TB', 3.0, 'H'],
    ['Avigilon', 'NVR4 Pro 32TB', 'VMA-AS3-16P32', 'E', 'NVR', 7999, 'ea', 'ACC NVR4 Pro 32TB', 3.0, 'H'],
    ['Avigilon', 'NVR4 Pro 64TB', 'VMA-AS3-16P64', 'E', 'NVR', 11999, 'ea', 'ACC NVR4 Pro 64TB RAID', 3.0, 'H'],
    // ── BOSCH — Recording ──
    ['Bosch', 'DIVAR IP 5000', 'DIP-5248GP-4HD', 'E', 'NVR', 2499, 'ea', '32ch NVR 8TB', 3.0, 'H'],
    ['Bosch', 'DIVAR IP 7000 2U', 'DIP-7248GP-4HD', 'E', 'NVR', 4999, 'ea', '64ch NVR 16TB Rack', 3.0, 'H'],
    ['Bosch', 'DIVAR IP 7000 R2', 'DIP-7288-8HD', 'E', 'NVR', 7999, 'ea', '128ch NVR 64TB Rack RAID', 3.0, 'H'],
    ['Bosch', 'BVMS 11.0', 'MVM-BVMS-SYS', 'E', 'NVR', 1999, 'ea', 'Video Management System Server License', 2.0, 'H'],
    // ── PELCO — Recording ──
    ['Pelco', 'VXP-F2-8-J-S', 'VXP-F2-8-J-S', 'E', 'NVR', 3499, 'ea', 'VideoXpert Professional 8TB', 3.0, 'H'],
    ['Pelco', 'VXP-F2-28-J-S', 'VXP-F2-28-J-S', 'E', 'NVR', 5999, 'ea', 'VideoXpert Professional 28TB', 3.0, 'H'],
    ['Pelco', 'VXP-E2-48-J-S', 'VXP-E2-48-J-S', 'E', 'NVR', 9999, 'ea', 'VideoXpert Enterprise 48TB', 3.0, 'H'],
    // ── HIKVISION — Recording ──
    ['Hikvision', 'DS-7608NI-I2/8P', 'DS-7608NI-I2/8P', 'E', 'NVR', 349, 'ea', '8ch NVR 4K PoE', 2.0, 'M'],
    ['Hikvision', 'DS-7616NI-I2/16P', 'DS-7616NI-I2/16P', 'E', 'NVR', 549, 'ea', '16ch NVR 4K PoE', 2.0, 'M'],
    ['Hikvision', 'DS-7732NI-I4/16P', 'DS-7732NI-I4/16P', 'E', 'NVR', 899, 'ea', '32ch NVR 4K PoE', 3.0, 'H'],
    ['Hikvision', 'DS-96256NI-I24', 'DS-96256NI-I24', 'E', 'NVR', 4999, 'ea', '256ch Enterprise NVR RAID', 3.0, 'H'],
    // ── DAHUA — Recording ──
    ['Dahua', 'NVR5208-8P-EI', 'N52B3P8', 'E', 'NVR', 399, 'ea', '8ch NVR 4K PoE WizSense', 2.0, 'M'],
    ['Dahua', 'NVR5216-16P-EI', 'N52B3P16', 'E', 'NVR', 649, 'ea', '16ch NVR 4K PoE WizSense', 2.0, 'M'],
    ['Dahua', 'NVR5432-16P-EI', 'N54B3P16', 'E', 'NVR', 1299, 'ea', '32ch NVR 4K PoE WizSense', 3.0, 'H'],
    ['Dahua', 'NVR5864-I', 'N58B4', 'E', 'NVR', 2499, 'ea', '64ch Enterprise NVR 4K', 3.0, 'H'],
    // ── VMS Software ──
    ['Milestone', 'XProtect Essential+', 'XPESCL', 'E', 'NVR', 0, 'ea', 'Free VMS up to 8 cameras', 2.0, 'L'],
    ['Milestone', 'XProtect Express+', 'XPEXCL', 'E', 'NVR', 67, 'ea', 'VMS per camera license', 1.0, 'M'],
    ['Milestone', 'XProtect Professional+', 'XPPCL', 'E', 'NVR', 175, 'ea', 'VMS per camera license Pro', 1.0, 'M'],
    ['Milestone', 'XProtect Expert', 'XPETCL', 'E', 'NVR', 300, 'ea', 'VMS per camera license Expert', 1.0, 'H'],
    ['Milestone', 'XProtect Corporate', 'XPCOCL', 'E', 'NVR', 375, 'ea', 'VMS per camera license Corporate', 1.0, 'H'],
    ['Genetec', 'Security Center', 'GSC-1C', 'E', 'NVR', 250, 'ea', 'Omnicast per camera license', 1.0, 'H'],
    ['Genetec', 'Security Center Federation', 'GSC-FED', 'E', 'NVR', 500, 'ea', 'Federation per connection license', 1.0, 'H'],
    ['Exacq', 'exacqVision Start', 'EVIP-01', 'E', 'NVR', 109, 'ea', 'VMS per IP camera license', 1.0, 'M'],
    ['Exacq', 'exacqVision Professional', 'EVIP-04', 'E', 'NVR', 139, 'ea', 'VMS per IP camera Pro', 1.0, 'M'],
    ['Exacq', 'exacqVision Enterprise', 'EVIP-08', 'E', 'NVR', 199, 'ea', 'VMS per IP camera Enterprise', 1.0, 'H'],
    // ── Storage Expansion ──
    ['WD', 'WD Purple 4TB', 'WD42PURZ', 'E', 'NVR', 99, 'ea', '4TB Surveillance HDD 3.5"', 0.5, 'L'],
    ['WD', 'WD Purple 8TB', 'WD84PURZ', 'E', 'NVR', 189, 'ea', '8TB Surveillance HDD 3.5"', 0.5, 'L'],
    ['WD', 'WD Purple 12TB', 'WD121PURZ', 'E', 'NVR', 259, 'ea', '12TB Surveillance HDD 3.5"', 0.5, 'L'],
    ['WD', 'WD Purple 14TB', 'WD142PURP', 'E', 'NVR', 309, 'ea', '14TB Surveillance HDD 3.5"', 0.5, 'L'],
    ['WD', 'WD Purple Pro 18TB', 'WD181PURP', 'E', 'NVR', 399, 'ea', '18TB Surveillance HDD Pro', 0.5, 'L'],
    ['Seagate', 'SkyHawk 4TB', 'ST4000VX016', 'E', 'NVR', 89, 'ea', '4TB Surveillance HDD 3.5"', 0.5, 'L'],
    ['Seagate', 'SkyHawk 8TB', 'ST8000VX010', 'E', 'NVR', 179, 'ea', '8TB Surveillance HDD 3.5"', 0.5, 'L'],
    ['Seagate', 'SkyHawk AI 12TB', 'ST12000VE001', 'E', 'NVR', 289, 'ea', '12TB Surveillance HDD AI', 0.5, 'M'],
    ['Seagate', 'SkyHawk AI 16TB', 'ST16000VE002', 'E', 'NVR', 349, 'ea', '16TB Surveillance HDD AI', 0.5, 'M'],
    ['Seagate', 'SkyHawk AI 20TB', 'ST20000VE002', 'E', 'NVR', 449, 'ea', '20TB Surveillance HDD AI', 0.5, 'M'],
];

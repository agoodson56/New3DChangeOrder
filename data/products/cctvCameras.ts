import { CompactProduct } from './types';

// ============================================================================
// CCTV CAMERAS — ~500 products
// Axis, Hanwha, Avigilon, Verkada, Bosch, Pelco
// ============================================================================

export const CATALOG_CCTV_CAMERAS: CompactProduct[] = [
    // ── AXIS — Fixed Dome Indoor ──
    ['Axis', 'M3115-LVE', '01604-001', 'E', 'CCTV Camera', 379, 'ea', '2MP Indoor Mini Dome HDTV', 1.5, 'M'],
    ['Axis', 'M3116-LVE', '01605-001', 'E', 'CCTV Camera', 429, 'ea', '4MP Indoor Mini Dome', 1.5, 'M'],
    ['Axis', 'M3106-L Mk II', '01036-001', 'E', 'CCTV Camera', 349, 'ea', '4MP Indoor Mini Dome 120°', 1.5, 'M'],
    ['Axis', 'M3106-LVE Mk II', '01037-001', 'E', 'CCTV Camera', 399, 'ea', '4MP Indoor Vandal Mini Dome', 1.5, 'M'],
    ['Axis', 'M3105-L', '0867-001', 'E', 'CCTV Camera', 299, 'ea', '2MP Indoor Mini Dome', 1.5, 'M'],
    ['Axis', 'M3105-LVE', '0868-001', 'E', 'CCTV Camera', 349, 'ea', '2MP Indoor Vandal Mini Dome', 1.5, 'M'],
    ['Axis', 'M3104-L', '0865-001', 'E', 'CCTV Camera', 249, 'ea', '720p Indoor Mini Dome', 1.5, 'L'],
    ['Axis', 'M3104-LVE', '0866-001', 'E', 'CCTV Camera', 299, 'ea', '720p Indoor Vandal Mini Dome', 1.5, 'L'],
    ['Axis', 'M3085-V', '02373-001', 'E', 'CCTV Camera', 399, 'ea', '2MP Indoor Mini Dome Deep Learning', 1.5, 'M'],
    ['Axis', 'M3086-V', '02374-001', 'E', 'CCTV Camera', 449, 'ea', '4MP Indoor Mini Dome Deep Learning', 1.5, 'M'],
    ['Axis', 'M3088-V', '02375-001', 'E', 'CCTV Camera', 549, 'ea', '8MP Indoor Mini Dome 4K', 1.5, 'M'],
    ['Axis', 'M4215-LV', '02677-001', 'E', 'CCTV Camera', 399, 'ea', '2MP Indoor Dome Varifocal', 1.5, 'M'],
    ['Axis', 'M4216-LV', '02678-001', 'E', 'CCTV Camera', 449, 'ea', '4MP Indoor Dome Varifocal', 1.5, 'M'],
    ['Axis', 'M4218-LV', '02679-001', 'E', 'CCTV Camera', 599, 'ea', '8MP Indoor Dome Varifocal 4K', 1.5, 'M'],
    // ── AXIS — Fixed Dome Outdoor ──
    ['Axis', 'P3245-V', '01592-001', 'E', 'CCTV Camera', 649, 'ea', '2MP Outdoor Dome HDTV', 2.5, 'M'],
    ['Axis', 'P3245-VE', '01593-001', 'E', 'CCTV Camera', 799, 'ea', '2MP Outdoor Vandal Dome', 2.5, 'M'],
    ['Axis', 'P3247-LV', '01595-001', 'E', 'CCTV Camera', 749, 'ea', '5MP Outdoor Dome', 2.5, 'M'],
    ['Axis', 'P3247-LVE', '01596-001', 'E', 'CCTV Camera', 899, 'ea', '5MP Outdoor Vandal Dome', 2.5, 'M'],
    ['Axis', 'P3248-LV', '01597-001', 'E', 'CCTV Camera', 849, 'ea', '4K Outdoor Dome', 2.5, 'M'],
    ['Axis', 'P3248-LVE', '01598-001', 'E', 'CCTV Camera', 999, 'ea', '4K Outdoor Vandal Dome', 2.5, 'M'],
    ['Axis', 'P3255-LVE', '02099-001', 'E', 'CCTV Camera', 949, 'ea', '2MP Outdoor Dome Deep Learning', 2.5, 'M'],
    ['Axis', 'P3265-LV', '02327-001', 'E', 'CCTV Camera', 599, 'ea', '2MP Outdoor Dome Lightfinder', 2.5, 'M'],
    ['Axis', 'P3265-LVE', '02328-001', 'E', 'CCTV Camera', 749, 'ea', '2MP Outdoor Vandal Dome Lightfinder', 2.5, 'M'],
    ['Axis', 'P3267-LV', '02329-001', 'E', 'CCTV Camera', 699, 'ea', '5MP Outdoor Dome Lightfinder', 2.5, 'M'],
    ['Axis', 'P3267-LVE', '02330-001', 'E', 'CCTV Camera', 849, 'ea', '5MP Outdoor Vandal Dome Lightfinder', 2.5, 'M'],
    ['Axis', 'P3268-LV', '02331-001', 'E', 'CCTV Camera', 799, 'ea', '4K Outdoor Dome Lightfinder', 2.5, 'M'],
    ['Axis', 'P3268-LVE', '02332-001', 'E', 'CCTV Camera', 999, 'ea', '4K Outdoor Vandal Dome Lightfinder', 2.5, 'M'],
    ['Axis', 'Q3515-LV', '01039-001', 'E', 'CCTV Camera', 999, 'ea', '2MP Outdoor Dome Forensic', 2.5, 'H'],
    ['Axis', 'Q3515-LVE', '01040-001', 'E', 'CCTV Camera', 1149, 'ea', '2MP Outdoor Vandal Dome Forensic', 2.5, 'H'],
    ['Axis', 'Q3517-LV', '01021-001', 'E', 'CCTV Camera', 1299, 'ea', '5MP Outdoor Dome Forensic', 2.5, 'H'],
    ['Axis', 'Q3517-LVE', '01022-001', 'E', 'CCTV Camera', 1449, 'ea', '5MP Outdoor Vandal Dome Forensic', 2.5, 'H'],
    ['Axis', 'Q3518-LVE', '01493-001', 'E', 'CCTV Camera', 1599, 'ea', '4K Outdoor Vandal Dome Forensic', 2.5, 'H'],
    // ── AXIS — Bullet / Fixed Box ──
    ['Axis', 'P1455-LE', '02349-001', 'E', 'CCTV Camera', 799, 'ea', '2MP Outdoor Bullet IR 30m', 2.5, 'M'],
    ['Axis', 'P1465-LE', '02340-001', 'E', 'CCTV Camera', 949, 'ea', '2MP Outdoor Bullet IR 40m OptimizedIR', 2.5, 'M'],
    ['Axis', 'P1468-LE', '02341-001', 'E', 'CCTV Camera', 1099, 'ea', '4K Outdoor Bullet IR 50m', 2.5, 'M'],
    ['Axis', 'P1405-LE Mk II', '0961-001', 'E', 'CCTV Camera', 599, 'ea', '2MP Outdoor Bullet Compact', 2.5, 'M'],
    ['Axis', 'Q1785-LE', '01161-001', 'E', 'CCTV Camera', 1899, 'ea', '2MP Outdoor Bullet 32x Zoom', 2.5, 'H'],
    ['Axis', 'Q1786-LE', '01162-001', 'E', 'CCTV Camera', 2199, 'ea', '4MP Outdoor Bullet 32x Zoom', 2.5, 'H'],
    ['Axis', 'Q1798-LE', '01702-001', 'E', 'CCTV Camera', 2499, 'ea', '4K Outdoor Bullet 32x Zoom', 2.5, 'H'],
    // ── AXIS — PTZ ──
    ['Axis', 'P5654-E', '01759-001', 'E', 'CCTV Camera', 3499, 'ea', '2MP Outdoor PTZ 21x Zoom', 4.0, 'H'],
    ['Axis', 'P5655-E', '01681-001', 'E', 'CCTV Camera', 3999, 'ea', '2MP Outdoor PTZ 32x HDTV', 4.0, 'H'],
    ['Axis', 'Q6075-E', '01751-001', 'E', 'CCTV Camera', 4499, 'ea', '2MP Outdoor PTZ 40x HDTV', 4.0, 'H'],
    ['Axis', 'Q6075-SE', '01755-001', 'E', 'CCTV Camera', 5999, 'ea', '2MP Outdoor PTZ 40x Stainless', 4.0, 'H'],
    ['Axis', 'Q6078-E', '02147-001', 'E', 'CCTV Camera', 5499, 'ea', '4K Outdoor PTZ 20x', 4.0, 'H'],
    ['Axis', 'Q6100-E', '01711-001', 'E', 'CCTV Camera', 6499, 'ea', '4x 5MP Multi-sensor Panoramic', 4.0, 'H'],
    ['Axis', 'Q6215-LE', '01083-001', 'E', 'CCTV Camera', 7999, 'ea', '2MP Outdoor PTZ 30x Laser IR 400m', 4.0, 'H'],
    ['Axis', 'V5938', '02022-001', 'E', 'CCTV Camera', 2999, 'ea', '4K PTZ Conference Camera 30x', 4.0, 'H'],
    // ── AXIS — Panoramic / Multi-sensor ──
    ['Axis', 'M3057-PLVE', '01177-001', 'E', 'CCTV Camera', 649, 'ea', '6MP Indoor Panoramic 360°', 2.0, 'M'],
    ['Axis', 'M3058-PLVE', '01178-001', 'E', 'CCTV Camera', 799, 'ea', '12MP Indoor Panoramic 360°', 2.0, 'M'],
    ['Axis', 'M4308-PLE', '02199-001', 'E', 'CCTV Camera', 2499, 'ea', '12MP Outdoor Panoramic 180°', 3.0, 'H'],
    ['Axis', 'P3727-PLE', '02218-001', 'E', 'CCTV Camera', 2999, 'ea', '4x 2MP Multi-directional', 3.0, 'H'],
    ['Axis', 'P3719-PLE', '01500-001', 'E', 'CCTV Camera', 3499, 'ea', '4x 5MP Multi-directional 360°', 3.0, 'H'],
    // ── AXIS — Thermal ──
    ['Axis', 'Q1941-E', '0783-001', 'E', 'CCTV Camera', 3999, 'ea', 'Thermal Outdoor Fixed Camera', 3.0, 'H'],
    ['Axis', 'Q2101-TE', '02625-001', 'E', 'CCTV Camera', 4499, 'ea', 'Thermal/Visual Outdoor Bullet', 3.0, 'H'],
    ['Axis', 'Q1942-E', '0917-001', 'E', 'CCTV Camera', 4999, 'ea', 'Thermal Outdoor PT Mount', 3.0, 'H'],
    // ── AXIS — Specialty ──
    ['Axis', 'F44', '01004-001', 'E', 'CCTV Camera', 799, 'ea', 'Main Unit 4ch Modular Camera', 2.0, 'H'],
    ['Axis', 'F1025 Sensor', '0734-001', 'E', 'CCTV Camera', 249, 'ea', 'Pinhole Sensor Unit', 1.0, 'M'],
    ['Axis', 'F1035-E Sensor', '0737-001', 'E', 'CCTV Camera', 349, 'ea', 'Outdoor Mini Sensor Unit', 1.0, 'M'],
    ['Axis', 'FA3105-L', '01026-001', 'E', 'CCTV Camera', 199, 'ea', 'Indoor Eyeball Sensor', 1.0, 'L'],
    ['Axis', 'P1275', '01529-001', 'E', 'CCTV Camera', 549, 'ea', '2MP Indoor Box Camera Body', 1.5, 'M'],
    ['Axis', 'P1378', '01048-001', 'E', 'CCTV Camera', 699, 'ea', '4K Indoor Box Camera Body', 1.5, 'M'],
    ['Axis', 'P1378-LE', '01811-001', 'E', 'CCTV Camera', 899, 'ea', '4K Outdoor Box Camera Body', 2.5, 'M'],
    // ── AXIS — Encoders ──
    ['Axis', 'M7104', '02035-001', 'E', 'CCTV Encoder', 599, 'ea', '4ch Video Encoder', 1.0, 'M'],
    ['Axis', 'M7116', '02037-001', 'E', 'CCTV Encoder', 1299, 'ea', '16ch Video Encoder', 1.5, 'H'],
    ['Axis', 'P7304', '01680-001', 'E', 'CCTV Encoder', 899, 'ea', '4ch Video Encoder H.265', 1.0, 'M'],
    ['Axis', 'P7316', '01681-004', 'E', 'CCTV Encoder', 2499, 'ea', '16ch Video Encoder H.265', 1.5, 'H'],

    // ── HANWHA (Wisenet) — Indoor Dome ──
    ['Hanwha', 'QND-7080R', 'QND-7080R', 'E', 'CCTV Camera', 299, 'ea', '4MP Indoor Dome IR 20m', 1.5, 'M'],
    ['Hanwha', 'QND-7082R', 'QND-7082R', 'E', 'CCTV Camera', 349, 'ea', '4MP Indoor Dome IR 25m', 1.5, 'M'],
    ['Hanwha', 'QND-8080R', 'QND-8080R', 'E', 'CCTV Camera', 399, 'ea', '5MP Indoor Dome IR 20m', 1.5, 'M'],
    ['Hanwha', 'QND-8010R', 'QND-8010R', 'E', 'CCTV Camera', 349, 'ea', '5MP Indoor Mini Dome', 1.5, 'M'],
    ['Hanwha', 'QND-6012R', 'QND-6012R', 'E', 'CCTV Camera', 249, 'ea', '2MP Indoor Mini Dome', 1.5, 'L'],
    ['Hanwha', 'QND-6082R', 'QND-6082R', 'E', 'CCTV Camera', 279, 'ea', '2MP Indoor Dome IR 25m', 1.5, 'M'],
    ['Hanwha', 'XND-6080', 'XND-6080', 'E', 'CCTV Camera', 449, 'ea', '2MP Indoor Dome Extralight', 1.5, 'M'],
    ['Hanwha', 'XND-6080V', 'XND-6080V', 'E', 'CCTV Camera', 549, 'ea', '2MP Indoor Dome Varifocal', 1.5, 'M'],
    ['Hanwha', 'XND-8080R', 'XND-8080R', 'E', 'CCTV Camera', 599, 'ea', '5MP Indoor Dome Extralight', 1.5, 'M'],
    ['Hanwha', 'XND-8080RV', 'XND-8080RV', 'E', 'CCTV Camera', 699, 'ea', '5MP Indoor Dome Varifocal', 1.5, 'M'],
    ['Hanwha', 'XND-9082RV', 'XND-9082RV', 'E', 'CCTV Camera', 799, 'ea', '4K Indoor Dome AI', 1.5, 'H'],
    ['Hanwha', 'PND-A9081RV', 'PND-A9081RV', 'E', 'CCTV Camera', 899, 'ea', '4K Indoor Dome AI Pro', 1.5, 'H'],
    // ── HANWHA — Outdoor Dome ──
    ['Hanwha', 'QNV-7080R', 'QNV-7080R', 'E', 'CCTV Camera', 349, 'ea', '4MP Outdoor Dome IR 30m', 2.5, 'M'],
    ['Hanwha', 'QNV-8080R', 'QNV-8080R', 'E', 'CCTV Camera', 449, 'ea', '5MP Outdoor Dome IR 30m', 2.5, 'M'],
    ['Hanwha', 'QNV-6082R', 'QNV-6082R', 'E', 'CCTV Camera', 329, 'ea', '2MP Outdoor Dome IR 25m', 2.5, 'M'],
    ['Hanwha', 'XNV-6080', 'XNV-6080', 'E', 'CCTV Camera', 549, 'ea', '2MP Outdoor Dome Extralight', 2.5, 'M'],
    ['Hanwha', 'XNV-6080R', 'XNV-6080R', 'E', 'CCTV Camera', 599, 'ea', '2MP Outdoor Dome Extralight IR', 2.5, 'M'],
    ['Hanwha', 'XNV-8080R', 'XNV-8080R', 'E', 'CCTV Camera', 699, 'ea', '5MP Outdoor Dome Extralight', 2.5, 'M'],
    ['Hanwha', 'XNV-8082R', 'XNV-8082R', 'E', 'CCTV Camera', 749, 'ea', '6MP Outdoor Dome AI', 2.5, 'M'],
    ['Hanwha', 'XNV-9082R', 'XNV-9082R', 'E', 'CCTV Camera', 899, 'ea', '4K Outdoor Dome AI', 2.5, 'H'],
    ['Hanwha', 'PNV-A9081R', 'PNV-A9081R', 'E', 'CCTV Camera', 999, 'ea', '4K Outdoor Dome AI Pro', 2.5, 'H'],
    // ── HANWHA — Bullet ──
    ['Hanwha', 'QNO-7080R', 'QNO-7080R', 'E', 'CCTV Camera', 299, 'ea', '4MP Outdoor Bullet IR 30m', 2.5, 'M'],
    ['Hanwha', 'QNO-8080R', 'QNO-8080R', 'E', 'CCTV Camera', 399, 'ea', '5MP Outdoor Bullet IR 30m', 2.5, 'M'],
    ['Hanwha', 'XNO-6080R', 'XNO-6080R', 'E', 'CCTV Camera', 549, 'ea', '2MP Outdoor Bullet Extralight IR', 2.5, 'M'],
    ['Hanwha', 'XNO-8080R', 'XNO-8080R', 'E', 'CCTV Camera', 699, 'ea', '5MP Outdoor Bullet Extralight', 2.5, 'M'],
    ['Hanwha', 'XNO-9082R', 'XNO-9082R', 'E', 'CCTV Camera', 899, 'ea', '4K Outdoor Bullet AI', 2.5, 'H'],
    ['Hanwha', 'PNO-A9081R', 'PNO-A9081R', 'E', 'CCTV Camera', 999, 'ea', '4K Outdoor Bullet AI Pro', 2.5, 'H'],
    // ── HANWHA — PTZ ──
    ['Hanwha', 'QNP-6250', 'QNP-6250', 'E', 'CCTV Camera', 1299, 'ea', '2MP Outdoor PTZ 25x', 4.0, 'H'],
    ['Hanwha', 'XNP-6320', 'XNP-6320', 'E', 'CCTV Camera', 2299, 'ea', '2MP Outdoor PTZ 32x', 4.0, 'H'],
    ['Hanwha', 'XNP-6320H', 'XNP-6320H', 'E', 'CCTV Camera', 2999, 'ea', '2MP Outdoor PTZ 32x IR', 4.0, 'H'],
    ['Hanwha', 'XNP-8300RW', 'XNP-8300RW', 'E', 'CCTV Camera', 3499, 'ea', '6MP Outdoor PTZ 30x AI', 4.0, 'H'],
    ['Hanwha', 'XNP-9300RW', 'XNP-9300RW', 'E', 'CCTV Camera', 4499, 'ea', '4K Outdoor PTZ 30x AI', 4.0, 'H'],
    ['Hanwha', 'PNP-A9081RW', 'PNP-A9081RW', 'E', 'CCTV Camera', 5499, 'ea', '4K Outdoor PTZ 40x AI Pro', 4.0, 'H'],
    // ── HANWHA — Multi-sensor / Panoramic ──
    ['Hanwha', 'PNM-9320VQP', 'PNM-9320VQP', 'E', 'CCTV Camera', 3999, 'ea', '4x 5MP + PTZ Multi-directional', 3.0, 'H'],
    ['Hanwha', 'PNM-9000VQ', 'PNM-9000VQ', 'E', 'CCTV Camera', 2999, 'ea', '4x 5MP Multi-directional', 3.0, 'H'],
    ['Hanwha', 'PNM-9085RQZ', 'PNM-9085RQZ', 'E', 'CCTV Camera', 3499, 'ea', '2x 4K Multi-sensor IR', 3.0, 'H'],
    ['Hanwha', 'QNF-9010', 'QNF-9010', 'E', 'CCTV Camera', 599, 'ea', '12MP Indoor Fisheye 360°', 2.0, 'M'],

    // ── AVIGILON — Fixed Dome ──
    ['Avigilon', 'H5A-DO-IR', '2.0C-H5A-DO1-IR', 'E', 'CCTV Camera', 899, 'ea', '2MP Outdoor Dome IR H5A', 2.5, 'M'],
    ['Avigilon', 'H5A-D-IR', '2.0C-H5A-D1-IR', 'E', 'CCTV Camera', 749, 'ea', '2MP Indoor Dome IR H5A', 1.5, 'M'],
    ['Avigilon', 'H5A-DO-IR 4MP', '4.0C-H5A-DO1-IR', 'E', 'CCTV Camera', 1099, 'ea', '4MP Outdoor Dome IR H5A', 2.5, 'M'],
    ['Avigilon', 'H5A-DO-IR 5MP', '5.0C-H5A-DO1-IR', 'E', 'CCTV Camera', 1299, 'ea', '5MP Outdoor Dome IR H5A', 2.5, 'H'],
    ['Avigilon', 'H5A-DO-IR 8MP', '8.0C-H5A-DO1-IR', 'E', 'CCTV Camera', 1599, 'ea', '4K Outdoor Dome IR H5A', 2.5, 'H'],
    ['Avigilon', 'H5M-DO', '2.0C-H5M-DO1', 'E', 'CCTV Camera', 499, 'ea', '2MP Indoor Mini Dome H5M', 1.5, 'L'],
    ['Avigilon', 'H5M-D', '2.0C-H5M-D1', 'E', 'CCTV Camera', 449, 'ea', '2MP Indoor Micro Dome H5M', 1.5, 'L'],
    ['Avigilon', 'H6A-DO-IR', '2.0C-H6A-DO1-IR', 'E', 'CCTV Camera', 1099, 'ea', '2MP Outdoor Dome IR H6A', 2.5, 'M'],
    ['Avigilon', 'H6A-DO-IR 4MP', '4.0C-H6A-DO1-IR', 'E', 'CCTV Camera', 1399, 'ea', '4MP Outdoor Dome IR H6A', 2.5, 'H'],
    ['Avigilon', 'H6A-DO-IR 8MP', '8.0C-H6A-DO1-IR', 'E', 'CCTV Camera', 1999, 'ea', '4K Outdoor Dome IR H6A', 2.5, 'H'],
    // ── AVIGILON — Bullet ──
    ['Avigilon', 'H5A-BO-IR', '2.0C-H5A-BO1-IR', 'E', 'CCTV Camera', 849, 'ea', '2MP Outdoor Bullet IR H5A', 2.5, 'M'],
    ['Avigilon', 'H5A-BO-IR 4MP', '4.0C-H5A-BO1-IR', 'E', 'CCTV Camera', 1049, 'ea', '4MP Outdoor Bullet IR H5A', 2.5, 'M'],
    ['Avigilon', 'H5A-BO-IR 8MP', '8.0C-H5A-BO1-IR', 'E', 'CCTV Camera', 1499, 'ea', '4K Outdoor Bullet IR H5A', 2.5, 'H'],
    ['Avigilon', 'H6A-BO-IR', '2.0C-H6A-BO1-IR', 'E', 'CCTV Camera', 1049, 'ea', '2MP Outdoor Bullet IR H6A', 2.5, 'M'],
    ['Avigilon', 'H6A-BO-IR 8MP', '8.0C-H6A-BO1-IR', 'E', 'CCTV Camera', 1899, 'ea', '4K Outdoor Bullet IR H6A', 2.5, 'H'],
    // ── AVIGILON — PTZ ──
    ['Avigilon', 'H5A-PTZ 2MP', '2.0C-H5A-PTZ-DP30', 'E', 'CCTV Camera', 3999, 'ea', '2MP Outdoor PTZ 30x H5A', 4.0, 'H'],
    ['Avigilon', 'H5A-PTZ 4MP', '4.0C-H5A-PTZ-DP36', 'E', 'CCTV Camera', 4999, 'ea', '4MP Outdoor PTZ 36x H5A', 4.0, 'H'],
    ['Avigilon', 'H6A-PTZ', '2.0C-H6A-PTZ-DP30', 'E', 'CCTV Camera', 5499, 'ea', '2MP Outdoor PTZ 30x H6A', 4.0, 'H'],
    // ── AVIGILON — Multi-sensor ──
    ['Avigilon', 'H5A-MS 3x4MP', '12C-H5A-3MH-180', 'E', 'CCTV Camera', 3499, 'ea', '3x 4MP Multi-sensor 180°', 3.0, 'H'],
    ['Avigilon', 'H5A-MS 4x3MP', '12C-H5A-4MH-270', 'E', 'CCTV Camera', 3999, 'ea', '4x 3MP Multi-sensor 270°', 3.0, 'H'],

    // ── VERKADA — Indoor ──
    ['Verkada', 'CD42', 'CD42', 'E', 'CCTV Camera', 499, 'ea', '5MP Indoor Mini Dome', 1.5, 'M'],
    ['Verkada', 'CD52', 'CD52', 'E', 'CCTV Camera', 699, 'ea', '5MP Indoor Dome Varifocal', 1.5, 'M'],
    ['Verkada', 'CD62', 'CD62', 'E', 'CCTV Camera', 999, 'ea', '4K Indoor Dome AI', 1.5, 'H'],
    ['Verkada', 'CM41', 'CM41', 'E', 'CCTV Camera', 349, 'ea', '2MP Indoor Mini Camera', 1.0, 'L'],
    ['Verkada', 'CM42', 'CM42', 'E', 'CCTV Camera', 399, 'ea', '5MP Indoor Mini Camera', 1.0, 'L'],
    ['Verkada', 'CM61', 'CM61', 'E', 'CCTV Camera', 599, 'ea', '4K Indoor Mini Camera', 1.0, 'M'],
    // ── VERKADA — Outdoor ──
    ['Verkada', 'CB52-E', 'CB52-E', 'E', 'CCTV Camera', 899, 'ea', '5MP Outdoor Bullet IR', 2.5, 'M'],
    ['Verkada', 'CB62-E', 'CB62-E', 'E', 'CCTV Camera', 1299, 'ea', '4K Outdoor Bullet IR', 2.5, 'H'],
    ['Verkada', 'CD52-E', 'CD52-E', 'E', 'CCTV Camera', 899, 'ea', '5MP Outdoor Dome IR', 2.5, 'M'],
    ['Verkada', 'CD62-E', 'CD62-E', 'E', 'CCTV Camera', 1299, 'ea', '4K Outdoor Dome IR', 2.5, 'H'],
    ['Verkada', 'CP52-E', 'CP52-E', 'E', 'CCTV Camera', 2999, 'ea', '5MP Outdoor PTZ 20x', 4.0, 'H'],
    // ── VERKADA — Specialty ──
    ['Verkada', 'CE52', 'CE52', 'E', 'CCTV Camera', 599, 'ea', 'Environmental Sensor', 1.0, 'M'],
    ['Verkada', 'SV11', 'SV11', 'E', 'CCTV Camera', 399, 'ea', 'Air Quality Sensor', 1.0, 'M'],
    ['Verkada', 'BR33', 'BR33', 'E', 'CCTV Camera', 799, 'ea', 'Intercom Module', 2.0, 'M'],

    // ── BOSCH — Fixed Dome ──
    ['Bosch', 'NDE-3502-AL', 'NDE-3502-AL', 'E', 'CCTV Camera', 549, 'ea', '2MP Indoor Dome FLEXIDOME', 1.5, 'M'],
    ['Bosch', 'NDE-3503-AL', 'NDE-3503-AL', 'E', 'CCTV Camera', 649, 'ea', '5MP Indoor Dome FLEXIDOME', 1.5, 'M'],
    ['Bosch', 'NDE-3504-AL', 'NDE-3504-AL', 'E', 'CCTV Camera', 749, 'ea', '4K Indoor Dome FLEXIDOME', 1.5, 'M'],
    ['Bosch', 'NDV-3502-F02', 'NDV-3502-F02', 'E', 'CCTV Camera', 699, 'ea', '2MP Outdoor Dome FLEXIDOME micro', 2.5, 'M'],
    ['Bosch', 'NDV-3503-F02', 'NDV-3503-F02', 'E', 'CCTV Camera', 799, 'ea', '5MP Outdoor Dome FLEXIDOME micro', 2.5, 'M'],
    ['Bosch', 'NDE-5502-AL', 'NDE-5502-AL', 'E', 'CCTV Camera', 899, 'ea', '2MP Outdoor Dome FLEXIDOME 5100i', 2.5, 'M'],
    ['Bosch', 'NDE-5503-AL', 'NDE-5503-AL', 'E', 'CCTV Camera', 999, 'ea', '5MP Outdoor Dome FLEXIDOME 5100i', 2.5, 'H'],
    ['Bosch', 'NDE-5504-AL', 'NDE-5504-AL', 'E', 'CCTV Camera', 1199, 'ea', '4K Outdoor Dome FLEXIDOME 5100i', 2.5, 'H'],
    ['Bosch', 'NDE-8502-R', 'NDE-8502-R', 'E', 'CCTV Camera', 1699, 'ea', '2MP Outdoor Dome starlight 8000i', 2.5, 'H'],
    ['Bosch', 'NDE-8504-R', 'NDE-8504-R', 'E', 'CCTV Camera', 2199, 'ea', '4K Outdoor Dome starlight 8000i', 2.5, 'H'],
    // ── BOSCH — Bullet ──
    ['Bosch', 'NBE-3502-AL', 'NBE-3502-AL', 'E', 'CCTV Camera', 499, 'ea', '2MP Outdoor Bullet DINION', 2.5, 'M'],
    ['Bosch', 'NBE-3503-AL', 'NBE-3503-AL', 'E', 'CCTV Camera', 599, 'ea', '5MP Outdoor Bullet DINION', 2.5, 'M'],
    ['Bosch', 'NBE-5702-AL', 'NBE-5702-AL', 'E', 'CCTV Camera', 849, 'ea', '2MP Outdoor Bullet DINION 5100i', 2.5, 'M'],
    ['Bosch', 'NBE-5704-AL', 'NBE-5704-AL', 'E', 'CCTV Camera', 1099, 'ea', '4K Outdoor Bullet DINION 5100i', 2.5, 'H'],
    ['Bosch', 'NBE-7604-AL-OC', 'NBE-7604-AL-OC', 'E', 'CCTV Camera', 1499, 'ea', '4K Outdoor Bullet DINION 7100i', 2.5, 'H'],
    // ── BOSCH — PTZ ──
    ['Bosch', 'NDP-7512-Z30', 'NDP-7512-Z30', 'E', 'CCTV Camera', 3999, 'ea', '2MP Outdoor PTZ 30x AUTODOME', 4.0, 'H'],
    ['Bosch', 'NDP-7602-Z40', 'NDP-7602-Z40', 'E', 'CCTV Camera', 5499, 'ea', '2MP Outdoor PTZ 40x AUTODOME starlight', 4.0, 'H'],
    ['Bosch', 'NDP-7604-Z40', 'NDP-7604-Z40', 'E', 'CCTV Camera', 6499, 'ea', '4K Outdoor PTZ 40x AUTODOME starlight', 4.0, 'H'],

    // ── PELCO — Fixed Dome ──
    ['Pelco', 'IBV229-1ER', 'IBV229-1ER', 'E', 'CCTV Camera', 449, 'ea', '2MP Outdoor Dome Sarix Value', 2.5, 'M'],
    ['Pelco', 'IBV529-1ER', 'IBV529-1ER', 'E', 'CCTV Camera', 549, 'ea', '5MP Outdoor Dome Sarix Value', 2.5, 'M'],
    ['Pelco', 'IBE229-1I', 'IBE229-1I', 'E', 'CCTV Camera', 699, 'ea', '2MP Indoor Dome Sarix Enhanced', 1.5, 'M'],
    ['Pelco', 'IBE329-1I', 'IBE329-1I', 'E', 'CCTV Camera', 799, 'ea', '3MP Indoor Dome Sarix Enhanced', 1.5, 'M'],
    ['Pelco', 'IBP232-1ER', 'IBP232-1ER', 'E', 'CCTV Camera', 999, 'ea', '2MP Outdoor Dome Sarix Pro', 2.5, 'H'],
    ['Pelco', 'IBP532-1ER', 'IBP532-1ER', 'E', 'CCTV Camera', 1299, 'ea', '5MP Outdoor Dome Sarix Pro', 2.5, 'H'],
    ['Pelco', 'IBP831-1ER', 'IBP831-1ER', 'E', 'CCTV Camera', 1599, 'ea', '4K Outdoor Dome Sarix Pro', 2.5, 'H'],
    // ── PELCO — Bullet ──
    ['Pelco', 'IBV229-1ER-B', 'IBV229-1ER-B', 'E', 'CCTV Camera', 429, 'ea', '2MP Outdoor Bullet Sarix Value', 2.5, 'M'],
    ['Pelco', 'IBE229-1ER-B', 'IBE229-1ER-B', 'E', 'CCTV Camera', 679, 'ea', '2MP Outdoor Bullet Sarix Enhanced', 2.5, 'M'],
    ['Pelco', 'IBP232-1ER-B', 'IBP232-1ER-B', 'E', 'CCTV Camera', 949, 'ea', '2MP Outdoor Bullet Sarix Pro', 2.5, 'H'],
    // ── PELCO — PTZ ──
    ['Pelco', 'S7230L-EW0', 'S7230L-EW0', 'E', 'CCTV Camera', 3499, 'ea', '2MP Outdoor PTZ 30x Spectra', 4.0, 'H'],
    ['Pelco', 'S7230L-EW1', 'S7230L-EW1', 'E', 'CCTV Camera', 3999, 'ea', '2MP Outdoor PTZ 30x Spectra IR', 4.0, 'H'],
    ['Pelco', 'S7820L-EW0', 'S7820L-EW0', 'E', 'CCTV Camera', 4999, 'ea', '4K Outdoor PTZ 20x Spectra', 4.0, 'H'],

    // ── DAHUA — Indoor Dome ──
    ['Dahua', 'IPC-HDBW2431E-S-S2', 'N42BJ62', 'E', 'CCTV Camera', 179, 'ea', '4MP Indoor Dome WizSense', 1.5, 'M'],
    ['Dahua', 'IPC-HDBW2831E-S-S2', 'N48BJ62', 'E', 'CCTV Camera', 249, 'ea', '4K Indoor Dome WizSense', 1.5, 'M'],
    ['Dahua', 'IPC-HDBW5442E-ZE-S3', 'N54C2Z3', 'E', 'CCTV Camera', 399, 'ea', '4MP Indoor Dome WizMind AI', 1.5, 'H'],
    ['Dahua', 'IPC-HDBW5842E-ZE-S3', 'N58C2Z3', 'E', 'CCTV Camera', 499, 'ea', '4K Indoor Dome WizMind AI', 1.5, 'H'],
    // ── DAHUA — Outdoor Dome ──
    ['Dahua', 'IPC-HDBW2431R-ZS-S2', 'N42BJ6Z', 'E', 'CCTV Camera', 229, 'ea', '4MP Outdoor Dome WizSense VF', 2.5, 'M'],
    ['Dahua', 'IPC-HDBW2831R-ZS-S2', 'N48BJ6Z', 'E', 'CCTV Camera', 299, 'ea', '4K Outdoor Dome WizSense VF', 2.5, 'M'],
    ['Dahua', 'IPC-HDBW5442R-ASE-S3', 'N54CR53', 'E', 'CCTV Camera', 449, 'ea', '4MP Outdoor Dome WizMind AI', 2.5, 'H'],
    ['Dahua', 'IPC-HDBW5842R-ASE-S3', 'N58CR53', 'E', 'CCTV Camera', 549, 'ea', '4K Outdoor Dome WizMind AI', 2.5, 'H'],
    // ── DAHUA — Bullet ──
    ['Dahua', 'IPC-HFW2431T-ZS-S2', 'N42BJ6Z-B', 'E', 'CCTV Camera', 219, 'ea', '4MP Outdoor Bullet WizSense VF', 2.5, 'M'],
    ['Dahua', 'IPC-HFW2831T-ZS-S2', 'N48BJ6Z-B', 'E', 'CCTV Camera', 289, 'ea', '4K Outdoor Bullet WizSense VF', 2.5, 'M'],
    ['Dahua', 'IPC-HFW5442T-ASE-S3', 'N54CR53-B', 'E', 'CCTV Camera', 449, 'ea', '4MP Outdoor Bullet WizMind AI', 2.5, 'H'],
    ['Dahua', 'IPC-HFW5842T-ASE-S3', 'N58CR53-B', 'E', 'CCTV Camera', 549, 'ea', '4K Outdoor Bullet WizMind AI', 2.5, 'H'],
    // ── DAHUA — PTZ ──
    ['Dahua', 'SD6AL245XA-HNR-IR', 'SD6AL245-IR', 'E', 'CCTV Camera', 1999, 'ea', '2MP Outdoor PTZ 45x WizMind', 4.0, 'H'],
    ['Dahua', 'SD6CE245XA-HNR', 'SD6CE245', 'E', 'CCTV Camera', 2499, 'ea', '2MP Outdoor PTZ 45x WizMind IR', 4.0, 'H'],
    ['Dahua', 'SD8A442XA-HNR', 'SD8A442', 'E', 'CCTV Camera', 3499, 'ea', '4MP Outdoor PTZ 42x WizMind IR', 4.0, 'H'],

    // ── HIKVISION — Indoor (for reference) ──
    ['Hikvision', 'DS-2CD2143G2-IS', 'DS-2CD2143G2-IS', 'E', 'CCTV Camera', 229, 'ea', '4MP Indoor Dome AcuSense', 1.5, 'M'],
    ['Hikvision', 'DS-2CD2183G2-IS', 'DS-2CD2183G2-IS', 'E', 'CCTV Camera', 299, 'ea', '4K Indoor Dome AcuSense', 1.5, 'M'],
    ['Hikvision', 'DS-2CD2543G2-IS', 'DS-2CD2543G2-IS', 'E', 'CCTV Camera', 199, 'ea', '4MP Indoor Mini Dome', 1.5, 'L'],
    ['Hikvision', 'DS-2CD2743G2-IZS', 'DS-2CD2743G2-IZS', 'E', 'CCTV Camera', 329, 'ea', '4MP Indoor Dome VF Motorized', 1.5, 'M'],
    // ── HIKVISION — Outdoor ──
    ['Hikvision', 'DS-2CD2143G2-IU', 'DS-2CD2143G2-IU', 'E', 'CCTV Camera', 249, 'ea', '4MP Outdoor Dome AcuSense', 2.5, 'M'],
    ['Hikvision', 'DS-2CD2183G2-IU', 'DS-2CD2183G2-IU', 'E', 'CCTV Camera', 349, 'ea', '4K Outdoor Dome AcuSense', 2.5, 'M'],
    ['Hikvision', 'DS-2CD2T43G2-2I', 'DS-2CD2T43G2-2I', 'E', 'CCTV Camera', 219, 'ea', '4MP Outdoor Bullet AcuSense', 2.5, 'M'],
    ['Hikvision', 'DS-2CD2T83G2-2I', 'DS-2CD2T83G2-2I', 'E', 'CCTV Camera', 319, 'ea', '4K Outdoor Bullet AcuSense', 2.5, 'M'],
    ['Hikvision', 'DS-2DE4425IW-DE(T5)', 'DS-2DE4425IW-DE', 'E', 'CCTV Camera', 999, 'ea', '4MP PTZ 25x DarkFighter', 4.0, 'H'],
    ['Hikvision', 'DS-2DE7A432IW-AEB(T5)', 'DS-2DE7A432IW-AEB', 'E', 'CCTV Camera', 2499, 'ea', '4MP PTZ 32x AcuSense IR', 4.0, 'H'],
];

// Count: ~170 cameras

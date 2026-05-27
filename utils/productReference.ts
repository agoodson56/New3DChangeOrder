/**
 * Generates a condensed product reference string from the product database
 * for injection into AI system instructions.
 * 
 * This keeps the product database as the single source of truth for pricing,
 * installation requirements, accessories, and labor hours.
 */

import { FULL_CATALOG, getCatalogStats } from '../data/products';

import {
    CCTV_CAMERAS,
    NVR_SYSTEMS,
    ACCESS_READERS,
    DOOR_HARDWARE,
    ACCESS_PANELS,
    CABLING_PRODUCTS,
    PATHWAY_PRODUCTS,
    STANDARD_CONSUMABLES,
    CABLE_STANDARDS,
    CABLE_RUN_MODEL,
    CABLE_RUN_OVERHEAD_FT,
    LABOR_STANDARDS,
    AV_PRODUCTS,
    INTRUSION_PANELS,
    INTRUSION_SENSORS,
    FIRE_ALARM_PRODUCTS,
    FIRE_ALARM_CABLE,
    VERKADA_CAMERAS,
    BERKTEK_CABLE,
    POE_SWITCHES,
    type ProductDefinition
} from '../data/productDatabase';

function formatProduct(p: ProductDefinition): string {
    const price = p.unitOfMeasure === 'ft' ? `$${p.msrp.toFixed(2)}/ft` : `$${p.msrp.toFixed(2)} ea`;
    let line = `${p.manufacturer} ${p.model} (${p.partNumber}): ${price} | Labor: ${p.laborHours}hrs | ${p.description}`;

    // Add installation requirements
    const consumables = p.installationRequirements.filter(r => r.type === 'consumable');
    if (consumables.length > 0) {
        const reqs = consumables.map(c => {
            const cost = c.msrp ? ` @$${c.msrp}` : '';
            return `${c.name} x${c.quantityPerUnit}${cost}`;
        }).join('; ');
        line += `\n         Install reqs: ${reqs}`;
    }

    // Add required/recommended accessories
    const required = p.accessories.filter(a => a.type === 'required');
    const recommended = p.accessories.filter(a => a.type === 'recommended');

    if (required.length > 0) {
        const reqs = required.map(a => `[REQUIRED] ${a.manufacturer} ${a.name} (${a.partNumber}) $${a.msrp} - ${a.reason}`).join('; ');
        line += `\n         Accessories: ${reqs}`;
    }
    if (recommended.length > 0) {
        const recs = recommended.map(a => `[RECOMMENDED] ${a.manufacturer} ${a.name} (${a.partNumber}) $${a.msrp} - ${a.reason}`).join('; ');
        line += `\n         ${required.length > 0 ? '' : 'Accessories: '}${recs}`;
    }

    return line;
}

function formatSection(title: string, products: ProductDefinition[]): string {
    if (products.length === 0) return '';
    const lines = products.map(p => `       ${formatProduct(p)}`).join('\n');
    return `\n       === ${title} ===\n${lines}`;
}

// Cache: the product DB is static at module load, so the reference string
// is too. Compute once, reuse. Saves significant tokens AND wall-time on
// every CO generation.
let _productReferenceCache: string | null = null;

/**
 * Builds the complete product reference for AI prompt injection.
 * Returns a string block ready to be embedded in the system instruction.
 */
export function buildProductReference(): string {
    if (_productReferenceCache !== null) return _productReferenceCache;
    let ref = `
    12. VERIFIED PRODUCT DATABASE (USE THESE EXACT PRICES AND INSTALLATION REQUIREMENTS)
        The following products are from our verified database. When a user mentions any of these
        products or similar products, use the EXACT pricing, labor hours, and installation
        requirements listed. For products NOT in this database, use Google search for current pricing.
        
        CRITICAL: Each product lists its REQUIRED installation consumables and accessories.
        You MUST include these items on the change order. This is the Zero-Omission rule in action.
`;

    // CCTV
    ref += formatSection('CCTV CAMERAS', [...CCTV_CAMERAS, ...VERKADA_CAMERAS]);
    ref += formatSection('NVR / RECORDING SYSTEMS', NVR_SYSTEMS);

    // Access Control
    ref += formatSection('ACCESS CONTROL - READERS', ACCESS_READERS);
    ref += formatSection('ACCESS CONTROL - DOOR HARDWARE', DOOR_HARDWARE);
    ref += formatSection('ACCESS CONTROL - PANELS', ACCESS_PANELS);

    // AV Systems
    ref += formatSection('AV SYSTEMS - DISPLAYS, DSPs, ENCODERS, SPEAKERS', AV_PRODUCTS);

    // Intrusion Detection
    ref += formatSection('INTRUSION - PANELS', INTRUSION_PANELS);
    ref += formatSection('INTRUSION - SENSORS & DEVICES', INTRUSION_SENSORS);

    // Fire Alarm
    ref += formatSection('FIRE ALARM - PANELS & DEVICES', FIRE_ALARM_PRODUCTS);
    ref += formatSection('FIRE ALARM - CABLE', FIRE_ALARM_CABLE);

    // Cabling & Pathway
    ref += formatSection('STRUCTURED CABLING', [...CABLING_PRODUCTS, ...BERKTEK_CABLE]);
    ref += formatSection('PATHWAY & SUPPORTS', PATHWAY_PRODUCTS);
    ref += formatSection('POE SWITCHES', POE_SWITCHES);

    // Standard consumables
    ref += `\n
       === STANDARD CONSUMABLES (include on EVERY job) ===
`;
    ref += STANDARD_CONSUMABLES.map(c => {
        const scope = c.perProject ? 'per project' : `per ${(c as any).perCameraSet ? (c as any).perCameraSet + ' cameras' : 'outdoor camera'}`;
        return `       ${c.name} (${c.partNumber}): $${c.msrp.toFixed(2)} — ${scope}`;
    }).join('\n');

    // Cable calculation standards
    const ptd = CABLE_RUN_MODEL.projectTypeDefaults;
    const ptLine = Object.entries(ptd)
        .map(([k, v]) => `${k.replace(/_/g, ' ')} ~${v.horizontalFt}ft (×${v.routingFactor})`)
        .join(', ');
    ref += `\n
       === CABLE CALCULATION STANDARDS (BICSI run model) ===
       Default cable type: ${CABLE_STANDARDS.cableType}

       A real horizontal run is NOT a straight line. Estimate each run's length as:
         run_ft = (horizontal_pathway × routing_factor) + vertical_rise + service_slack
       then apply the waste factor to the total.
       - routing_factor: ${CABLE_RUN_MODEL.routingFactor} typical commercial (BICSI TDMM: 1.15-1.20 open plan, 1.25-1.35 standard, 1.35-1.50 complex medical/govt/school).
       - vertical_rise: stub-up to plenum ${CABLE_RUN_MODEL.stubUpFt}ft + IDF/TR drop to patch panel ${CABLE_RUN_MODEL.idfDropFt}ft.
       - service_slack: ${CABLE_RUN_MODEL.serviceLoopTrFt}ft loop at the telecom room + ${CABLE_RUN_MODEL.serviceLoopWaFt}ft at the work area + ${CABLE_RUN_MODEL.dressingFt}ft rack dressing (~${CABLE_RUN_OVERHEAD_FT}ft total vertical+slack added to EVERY run).
       - Minimum run: ${CABLE_RUN_MODEL.minRunFt}ft (even the closest device has stub-up + loops + rack routing).
       - TIA-568 cap: the HORIZONTAL portion must not exceed ${CABLE_RUN_MODEL.tiaMaxHorizontalFt}ft (90 m permanent link). Flag any run that does and note a different pathway/IDF is needed.
       If the coordinator gives a measured distance, use it as the horizontal_pathway; otherwise use the project-type baseline:
         ${ptLine}.
       Fallback per-device totals when no project type is evident: camera ${CABLE_STANDARDS.perCameraFeet}ft, door ${CABLE_STANDARDS.perDoorFeet}ft, data drop ${CABLE_STANDARDS.perDropFeet}ft (these already roll in vertical+slack).

       J-hook spacing: 1 every ${CABLE_STANDARDS.jHookSpacingFeet}ft (3DTSI install standard). ${Math.round(CABLE_STANDARDS.bundledCableFraction * 100)}% of EACH run is bundled (one shared pathway, one set of hooks); the remaining ${Math.round((1 - CABLE_STANDARDS.bundledCableFraction) * 100)}% of each run is separate, summed across runs. Include 1 beam clamp per J-hook (1:1 ratio).
       Pull box interval: Every ${CABLE_STANDARDS.pullBoxIntervalFeet}ft for long runs.
       Waste factor: ${CABLE_RUN_MODEL.wastePct}% for terminations, pulls, cut ends, and mistakes.
`;

    // Labor standards (all 6 systems)
    ref += `
       === LABOR HOUR STANDARDS (per unit) ===
       CCTV: Indoor Dome ${LABOR_STANDARDS.indoorDomeCamera}hrs | Outdoor Dome ${LABOR_STANDARDS.outdoorDomeCamera}hrs | PTZ ${LABOR_STANDARDS.ptzCamera}hrs | Bullet ${LABOR_STANDARDS.bulletCamera}hrs | NVR Rack ${LABOR_STANDARDS.nvrRackMount}hrs | NVR Desktop ${LABOR_STANDARDS.nvrDesktop}hrs
       Access Control: Reader ${LABOR_STANDARDS.readerInstall}hrs | Electric Strike ${LABOR_STANDARDS.electricStrike}hrs | Mag Lock ${LABOR_STANDARDS.magLock}hrs | Panel ${LABOR_STANDARDS.controlPanel}hrs | Door Contact ${LABOR_STANDARDS.doorContact}hrs | REX ${LABOR_STANDARDS.rexSensor}hrs
       AV Systems: Display Mount ${LABOR_STANDARDS.displayMount}hrs | DSP ${LABOR_STANDARDS.dspInstall}hrs | Amplifier ${LABOR_STANDARDS.amplifierInstall}hrs | Speaker ${LABOR_STANDARDS.speakerInstall}hrs | Encoder/Decoder ${LABOR_STANDARDS.encoderDecoder}hrs | Control Processor ${LABOR_STANDARDS.controlProcessor}hrs | Microphone ${LABOR_STANDARDS.microphoneInstall}hrs
       Intrusion: Motion Detector ${LABOR_STANDARDS.motionDetector}hrs | Glass Break ${LABOR_STANDARDS.glassBreak}hrs | Panel ${LABOR_STANDARDS.intrusionPanel}hrs | Keypad ${LABOR_STANDARDS.keypad}hrs | Siren ${LABOR_STANDARDS.siren}hrs
       Fire Alarm: Smoke Detector ${LABOR_STANDARDS.smokeDetector}hrs | Heat Detector ${LABOR_STANDARDS.heatDetector}hrs | Pull Station ${LABOR_STANDARDS.pullStation}hrs | Horn/Strobe ${LABOR_STANDARDS.hornStrobe}hrs | FACP ${LABOR_STANDARDS.firePanel}hrs
       Cabling: Per run ${LABOR_STANDARDS.cablePullPerRun}hrs + ${LABOR_STANDARDS.cablePullPer50Ft}hrs/50ft | Termination ${LABOR_STANDARDS.terminationPerEnd}hrs/end | 24-port panel ${LABOR_STANDARDS.patchPanelPer24}hrs
       Pathway: J-hook ${LABOR_STANDARDS.jHookInstall}hrs | Ladder rack ${LABOR_STANDARDS.ladderRackPer10Ft}hrs/10ft | Conduit ${LABOR_STANDARDS.conduitPer10Ft}hrs/10ft

       --- ADDITIONAL DEVICE TIERS (field-verified production rates) ---
       Use the higher tier when the install conditions warrant it:
       - Camera, POLE-MOUNT (lift + ground + surge + terminate + test): ~20 hrs each — far above a standard dome. Use whenever a camera is on a pole/mast or requires a lift at height.
       - Camera, COMPLEX (PTZ / multi-sensor / 360): ~8 hrs each (extra programming + setup) — more than a fixed dome.
       - Access controller by door capacity: 2-door ~4 hrs | 4-door ~8 hrs | 8-door ~8 hrs (controller mount + power + head-end termination, separate from per-door reader/strike/REX/contact).
       - Access control PROGRAMMING (head-end, cardholders, schedules, integration test): ~8 hrs per system, as its own line.
       - Long-range / vehicle reader: ~1.5 hrs each.
       Per-foot PATHWAY labor (bill pathway by the linear foot, not as 'each'):
       - Conduit / EMT / PVC: ${LABOR_STANDARDS.conduitPer10Ft || 0.25}hrs/10ft ≈ 0.025 hrs/ft (15 min per 10-ft stick).
       - Cable tray / ladder rack / runway: ~0.15 hrs/ft (≈9 min per LF).

       --- OVERHEAD LOADERS (apply on top of field labor, as their own lines) ---
       Field labor hours are DIRECT install only. A defensible bid adds these burdens:
       - Misc labor: +5% of field hours (small unaccounted tasks — applied to every bid).
       - Non-productive time (NPT): +8% of field hours (escort wait, breaks, travel-on-site, staging).
       - Project management: +8% of field hours.
       - Engineering / admin: +4% of field hours.
       - Material support: +2% of material cost (3-system handling, staging) — 10% for pole-mount jobs.
       - Shipping/freight: +1% of material cost — 3% for pole-mount jobs.
       - Pre-construction / general conditions: ~3% where applicable; Warranty: ~2% of section total.
       Surface PM, NPT, and engineering as explicit labor tasks so the total reflects true cost, not just install hours.
`;

    // Expanded catalog summary (compact products from data/products/)
    const stats = getCatalogStats();
    ref += `
       === EXPANDED PRODUCT CATALOG (${stats.total} additional products available) ===
       Beyond the detailed products above, we maintain a verified catalog of ${stats.total} products.
       Use these EXACT prices when matching. For any product not found, use Google Search for pricing.

       Available Manufacturers: ${Object.entries(stats.manufacturers)
            .sort((a, b) => b[1] - a[1])
            .map(([mfr, count]) => `${mfr} (${count})`)
            .join(', ')}

       Available Categories: ${Object.entries(stats.categories)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => `${cat} (${count})`)
            .join(', ')}
`;

    _productReferenceCache = ref;
    return ref;
}


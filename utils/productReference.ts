/**
 * Generates a condensed product reference string from the product database
 * for injection into AI system instructions.
 * 
 * This keeps the product database as the single source of truth for pricing,
 * installation requirements, accessories, and labor hours.
 */

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
    LABOR_STANDARDS,
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

/**
 * Builds the complete product reference for AI prompt injection.
 * Returns a string block ready to be embedded in the system instruction.
 */
export function buildProductReference(): string {
    let ref = `
    12. VERIFIED PRODUCT DATABASE (USE THESE EXACT PRICES AND INSTALLATION REQUIREMENTS)
        The following products are from our verified database. When a user mentions any of these
        products or similar products, use the EXACT pricing, labor hours, and installation
        requirements listed. For products NOT in this database, use Google search for current pricing.
        
        CRITICAL: Each product lists its REQUIRED installation consumables and accessories.
        You MUST include these items on the change order. This is the Zero-Omission rule in action.
`;

    ref += formatSection('CCTV CAMERAS', CCTV_CAMERAS);
    ref += formatSection('NVR / RECORDING SYSTEMS', NVR_SYSTEMS);
    ref += formatSection('ACCESS CONTROL - READERS', ACCESS_READERS);
    ref += formatSection('ACCESS CONTROL - DOOR HARDWARE', DOOR_HARDWARE);
    ref += formatSection('ACCESS CONTROL - PANELS', ACCESS_PANELS);
    ref += formatSection('STRUCTURED CABLING', CABLING_PRODUCTS);
    ref += formatSection('PATHWAY & SUPPORTS', PATHWAY_PRODUCTS);

    // Standard consumables
    ref += `\n
       === STANDARD CONSUMABLES (include on EVERY job) ===
`;
    ref += STANDARD_CONSUMABLES.map(c => {
        const scope = c.perProject ? 'per project' : `per ${(c as any).perCameraSet ? (c as any).perCameraSet + ' cameras' : 'outdoor camera'}`;
        return `       ${c.name} (${c.partNumber}): $${c.msrp.toFixed(2)} — ${scope}`;
    }).join('\n');

    // Cable calculation standards
    ref += `\n
       === CABLE CALCULATION STANDARDS ===
       Default cable type: ${CABLE_STANDARDS.cableType}
       Average per camera: ${CABLE_STANDARDS.perCameraFeet}ft
       Average per door: ${CABLE_STANDARDS.perDoorFeet}ft
       Average per data drop: ${CABLE_STANDARDS.perDropFeet}ft
       J-hook spacing: Every ${CABLE_STANDARDS.jHookSpacingFeet}ft (TIA-569)
       Pull box interval: Every ${CABLE_STANDARDS.pullBoxIntervalFeet}ft for long runs
       Waste factor: ${CABLE_STANDARDS.wasteFactorPercent}% for terminations and pulls
`;

    // Labor standards
    ref += `
       === LABOR HOUR STANDARDS (per unit) ===
       CCTV: Indoor Dome ${LABOR_STANDARDS.indoorDomeCamera}hrs | Outdoor Dome ${LABOR_STANDARDS.outdoorDomeCamera}hrs | PTZ ${LABOR_STANDARDS.ptzCamera}hrs | Bullet ${LABOR_STANDARDS.bulletCamera}hrs | NVR Rack ${LABOR_STANDARDS.nvrRackMount}hrs | NVR Desktop ${LABOR_STANDARDS.nvrDesktop}hrs
       Access Control: Reader ${LABOR_STANDARDS.readerInstall}hrs | Electric Strike ${LABOR_STANDARDS.electricStrike}hrs | Mag Lock ${LABOR_STANDARDS.magLock}hrs | Panel ${LABOR_STANDARDS.controlPanel}hrs | Door Contact ${LABOR_STANDARDS.doorContact}hrs | REX ${LABOR_STANDARDS.rexSensor}hrs
       Cabling: Per run ${LABOR_STANDARDS.cablePullPerRun}hrs + ${LABOR_STANDARDS.cablePullPer50Ft}hrs/50ft | Termination ${LABOR_STANDARDS.terminationPerEnd}hrs/end | 24-port panel ${LABOR_STANDARDS.patchPanelPer24}hrs
       Pathway: J-hook ${LABOR_STANDARDS.jHookInstall}hrs | Ladder rack ${LABOR_STANDARDS.ladderRackPer10Ft}hrs/10ft | Conduit ${LABOR_STANDARDS.conduitPer10Ft}hrs/10ft
`;

    return ref;
}

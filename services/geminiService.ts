
import { GoogleGenAI, Type } from "@google/genai";
import { ChangeOrderData, ProposalData, LaborRates } from "../types";

const CO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    customer: { type: Type.STRING },
    contact: { type: Type.STRING },
    projectName: { type: Type.STRING },
    address: { type: Type.STRING },
    phone: { type: Type.STRING },
    projectNumber: { type: Type.STRING },
    rfiNumber: { type: Type.STRING },
    pcoNumber: { type: Type.STRING },
    technicalScope: { type: Type.STRING, description: "Prepared Work Summary - must be 6-8 sentences as ONE paragraph. Include: (1) Opening with '3D Technology Services proposes...', (2) Solution overview with equipment and quantities, (3) Key installation methods (J-hooks, lift equipment, cable certification), (4) Applicable codes (BICSI, NEC, OSHA), (5) Business benefits and warranty coverage, (6) Closing value statement. Be comprehensive but CONCISE - do not exceed 8 sentences." },
    systemsImpacted: { type: Type.ARRAY, items: { type: Type.STRING } },
    materials: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          manufacturer: { type: Type.STRING },
          model: { type: Type.STRING },
          category: { type: Type.STRING, enum: ['Material', 'Equipment'] },
          quantity: { type: Type.NUMBER },
          msrp: { type: Type.NUMBER, description: "Unit value. If cable, this MUST be the price per foot." },
          unitOfMeasure: { type: Type.STRING, description: "If cabling, this MUST be 'ft'. Otherwise 'ea'." },
          complexity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
          notes: { type: Type.STRING, description: "The purpose or dependency for this item." }
        },
        required: ['manufacturer', 'model', 'quantity', 'msrp', 'category', 'unitOfMeasure']
      }
    },
    labor: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          class: { type: Type.STRING, description: "Lead, Tech, or Programmer" },
          task: { type: Type.STRING },
          hours: { type: Type.NUMBER },
          rateType: { type: Type.STRING, enum: ['base', 'afterHours', 'emergency'] },
          notes: { type: Type.STRING }
        },
        required: ['class', 'task', 'hours', 'rateType']
      }
    },
    standardsReview: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          standard: { type: Type.STRING },
          compliance: { type: Type.STRING },
          action: { type: Type.STRING }
        }
      }
    },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    exclusions: { type: Type.ARRAY, items: { type: Type.STRING } },
    professionalNotes: { type: Type.STRING, description: "Senior estimator reasoning summary." },
    confidenceScore: { type: Type.NUMBER },
    nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['customer', 'technicalScope', 'systemsImpacted', 'materials', 'labor', 'professionalNotes', 'confidenceScore']
};

export async function generateChangeOrder(
  intent: string,
  images: string[] = [],
  adminData: any = {}
): Promise<ChangeOrderData> {
  // Use VITE_ prefix for Cloudflare/Vite environment variables
  const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.0-flash';

  const systemInstruction = `
    ENFORCEMENT PROMPT — ZERO-OMISSION PARTS & LABOR RULE

    <role>
    You are a Zero-Omission Compliance Authority for service change orders.
    Your sole responsibility is to ensure nothing required to complete the work is omitted, regardless of how small, inexpensive, or "normally assumed" it may seem.
    You operate as a senior service estimator, systems engineer, and project coordinator combined.
    </role>

    <sales_focused_summary>
    The 'technicalScope' field is your PREPARED WORK SUMMARY. Keep it CONCISE but VALUE-FOCUSED.
    
    LENGTH: Exactly 6-8 sentences as ONE PARAGRAPH. Do not exceed this.
    
    REQUIRED ELEMENTS (cover all 6 briefly):
    1. OPENING: "3D Technology Services proposes..." - describe what you're installing with quantities
    2. INSTALLATION: Mention J-hooks for cable support, lift equipment for high work, professional mounting
    3. TESTING: Fluke cable certification per TIA-568 standards, camera focus/alignment optimization  
    4. CODES: Reference BICSI, NEC, and OSHA compliance in one sentence
    5. VALUE: Business benefits (security, liability protection) and warranty coverage
    6. CLOSING: Turnkey solution commitment
    
    EXAMPLE (6 sentences - use this length):
    "3D Technology Services proposes a comprehensive video surveillance enhancement featuring five (5) Axis P5655 PTZ cameras delivering 24/7 HD coverage across your warehouse facility. All cabling will be professionally suspended using J-hooks at 4-5 foot intervals per BICSI standards, with elevated work performed using OSHA-compliant scissor lift equipment. Every cable run will be Fluke-certified to TIA-568 standards, and each camera will be precisely aimed and optimized for maximum coverage. All work complies with BICSI TDMM, NEC Article 800, and OSHA 1910/1926 safety standards. This investment protects your assets with 24/7 surveillance, manufacturer warranty coverage, and 3D Technology Services' professional workmanship guarantee. Complete turnkey solution including installation, testing, certification, and documentation."
    
    DO NOT exceed 8 sentences. Be comprehensive but CONCISE.
    </sales_focused_summary>

    <context>
    Change orders fail when minor components, accessories, prep work, or labor steps are excluded.
    This prompt exists to override assumptions and force full disclosure of every physical item, consumable, and labor action required to complete the request successfully.
    
    This applies to all adds, moves, and changes across:
    - Structured cabling
    - CCTV
    - Access Control
    - Intrusion
    - Fire Alarm (low-voltage scope)
    - AV systems
    - Supporting infrastructure
    </context>

    <administrative_data>
    Priority MUST be given to these explicit fields:
    - Customer: ${adminData.customer || 'Infer from intent'}
    - Contact: ${adminData.contact || 'Infer from intent'}
    - Project: ${adminData.projectName || 'Infer from intent'}
    - Address: ${adminData.address || 'Infer from intent'}
    - Phone: ${adminData.phone || 'Infer from intent'}
    - Project #: ${adminData.projectNumber || 'Infer from intent'}
    - RFI #: ${adminData.rfiNumber || 'Infer from intent'}
    - PCO #: ${adminData.pcoNumber || 'Infer from intent'}
    </administrative_data>

    <instructions>
    1. ABSOLUTE INCLUSION RULE
       You must include every required item, even if it is:
       - Small
       - Inexpensive
       - Commonly overlooked
       - Normally included in "miscellaneous"
       - Considered "part of the job"
       Nothing may be implied. Everything must be listed.

    2. MANDATORY "TOUCH RULE"
       If any of the following are true, the item or task must be included:
       - A technician touches it
       - A technician installs it
       - A technician programs it
       - A technician tests it
       - A technician labels it
       - A technician documents it
       - A technician removes or disposes of it
       If it consumes time, material, or effort — it belongs on the change order.

    3. MINIMUM MATERIAL CATEGORIES (Non-Exhaustive - Include ALL When Applicable)
       - Fasteners (screws, anchors, bolts)
       - Mounting hardware and brackets
       - Backboxes, mud rings, faceplates
       - Patch cords, jumpers, pigtails
       - Conduit fittings and supports
       - J-hooks, straps, and hangers (see calculation rule below)
       - Fire-stopping materials
       - Labels and labeling supplies
       - Cable management accessories
       - Power connectors and adapters
       - Consumables (ties, Velcro, tape)
       - Disposal materials and labor
       - RJ45/Keystone jacks (see calculation rule below)
       - Patch panels for rack terminations
       - LIFT/EQUIPMENT RENTAL (MANDATORY if working above 10ft):
         * Scissor lift rental (daily rate)
         * Boom lift rental (daily rate)
         * Ladder rental if required
         * Safety harness/fall protection
       If any category applies, list it explicitly.

    9. PRODUCT PRICING REFERENCE (USE THESE EXACT PRICES)
       You MUST use the following verified MSRP pricing for all materials and equipment.
       Search Google if a specific product is not listed below to find current pricing.
       
       === CCTV CAMERAS ===
       Axis P3245-V (2MP Indoor Dome): $899.00 ea
       Axis P3265-V (4K Indoor Dome): $1,199.00 ea
       Axis P3255-LVE (2MP Outdoor Dome): $1,349.00 ea
       Axis Q6135-LE (2MP PTZ 32x): $5,899.00 ea
       Axis Q6225-LE (4MP PTZ 32x, IR): $7,199.00 ea
       Axis M3115-LVE (2MP Mini Dome): $449.00 ea
       Axis T91D61 Wall Mount: $125.00 ea
       Axis T94K01L Recessed Mount: $89.00 ea
       Axis T94K01D Pendant Kit: $105.00 ea
       Axis T91A67 Pole Mount: $285.00 ea
       Hikvision DS-2CD2143G2-IU (4MP Dome): $285.00 ea
       Hikvision DS-2CD2T47G2-L (4MP ColorVu Bullet): $425.00 ea
       Hikvision DS-2CD2547G2-LZS (4MP Mini Dome): $375.00 ea
       
       === NVR/RECORDING SYSTEMS ===
       Axis S1116 (16ch NVR, 8TB): $4,299.00 ea
       Axis S1148 (48ch NVR, 24TB): $8,995.00 ea
       Hikvision DS-7616NXI-K2/16P (16ch NVR w/PoE): $649.00 ea
       WD Purple Surveillance HDD 6TB: $155.00 ea
       WD Purple Surveillance HDD 8TB: $185.00 ea
       Seagate SkyHawk 8TB: $179.00 ea
       APC SMT1500RM2U UPS: $895.00 ea
       CyberPower CP850PFCLCD UPS: $159.00 ea
       
       === ACCESS CONTROL ===
       HID Signo 40 Reader w/Keypad: $425.00 ea
       HID Signo 20 Reader: $285.00 ea
       HID iCLASS SE R40 Reader: $195.00 ea
       Mercury LP1502 (2-door panel): $595.00 ea
       Mercury LP1504 (4-door panel): $895.00 ea
       HES 1006CLB Electric Strike: $195.00 ea
       Securitron M62 Maglock (1200lb): $285.00 ea
       Seco-Larm SD-995C-D1Q REX Sensor: $55.00 ea
       Seco-Larm SM-226L-3Q Door Contact: $12.00 ea
       Altronix AL600ULACM Power Supply: $285.00 ea
       Power Sonic PS-1270 Battery: $25.00 ea
       Z-Bracket Kit (maglock): $45.00 ea
       Power Transfer Hinge: $125.00 ea
       
       === STRUCTURED CABLING ===
       Panduit Cat6A Plenum Cable (PUP6AV04BU-UG): $0.85/ft
       Belden 10GXS12 Cat6A F/UTP Plenum: $0.95/ft
       Berk-Tek 10GXS12 Cat6A (Leviton warranty): $0.90/ft
       Leviton 6A586-U24 Patch Panel 24-port: $533.99 ea
       Leviton 6A586-U48 Patch Panel 48-port: $744.42 ea
       Leviton eXtreme Cat6A Jack (6110G-RW6): $13.50 ea
       Leviton QuickPort 2-port Faceplate: $3.25 ea
       Low Voltage Mounting Bracket: $1.50 ea
       Cat6A RJ45 Shielded Connector: $5.50 ea
       Cat6A RJ45 UTP Connector: $3.50 ea
       Cat6 RJ45 Connector: $1.50 ea
       Patch Cable 1ft Cat6: $3.50 ea
       Patch Cable 3ft Cat6A: $8.00 ea
       Patch Cable 7ft Cat6A: $12.00 ea
       
       === PATHWAY & SUPPORTS ===
       nVent CADDY CAT HP J-Hook 2" (CAT21HP): $3.85 ea
       nVent CADDY CAT HP J-Hook 4" (CAT41HP): $5.25 ea
       B-Line Bridle Ring 2": $1.85 ea
       Beam Clamp for J-Hook: $2.50 ea
       Threaded Rod 1/4" x 10ft: $8.00 ea
       Horizontal Cable Manager 1U: $45.00 ea
       Horizontal Cable Manager 2U: $65.00 ea
       
       === CONSUMABLES (INCLUDE ON EVERY JOB) ===
       Cable Ties 8" Black (100 pack): $8.50/pack
       Velcro Cable Straps 6" (25 pack): $15.00/pack
       Cable Labels (100 roll): $12.00/roll
       Tapcon Anchors 1/4x1-3/4 (box 100): $35.00/box
       Drywall Anchors Assorted Kit: $18.00/kit
       Wire Nuts Assorted (bag 50): $8.00/bag
       Electrical Tape 3-pack: $12.00/pack
       Silicone Sealant Clear (tube): $8.50/tube
       Heat Shrink Assortment Kit: $22.00/kit
       Weatherproof Junction Box: $45.00 ea
       Single Gang Junction Box: $4.50 ea
       
       === LIFT EQUIPMENT (REQUIRED FOR HIGH WORK) ===
       Scissor Lift Rental (daily): $250.00/day
       Boom Lift Rental (daily): $450.00/day
       Fall Protection Harness (rental): $35.00/day
       
       === INSTALLATION MATERIAL FORMULAS ===
       J-HOOKS: 1 per every 5 feet of horizontal cable run (mandatory TIA-569)
       CABLE TIES: 1 per every 2 feet of cable (bundling at J-hooks)
       LABELS: 2 per cable run (both ends)
       JACKS: 1 per camera (patch panel only); 2 per data drop (wall + panel)
       CABLE WASTE: Add 15% to stated footage for terminations and routing
       OUTDOOR CAMERAS: Include weatherproof junction box + silicone sealant
       PTZ CAMERAS: Include larger junction box, stainless mounting hardware

    3a. QUANTITY CALCULATION RULES (MANDATORY - Follow Precisely)
       CABLE QUANTITY:
       - Use the EXACT footage stated by the user
       - Add ONLY 10% overhead for service loops and routing (NOT 100%, NOT double)
       - Example: User says "400ft run" = 400 + 40 (10%) = 440ft total
       - NEVER double the stated cable length
       - Each camera/device requires ONE cable run, not two

       KEYSTONE JACKS:
       - CAMERAS/PoE DEVICES: 1 jack per device (at patch panel only - device end uses RJ45 plug)
       - DATA DROPS (wall outlets): 2 jacks per drop (1 wall jack + 1 patch panel jack)
       - Do NOT add 2 jacks per camera - cameras terminate with RJ45 plugs, not jacks

       J-HOOKS:
       - Calculate: 1 J-hook per 5 feet of HORIZONTAL cable run
       - Example: 400ft horizontal run = 80 J-hooks
       - Vertical runs use different supports (not J-hooks)
       - Round up to nearest whole number

       PATCH CORDS:
       - 1 patch cord per camera/device (for switch to patch panel connection)
       - 1 patch cord per data drop (for patch panel to switch connection)

       FACEPLATES:
       - 0 for cameras (no faceplate needed)
       - 1 per data drop wall outlet

       CABLE TIES:
       - Estimate 1 tie per 2 feet of cable run (bundle at J-hooks)

       LABELS:
       - 2 per cable run (one each end)

    4. CABLING REQUIREMENT
       When adding cable (Category 6, Fiber, Security Wire, etc.):
       - Set 'unitOfMeasure' to 'ft'
       - Use the CALCULATED footage (user stated + 10% overhead) for 'quantity'
       - Use the price per foot for 'msrp'
       - MANDATORY: Include jacks (per 3a rules), patch cords, labels
       - Do NOT include faceplates for camera runs

    5. LABOR GRANULARITY RULE
       Labor must never be summarized as "install" or "configure" alone.
       You must break labor into:
       - Site Survey and Preparation
       - Installation / Mounting
       - Cabling and Pathways
       - Termination and Connections
       - Programming and Configuration
       - Testing and Verification
       - Documentation and Labeling
       - Customer Coordination and Sign-off
       Even brief tasks must be included if they exist.

    5a. LABOR HOUR ESTIMATION (Follow These Guidelines)
       Base labor on the ACTUAL device count and cable footage, not inflated quantities.
       
       SINGLE CAMERA INSTALLATION (typical):
       - Site Survey and Preparation: 1 hour
       - Installation / Mounting: 2 hours (includes lift time if applicable)
       - Cabling and Pathways: 4 hours per 400ft of cable run
       - Termination and Connections: 2 hours
       - Programming and Configuration: 1 hour
       - Testing and Verification: 1 hour
       - Documentation and Labeling: 0.5 hours
       - Customer Coordination and Sign-off: 0.5 hours
       
       Scale proportionally for multiple devices. Do NOT double labor just because materials seem high.

    6. NO ASSUMED INFRASTRUCTURE RULE
       Never assume:
       - Spare capacity exists
       - Pathways are available
       - Power is nearby
       - Licensing is sufficient
       - Documentation is current
       If something is assumed, it must be explicitly stated as an assumption.

    7. MANUFACTURER CONSISTENCY RULE (Required)
       Within each system category, use components from a SINGLE manufacturer:
       - Structured Cabling: Use ALL Panduit OR ALL Leviton OR ALL CommScope (do NOT mix)
         * Jacks, patch panels, faceplates must all be same brand
         * LEVITON WARRANTY REQUIREMENT: When using Leviton jacks/panels, MUST use Berk-Tek cable for warranty compliance
         * Panduit or CommScope systems can use their respective branded cable
       - CCTV: Use ALL Axis OR ALL Hanwha OR ALL Verkada (do NOT mix cameras/NVRs)
       - Access Control: Use ALL Lenel OR ALL HID OR ALL Genetec (do NOT mix readers/panels)
       - Fire Alarm: Use ALL Notifier OR ALL EST OR ALL Simplex (do NOT mix devices/panels)
       - AV: Use ALL Crestron OR ALL Extron OR ALL Biamp for control/DSP (do NOT mix)
       
       EXCEPTION: Only mix manufacturers if a specific component is unavailable from the primary brand
       or if the customer explicitly specifies a different brand for a particular item.
       If mixing is required, document it in 'professionalNotes' with justification.

    8. VALIDATION PASS (Required)
       Before finalizing output, perform a completeness audit:
       Ask yourself:
       - "What could cause a technician to stop work?"
       - "What would the field call back asking for?"
       - "What small item would delay completion if missing?"
       If the answer exists — include it.
    </instructions>

    <format>
    Your output MUST be a JSON object adhering to the provided schema.
    - 'technicalScope' must be a professional rewriting of the user's intent
    - 'materials' must include ALL Materials (infrastructure) and Equipment (active components)
    - 'labor' must include ALL labor tasks broken down granularly
    - 'assumptions' must list anything assumed about existing conditions
    - 'exclusions' must list anything explicitly not included
    </format>

    <criteria>
    The output is only acceptable if:
    - No material or labor is implied
    - Nothing is hidden inside assumptions
    - A technician could complete the work without requesting additional parts
    - The change order would withstand customer, auditor, and field review
    When in doubt, include the item.
    </criteria>
  `;

  const contents = {
    parts: [
      { text: `User Description: ${intent}` },
      ...images.map(img => ({ inlineData: { data: img.split(',')[1], mimeType: 'image/jpeg' } }))
    ]
  };

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: CO_SCHEMA
    }
  });

  const rawText = response.text;
  if (!rawText) throw new Error("No response from AI");

  const data = JSON.parse(rawText) as ChangeOrderData;
  data.coordinatorIntent = intent;
  return data;
}

const PROPOSAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    projectTitle: { type: Type.STRING, description: "A compelling, professional project title" },
    clientName: { type: Type.STRING },
    executiveSummary: { type: Type.STRING, description: "A compelling 3-4 sentence executive summary highlighting the business value and ROI of this investment" },
    problemStatement: { type: Type.STRING, description: "2-3 sentences describing the business challenge or opportunity this addresses" },
    solutionOverview: { type: Type.STRING, description: "3-4 sentences describing the proposed solution in compelling, benefits-focused language" },
    technicalHighlights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5-7 bullet points of key technical features and capabilities being delivered"
    },
    valueProposition: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5-7 compelling value statements about ROI, efficiency gains, risk reduction, competitive advantage"
    },
    industryInsights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 relevant industry statistics, trends, or benchmarks that support the investment (use current 2024-2026 data)"
    },
    companyCredentials: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5-7 compelling credentials about 3D Technology Services including certifications, years experience, project count, warranty coverage"
    },
    whyChooseUs: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "4-6 differentiators that set 3D Technology Services apart from competitors"
    },
    nextSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 clear action items for project initiation"
    },
    callToAction: { type: Type.STRING, description: "A compelling closing statement urging immediate action" }
  },
  required: ['projectTitle', 'clientName', 'executiveSummary', 'solutionOverview', 'technicalHighlights', 'valueProposition', 'industryInsights', 'companyCredentials', 'whyChooseUs', 'nextSteps', 'callToAction']
};

export async function generateProposal(
  coData: ChangeOrderData,
  rates: LaborRates,
  financials: {
    laborTotal: number;
    materialsTotal: number;
    taxTotal: number;
    grandTotal: number;
  }
): Promise<ProposalData> {
  const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.0-flash';

  // Build a detailed context from the change order
  const materialsList = coData.materials.map(m =>
    `${m.quantity}x ${m.manufacturer} ${m.model} (${m.category})`
  ).join(', ');

  const laborList = coData.labor.map(l =>
    `${l.task} - ${l.hours} hours`
  ).join(', ');

  const systemInstruction = `
    You are an elite proposal writer for 3D Technology Services, a premier low-voltage systems integrator.
    Your writing style is:
    - COMPELLING and PERSUASIVE - this is a sales document
    - PROFESSIONAL yet EXCITING - make technology sound impressive
    - BENEFIT-FOCUSED - always tie features to business outcomes
    - CONFIDENT - position 3D Technology Services as the clear best choice
    
    ABOUT 3D TECHNOLOGY SERVICES:
    - California C-7 Licensed contractor (#875745)
    - Located in Rancho Cordova, CA (Sacramento region)
    - Specializes in: CCTV, Access Control, Structured Cabling, Fire Alarm, AV Systems
    - BICSI certified technicians
    - 25+ years combined leadership experience
    - Thousands of successful installations
    - 24/7 emergency service available
    - Full manufacturer warranties honored
    
    WRITING GUIDELINES:
    1. Use powerful action verbs and confident language
    2. Include specific numbers and metrics when possible
    3. Connect features to business outcomes (security, liability protection, efficiency, ROI)
    4. Make the investment feel essential, not optional
    5. Create urgency without being pushy
    6. Use industry terminology appropriately but explain benefits in business terms
    
    INTERNET RESEARCH:
    Use your knowledge to include:
    - Current industry statistics about security/technology trends
    - ROI benchmarks for similar investments
    - Relevant regulatory or compliance information
    - Market trends that support the investment
    
    IMPORTANT: Generate content that would impress a C-level executive reviewing this proposal.
  `;

  const prompt = `
    Create a compelling professional proposal based on this Change Order:
    
    PROJECT DETAILS:
    - Customer: ${coData.customer}
    - Contact: ${coData.contact}
    - Project Name: ${coData.projectName}
    - Location: ${coData.address}
    
    TECHNICAL SCOPE:
    ${coData.technicalScope}
    
    SYSTEMS IMPACTED:
    ${coData.systemsImpacted.join(', ')}
    
    MATERIALS & EQUIPMENT:
    ${materialsList}
    
    LABOR TASKS:
    ${laborList}
    
    INVESTMENT BREAKDOWN:
    - Labor: $${financials.laborTotal.toLocaleString()}
    - Materials & Equipment: $${financials.materialsTotal.toLocaleString()}
    - Tax: $${financials.taxTotal.toLocaleString()}
    - TOTAL INVESTMENT: $${financials.grandTotal.toLocaleString()}
    
    Generate a COMPELLING, PROFESSIONAL proposal that would excite and convince the client to approve this investment immediately.
    Use current industry knowledge to add relevant statistics, trends, and insights.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: PROPOSAL_SCHEMA
    }
  });

  const rawText = response.text;
  if (!rawText) throw new Error("No response from AI");

  const proposalContent = JSON.parse(rawText);

  return {
    ...proposalContent,
    investmentSummary: financials,
    generatedDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } as ProposalData;
}

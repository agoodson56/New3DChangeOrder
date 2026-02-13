
import { GoogleGenAI, Type } from "@google/genai";
import { ChangeOrderData, ProposalData, LaborRates, AdminData, Financials, ValidationResult } from "../types";
import { buildProductReference } from "../utils/productReference";
import { validateChangeOrder } from "../utils/coValidator";
import { validatePricing } from "./pricingValidator";
import { auditChangeOrder } from "./qaAuditor";

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
  adminData: AdminData = { customer: '', contact: '', projectName: '', address: '', phone: '', projectNumber: '', rfiNumber: '', pcoNumber: '' }
): Promise<ChangeOrderData> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please set the GEMINI_API_KEY environment variable in your Cloudflare Pages project settings (Settings → Environment Variables) and redeploy.');
  }
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
    4. CODES: Reference BICSI TDMM, NEC Article 800, NFPA 70E (for PoE electrical safety), and OSHA compliance
    5. VALUE: Business benefits (security, liability protection) and warranty coverage
    6. CLOSING: Turnkey solution commitment
    
    EXAMPLE (6 sentences - use this length):
    "3D Technology Services proposes a comprehensive video surveillance enhancement featuring five (5) Axis P5655 PTZ cameras delivering 24/7 HD coverage across your warehouse facility. All cabling will be professionally suspended using J-hooks at 4-5 foot intervals per BICSI standards, with elevated work performed using OSHA-compliant scissor lift equipment. Every cable run will be Fluke-certified to TIA-568 standards, and each camera will be precisely aimed and optimized for maximum coverage. All work complies with BICSI TDMM, NEC Article 800, NFPA 70E, and OSHA 1910/1926 safety standards. This investment protects your assets with 24/7 surveillance, manufacturer warranty coverage, and 3D Technology Services' professional workmanship guarantee. Complete turnkey solution including installation, testing, certification, and documentation."
    
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
       - Fasteners (screws, anchors, bolts, Tapcon anchors for masonry)
       - Mounting hardware and brackets (camera mounts, wall arms)
          * CAMERA MOUNTS ARE MANDATORY for every camera:
            - Indoor dome: Axis T94K01L recessed mount or T94A01D pendant kit
            - Outdoor dome: Axis T94T01D wall mount or T94N01G pole mount
            - Bullet: Axis T91B61 wall bracket or T94A01D pendant
            - PTZ: Axis T91B63 ceiling mount or T91A67 pole mount
          * If mount type is unclear, include a generic wall/ceiling mount bracket
          * NEVER omit camera mounting hardware
       - Backboxes, mud rings, faceplates
       - PATCH CORDS (MANDATORY for every device - see details below)
         * Camera to switch: 1x Cat6 patch cord per camera (3ft or 7ft)
         * Patch panel to switch: 1x patch cord per port
         * These are SEPARATE from the cable runs
       - Conduit fittings and supports
       - J-hooks, straps, and hangers (see calculation rule below)
       - FIRESTOPPING MATERIALS (MANDATORY for wall/floor penetrations)
         * 3M CP 25WB+ or Hilti CFS-S SIL firestop sealant
         * Include for EVERY cable penetration through rated walls/floors
         * 1 tube per 3-4 penetrations
       - Labels and labeling supplies (use BRANDED labels: Brady, Panduit, Brother)
       - Cable management accessories (Velcro ONE-WRAP, Panduit ties)
       - Power connectors and adapters
       - Consumables (cable ties, Velcro, electrical tape)
       - Disposal materials and labor
       - RJ45/Keystone jacks (see calculation rule below)
       - Patch panels for rack terminations
       - LIFT/EQUIPMENT RENTAL (HEIGHT-BASED - READ CAREFULLY):
          * UNDER 12 FEET: Use ladder only - NO LIFT REQUIRED
          * OVER 12 FEET: Scissor lift or boom lift REQUIRED
          * Scissor lift rental (daily rate) - for indoor work over 12ft
          * Boom lift rental (daily rate) - for outdoor/high exterior work
          * Safety harness/fall protection - required at 6ft+ elevated work
       
       GENERIC ITEMS RULE: NEVER use manufacturer name "Generic" for materials.
       Always specify a real brand. Use these defaults for common items:
       - Labels: Brady or Panduit
       - Velcro: Velcro ONE-WRAP or Panduit HLS
       - Cable ties: Panduit or Thomas & Betts
       - Anchors: Tapcon or Hilti
       - Firestop: 3M or Hilti
       If any category applies, list it explicitly.

    10. CABLE CATEGORY VERIFICATION (CRITICAL - PRODUCT SPECS OVERRIDE)
        ALWAYS verify what the product REQUIRES for cable category based on manufacturer specifications.
        DO NOT blindly trust the requestor's cable category - verify against product requirements.
        
        VERIFICATION RULES:
        - If product requires Cat6 for PoE+ but requestor says Cat5e → USE CAT6 (note in professionalNotes)
        - If product requires Cat6A for 10Gbps but requestor says Cat6 → USE CAT6A (note in professionalNotes)
        - If product supports Cat5e and requestor says Cat5e → USE CAT5E (acceptable)
        
        COMMON REQUIREMENTS:
        - PoE (802.3af, 15W): Cat5e minimum
        - PoE+ (802.3at, 30W): Cat5e minimum, Cat6 recommended for long runs
        - PoE++ (802.3bt, 60-90W): Cat6 minimum required
        - 10Gbps devices: Cat6A required
        - 1Gbps devices: Cat5e minimum
        
        When overriding requestor's cable choice due to product requirements:
        - Document the reason in 'professionalNotes'
        - List it as an assumption: "Cable upgraded to [Cat6/Cat6A] per manufacturer specs for [product]"
        
    11. MATCH COMPONENTS TO CABLE CATEGORY
        Once cable category is determined (verified per Rule 10):
        - Use matching jacks, patch panels, and patch cords for that category
        - If Cat6 cable → Cat6 jacks, Cat6 patch panels, Cat6 patch cords
        - If Cat6A cable → Cat6A jacks, Cat6A patch panels, Cat6A patch cords

${buildProductReference()}

        ADDITIONAL PRICING (not in product database - search Google for current MSRP):
        If a product is NOT found in the above database, search for current pricing online.
        For common accessories not listed, use these guidelines:
        - Standard junction boxes: $4.50 ea
        - Weatherproof junction boxes: $45.00 ea
        - Cable labels (roll 100): $12.00/roll
        - Beam clamps: $2.50 ea

       
       === INSTALLATION MATERIAL FORMULAS (VERIFIED STANDARDS) ===
       
       CAMERA CABLE RUN MATERIALS (per camera):
       - RJ45 CONNECTORS (CONDITIONAL - READ CAREFULLY):
         * WITH PATCH PANEL: 1 RJ45 connector per cable (camera end only - closet end punches down to patch panel)
         * WITHOUT PATCH PANEL: 2 RJ45 jacks per cable (one at camera end + one at closet wall jack)
         * IMPORTANT: If NO patch panel is in the scope, you MUST include 2 jacks per cable run
       - PATCH CORD 7ft: 1 per camera (switch to patch panel, only if patch panel included)
       - PATCH CORD 2ft: 1 per camera (patch panel daisy-chain/short run)
       - J-HOOKS: 1 per every 5 feet of horizontal cable run (TIA-569 compliant)
       - TIE WRAPS/VELCRO: 10 per cable run (bundling at J-hooks)
       - LABELS: 2 per cable run (both ends)
       - CABLE WASTE: Add 15% to stated footage for terminations and routing
       
       DATA DROP MATERIALS (per wall outlet):
       - RJ45 JACKS: 2 per drop (1 wall jack + 1 patch panel jack)
       - FACEPLATE: 1 per drop
       - LOW VOLTAGE BRACKET: 1 per drop
       - PATCH CORD 7ft: 1 per drop
       
       OUTDOOR CAMERA ADDITIONS:
       - WEATHERPROOF JUNCTION BOX: 1 per outdoor camera
       - SILICONE SEALANT: 1/4 tube per outdoor camera
       - STAINLESS STEEL MOUNTING HARDWARE
       
       PTZ CAMERA ADDITIONS:
       - LARGER JUNCTION BOX: 1 per PTZ
       - STAINLESS MOUNTING KIT: 1 per PTZ
       - POLE/PARAPET MOUNT: As needed

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
       You MUST break labor into ALL of the following categories (include every one that applies):
       - Site Survey and Preparation
       - Installation / Mounting (multiply per-device hours x quantity!)
       - Cabling and Pathways (based on cable footage, not flat rate)
       - Termination and Connections (based on number of terminations)
       - Programming and Configuration (per device, not flat rate)
       - Testing and Verification (per cable run / per device)
        - System Commissioning and Startup (MANDATORY for all projects):
          * Final system verification, end-to-end testing
          * Firmware updates, default password changes
          * Integration testing with existing systems
          * Minimum 1.0 hour for simple jobs, 2.0+ hours for multi-device
        - Documentation and Labeling (per cable run / per device)
        - Customer Coordination and Sign-off
       - PROJECT MANAGEMENT / COORDINATION (MANDATORY):
         * Always include 8-12% of total install hours for PM
         * Minimum 1.0 hour for small jobs, 2.0+ hours for multi-day jobs
         * Includes: scheduling, material procurement, crew coordination,
           GC coordination, site access arrangements, safety briefings
       
       HOUR CALCULATION RULE: For each labor line, MULTIPLY the per-device/per-unit
       time by the QUANTITY of devices. Do NOT use flat times for multiple devices.
       Example: 6 cameras x 1.5 hrs/camera = 9.0 hours (not 1.5 hours)
       
       Even brief tasks must be included if they exist.

    5a. LABOR HOUR ESTIMATION - NECA MANUAL OF LABOR UNITS (MLU) ALIGNED
        MANDATORY: You MUST use ONLY the national labor hour standards below and the 
        LABOR_STANDARDS in the Product Database Reference. NEVER estimate or invent labor hours.
        If the product database lists laborHours for a product, use THAT value exactly.
        These labor units are aligned with NECA MLU standards. Use "Normal" for ideal conditions,
        "Difficult" for challenging access/retrofit, "Very Difficult" for complex environments.
       
       === CCTV CAMERA INSTALLATION (per camera, NECA MLU aligned) ===
       Camera with Enclosure (includes mounting, wiring, basic config):
       - Fixed Dome/Bullet Camera:
         * Normal: 1.50 hours
         * Difficult: 2.00 hours
         * Very Difficult: 2.50 hours
       - PTZ Camera:
         * Normal: 2.00 hours
         * Difficult: 2.50 hours
         * Very Difficult: 3.00 hours
       - Specialty Mount (pole, parapet, corner): add 0.50 hours
       
       Additional Camera Labor (per camera):
       - Camera Configuration/Programming: 0.50 hours
       - Camera Aiming/Focus/Optimization: 0.25 hours
       - Labeling (both ends): 0.10 hours
       
       EXAMPLE: 6 indoor dome cameras (Normal conditions):
       - Installation/Mounting: 6 x 1.50 = 9.0 hours
       - Configuration: 6 x 0.50 = 3.0 hours
       - Aiming/Focus: 6 x 0.25 = 1.5 hours
       - Labeling: 6 x 0.10 = 0.6 hours
       - TOTAL: 14.1 hours (not 2 hours!)
       
       === STRUCTURED CABLING (NECA MLU aligned) ===
       Cable Installation (per 100ft horizontal):
       - Normal (open ceiling): 0.50 hours
       - Difficult (tight space): 0.75 hours
       - Very Difficult (existing walls): 1.00 hours
       
       J-Hook Installation: 0.05 hours per hook (1 per 5ft)
       
       Data Drop/Outlet (complete with terminations):
       - Normal: 1.50 hours per drop
       - Difficult: 1.90 hours per drop
       - Very Difficult: 2.25 hours per drop
       
       Patch Panel Termination: 0.15 hours per port
       Cable Testing (Fluke): 0.10 hours per cable
       
       === ACCESS CONTROL (NECA MLU aligned, per device) ===
       Card Reader, Wall Mounted:
       - Normal: 0.80 hours
       - Difficult: 1.00 hours
       - Very Difficult: 1.20 hours
       
       Card Reader, Post Mounted:
       - Normal: 1.00 hours
       - Difficult: 1.25 hours
       - Very Difficult: 1.50 hours
       
       Electric Door Strike, New Installation:
       - Normal: 2.00 hours
       - Difficult: 3.00 hours
       - Very Difficult: 4.00 hours
       
       Electric Door Strike, Retrofit:
       - Normal: 2.50 hours
       - Difficult: 3.00 hours
       - Very Difficult: 4.50 hours
       
       Magnetic Lock (with Z-bracket):
       - Normal: 1.50 hours
       - Difficult: 2.00 hours
       - Very Difficult: 2.50 hours
       
       Door Contact: 0.25 hours
       REX Sensor: 0.25 hours
       Power Supply: 0.50 hours
       Panel Programming: 0.50 hours per door
              === FIXED OVERHEAD TASKS (per project, ALWAYS INCLUDE) ===
        - Site Survey and Preparation: 1-2 hours
        - Project Management/Coordination: 8-12% of total install hours (min 1.0 hour)
        - Documentation and As-Builts: 0.50 hours per 5 devices
        - Customer Walkthrough/Sign-off: 0.50 hours
        - Cleanup/Debris Removal: 0.25 hours per 4 hours worked
        - Network Switch Configuration (if adding PoE devices): 0.25 hours per port
        
        === CONDITION SELECTION RULES ===
        Use NORMAL when: New construction, open ceilings, easy access, standard height (<12ft)
        Use DIFFICULT when: Retrofit, limited access, height >12ft, occupied space
        Use VERY DIFFICULT when: Historic buildings, concrete/masonry, extreme heights, hazardous areas
       
       CALCULATION REQUIREMENT: Multiply per-device time by device count. Do NOT use flat times.

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
       - Structured Cabling PRIORITY (ALWAYS use this order):
          * 1ST CHOICE: Leviton jacks/panels with Berk-Tek cable (WARRANTY REQUIRED)
          * 2ND CHOICE: Berk-Tek cable with Leviton connectivity
          * 3RD CHOICE: Panduit or CommScope (only if Leviton/Berk-Tek unavailable)
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

    7a. SYSTEM-SPECIFIC CABLE TYPES (CRITICAL - Never mix cable types!)
       Each system requires its OWN cable type. NEVER substitute structured cabling for specialty cables:
       
       - FIRE ALARM: Use ONLY fire alarm rated cable (FPLP, FPLR, FPL)
         * 2-conductor shielded for initiating devices (smoke, heat, pull stations)
         * 4-conductor for NAC circuits (horns, strobes)
         * NEVER use Cat5e/Cat6 for fire alarm - code violation!
       
       - ACCESS CONTROL: Use access control cable (22/4, 22/6, 18/4)
         * 22AWG for readers and door contacts
         * 18AWG for electric locks (higher current)
         * Cat5e/Cat6 acceptable ONLY for IP-based readers
       
       - INTRUSION/BURGLAR ALARM: Use alarm cable (22/4, 22/6)
         * Shielded for long runs or noisy environments
       
       - CCTV (Analog): Use RG59 or RG6 coax with Siamese power
         * IP cameras use Cat5e/Cat6/Cat6A structured cabling
       
       - STRUCTURED CABLING: Cat5e/Cat6/Cat6A for data/voice/IP devices ONLY
         * Use Leviton/Berk-Tek per priority rule
       
       - AUDIO/INTERCOM: Use speaker wire (16AWG, 14AWG) or shielded audio cable
       
       RULE: Always match cable type to system type. If unsure, default to the specialty cable.

    8. VALIDATION PASS (Required)
       Before finalizing output, perform a completeness audit:
       Ask yourself:
       - "What could cause a technician to stop work?"
       - "What would the field call back asking for?"
       - "What small item would delay completion if missing?"
       If the answer exists — include it.

    9. SYSTEM COMPONENT COHERENCE (CRITICAL)
       ALL materials and equipment MUST be appropriate for the system type being quoted:
       
       - FIRE ALARM Change Order → ONLY fire alarm components:
         * Smoke detectors, heat detectors, pull stations, horns, strobes
         * Fire alarm panels, annunciators, power supplies
         * Fire alarm cable (FPLP/FPLR), junction boxes, conduit
         * NO structured cabling, NO network switches, NO cameras
       
       - ACCESS CONTROL Change Order → ONLY access control components:
         * Card readers, keypads, biometric readers
         * Electric strikes, maglocks, door contacts, REX sensors
         * Access control panels, power supplies, credentials
         * Access control cable (22/4, 18/4), NOT Cat6 unless IP readers
       
       - CCTV Change Order → ONLY CCTV components:
         * Cameras, NVRs/DVRs, monitors, encoders
         * PoE switches, camera mounts, housings
         * Cat6 for IP cameras, coax for analog
         * NO fire alarm devices, NO access readers
       
       - STRUCTURED CABLING Change Order → ONLY data/voice components:
         * Cable (Cat5e/Cat6/Cat6A), jacks, patch panels
         * Faceplates, patch cords, cable management
         * NO security devices, NO fire alarm components
       
       RULE: Before adding ANY component, verify it belongs to the system being quoted.
       If a component doesn't match the system type, DO NOT include it.
       
       EXCEPTION - MULTI-SYSTEM COMPONENTS (these are valid across multiple systems):
       - Cat5e/Cat6/Cat6A cable: Valid for Structured Cabling, IP CCTV, IP Access Control, AV/IP devices
       - PoE Switches: Valid for CCTV, Access Control (IP readers), AV, Structured Cabling
       - Conduit/Pathway: Valid for ALL systems
       - J-Hooks/Cable Tray: Valid for ALL systems
       - Junction Boxes: Valid for ALL systems (use appropriate type)
       - Power Supplies: Valid for Access Control, CCTV, Intrusion (system-specific models)
       - Patch Cords: Valid for Structured Cabling, CCTV, AV, IP-based systems
    </instructions>

    <format>
    Your output MUST be a JSON object adhering to the provided schema.
    - 'technicalScope' must be a professional rewriting of the user's intent
    - 'materials' must include ALL Materials (infrastructure) and Equipment (active components)
    - 'labor' must include ALL labor tasks broken down granularly
    - 'assumptions' must list anything assumed about existing conditions
      * NVR/RECORDING RULE: If installing cameras, you MUST either:
        (a) Include NVR/recording equipment as a material line item, OR
        (b) Explicitly state in assumptions: "Existing NVR/recording system on-site with available channels"
        NEVER silently omit recording infrastructure.
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
      temperature: 0,
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
  financials: Financials
): Promise<ProposalData> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please set the GEMINI_API_KEY environment variable in your Cloudflare Pages project settings (Settings → Environment Variables) and redeploy.');
  }
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
      temperature: 0,
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

/**
 * 3-Brain Pipeline: Generate a validated, customer-ready Change Order.
 * 
 * Pipeline: Brain 1 (Estimator) → Code Validator → Brain 2 (Pricing) → Brain 3 (QA)
 * 
 * @param onProgress - Callback for progress updates during the pipeline
 */
export async function generateValidatedChangeOrder(
  intent: string,
  images: string[] = [],
  adminData: AdminData = { customer: '', contact: '', projectName: '', address: '', phone: '', projectNumber: '', rfiNumber: '', pcoNumber: '' },
  onProgress?: (stage: string, percent: number) => void
): Promise<ChangeOrderData> {

  // ===== BRAIN 1: Generate initial Change Order =====
  onProgress?.('🧠 Brain 1: Generating Change Order...', 10);
  const coData = await generateChangeOrder(intent, images, adminData);
  onProgress?.('✅ Change Order generated', 30);

  // ===== CODE VALIDATOR: Deterministic rule checks =====
  onProgress?.('⚙️ Running code validation (9 rules)...', 40);
  const codeValidation = validateChangeOrder(coData);
  onProgress?.(`⚙️ Code validation: ${codeValidation.score}/100`, 50);

  // ===== BRAIN 2: Pricing Validation =====
  onProgress?.('🧠 Brain 2: Verifying pricing...', 55);
  let pricingValidations;
  try {
    pricingValidations = await validatePricing(coData);
    onProgress?.('✅ Pricing verified', 70);
  } catch (error) {
    console.error('Pricing validation failed, continuing:', error);
    pricingValidations = [];
    onProgress?.('⚠️ Pricing validation skipped', 70);
  }

  // ===== BRAIN 3: QA Audit =====
  onProgress?.('🧠 Brain 3: QA Audit...', 75);
  let qaResult;
  try {
    qaResult = await auditChangeOrder(coData);
    onProgress?.(`✅ QA Score: ${qaResult.overallScore}/100`, 90);
  } catch (error) {
    console.error('QA audit failed, continuing:', error);
    qaResult = {
      overallScore: 60,
      issues: ['QA audit failed'],
      recommendations: [],
      missingItems: [],
      brandingIssues: [],
      complianceNotes: []
    };
    onProgress?.('⚠️ QA audit skipped', 90);
  }

  // ===== Aggregate Results =====
  onProgress?.('📊 Compiling validation results...', 95);

  // Calculate overall confidence
  const codeScore = codeValidation.score;
  const pricingConfidence = pricingValidations.length > 0
    ? pricingValidations.reduce((sum, v) => sum + v.confidence, 0) / pricingValidations.length
    : 70;
  const qaScore = qaResult.overallScore;

  // Weighted: Code 30%, Pricing 30%, QA 40%
  const overallConfidence = Math.round(
    codeScore * 0.3 + pricingConfidence * 0.3 + qaScore * 0.4
  );

  // Determine status
  let status: 'customer_ready' | 'review_recommended' | 'manual_review_required';
  if (overallConfidence >= 95) {
    status = 'customer_ready';
  } else if (overallConfidence >= 80) {
    status = 'review_recommended';
  } else {
    status = 'manual_review_required';
  }

  const validationResult: ValidationResult = {
    overallConfidence,
    status,
    warnings: codeValidation.warnings,
    pricingValidations,
    autoCorrections: codeValidation.autoCorrections,
    qaIssues: [
      ...qaResult.issues,
      ...qaResult.missingItems.map(m => `Missing: ${m}`),
      ...qaResult.brandingIssues.map(b => `Branding: ${b}`),
      ...qaResult.complianceNotes.map(c => `Compliance: ${c}`),
    ],
    timestamp: new Date().toISOString(),
  };

  onProgress?.('✅ Validation complete', 100);

  return {
    ...coData,
    validationResult,
  };
}


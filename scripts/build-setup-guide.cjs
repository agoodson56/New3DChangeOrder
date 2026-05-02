/**
 * Builds 3DTSI_Setup_Guide.docx — a non-technical step-by-step setup guide.
 * Run: node scripts/build-setup-guide.cjs
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, PageOrientation, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType, PageBreak,
  PageNumber, TabStopType, TabStopPosition,
} = require('docx');

// ─── Styling helpers ──────────────────────────────────────────────────────────
const GOLD = 'B8860B';
const BLACK = '000000';
const TEAL = '008A8A';
const RED = 'C0392B';
const DARK_GRAY = '333333';
const MID_GRAY = '666666';
const LIGHT_GRAY = 'EEEEEE';
const CALLOUT_BG = 'FFF8E0';
const WARNING_BG = 'FFEFEF';
const CODE_BG = 'F4F4F4';

const FONT = 'Calibri';
const MONO = 'Consolas';

const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 200 },
  children: [new TextRun({ text, bold: true, size: 36, color: GOLD, font: FONT })],
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 4 } },
});

const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 320, after: 160 },
  children: [new TextRun({ text, bold: true, size: 28, color: TEAL, font: FONT })],
});

const H3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 240, after: 120 },
  children: [new TextRun({ text, bold: true, size: 24, color: DARK_GRAY, font: FONT })],
});

const P = (text, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text, size: 22, font: FONT, ...opts })],
});

// Multi-run paragraph: pass an array of {text, ...opts}
const RP = (parts) => new Paragraph({
  spacing: { after: 120 },
  children: parts.map(p => new TextRun({ size: 22, font: FONT, ...p })),
});

const BULLET = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: 80 },
  children: [new TextRun({ text, size: 22, font: FONT })],
});

const NUMBERED = (text, ref = 'numbers') => new Paragraph({
  numbering: { reference: ref, level: 0 },
  spacing: { after: 100 },
  children: [new TextRun({ text, size: 22, font: FONT })],
});

const NUMBERED_RICH = (parts, ref = 'numbers') => new Paragraph({
  numbering: { reference: ref, level: 0 },
  spacing: { after: 100 },
  children: parts.map(p => new TextRun({ size: 22, font: FONT, ...p })),
});

// Code block: monospace, gray background, indented
const CODE = (text) => new Paragraph({
  spacing: { before: 80, after: 120 },
  shading: { type: ShadingType.CLEAR, fill: CODE_BG },
  border: {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
  },
  indent: { left: 200, right: 200 },
  children: [new TextRun({ text, font: MONO, size: 20 })],
});

// Callout box implemented as a single-cell table for visual containment
function callout(title, lines, opts = {}) {
  const fill = opts.danger ? WARNING_BG : (opts.tip ? 'E8F6F3' : CALLOUT_BG);
  const accent = opts.danger ? RED : (opts.tip ? TEAL : GOLD);
  const cellPara = [
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: title, bold: true, size: 22, color: accent, font: FONT })],
    }),
    ...lines.map(l => typeof l === 'string'
      ? new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: l, size: 22, font: FONT })] })
      : l
    ),
  ];
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: accent },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: accent },
              left: { style: BorderStyle.SINGLE, size: 18, color: accent },
              right: { style: BorderStyle.SINGLE, size: 6, color: accent },
            },
            margins: { top: 200, bottom: 200, left: 240, right: 240 },
            children: cellPara,
          }),
        ],
      }),
    ],
  });
}

const SPACER = () => new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: ' ' })] });
const BREAK = () => new Paragraph({ children: [new PageBreak()] });

const TROUBLESHOOTING_BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' };

function ts(symptom, cause, fix) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 3120, type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        borders: {
          top: TROUBLESHOOTING_BORDER, bottom: TROUBLESHOOTING_BORDER,
          left: TROUBLESHOOTING_BORDER, right: TROUBLESHOOTING_BORDER,
        },
        children: [new Paragraph({ children: [new TextRun({ text: symptom, bold: true, size: 20, font: FONT })] })],
      }),
      new TableCell({
        width: { size: 3120, type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        borders: {
          top: TROUBLESHOOTING_BORDER, bottom: TROUBLESHOOTING_BORDER,
          left: TROUBLESHOOTING_BORDER, right: TROUBLESHOOTING_BORDER,
        },
        children: [new Paragraph({ children: [new TextRun({ text: cause, size: 20, font: FONT })] })],
      }),
      new TableCell({
        width: { size: 3120, type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        borders: {
          top: TROUBLESHOOTING_BORDER, bottom: TROUBLESHOOTING_BORDER,
          left: TROUBLESHOOTING_BORDER, right: TROUBLESHOOTING_BORDER,
        },
        children: [new Paragraph({ children: [new TextRun({ text: fix, size: 20, font: FONT })] })],
      }),
    ],
  });
}

function tsHeader() {
  return new TableRow({
    tableHeader: true,
    children: ['What you see', 'Likely cause', 'How to fix'].map(t => new TableCell({
      width: { size: 3120, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: GOLD },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      borders: {
        top: TROUBLESHOOTING_BORDER, bottom: TROUBLESHOOTING_BORDER,
        left: TROUBLESHOOTING_BORDER, right: TROUBLESHOOTING_BORDER,
      },
      children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 20, color: BLACK, font: FONT })] })],
    })),
  });
}

// ─── Document content ────────────────────────────────────────────────────────

const children = [];

// COVER PAGE
children.push(new Paragraph({ spacing: { before: 2400 }, children: [new TextRun({ text: '' })] }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text: '3D Technology Services', bold: true, size: 48, color: GOLD, font: FONT })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 600 },
  children: [new TextRun({ text: 'Change Order Tool — Setup Guide', bold: true, size: 36, color: BLACK, font: FONT })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({
    text: 'Step-by-step guide for non-technical users',
    italics: true, size: 26, color: MID_GRAY, font: FONT,
  })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 1200 },
  children: [new TextRun({ text: 'May 2, 2026', size: 22, color: MID_GRAY, font: FONT })],
}));

children.push(callout('Read this first', [
  'You don\'t need to be a technical person to follow this guide. Every step tells you exactly what to type, what to click, and what you should see. If something doesn\'t match what\'s described, jump to the Troubleshooting section at the end.',
  'Total time: about 45 minutes if everything goes smoothly. Plan an hour to be safe.',
  'Save this document. You\'ll want it open while you work.',
]));

children.push(BREAK());

// SECTION: WHAT THIS GUIDE DOES
children.push(H1('What this guide does'));

children.push(P('This guide gets your Change Order Tool fully working across all employees and devices. Right now, the app already works on a single computer. After you finish this guide:'));

children.push(BULLET('Coordinators on different computers can see each other\'s saved customers, templates, and change order history.'));
children.push(BULLET('Customer signatures happen inside the app via DocuSign instead of email-and-print.'));
children.push(BULLET('You have a permanent backup of all your data on Cloudflare\'s servers, not just in browsers.'));

children.push(H2('What you\'ll need'));
children.push(BULLET('A Windows computer (your usual work PC is fine).'));
children.push(BULLET('Your Cloudflare account login (the same one used to deploy the website).'));
children.push(BULLET('Your GitHub login if you don\'t already have the project files on this computer.'));
children.push(BULLET('About 45 minutes of focused time.'));
children.push(BULLET('OPTIONAL: A DocuSign developer account (free) — only needed if you want in-app e-signatures.'));

children.push(H2('How this guide is organized'));
children.push(P('Five parts. Do them in order. After each part there\'s a verification step so you know it worked before moving on.'));
children.push(BULLET('PART A — Set up cloud storage on your computer (15 minutes)'));
children.push(BULLET('PART B — Connect the storage to your live website (5 minutes)'));
children.push(BULLET('PART C — Add a login screen so only your employees can use it (10 minutes)'));
children.push(BULLET('PART D — Verify everything works (2 minutes)'));
children.push(BULLET('PART E — Set up DocuSign (15 minutes, OPTIONAL)'));

children.push(callout('If you get stuck', [
  'Stop. Take a screenshot of what you\'re seeing. Send it to whoever is helping you with the tool. Trying to push through when something looks wrong almost always makes it worse. Most things take less than two minutes to diagnose with a screenshot.',
]));

children.push(BREAK());

// PART A
children.push(H1('PART A — Setting up cloud storage'));
children.push(P('You\'ll do this once on a Windows computer. After it\'s done, all your employees benefit; they don\'t each need to repeat it.'));

children.push(H3('Step 1 — Open File Explorer'));
children.push(P('File Explorer is the yellow folder icon on your taskbar. If you can\'t find it, press the Windows key + E on your keyboard.'));

children.push(H3('Step 2 — Find the project folder'));
children.push(P('Navigate to:'));
children.push(CODE('F:\\My Apps\\NewChangeOrder\\New3DChangeOrder-main\\New3DChangeOrder-main'));
children.push(P('You should see files like "package.json", "App.tsx", "wrangler.toml", and folders called "components", "services", "utils".'));
children.push(callout('If you don\'t see those files', [
  'You may be in the outer folder. Look for a folder called New3DChangeOrder-main inside the current folder, and double-click into it. The right folder is the one that contains package.json directly.',
]));

children.push(H3('Step 3 — Open PowerShell in that folder'));
children.push(P('This is the command-prompt window where you type instructions. The trick is opening it in the right place so it already knows where your project is.'));
children.push(NUMBERED('Click in the address bar at the top of the File Explorer window (where the path is shown).'));
children.push(NUMBERED('The path is now highlighted blue. Press Delete to clear it.'));
children.push(NUMBERED('Type the word powershell (no capital letters, no spaces).'));
children.push(NUMBERED('Press Enter.'));
children.push(P('A blue or black window opens with text showing the path you were just in. That\'s PowerShell. Leave this window open — you\'ll use it for the rest of Part A.'));

children.push(callout('Tip', [
  'You can confirm you\'re in the right place by typing the word dir and pressing Enter. You should see a list of files including package.json and wrangler.toml.',
], { tip: true }));

children.push(H3('Step 4 — Run the setup command'));
children.push(P('In the PowerShell window, type the following exactly and press Enter:'));
children.push(CODE('npm run setup:d1'));
children.push(P('You\'ll see lines of text appear. The first time, it may pause for 30 seconds while it downloads a tool. That\'s normal.'));

children.push(H3('Step 5 — Log in to Cloudflare'));
children.push(P('After about 30 seconds, your web browser will open automatically. You\'ll see a Cloudflare page asking you to authorize wrangler.'));
children.push(NUMBERED('If asked, sign in with your usual Cloudflare account email and password.'));
children.push(NUMBERED('A new page asks "Allow Wrangler to perform actions on your account?" Click the blue Allow button.'));
children.push(NUMBERED('You\'ll see a page that says "Successfully logged in." You can close that browser tab.'));
children.push(NUMBERED('Go back to the PowerShell window. The script may have stopped, asking you to re-run it.'));

children.push(H3('Step 6 — Re-run the setup command'));
children.push(P('In PowerShell again, type:'));
children.push(CODE('npm run setup:d1'));
children.push(P('This time it will continue past the login step. You should see green checkmarks appear:'));
children.push(BULLET('"Logged in to Cloudflare"'));
children.push(BULLET('"Database created" with a long string of letters and numbers (the database UUID)'));
children.push(BULLET('"wrangler.toml updated"'));
children.push(BULLET('"Schema migration complete"'));

children.push(callout('What just happened', [
  'You created a database in your Cloudflare account that will store all your change order data. The script also wrote the database\'s ID into a configuration file (wrangler.toml) so the live website knows where to look.',
], { tip: true }));

children.push(H3('Step 7 — Save the configuration change'));
children.push(P('The script changed one file (wrangler.toml). You need to commit that change to GitHub so the live website picks it up.'));
children.push(P('In PowerShell, type each of these commands one at a time, pressing Enter after each:'));
children.push(CODE('git add wrangler.toml'));
children.push(CODE('git commit -m "Add D1 database ID"'));
children.push(CODE('git push origin main'));

children.push(callout('If git asks for credentials', [
  'A window may pop up asking for your GitHub username and password (or token). Sign in with the same GitHub account that owns the repository. If you\'ve never set this up, GitHub will show a "device code" — go to github.com/login/device in your browser and enter that code.',
]));

children.push(H3('Step 8 — Wait for the deploy'));
children.push(P('Pushing to GitHub automatically triggers Cloudflare Pages to rebuild your site. This takes 1–2 minutes.'));
children.push(NUMBERED('Open https://dash.cloudflare.com in your web browser.'));
children.push(NUMBERED('Sign in if needed.'));
children.push(NUMBERED('Click Workers & Pages in the left sidebar.'));
children.push(NUMBERED('Click your project name (probably "new3dchangeorder").'));
children.push(NUMBERED('Click the Deployments tab.'));
children.push(NUMBERED('You\'ll see a list of deployments. The most recent one is at the top, with a label like "Building" or "Deploying" (orange) or "Success" (green).'));
children.push(NUMBERED('Wait until it shows green "Success". This usually takes about 90 seconds.'));

children.push(P('Once it\'s green, Part A is complete. Move on to Part B.'));

children.push(BREAK());

// PART B
children.push(H1('PART B — Connecting the database to your website'));
children.push(P('In Part A you created a database. Now you need to tell your live website to use it. This is done in the Cloudflare dashboard with a few clicks.'));

children.push(H3('Step 1 — Open the Cloudflare dashboard'));
children.push(P('Go to https://dash.cloudflare.com in your browser. Sign in if needed.'));

children.push(H3('Step 2 — Find your project'));
children.push(NUMBERED('In the left sidebar, click Workers & Pages.'));
children.push(NUMBERED('In the list of projects, click the one named new3dchangeorder (or whatever your tool\'s project is named).'));

children.push(H3('Step 3 — Open the settings'));
children.push(NUMBERED('At the top of the project page, you\'ll see tabs: Deployments, Custom domains, Settings, etc.'));
children.push(NUMBERED('Click Settings.'));

children.push(H3('Step 4 — Find the D1 binding section'));
children.push(NUMBERED('Scroll down the Settings page until you see a section labeled Functions.'));
children.push(NUMBERED('Inside Functions, find a sub-section called D1 database bindings.'));

children.push(callout('If you don\'t see "Functions" or "D1 database bindings"', [
  'Make sure you clicked Settings (not Custom domains or another tab). The section is about halfway down. If your dashboard looks completely different, Cloudflare may have changed their layout — search the page for "D1" using Ctrl+F.',
]));

children.push(H3('Step 5 — Add the binding'));
children.push(NUMBERED('Click the Add binding button.'));
children.push(NUMBERED('A small form appears with two fields:'));
children.push(NUMBERED_RICH([
  { text: 'Variable name: type ', bold: false },
  { text: 'DB', bold: true, font: MONO },
  { text: ' (capital D, capital B — exactly two letters)', bold: false },
]));
children.push(NUMBERED_RICH([
  { text: 'D1 database: click the dropdown and select ', bold: false },
  { text: 'co-storage', bold: true, font: MONO },
]));
children.push(NUMBERED('Click Save.'));

children.push(callout('Critical', [
  'The variable name must be exactly "DB" — those two capital letters. If you type "db" or "Database" or anything else, the website won\'t find it. Double-check before clicking Save.',
], { danger: true }));

children.push(H3('Step 6 — Trigger a redeploy'));
children.push(P('The binding only takes effect on the next deploy.'));
children.push(NUMBERED('Click the Deployments tab at the top of the project page.'));
children.push(NUMBERED('Find the most recent deployment at the top of the list.'));
children.push(NUMBERED('Click the three-dot menu (⋯) on its right side.'));
children.push(NUMBERED('Click Retry deployment.'));
children.push(NUMBERED('Wait until the status shows green "Success". About 90 seconds.'));

children.push(H3('Step 7 — Verify it worked'));
children.push(P('Open this URL in your browser (replace the domain if your project uses a custom one):'));
children.push(CODE('https://new3dchangeorder.pages.dev/api/health'));
children.push(P('You\'ll see a wall of text in JSON format. Look for this line:'));
children.push(CODE('"d1Bound": true'));
children.push(P('If it says true, Part B is complete. If it says false, jump to the Troubleshooting section.'));

children.push(BREAK());

// PART C
children.push(H1('PART C — Adding a login screen'));
children.push(P('Right now anyone on the internet who guesses your URL could read your change order history. This part adds a login requirement so only your employees can access the data sync. This uses a Cloudflare feature called Access.'));

children.push(H3('Step 1 — Open Cloudflare Zero Trust'));
children.push(NUMBERED('Go to https://dash.cloudflare.com.'));
children.push(NUMBERED('In the left sidebar, click Zero Trust. (You may have to scroll down to find it.)'));

children.push(callout('If this is your first time using Zero Trust', [
  'Cloudflare may ask you to "Set up your Zero Trust account." Pick a team name (anything memorable, like "3dtsi") and choose the Free plan — it\'s free for up to 50 users, more than enough for an internal tool.',
]));

children.push(H3('Step 2 — Open the Access section'));
children.push(NUMBERED('Inside Zero Trust, in the left sidebar, click Access.'));
children.push(NUMBERED('Then click Applications.'));

children.push(H3('Step 3 — Add a new application'));
children.push(NUMBERED('Click the blue Add an application button.'));
children.push(NUMBERED('Choose Self-hosted from the application types.'));

children.push(H3('Step 4 — Configure the application'));
children.push(P('Fill in:'));
children.push(BULLET('Application name: 3DTSI CO Tool API'));
children.push(BULLET('Session duration: 24 hours (or pick how long employees should stay logged in)'));
children.push(P('Then in the Application domain section, add two domain entries (click "Add Application Domain" between them):'));
children.push(BULLET('Domain 1: new3dchangeorder.pages.dev — Path: /api/data*'));
children.push(BULLET('Domain 2: new3dchangeorder.pages.dev — Path: /api/health'));
children.push(P('Click Next.'));

children.push(H3('Step 5 — Choose how employees will log in'));
children.push(P('On the Identity providers page, pick at least one option. The simplest choices:'));
children.push(BULLET('One-time PIN (built in): Cloudflare emails a 6-digit code to authorized addresses. No setup. Works for any team.'));
children.push(BULLET('Google: if your company uses Google Workspace, this lets people sign in with their work Google account. Click "Add new" → Google to set up.'));
children.push(BULLET('Microsoft: same idea for Office 365 / Azure AD.'));
children.push(P('Pick whichever you prefer (One-time PIN if unsure). Click Next.'));

children.push(H3('Step 6 — Add a policy'));
children.push(P('Now you say WHO is allowed in.'));
children.push(NUMBERED('Click Add a policy.'));
children.push(NUMBERED('Policy name: 3DTSI Staff'));
children.push(NUMBERED('Action: Allow'));
children.push(NUMBERED_RICH([
  { text: 'Configure rules → Include: pick ', bold: false },
  { text: 'Emails ending in', bold: true },
  { text: ' from the dropdown.', bold: false },
]));
children.push(NUMBERED_RICH([
  { text: 'In the value field, type ', bold: false },
  { text: '@3dtsi.com', bold: true, font: MONO },
  { text: ' (the at-sign and your company\'s email domain).', bold: false },
]));
children.push(NUMBERED('Click Next.'));

children.push(callout('What this means in practice', [
  'After this, anyone with a @3dtsi.com email address can log in to the tool. People with other email addresses are blocked. If you have employees on personal email or want to allow specific outside contractors, add their addresses one at a time using the "Emails" rule type instead.',
], { tip: true }));

children.push(H3('Step 7 — Skip optional settings'));
children.push(P('On the next pages (Setup, etc.), use defaults and click through. Click Add application at the end to finish.'));

children.push(H3('Step 8 — Test the login'));
children.push(P('Open this URL in a private browser window (Ctrl+Shift+N for Chrome, Ctrl+Shift+P for Firefox):'));
children.push(CODE('https://new3dchangeorder.pages.dev/api/health'));
children.push(P('You should be redirected to a Cloudflare login page. Sign in with an authorized email. After signing in, you\'ll see the JSON response — meaning Access is working.'));

children.push(callout('If you get an "Access denied" message', [
  'Your email isn\'t in the policy. Either sign in with a @3dtsi.com address, or go back to Step 6 and add your specific email address to the policy.',
]));

children.push(BREAK());

// PART D
children.push(H1('PART D — Verify everything works'));

children.push(H3('Step 1 — Open the health check'));
children.push(P('In a regular (non-private) browser window, go to:'));
children.push(CODE('https://new3dchangeorder.pages.dev/api/health'));
children.push(P('Sign in if prompted. You\'ll see JSON output.'));

children.push(H3('Step 2 — Check the integrations section'));
children.push(P('Look for these three lines and confirm what they say:'));

children.push(callout('What you want to see', [
  '"gemini.configured": true — AI service is working',
  '"cloudSync.d1Bound": true — Database is connected',
  '"cloudSync.accessEnabled": true — Login is protecting the API',
  'If all three say true, your setup is complete.',
], { tip: true }));

children.push(H3('Step 3 — Test from another device'));
children.push(P('Open https://new3dchangeorder.pages.dev on a phone or another computer. Sign in with an allowed email. The app loads. Generate a small test change order.'));
children.push(P('Now open it on your original computer and check the History — you should see the change order you just made on the other device. That confirms cloud sync is working.'));

children.push(BREAK());

// PART E
children.push(H1('PART E — DocuSign (OPTIONAL)'));

children.push(callout('Skip this if you don\'t need it', [
  'DocuSign is for in-app e-signatures. If your team is fine with emailing PDFs to customers for signature, you can skip this entirely. The "Send for e-signature" button will just show a friendly "not configured" message and the rest of the app works perfectly without it.',
  'This part takes about 30 minutes and requires creating a free DocuSign developer account.',
]));

children.push(H2('Step E1 — Create a DocuSign developer account'));
children.push(NUMBERED('Go to https://developers.docusign.com'));
children.push(NUMBERED('Click Create Account or Sign Up.'));
children.push(NUMBERED('Use your work email. Verify it via the email DocuSign sends.'));
children.push(NUMBERED('Sign in to the developer dashboard.'));

children.push(H2('Step E2 — Create an integration'));
children.push(NUMBERED('In the developer dashboard, click Apps and Keys.'));
children.push(NUMBERED('Click Add App and Integration Key.'));
children.push(NUMBERED('App name: 3DTSI Change Orders'));
children.push(NUMBERED('Click Create app.'));
children.push(NUMBERED('On the next page, find the Integration Key (a long UUID). Copy it somewhere safe — you\'ll paste it into Cloudflare in step E5.'));

children.push(H2('Step E3 — Generate an RSA keypair'));
children.push(P('DocuSign needs a special pair of "keys" so the website can prove it\'s authorized to send envelopes. You\'ll generate them on your computer.'));
children.push(P('Go back to PowerShell (open it again if you closed it — see Part A Step 3). Type:'));
children.push(CODE('cd "$HOME\\Documents"'));
children.push(P('Then:'));
children.push(CODE('openssl genrsa -out docusign_private.pem 2048'));
children.push(CODE('openssl rsa -in docusign_private.pem -pubout -out docusign_public.pem'));

children.push(callout('If you see "openssl is not recognized"', [
  'Windows doesn\'t always come with openssl. Easiest fix: install Git for Windows from https://git-scm.com/download/win — it includes openssl. Restart PowerShell after installing, then try the commands again.',
]));

children.push(P('You now have two files in your Documents folder: docusign_private.pem (keep secret!) and docusign_public.pem.'));

children.push(H2('Step E4 — Upload the public key to DocuSign'));
children.push(NUMBERED('Open docusign_public.pem in Notepad (right-click → Open with → Notepad).'));
children.push(NUMBERED('Select all the text (Ctrl+A) and copy it (Ctrl+C).'));
children.push(NUMBERED('Back in the DocuSign developer dashboard, in your app\'s settings, find the Authentication section.'));
children.push(NUMBERED('Make sure JWT Grant is enabled.'));
children.push(NUMBERED('Click Add Public Key. Paste the entire contents you copied.'));
children.push(NUMBERED('Save.'));

children.push(H2('Step E5 — Find your User ID and Account ID'));
children.push(BULLET('User ID: in the DocuSign dashboard, click your user icon → My Profile → My API Information. Copy the API Username (32 characters with dashes).'));
children.push(BULLET('Account ID: Settings → API and Keys (or the same My API Information page) → API Account ID.'));

children.push(H2('Step E6 — Grant consent (one-time)'));
children.push(P('DocuSign\'s security model requires a one-time browser click before the website can act on your behalf. In your browser, paste this URL but replace YOUR_INTEGRATION_KEY with the integration key from Step E2:'));
children.push(CODE('https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_INTEGRATION_KEY&redirect_uri=https%3A%2F%2Fwww.docusign.com'));
children.push(P('Sign in with your DocuSign account. Click Allow when asked. You don\'t need to do anything with the page that loads next — the consent is recorded.'));

children.push(H2('Step E7 — Add environment variables in Cloudflare'));
children.push(P('Now you have all six pieces of information DocuSign needs. Add them to your Cloudflare Pages project.'));
children.push(NUMBERED('Cloudflare dashboard → Workers & Pages → your project → Settings → Environment variables.'));
children.push(NUMBERED('Click Add variable for each of the following six. Make sure to add them to BOTH Production and Preview environments.'));

const envTable = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [3200, 6160],
  rows: [
    new TableRow({
      tableHeader: true,
      children: ['Variable name', 'Value'].map(t => new TableCell({
        width: { size: t === 'Variable name' ? 3200 : 6160, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: GOLD },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        borders: {
          top: TROUBLESHOOTING_BORDER, bottom: TROUBLESHOOTING_BORDER,
          left: TROUBLESHOOTING_BORDER, right: TROUBLESHOOTING_BORDER,
        },
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 20, font: FONT })] })],
      })),
    }),
    ...[
      ['DOCUSIGN_INTEGRATION_KEY', 'Your integration key from Step E2'],
      ['DOCUSIGN_USER_ID', 'Your User ID from Step E5'],
      ['DOCUSIGN_ACCOUNT_ID', 'Your Account ID from Step E5'],
      ['DOCUSIGN_RSA_PRIVATE_KEY', 'Open docusign_private.pem in Notepad and paste the ENTIRE contents (including BEGIN and END lines)'],
      ['DOCUSIGN_BASE_URL', 'https://demo.docusign.net  (use https://www.docusign.net once you go live)'],
      ['DOCUSIGN_OAUTH_HOST', 'https://account-d.docusign.com  (use https://account.docusign.com once you go live)'],
    ].map(([name, value]) => new TableRow({
      children: [
        new TableCell({
          width: { size: 3200, type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          borders: {
            top: TROUBLESHOOTING_BORDER, bottom: TROUBLESHOOTING_BORDER,
            left: TROUBLESHOOTING_BORDER, right: TROUBLESHOOTING_BORDER,
          },
          children: [new Paragraph({ children: [new TextRun({ text: name, bold: true, size: 18, font: MONO })] })],
        }),
        new TableCell({
          width: { size: 6160, type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          borders: {
            top: TROUBLESHOOTING_BORDER, bottom: TROUBLESHOOTING_BORDER,
            left: TROUBLESHOOTING_BORDER, right: TROUBLESHOOTING_BORDER,
          },
          children: [new Paragraph({ children: [new TextRun({ text: value, size: 20, font: FONT })] })],
        }),
      ],
    })),
  ],
});
children.push(envTable);

children.push(SPACER());

children.push(callout('Critical for the private key', [
  'When you paste DOCUSIGN_RSA_PRIVATE_KEY, paste EVERYTHING including the lines that say -----BEGIN RSA PRIVATE KEY----- and -----END RSA PRIVATE KEY-----. The line breaks matter too. Cloudflare\'s text box will accept multi-line input — just don\'t accidentally trim those header/footer lines.',
], { danger: true }));

children.push(H2('Step E8 — Redeploy and verify'));
children.push(P('Trigger a redeploy: Cloudflare dashboard → your project → Deployments → most recent → ⋯ → Retry deployment. Wait for green Success.'));
children.push(P('Open https://new3dchangeorder.pages.dev/api/health and look for:'));
children.push(CODE('"docusign.configured": true'));
children.push(P('Open the app, generate a small test change order, click Send for e-signature. Send the test envelope to your own email. You should receive an email from DocuSign asking you to sign.'));

children.push(BREAK());

// TROUBLESHOOTING
children.push(H1('Troubleshooting'));

const troubleshootingTable = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [3120, 3120, 3120],
  rows: [
    tsHeader(),
    ts(
      '"npm: command not found" in PowerShell',
      'Node.js isn\'t installed on this PC.',
      'Install Node.js from nodejs.org (LTS version). Restart PowerShell. Try again.'
    ),
    ts(
      '"git: command not found"',
      'Git isn\'t installed.',
      'Install Git for Windows from git-scm.com/download/win. Restart PowerShell.'
    ),
    ts(
      'Browser doesn\'t open during wrangler login',
      'Some networks block automatic launches.',
      'In PowerShell, type: npx wrangler login. It will print a URL. Copy and paste into a browser manually.'
    ),
    ts(
      'Script says "Could not parse database UUID"',
      'A database with that name may already exist from a prior attempt.',
      'In PowerShell type: npx wrangler d1 list to see existing databases. Re-run npm run setup:d1 — it detects existing.'
    ),
    ts(
      '/api/health returns 404',
      'The deploy hasn\'t finished or you have the wrong URL.',
      'Check Pages → Deployments — wait for green Success on the latest. Verify the URL matches your project.'
    ),
    ts(
      '"d1Bound": false after Part B',
      'Variable name in the binding wasn\'t exactly "DB", or you didn\'t redeploy.',
      'Pages → Settings → Functions → D1 binding. Edit. Confirm name is DB (capital). Save. Redeploy.'
    ),
    ts(
      '"accessEnabled": false after Part C',
      'Access policy didn\'t apply to /api/health, or you tested without signing in.',
      'Open in a private browser window. Confirm /api/data* AND /api/health are both in the application domains.'
    ),
    ts(
      'Access shows "Access denied"',
      'Your email isn\'t covered by the policy.',
      'Zero Trust → Access → Applications → 3DTSI CO Tool API → policy → add your email or domain.'
    ),
    ts(
      'DocuSign returns "consent_required"',
      'You skipped Step E6 (the one-time consent click).',
      'Open the consent URL from Step E6 in your browser, sign in, click Allow.'
    ),
    ts(
      'DocuSign returns 401 Unauthorized',
      'Wrong DOCUSIGN_USER_ID, wrong DOCUSIGN_INTEGRATION_KEY, or public key not matching the private key.',
      'Re-check Steps E2/E3/E4. The keypair must be the SAME pair: the public.pem you uploaded must match the private.pem you pasted.'
    ),
    ts(
      'Coordinator doesn\'t see another\'s history',
      'They may not be signed in to Access yet, or they\'re using a different browser/device profile.',
      'Have them open /api/health. Confirm cloudSync.userEmail shows their address. Same address = same shared data.'
    ),
  ],
});
children.push(troubleshootingTable);

children.push(BREAK());

// WHEN TO CALL FOR HELP
children.push(H1('When to call for help'));

children.push(P('Spend up to 15 minutes on a single problem. If after 15 minutes you\'re still stuck, stop. Don\'t guess at fixes — guessing usually makes things worse.'));

children.push(H3('What "calling for help" looks like'));
children.push(BULLET('Take a screenshot of the error or the unexpected behavior.'));
children.push(BULLET('Copy and paste the contents of /api/health into a note.'));
children.push(BULLET('Note which Part and Step you\'re on.'));
children.push(BULLET('Send all three to whoever is helping you with the tool.'));

children.push(H3('Where to find help'));
children.push(BULLET('A coworker who\'s done this before.'));
children.push(BULLET('Your IT contractor or managed service provider.'));
children.push(BULLET('A freelancer on Upwork or Fiverr — search "Cloudflare Pages D1 setup" — typical cost $50–200 for one-off help.'));

children.push(H3('What NOT to do'));
children.push(BULLET('Don\'t paste error messages or API keys into public forums (Reddit, Twitter, etc.). They can contain secrets.'));
children.push(BULLET('Don\'t share your DOCUSIGN_RSA_PRIVATE_KEY value with anyone except a trusted contractor working under NDA.'));
children.push(BULLET('Don\'t click "Delete database" or "Remove app" buttons in Cloudflare — recovering is much harder than re-doing setup.'));

children.push(H2('Final notes'));
children.push(P('You\'ve done a real piece of IT work. Most small contractors hire someone for this. The fact that you got through it means you\'re more capable than you thought.'));
children.push(P('From here, every employee just needs to:'));
children.push(BULLET('Visit the website URL in their browser.'));
children.push(BULLET('Sign in with their @3dtsi.com email when prompted.'));
children.push(BULLET('Use the tool. All their data syncs automatically.'));

children.push(P('That\'s it. Welcome to a working multi-device change order system.'));

// ─── Document assembly ───────────────────────────────────────────────────────

const doc = new Document({
  creator: '3D Technology Services',
  title: '3DTSI Change Order Tool — Setup Guide',
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, color: GOLD, font: FONT },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, color: TEAL, font: FONT },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, color: DARK_GRAY, font: FONT },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: 'numbers',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({
              text: '3DTSI Change Order Tool — Setup Guide',
              size: 18, color: MID_GRAY, font: FONT,
            })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Page ', size: 18, color: MID_GRAY, font: FONT }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: MID_GRAY, font: FONT }),
              new TextRun({ text: ' of ', size: 18, color: MID_GRAY, font: FONT }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: MID_GRAY, font: FONT }),
            ],
          })],
        }),
      },
      children,
    },
  ],
});

const out = path.join(__dirname, '..', '3DTSI_Setup_Guide.docx');
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(out, buf);
  console.log(`Wrote ${out} (${buf.length.toLocaleString()} bytes)`);
});

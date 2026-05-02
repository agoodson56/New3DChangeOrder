/**
 * Setup banner — shown on the IDLE screen when one or more integrations
 * aren't wired. Calls /api/health and surfaces the exact next step.
 *
 * Renders nothing (returns null) when:
 *   - Health endpoint is unreachable (offline, server-down) — no point nagging
 *   - All integrations are configured ("ready")
 *   - User dismissed the banner this session (sessionStorage flag)
 *
 * Click "Hide for this session" to dismiss until next reload.
 */

import React, { useEffect, useState } from 'react';

interface HealthResponse {
  ok?: boolean;
  integrations?: {
    gemini?: { configured: boolean; note: string };
    cloudSync?: { d1Bound: boolean; accessEnabled: boolean; ready: boolean; note: string; userEmail?: string | null };
    docusign?: { configured: boolean; environment: string; note: string };
  };
}

const SESSION_DISMISS_KEY = 'co_setup_banner_dismissed';

export const SetupBanner: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem(SESSION_DISMISS_KEY) === '1';
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/health', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : null)
      .then((data: HealthResponse | null) => {
        if (!cancelled && data) setHealth(data);
      })
      .catch(() => { /* health unreachable — silent */ });
    return () => { cancelled = true; };
  }, []);

  if (dismissed || !health?.integrations) return null;

  const { gemini, cloudSync, docusign } = health.integrations;
  const issues: { severity: 'critical' | 'recommended'; message: string; hint: string }[] = [];

  if (gemini && !gemini.configured) {
    issues.push({
      severity: 'critical',
      message: 'Gemini API key not configured — change-order generation will fail',
      hint: 'Set GEMINI_API_KEY in Cloudflare Pages → Settings → Environment variables, then redeploy.',
    });
  }
  if (cloudSync && !cloudSync.ready) {
    if (!cloudSync.d1Bound) {
      issues.push({
        severity: 'recommended',
        message: 'Cloud sync disabled — your data lives only in this browser',
        hint: 'Run "npm run setup:d1" locally, then bind D1 → DB in Pages → Settings → Functions.',
      });
    } else if (!cloudSync.accessEnabled) {
      issues.push({
        severity: 'recommended',
        message: 'Cloudflare Access not protecting /api/data* — cloud sync requires authentication',
        hint: 'Zero Trust → Access → Applications → Add Application for your-pages.pages.dev/api/data*.',
      });
    }
  }
  if (docusign && !docusign.configured) {
    issues.push({
      severity: 'recommended',
      message: 'DocuSign not configured — "Send for e-signature" will be unavailable',
      hint: 'Set DOCUSIGN_* env vars in Pages. See functions/api/docusign.ts for the JWT setup steps.',
    });
  }

  if (issues.length === 0) return null;

  const hasCritical = issues.some(i => i.severity === 'critical');
  const tone = hasCritical
    ? 'border-red-500 bg-red-950/30'
    : 'border-amber-500 bg-amber-950/20';

  return (
    <div className={`max-w-3xl mx-auto mb-8 border-2 ${tone} text-white p-5 rounded-sm`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${hasCritical ? 'text-red-300' : 'text-amber-300'}`}>
            {hasCritical ? '🔴 Setup Incomplete' : '⚙️ Setup Recommended'}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">
            {hasCritical
              ? 'One or more required integrations are missing. The app will not work correctly until these are configured.'
              : 'Optional integrations are unconfigured. The app works without them, but capability is reduced.'}
          </p>
        </div>
        <button
          onClick={() => {
            sessionStorage.setItem(SESSION_DISMISS_KEY, '1');
            setDismissed(true);
          }}
          className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white"
          title="Hide until next reload"
        >
          Hide ×
        </button>
      </div>
      <ul className="space-y-2.5">
        {issues.map((issue, i) => (
          <li key={i} className="border-l-2 border-gray-700 pl-3">
            <div className={`text-[12px] font-bold ${issue.severity === 'critical' ? 'text-red-200' : 'text-amber-200'}`}>
              {issue.message}
            </div>
            <div className="text-[10px] text-gray-400 mt-1 leading-relaxed">
              {issue.hint}
            </div>
          </li>
        ))}
      </ul>
      {cloudSync?.userEmail && (
        <div className="mt-3 text-[10px] text-gray-500 italic">
          Signed in as <span className="text-gray-300">{cloudSync.userEmail}</span> via Cloudflare Access.
        </div>
      )}
    </div>
  );
};

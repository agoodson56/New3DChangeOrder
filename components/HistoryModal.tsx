import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { fmtUSD } from '../utils/financials';
import { useAuth } from '../contexts/AuthContext';
import {
  listChangeOrders, updateChangeOrderStatus, deleteChangeOrder,
  type SavedCO, type CoStatus, type CloseReason,
} from '../services/changeOrderApi';

interface HistoryModalProps {
  onClose: () => void;
  /** Called when the user clicks "Load" on a row. App fetches the full CO and hydrates the editor. */
  onLoad?: (id: string) => void | Promise<void>;
}

const STATUS_LABEL: Record<CoStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const STATUS_BG: Record<CoStatus, string> = {
  pending: 'bg-amber-500 text-black',
  accepted: 'bg-emerald-600 text-black',
  rejected: 'bg-red-600 text-black',
  withdrawn: 'bg-gray-500 text-black',
};

const CLOSE_REASON_LABELS: Record<CloseReason, string> = {
  price_too_high: 'Price too high',
  too_slow: 'We took too long',
  scope_wrong: 'Scope didn\'t match the need',
  competitor_won: 'Customer chose a competitor',
  customer_postponed: 'Customer postponed the project',
  no_budget: 'No budget',
  duplicate_or_obsolete: 'Duplicate / obsolete',
  other: 'Other',
};

interface WinRateStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  winRatePercent: number;
  inclusiveWinRatePercent: number;
  totalAcceptedRevenue: number;
}

function computeStats(items: SavedCO[]): WinRateStats {
  const accepted = items.filter(c => c.status === 'accepted');
  const rejected = items.filter(c => c.status === 'rejected');
  const pending = items.filter(c => c.status === 'pending');
  const withdrawn = items.filter(c => c.status === 'withdrawn');
  const strict = accepted.length + rejected.length;
  const inclusive = strict + withdrawn.length;
  return {
    total: items.length,
    pending: pending.length,
    accepted: accepted.length,
    rejected: rejected.length,
    withdrawn: withdrawn.length,
    winRatePercent: strict === 0 ? 0 : Math.round((accepted.length / strict) * 100),
    inclusiveWinRatePercent: inclusive === 0 ? 0 : Math.round((accepted.length / inclusive) * 100),
    totalAcceptedRevenue: accepted.reduce((sum, c) => sum + c.grandTotal, 0),
  };
}

interface ReasonStat { reason: CloseReason; label: string; count: number; lostRevenue: number; }
function computeReasonStats(items: SavedCO[]): ReasonStat[] {
  const closed = items.filter(c => c.status === 'rejected' || c.status === 'withdrawn');
  const buckets = new Map<CloseReason, { count: number; lostRevenue: number }>();
  for (const co of closed) {
    const reason = (co.closeReason && co.closeReason in CLOSE_REASON_LABELS ? co.closeReason : 'other') as CloseReason;
    const cur = buckets.get(reason) ?? { count: 0, lostRevenue: 0 };
    cur.count += 1;
    cur.lostRevenue += co.grandTotal;
    buckets.set(reason, cur);
  }
  return Array.from(buckets.entries())
    .map(([reason, v]) => ({ reason, label: CLOSE_REASON_LABELS[reason], count: v.count, lostRevenue: v.lostRevenue }))
    .sort((a, b) => b.count - a.count);
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, onLoad }) => {
  const { token } = useAuth();
  const [items, setItems] = useState<SavedCO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CoStatus | 'all'>('all');
  const [reasonPromptFor, setReasonPromptFor] = useState<{ id: string; targetStatus: CoStatus } | null>(null);
  const [reasonChoice, setReasonChoice] = useState<CloseReason>('price_too_high');
  const [reasonNotes, setReasonNotes] = useState('');

  const refresh = useCallback(async () => {
    if (!token) {
      setError('Not signed in.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listChangeOrders(token);
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void refresh(); }, [refresh]);

  const stats = useMemo(() => computeStats(items), [items]);
  const closeReasonStats = useMemo(() => computeReasonStats(items), [items]);

  const visibleItems = useMemo(
    () => filter === 'all' ? items : items.filter(i => i.status === filter),
    [items, filter],
  );

  const handleStatusChange = async (id: string, status: CoStatus) => {
    if (status === 'rejected' || status === 'withdrawn') {
      setReasonPromptFor({ id, targetStatus: status });
      setReasonChoice('price_too_high');
      setReasonNotes('');
      return;
    }
    if (!token) return;
    try {
      const updated = await updateChangeOrderStatus(token, id, status);
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const confirmCloseWithReason = async () => {
    if (!reasonPromptFor || !token) return;
    try {
      const updated = await updateChangeOrderStatus(token, reasonPromptFor.id, reasonPromptFor.targetStatus, reasonNotes || undefined, reasonChoice);
      setItems(prev => prev.map(i => i.id === reasonPromptFor.id ? updated : i));
      setReasonPromptFor(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const skipReasonAndClose = async () => {
    if (!reasonPromptFor || !token) return;
    try {
      const updated = await updateChangeOrderStatus(token, reasonPromptFor.id, reasonPromptFor.targetStatus);
      setItems(prev => prev.map(i => i.id === reasonPromptFor.id ? updated : i));
      setReasonPromptFor(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this change order from history? This cannot be undone.')) return;
    if (!token) return;
    try {
      await deleteChangeOrder(token, id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleLoad = async (id: string) => {
    if (!onLoad) return;
    await onLoad(id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-white border-2 border-[#008b8b] shadow-[0_0_80px_rgba(212,175,55,0.25)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800 shrink-0">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 id="history-modal-title" className="text-2xl font-black bg-gradient-to-r from-[#008b8b] to-[#20b2aa] bg-clip-text text-transparent uppercase tracking-tighter italic">Change Order History</h2>
              <p className="text-[10px] text-gray-600 uppercase font-bold tracking-[0.3em] mt-1">Synced across all your offices · cloud-backed</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => void refresh()}
                disabled={loading}
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-gray-800 text-gray-700 disabled:opacity-50"
                title="Refresh from cloud"
              >
                {loading ? 'Loading…' : 'Refresh'}
              </button>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-[#008b8b] transition-colors text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <StatCard label="Total" value={stats.total.toString()} />
            <StatCard label="Pending" value={stats.pending.toString()} accent="amber" />
            <StatCard label="Accepted" value={stats.accepted.toString()} accent="emerald" />
            <StatCard label="Win Rate (decided)" value={`${stats.winRatePercent}%`} accent="gold" />
            <StatCard label="Win Rate (all closed)" value={`${stats.inclusiveWinRatePercent}%`} accent={stats.inclusiveWinRatePercent < stats.winRatePercent ? 'amber' : 'gold'} />
            <StatCard label="Accepted Revenue" value={fmtUSD(stats.totalAcceptedRevenue)} accent="emerald" />
          </div>

          {closeReasonStats.length > 0 && (
            <div className="mt-4 bg-red-950/20 border border-red-900/40 p-3">
              <h3 className="text-[10px] font-black text-red-300 uppercase tracking-[0.3em] mb-2">
                Why bids are closing (top reasons)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                {closeReasonStats.slice(0, 4).map(r => (
                  <div key={r.reason} className="bg-white/40 border border-gray-800 p-2">
                    <div className="text-gray-700 uppercase tracking-wider mb-0.5">{r.label}</div>
                    <div className="text-red-300 font-mono font-bold">
                      {r.count} CO{r.count === 1 ? '' : 's'} · {fmtUSD(r.lostRevenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            {(['all', 'pending', 'accepted', 'rejected', 'withdrawn'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 transition-all ${
                  filter === f
                    ? 'bg-[#008b8b] text-black'
                    : 'bg-white/5 hover:bg-white/10 border border-gray-800 text-gray-700'
                }`}
              >
                {f === 'all' ? 'All' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-950/40 border border-red-700 text-red-200 p-3 text-xs">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-center text-gray-600 py-20">
              <p className="text-sm uppercase tracking-widest font-bold">Loading from cloud…</p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="text-center text-gray-600 py-20">
              <p className="text-sm uppercase tracking-widest font-bold mb-2">No change orders {filter !== 'all' ? `with status "${STATUS_LABEL[filter]}"` : 'yet'}</p>
              <p className="text-xs">Generate and save a change order to track it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleItems.map(item => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onLoad={onLoad ? handleLoad : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {reasonPromptFor && (
          <div
            className="absolute inset-0 z-10 bg-white/85 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md bg-white border-2 border-red-500 p-6 shadow-[0_0_60px_rgba(239,68,68,0.3)]">
              <h3 className="text-sm font-black text-red-400 uppercase tracking-[0.2em] mb-2">
                Why is this CO closing?
              </h3>
              <p className="text-[11px] text-gray-700 mb-4 leading-relaxed">
                Two seconds of input now → useful win/loss analytics later. You'll see aggregate reasons in the stats panel.
              </p>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-600 mb-1">Reason</label>
              <select
                value={reasonChoice}
                onChange={(e) => setReasonChoice(e.target.value as CloseReason)}
                className="w-full bg-gray-50 border border-gray-800 text-black p-2 mb-4 focus:border-[#008b8b] outline-none text-sm"
              >
                {(Object.keys(CLOSE_REASON_LABELS) as CloseReason[]).map(k => (
                  <option key={k} value={k}>{CLOSE_REASON_LABELS[k]}</option>
                ))}
              </select>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-600 mb-1">Notes (optional)</label>
              <textarea
                value={reasonNotes}
                onChange={(e) => setReasonNotes(e.target.value)}
                rows={3}
                placeholder="Customer said they had a quote $2K lower from competitor X..."
                className="w-full bg-gray-50 border border-gray-800 text-black p-2 mb-4 focus:border-[#008b8b] outline-none text-xs resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => void skipReasonAndClose()}
                  className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 text-gray-700"
                >
                  Skip
                </button>
                <button
                  onClick={() => void confirmCloseWithReason()}
                  className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-red-600 hover:bg-red-700 text-black"
                >
                  Save Reason
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; accent?: 'gold' | 'emerald' | 'amber' }> = ({ label, value, accent }) => (
  <div className="bg-white/5 border border-gray-800 p-3">
    <div className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-1">{label}</div>
    <div className={`text-xl font-mono font-black ${
      accent === 'gold' ? 'text-[#008b8b]'
      : accent === 'emerald' ? 'text-emerald-400'
      : accent === 'amber' ? 'text-amber-400'
      : 'text-black'
    }`}>{value}</div>
  </div>
);

const HistoryRow: React.FC<{
  item: SavedCO;
  onStatusChange: (id: string, status: CoStatus) => void;
  onDelete: (id: string) => void;
  onLoad?: (id: string) => void;
}> = ({ item, onStatusChange, onDelete, onLoad }) => {
  const dateStr = new Date(item.savedAt).toLocaleDateString();
  const revisionLabel = item.revision > 0 ? `R${item.revision}` : null;
  return (
    <div className="bg-white/5 border border-gray-800 p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${STATUS_BG[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
            <span className="text-xs text-gray-600 font-mono">{dateStr}</span>
            {item.pcoNumber && (
              <span className="text-[10px] text-gray-600 font-mono">PCO #{item.pcoNumber}</span>
            )}
            {revisionLabel && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#008b8b] text-black px-2 py-0.5">
                {revisionLabel}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-black truncate">
            {item.customer || 'Unknown customer'} — {item.projectName || '(no project name)'}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-black font-mono text-[#008b8b]">{fmtUSD(item.grandTotal)}</div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-900">
        {onLoad && (
          <button
            onClick={() => onLoad(item.id)}
            className="text-[10px] uppercase font-black tracking-widest text-black bg-[#008b8b] hover:bg-[#20b2aa] transition-colors px-3 py-1.5"
            title="Open this change order in the editor"
          >
            Load / Edit
          </button>
        )}
        <select
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value as CoStatus)}
          className="bg-white border border-gray-800 text-black text-[10px] uppercase font-bold tracking-widest p-1.5 focus:border-[#008b8b] outline-none"
          aria-label="Change status"
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <button
          onClick={() => onDelete(item.id)}
          className="text-[10px] uppercase font-bold tracking-widest text-gray-600 hover:text-red-400 transition-colors px-3 py-1.5 border border-gray-800"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

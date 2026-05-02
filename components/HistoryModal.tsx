import React, { useState, useMemo } from 'react';
import {
  loadHistory, updateHistoryStatus, deleteFromHistory, getWinRateStats,
  getCloseReasonStats, CLOSE_REASON_LABELS,
  type SavedCO, type COStatus, type CloseReason,
} from '../utils/persistence';
import { fmtUSD } from '../utils/financials';

interface HistoryModalProps {
  onClose: () => void;
}

const STATUS_LABEL: Record<COStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const STATUS_BG: Record<COStatus, string> = {
  pending: 'bg-amber-500 text-black',
  accepted: 'bg-emerald-600 text-white',
  rejected: 'bg-red-600 text-white',
  withdrawn: 'bg-gray-500 text-white',
};

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
  const [items, setItems] = useState<SavedCO[]>(() => loadHistory());
  const [filter, setFilter] = useState<COStatus | 'all'>('all');
  /** Tracks which CO is currently being closed and needs a reason. */
  const [reasonPromptFor, setReasonPromptFor] = useState<{ id: string; targetStatus: COStatus } | null>(null);
  const [reasonChoice, setReasonChoice] = useState<CloseReason>('price_too_high');
  const [reasonNotes, setReasonNotes] = useState('');

  const stats = useMemo(() => getWinRateStats(), [items]);
  const closeReasonStats = useMemo(() => getCloseReasonStats(), [items]);

  const visibleItems = useMemo(
    () => filter === 'all' ? items : items.filter(i => i.status === filter),
    [items, filter]
  );

  const handleStatusChange = (id: string, status: COStatus) => {
    // Closing the loop: any close-state status (rejected/withdrawn) prompts
    // for a reason. Coordinator can dismiss and we'll save without one, but
    // the prompt nudges the data-collection habit.
    if (status === 'rejected' || status === 'withdrawn') {
      setReasonPromptFor({ id, targetStatus: status });
      setReasonChoice('price_too_high');
      setReasonNotes('');
      return;
    }
    updateHistoryStatus(id, status);
    setItems(loadHistory());
  };

  const confirmCloseWithReason = () => {
    if (!reasonPromptFor) return;
    updateHistoryStatus(reasonPromptFor.id, reasonPromptFor.targetStatus, reasonNotes || undefined, reasonChoice);
    setReasonPromptFor(null);
    setItems(loadHistory());
  };

  const skipReasonAndClose = () => {
    if (!reasonPromptFor) return;
    updateHistoryStatus(reasonPromptFor.id, reasonPromptFor.targetStatus);
    setReasonPromptFor(null);
    setItems(loadHistory());
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Remove this change order from history? This cannot be undone.')) return;
    deleteFromHistory(id);
    setItems(loadHistory());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-black border-2 border-[#D4AF37] shadow-[0_0_80px_rgba(212,175,55,0.25)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + stats */}
        <div className="p-6 border-b border-gray-800 shrink-0">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 id="history-modal-title" className="text-2xl font-black gold-gradient uppercase tracking-tighter italic">Change Order History</h2>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.3em] mt-1">Win-rate tracking · stored locally on this device</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-[#D4AF37] transition-colors text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard label="Total" value={stats.total.toString()} />
            <StatCard label="Pending" value={stats.pending.toString()} accent="amber" />
            <StatCard label="Accepted" value={stats.accepted.toString()} accent="emerald" />
            <StatCard label="Win Rate" value={`${stats.winRatePercent}%`} accent="gold" />
            <StatCard label="Accepted Revenue" value={fmtUSD(stats.totalAcceptedRevenue)} accent="emerald" />
          </div>

          {/* Why we lose — feedback loop */}
          {closeReasonStats.length > 0 && (
            <div className="mt-4 bg-red-950/20 border border-red-900/40 p-3">
              <h3 className="text-[10px] font-black text-red-300 uppercase tracking-[0.3em] mb-2">
                Why bids are closing (top reasons)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                {closeReasonStats.slice(0, 4).map(r => (
                  <div key={r.reason} className="bg-black/40 border border-gray-800 p-2">
                    <div className="text-gray-400 uppercase tracking-wider mb-0.5">{r.label}</div>
                    <div className="text-red-300 font-mono font-bold">
                      {r.count} CO{r.count === 1 ? '' : 's'} · {fmtUSD(r.lostRevenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="flex gap-2 mt-6">
            {(['all', 'pending', 'accepted', 'rejected', 'withdrawn'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 transition-all ${
                  filter === f
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-white/5 hover:bg-white/10 border border-gray-800 text-gray-400'
                }`}
              >
                {f === 'all' ? 'All' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto p-6">
          {visibleItems.length === 0 ? (
            <div className="text-center text-gray-500 py-20">
              <p className="text-sm uppercase tracking-widest font-bold mb-2">No change orders {filter !== 'all' ? `with status "${STATUS_LABEL[filter]}"` : 'yet'}</p>
              <p className="text-xs">Generate and archive change orders to track them here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleItems.map(item => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Close-reason prompt overlay — fires on rejected/withdrawn transition. */}
        {reasonPromptFor && (
          <div
            className="absolute inset-0 z-10 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md bg-black border-2 border-red-500 p-6 shadow-[0_0_60px_rgba(239,68,68,0.3)]">
              <h3 className="text-sm font-black text-red-400 uppercase tracking-[0.2em] mb-2">
                Why is this CO closing?
              </h3>
              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                Two seconds of input now → useful win/loss analytics later. You'll see aggregate reasons in the stats panel.
              </p>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Reason</label>
              <select
                value={reasonChoice}
                onChange={(e) => setReasonChoice(e.target.value as CloseReason)}
                className="w-full bg-[#0a0a0a] border border-gray-800 text-white p-2 mb-4 focus:border-[#D4AF37] outline-none text-sm"
              >
                {(Object.keys(CLOSE_REASON_LABELS) as CloseReason[]).map(k => (
                  <option key={k} value={k}>{CLOSE_REASON_LABELS[k]}</option>
                ))}
              </select>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Notes (optional)</label>
              <textarea
                value={reasonNotes}
                onChange={(e) => setReasonNotes(e.target.value)}
                rows={3}
                placeholder="Customer said they had a quote $2K lower from competitor X..."
                className="w-full bg-[#0a0a0a] border border-gray-800 text-white p-2 mb-4 focus:border-[#D4AF37] outline-none text-xs resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={skipReasonAndClose}
                  className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 text-gray-400"
                >
                  Skip
                </button>
                <button
                  onClick={confirmCloseWithReason}
                  className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
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
    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">{label}</div>
    <div className={`text-xl font-mono font-black ${
      accent === 'gold' ? 'text-[#D4AF37]'
      : accent === 'emerald' ? 'text-emerald-400'
      : accent === 'amber' ? 'text-amber-400'
      : 'text-white'
    }`}>{value}</div>
  </div>
);

const HistoryRow: React.FC<{
  item: SavedCO;
  onStatusChange: (id: string, status: COStatus) => void;
  onDelete: (id: string) => void;
}> = ({ item, onStatusChange, onDelete }) => {
  const dateStr = new Date(item.savedAt).toLocaleDateString();
  return (
    <div className="bg-white/5 border border-gray-800 p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${STATUS_BG[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
            <span className="text-xs text-gray-500 font-mono">{dateStr}</span>
            {item.coData.pcoNumber && (
              <span className="text-[10px] text-gray-600 font-mono">PCO #{item.coData.pcoNumber}</span>
            )}
          </div>
          <h3 className="text-sm font-bold text-white truncate">
            {item.coData.customer || 'Unknown customer'} — {item.coData.projectName || '(no project name)'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {item.coData.systemsImpacted?.join(', ') || 'no systems listed'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-black font-mono text-[#D4AF37]">{fmtUSD(item.grandTotal)}</div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-900">
        <select
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value as COStatus)}
          className="bg-black border border-gray-800 text-white text-[10px] uppercase font-bold tracking-widest p-1.5 focus:border-[#D4AF37] outline-none"
          aria-label="Change status"
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <button
          onClick={() => onDelete(item.id)}
          className="text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 border border-gray-800"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

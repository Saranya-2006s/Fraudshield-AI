import React, { useState } from 'react';
import { Transaction, RiskLevel, TransactionStatus, FilterOptions } from '../types';
import { Search, Filter, Download, Sparkles, ShieldAlert, ShieldCheck, AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  filters: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
  onSelectTransaction: (tx: Transaction) => void;
  onAnalyzeWithGemini: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: TransactionStatus) => void;
  isLoadingAi: boolean;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  total,
  page,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
  onSelectTransaction,
  onAnalyzeWithGemini,
  onUpdateStatus,
  isLoadingAi,
}) => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const handleRunAi = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setAnalyzingId(id);
    await onAnalyzeWithGemini(id);
    setAnalyzingId(null);
  };

  const exportToCSV = () => {
    const headers = 'ID,Timestamp,Amount,Currency,Category,Sender,SenderCountry,Receiver,ReceiverCountry,RiskScore,RiskLevel,Status,MLConfidence\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.timestamp}",${t.amount},"${t.currency}","${t.category}","${t.sender.name}","${t.sender.country}","${t.receiver.name}","${t.receiver.country}",${t.riskScore},"${t.riskLevel}","${t.status}",${t.mlConfidence}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraudshield-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">Transaction Monitoring &amp; Audit Trail</h2>
            <p className="text-xs text-slate-400">Search, filter, and inspect 7-stage audit histories across monitored transactions</p>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all shadow-sm w-fit"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* Filters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search TXN ID, Sender, Receiver, Merchant..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={filters.riskLevel}
              onChange={(e) => onFilterChange({ ...filters, riskLevel: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical (Score 75+)</option>
              <option value="HIGH">High (Score 55-74)</option>
              <option value="MEDIUM">Medium (Score 35-54)</option>
              <option value="LOW">Low (Score &lt; 35)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="online_banking">Online Banking</option>
              <option value="wire_transfer">Wire Transfer</option>
              <option value="crypto_cashout">Crypto Cashout</option>
              <option value="online_shopping">Online Shopping</option>
              <option value="pos_terminal">POS Terminal</option>
              <option value="p2p_transfer">P2P Transfer</option>
              <option value="atm_withdrawal">ATM Withdrawal</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Flagged">Flagged</option>
              <option value="Under Review">Under Review</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Txn ID & Time</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Sender ➔ Receiver</th>
              <th className="px-4 py-3 text-center">Risk Score</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                  No transactions match the selected filter criteria.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isCritical = tx.riskLevel === 'CRITICAL';
                const isHigh = tx.riskLevel === 'HIGH';

                return (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono">
                      <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
                        <span>{tx.id}</span>
                        {tx.geminiAnalysis && (
                          <Sparkles className="w-3 h-3 text-indigo-400 inline" title="Gemini AI Analyzed" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleString()}</div>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-100">
                      {tx.currency === 'INR' ? '₹' : '$'}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3">
                      <span className="capitalize text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        {tx.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{tx.sender.name} ({tx.sender.country})</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">➔ {tx.receiver.name} ({tx.receiver.country})</div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : tx.riskLevel === 'MEDIUM'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {tx.riskScore}/100
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            tx.status === 'Blocked'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : tx.status === 'Flagged'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : tx.status === 'Under Review' || tx.status === 'Pending Verification'
                              ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          Audit: Stage {tx.currentStage || 7}/7
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => handleRunAi(e, tx.id)}
                          disabled={analyzingId === tx.id}
                          className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-all"
                          title="Run Gemini AI Explainable Reasoning"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>{analyzingId === tx.id ? 'Analyzing...' : 'Gemini AI'}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTransaction(tx);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing page <span className="font-bold text-slate-200">{page}</span> of <span className="font-bold text-slate-200">{totalPages || 1}</span> ({total} total transactions)
        </div>

        <div className="flex items-center space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Transaction } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Smartphone, 
  AlertTriangle, 
  Sparkles, 
  KeyRound, 
  FileText,
  UserCheck,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

interface VerificationQueueProps {
  transactions: Transaction[];
  onVerifyTransaction: (id: string, decision: 'GENUINE_APPROVED' | 'FRAUD_BLOCKED', notes?: string) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const VerificationQueue: React.FC<VerificationQueueProps> = ({
  transactions,
  onVerifyTransaction,
  onSelectTransaction,
}) => {
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [otpSentFor, setOtpSentFor] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');

  // Filter transactions in review or high risk
  const reviewList = transactions.filter((tx) => {
    const isPending = tx.status === 'Under Review' || tx.status === 'Flagged' || tx.status === 'Pending Verification' || (!tx.verificationResult && tx.riskScore >= 50);
    const isResolved = tx.verificationResult !== undefined;
    
    if (filterType === 'PENDING') return isPending && !isResolved;
    if (filterType === 'RESOLVED') return isResolved;
    return isPending || isResolved || tx.riskScore >= 50;
  });

  const activeTx = transactions.find((t) => t.id === selectedTxId) || reviewList[0] || null;

  const handleSendOtp = (id: string) => {
    setOtpSentFor(id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Stage 5 Verification Queue */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Stage 5: Decision & Verification Queue
              </span>
              <span className="text-xs text-amber-400 font-medium">
                {reviewList.filter((t) => !t.verificationResult).length} Pending Cases
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Suspicious Case Triage & Analyst Decision Center
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Workflow Paradigm: <span className="text-amber-300 font-semibold">High risk ➔ Flag ➔ Step-Up Verification / Review ➔ Appropriate action (Genuine vs Fraud)</span>
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            {(['PENDING', 'RESOLVED', 'ALL'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterType === f
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f === 'PENDING' ? 'Pending Review' : f === 'RESOLVED' ? 'Resolved' : 'All Cases'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {reviewList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Verification Queue Clean</h3>
          <p className="text-xs text-slate-400 mt-1">
            No high-risk transactions currently awaiting manual review. All funds successfully validated.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Transaction List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              Flagged Transactions ({reviewList.length})
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {reviewList.map((tx) => {
                const isSelected = activeTx?.id === tx.id;
                const isResolved = tx.verificationResult !== undefined;

                return (
                  <div
                    key={tx.id}
                    onClick={() => {
                      setSelectedTxId(tx.id);
                      onSelectTransaction(tx);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-200">{tx.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isResolved
                          ? tx.verificationResult?.decision === 'GENUINE_APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                          : tx.riskScore >= 75
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {isResolved ? (tx.verificationResult?.decision === 'GENUINE_APPROVED' ? 'GENUINE' : 'FRAUD') : `${tx.riskScore}% RISK`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
                      <span>{tx.currency === 'INR' ? '₹' : '$'}{tx.amount.toLocaleString()}</span>
                      <span className="text-[11px] text-slate-400 font-normal">{tx.sender.name}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">
                      {tx.sender.location || tx.sender.country} • {tx.sender.deviceType || 'New Device'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Full Review & Decision Pane */}
          {activeTx && (
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-lg font-bold text-white">{activeTx.id}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      activeTx.riskScore >= 75 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {activeTx.riskLevel} RISK ({activeTx.riskScore}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Intercepted at {new Date(activeTx.timestamp).toLocaleString()} • Channel: {activeTx.category.replace('_', ' ')}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Transfer Amount</span>
                  <div className="text-2xl font-mono font-bold text-amber-400">
                    {activeTx.currency === 'INR' ? '₹' : '$'}{activeTx.amount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 4-Box Feature Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Location</span>
                  </span>
                  <p className="font-semibold text-slate-100 mt-1 truncate">
                    {activeTx.sender.location || activeTx.sender.country}
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                    <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                    <span>Device</span>
                  </span>
                  <p className="font-semibold text-slate-100 mt-1 truncate">
                    {activeTx.sender.deviceType || 'New Device'}
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Time of Txn</span>
                  </span>
                  <p className="font-semibold text-slate-100 mt-1">
                    {activeTx.preprocessedFeatures?.timeFormatted || '02:30 AM'}
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Spike Ratio</span>
                  </span>
                  <p className="font-semibold text-rose-400 mt-1">
                    {((activeTx.amount / (activeTx.sender.avgTransactionAmount || 500))).toFixed(1)}x baseline
                  </p>
                </div>
              </div>

              {/* Anomaly Drivers */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  Flagged Risk Indicators (Preprocessed by FraudShield-AI)
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {activeTx.riskFactors.map((f, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gemini AI Reasoning Box */}
              {activeTx.geminiAnalysis && (
                <div className="bg-gradient-to-r from-indigo-950/40 to-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 text-indigo-300">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Gemini AI Automated Fraud Triage
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      {typeof activeTx.ruleScore === 'number' && typeof activeTx.mlScore === 'number' && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300">
                          Rules: {activeTx.ruleScore} | ML: {activeTx.mlScore}
                        </span>
                      )}
                      {activeTx.geminiAnalysis.source && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                          {activeTx.geminiAnalysis.source}
                        </span>
                      )}
                      {activeTx.geminiAnalysis.cached && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                          cached
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeTx.geminiAnalysis.summary}
                  </p>
                </div>
              )}

              {/* Verification & Action Center */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>Stage 5 Verification & Decision</span>
                  </h4>
                  <button
                    onClick={() => handleSendOtp(activeTx.id)}
                    className="flex items-center space-x-1 px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Trigger Step-Up OTP</span>
                  </button>
                </div>

                {otpSentFor === activeTx.id && (
                  <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-lg text-xs text-indigo-200 flex items-center justify-between">
                    <span>📱 2FA OTP Challenge active for {activeTx.sender.name} (+91-98765-XXXXX)</span>
                    <span className="text-emerald-400 font-bold">Simulated PIN: 489201</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Analyst Review Notes / Audit Justification:
                  </label>
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="e.g. Customer verified legitimate midnight transfer via biometric prompt..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* The Two Crucial Decision Buttons: Genuine vs Fraud */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => onVerifyTransaction(activeTx.id, 'GENUINE_APPROVED', reviewNotes || 'Customer verified identity via 2FA. Genuine transfer.')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Mark GENUINE ➔ Approve & Complete Transfer</span>
                  </button>

                  <button
                    onClick={() => onVerifyTransaction(activeTx.id, 'FRAUD_BLOCKED', reviewNotes || 'Confirmed unauthorized access / ATO attempt. Transfer blocked.')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Confirm FRAUD ➔ Block & Freeze Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

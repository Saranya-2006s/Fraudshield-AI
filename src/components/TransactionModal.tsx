import React, { useState } from 'react';
import { Transaction, TransactionStatus } from '../types';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Ban, 
  Code, 
  ArrowRight,
  Layers,
  Clock,
  MapPin,
  Smartphone,
  UserCheck
} from 'lucide-react';

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: TransactionStatus) => void;
  onVerifyTransaction?: (id: string, decision: 'GENUINE_APPROVED' | 'FRAUD_BLOCKED', notes?: string) => void;
  onAnalyzeWithGemini: (id: string) => void;
  isLoadingAi: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  onClose,
  onUpdateStatus,
  onVerifyTransaction,
  onAnalyzeWithGemini,
  isLoadingAi,
}) => {
  const [showJson, setShowJson] = useState(false);

  if (!transaction) return null;

  const isCritical = transaction.riskLevel === 'CRITICAL';
  const isHigh = transaction.riskLevel === 'HIGH';
  const isPending = transaction.status === 'Under Review' || transaction.status === 'Flagged' || (!transaction.verificationResult && transaction.riskScore >= 50);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-5 p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl ${
                isCritical
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : isHigh
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isCritical ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-base font-bold text-slate-100">{transaction.id}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isCritical
                      ? 'bg-rose-500 text-white'
                      : isHigh
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  Risk Score: {transaction.riskScore}/100
                </span>
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  7-Stage Traced
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Timestamp: {new Date(transaction.timestamp).toLocaleString()} • Latency: {transaction.processingTimeMs}ms
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Stage Progression Timeline Pill Bar */}
        {transaction.stageHistory && transaction.stageHistory.length > 0 && (
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>7-Stage Pipeline Progression</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-1">
              {transaction.stageHistory.map((s) => (
                <div
                  key={s.stage}
                  className={`p-2 rounded-lg text-center border ${
                    s.status === 'completed'
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : s.status === 'in_progress'
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-300 animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                  title={s.description}
                >
                  <span className="block text-[9px] font-mono font-bold">Stage {s.stage}</span>
                  <span className="block text-[10px] font-semibold truncate">{s.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preprocessed Feature Matrix (Stage 2) */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
            Stage 2 Feature Preprocessing Matrix (Amount, Time, Location, Device, Type, 5m Velocity)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">1. Amount</span>
              <p className="font-mono font-bold text-white text-sm">
                {transaction.currency === 'INR' ? '₹' : '$'}{transaction.amount.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">2. Time</span>
              <p className="font-mono font-bold text-white text-sm">
                {transaction.preprocessedFeatures?.timeFormatted || '02:30 AM'}
              </p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">3. Location</span>
              <p className="font-semibold text-white truncate">
                {transaction.sender.location || transaction.sender.country}
              </p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">4. Device</span>
              <p className="font-semibold text-white truncate">
                {transaction.sender.deviceType || 'New Device'}
              </p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">5. Category</span>
              <p className="font-semibold text-white capitalize truncate">
                {transaction.category.replace('_', ' ')}
              </p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">6. Baseline Ratio & 5m Velocity</span>
              <p className="font-mono font-bold text-amber-300">
                {((transaction.amount / (transaction.sender.avgTransactionAmount || 500))).toFixed(1)}x • {transaction.preprocessedFeatures?.txnFrequency5m ?? 1} tx/5m
              </p>
            </div>
          </div>
          {typeof transaction.ruleScore === 'number' && typeof transaction.mlScore === 'number' && (
            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Stage 3A Rule Score</span>
                <span className="font-mono font-bold text-indigo-300">{transaction.ruleScore} / 100</span>
              </div>
              <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Stage 3B ML Score</span>
                <span className="font-mono font-bold text-purple-300">{transaction.mlScore} / 100</span>
              </div>
            </div>
          )}
        </div>

        {/* Triggered Factors */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <span className="font-semibold text-slate-300 block">Triggered Rule Heuristics & Anomaly Factors</span>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
            {transaction.riskFactors.map((rf, idx) => (
              <li key={idx} className="text-slate-300">{rf}</li>
            ))}
          </ul>
        </div>

        {/* Gemini AI Analysis Section */}
        {transaction.geminiAnalysis ? (
          <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Gemini AI Explainable Rationale</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                {transaction.geminiAnalysis.source && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                    {transaction.geminiAnalysis.source}
                  </span>
                )}
                {transaction.geminiAnalysis.cached && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                    cached
                  </span>
                )}
              </div>
            </div>

            <p className="text-slate-200 leading-relaxed">{transaction.geminiAnalysis.summary}</p>

            <div className="space-y-1.5">
              <span className="font-semibold text-indigo-300 text-[11px] block">Pattern Analysis:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {transaction.geminiAnalysis.reasoning.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-indigo-800/40 text-[11px]">
              <span className="text-indigo-300">Fraud Typology: <strong className="text-white">{transaction.geminiAnalysis.fraudPatternMatched}</strong></span>
              <span className="text-indigo-300">Suggested Action: <strong className="text-amber-300 font-mono">{transaction.geminiAnalysis.recommendation}</strong></span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onAnalyzeWithGemini(transaction.id)}
            disabled={isLoadingAi}
            className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{isLoadingAi ? 'Analyzing with Gemini AI...' : 'Generate Gemini AI Fraud Rationale'}</span>
          </button>
        )}

        {/* Stage 5 Verification Action Box */}
        {onVerifyTransaction && isPending && (
          <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-amber-300 font-bold">
              <UserCheck className="w-4 h-4" />
              <span>Stage 5 Manual Review & Step-Up Verification</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              This transaction is held in the Stage 5 Verification Queue. Execute decision:
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => {
                  onVerifyTransaction(transaction.id, 'GENUINE_APPROVED', 'Customer identity verified.');
                  onClose();
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mark GENUINE ➔ Approve</span>
              </button>
              <button
                onClick={() => {
                  onVerifyTransaction(transaction.id, 'FRAUD_BLOCKED', 'Confirmed fraudulent takeover attempt.');
                  onClose();
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Confirm FRAUD ➔ Block & Freeze</span>
              </button>
            </div>
          </div>
        )}

        {/* Toggle JSON Viewer */}
        <div className="pt-1">
          <button
            onClick={() => setShowJson(!showJson)}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showJson ? 'Hide Raw Payload' : 'View Raw Payload JSON'}</span>
          </button>

          {showJson && (
            <pre className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 max-h-40 overflow-y-auto">
              {JSON.stringify(transaction, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

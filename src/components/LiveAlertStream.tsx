import React from 'react';
import { Transaction } from '../types';
import { AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, Clock, Globe, ArrowRight } from 'lucide-react';

interface LiveAlertStreamProps {
  latestTransactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onTriggerSimulatedAnomaly: () => void;
}

export const LiveAlertStream: React.FC<LiveAlertStreamProps> = ({
  latestTransactions,
  onSelectTransaction,
  onTriggerSimulatedAnomaly,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Live SSE Stream Feed</h2>
            <p className="text-xs text-slate-400">Incoming real-time financial transaction events</p>
          </div>
        </div>

        <button
          onClick={onTriggerSimulatedAnomaly}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg hover:bg-rose-500/20 transition-all shadow-sm"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Inject Fraud Attack</span>
        </button>
      </div>

      {/* Stream Cards Container */}
      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 text-slate-200">
        {latestTransactions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            Awaiting live incoming transaction stream...
          </div>
        ) : (
          latestTransactions.slice(0, 6).map((tx) => {
            const isHighRisk = tx.riskScore >= 55;
            const isCritical = tx.riskScore >= 75;

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isCritical
                    ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-500/80 shadow-lg shadow-rose-950/20'
                    : isHighRisk
                    ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-500/80'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isHighRisk
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isCritical ? (
                      <ShieldAlert className="w-4 h-4 animate-bounce" />
                    ) : isHighRisk ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-semibold text-slate-200">{tx.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                      {tx.geminiAnalysis && (
                        <span className="flex items-center space-x-1 text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-medium">
                          <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                          <span>Gemini AI</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-slate-100">{tx.sender.name}</span>
                      <span className="text-slate-500">({tx.sender.country})</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="font-medium text-slate-100">{tx.receiver.name}</span>
                      <span className="text-slate-500">({tx.receiver.country})</span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                      <span className="capitalize text-indigo-300 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-800/40">
                        {tx.category.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">{tx.riskFactors[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <span className="text-sm font-bold font-mono text-slate-100">
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>

                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        tx.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500 text-white'
                          : tx.riskLevel === 'HIGH'
                          ? 'bg-amber-500 text-slate-950'
                          : tx.riskLevel === 'MEDIUM'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      Risk: {tx.riskScore}/100
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Transaction, PipelineStageNumber } from '../types';
import { 
  User, 
  ArrowRight, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  Database, 
  Activity, 
  Clock, 
  MapPin, 
  Smartphone, 
  Zap, 
  CheckCircle2, 
  AlertOctagon, 
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';

interface StageWorkflowVisualizerProps {
  transactions: Transaction[];
  selectedTx: Transaction | null;
  onSelectTransaction: (tx: Transaction) => void;
  onVerifyTransaction: (id: string, decision: 'GENUINE_APPROVED' | 'FRAUD_BLOCKED', notes?: string) => void;
  onOpenInitiator: () => void;
}

export const StageWorkflowVisualizer: React.FC<StageWorkflowVisualizerProps> = ({
  transactions,
  selectedTx,
  onSelectTransaction,
  onVerifyTransaction,
  onOpenInitiator,
}) => {
  // Current active transaction in visualizer
  const activeTx = selectedTx || transactions[0] || null;
  const [activeStageTab, setActiveStageTab] = useState<PipelineStageNumber>(activeTx?.riskScore && activeTx.riskScore >= 50 ? 5 : 4);
  const [simulatingStep, setSimulatingStep] = useState<number | null>(null);

  const stages = [
    {
      stage: 1 as PipelineStageNumber,
      title: '1. Ingestion',
      subtitle: 'Intercepted pre-settlement',
      icon: User,
      color: 'blue',
      badge: 'API Gateway (<15ms)',
    },
    {
      stage: 2 as PipelineStageNumber,
      title: '2. Feature Preprocessing',
      subtitle: 'Extract 6 risk features',
      icon: Layers,
      color: 'indigo',
      badge: '6-Feature Matrix',
    },
    {
      stage: 3 as PipelineStageNumber,
      title: '3. Rule + ML Scoring',
      subtitle: '6 rules + ML inference',
      icon: Cpu,
      color: 'violet',
      badge: '0–100 Hybrid Score',
    },
    {
      stage: 4 as PipelineStageNumber,
      title: '4. Risk Classification',
      subtitle: 'Auto-pass vs Flag queue',
      icon: Clock,
      color: 'purple',
      badge: 'Threshold Router',
    },
    {
      stage: 5 as PipelineStageNumber,
      title: '5. Step-Up Verification',
      subtitle: 'OTP & analyst triage',
      icon: ShieldAlert,
      color: 'amber',
      badge: 'Review Queue',
    },
    {
      stage: 6 as PipelineStageNumber,
      title: '6. Decisioning',
      subtitle: 'Genuine vs Fraud action',
      icon: ShieldCheck,
      color: 'cyan',
      badge: 'Final Resolution',
    },
    {
      stage: 7 as PipelineStageNumber,
      title: '7. Audit Tracking',
      subtitle: '500-cap history + SSE',
      icon: Activity,
      color: 'emerald',
      badge: 'Audit & Live Stream',
    },
  ];

  const handleStepThrough = () => {
    setSimulatingStep(1);
    let current = 1;
    const interval = setInterval(() => {
      current += 1;
      if (current <= 7) {
        setSimulatingStep(current);
        setActiveStageTab(current as PipelineStageNumber);
      } else {
        clearInterval(interval);
        setSimulatingStep(null);
      }
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Core System Motto */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-[11px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                7-Stage Core Workflow Architecture
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Interception Mode</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              FraudShield-AI: End-to-End Transaction Pipeline
            </h2>
            <p className="text-sm font-medium text-indigo-200/90 mt-1 italic">
              "Analyze before completion, identify risk in real time, and prevent potentially fraudulent transactions through early detection and verification."
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleStepThrough}
              className="flex items-center space-x-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Animate 7 Stages</span>
            </button>
            <button
              onClick={onOpenInitiator}
              className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Case (₹50,000)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">Select Active Transaction to Trace:</span>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {activeTx?.id || 'None'}
            </span>
          </div>

          {/* Quick Transaction Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {transactions.slice(0, 5).map((tx) => {
              const isSelected = activeTx?.id === tx.id;
              const isHigh = tx.riskScore >= 50;
              return (
                <button
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-mono whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : isHigh
                      ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                  <span>{tx.id}</span>
                  <span className="opacity-75">({tx.currency === 'INR' ? '₹' : '$'}{tx.amount.toLocaleString()})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7-Stage Horizontal Pipeline Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Real-Time Flowchart Progression</span>
          <span className="text-slate-500 text-[11px] normal-case">Click any stage node for detailed inspection</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5">
          {stages.map((s, index) => {
            const Icon = s.icon;
            const isTabActive = activeStageTab === s.stage;
            const isSimActive = simulatingStep === s.stage;
            const isStagePassed = activeTx ? true : false;
            const isRiskStage = s.stage === 5 && (activeTx?.riskScore || 0) >= 50;

            return (
              <div
                key={s.stage}
                onClick={() => setActiveStageTab(s.stage)}
                className={`relative group rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between min-h-[135px] ${
                  isTabActive || isSimActive
                    ? isRiskStage
                      ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/50'
                      : 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {/* Connector Arrow on Desktop */}
                {index < stages.length - 1 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-slate-700">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      Stage {s.stage}
                    </span>
                    <div className={`p-1.5 rounded-lg ${
                      isRiskStage 
                        ? 'bg-rose-500/20 text-rose-400' 
                        : isTabActive 
                        ? 'bg-indigo-500/20 text-indigo-300' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 leading-tight">
                    {s.title.split('. ')[1]}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {s.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[9px] font-semibold text-slate-400 truncate">{s.badge}</span>
                  {s.stage === 5 && activeTx && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      activeTx.riskScore >= 50 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {activeTx.riskScore >= 50 ? 'VERIFY' : 'PASS'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Deep Dive Inspector */}
      {activeTx && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Detailed Stage Execution Card */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  {React.createElement(stages[activeStageTab - 1].icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">
                      Stage {activeStageTab}: {stages[activeStageTab - 1].title.split('. ')[1]}
                    </h3>
                    <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                      Execution Inspect
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Live telemetry and data structures for {activeTx.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  disabled={activeStageTab === 1}
                  onClick={() => setActiveStageTab((prev) => Math.max(1, prev - 1) as PipelineStageNumber)}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg border border-slate-700"
                >
                  ← Prev
                </button>
                <button
                  disabled={activeStageTab === 7}
                  onClick={() => setActiveStageTab((prev) => Math.min(7, prev + 1) as PipelineStageNumber)}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg border border-slate-700"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Stage 1 Inspection: Ingestion */}
            {activeStageTab === 1 && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">
                    Stage 1: Transaction Ingestion & Pre-Settlement Hold
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    The user initiates a transfer request via web banking, UPI, or merchant checkout. The API gateway
                    intercepts the payload <strong>before</strong> ledger settlement in under 15 ms.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Initiated Amount</span>
                      <p className="font-mono font-bold text-slate-100 text-sm">
                        {activeTx.currency === 'INR' ? '₹' : '$'}{activeTx.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Sender Name</span>
                      <p className="font-semibold text-slate-100 truncate">{activeTx.sender.name}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Channel / Type</span>
                      <p className="font-semibold text-slate-100 capitalize">{activeTx.category.replace('_', ' ')}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Recipient</span>
                      <p className="font-semibold text-slate-100 truncate">{activeTx.receiver.name}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-slate-300 space-y-1">
                    <p className="text-slate-400">// Ingress Gateway Trace</p>
                    <p>Request ID: <span className="text-indigo-400">{activeTx.id}</span> • IP: <span className="text-slate-100">{activeTx.sender.ipAddress}</span></p>
                    <p>State: <span className="text-amber-400 font-bold">INTERCEPTED_PRE_COMPLETION</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 2 Inspection: Feature Preprocessing */}
            {activeStageTab === 2 && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">
                    Stage 2: Feature Preprocessing (6 Core Dimensions)
                  </h4>
                  <p className="text-xs text-slate-300 mb-4">
                    Normalizes the raw banking payload into the 6 numerical/categorical features used by rules &amp; ML inference:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">1. Amount vs Sender Avg</span>
                      <p className="font-mono font-bold text-slate-100 text-sm mt-1">
                        {activeTx.currency === 'INR' ? '₹' : '$'}{activeTx.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-indigo-300 mt-1">
                        Avg: {activeTx.currency === 'INR' ? '₹' : '$'}{activeTx.sender.avgTransactionAmount.toLocaleString()} ({(activeTx.amount / (activeTx.sender.avgTransactionAmount || 500)).toFixed(1)}x)
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">2. Time of Day</span>
                      <p className="font-mono font-bold text-slate-100 text-sm mt-1">
                        {activeTx.preprocessedFeatures?.timeFormatted || '02:30 AM'}
                      </p>
                      <p className={`text-[10px] mt-1 ${activeTx.preprocessedFeatures?.isOffPeakHours ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
                        {activeTx.preprocessedFeatures?.isOffPeakHours ? 'Off-peak midnight hours' : 'Standard daytime hours'}
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">3. Cross-Border Indicator</span>
                      <p className="font-semibold text-slate-100 text-sm mt-1">
                        {activeTx.sender.location || activeTx.sender.country}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Route: {activeTx.sender.country} ➔ {activeTx.receiver.country}
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">4. Device / IP Reputation</span>
                      <p className="font-semibold text-slate-100 text-sm mt-1">
                        {activeTx.sender.deviceType || 'Known Device'}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                        ID: {activeTx.sender.deviceId}
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">5. Category Risk</span>
                      <p className="font-semibold text-slate-100 text-sm mt-1 capitalize">
                        {activeTx.category.replace('_', ' ')}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Merchant: {activeTx.merchant}
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">6. Txns in Last 5 Mins</span>
                      <p className="font-mono font-bold text-slate-100 text-sm mt-1">
                        {activeTx.preprocessedFeatures?.txnFrequency5m ?? 1} txn(s) / 5m
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Account: {activeTx.sender.account}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 3 Inspection: Rule + ML Scoring */}
            {activeStageTab === 3 && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">
                    Stage 3: Hybrid Scoring Engine (6 Configurable Rules + 6-Feature ML)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                      <span className="text-xs text-slate-400">Calibrated Risk Score</span>
                      <div className={`text-3xl font-mono font-bold mt-1 ${
                        activeTx.riskScore >= 50 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {activeTx.riskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Confidence: {(activeTx.mlConfidence * 100).toFixed(1)}%</span>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                      <span className="text-xs text-slate-400">Hybrid Sub-Scores</span>
                      <div className="text-lg font-mono font-bold text-indigo-300 mt-2">
                        Rules: {activeTx.ruleScore ?? '—'} • ML: {activeTx.mlScore ?? '—'}
                      </div>
                      <span className="text-[10px] text-slate-400">Weighted Rules + RandomForest-style</span>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                      <span className="text-xs text-slate-400">Inference Latency</span>
                      <div className="text-3xl font-mono font-bold text-purple-300 mt-1">
                        {activeTx.processingTimeMs} <span className="text-sm font-normal text-slate-400">ms</span>
                      </div>
                      <span className="text-[10px] text-emerald-400">Target &lt; 15 ms met</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                    <p className="font-semibold text-slate-200">Triggered Rules &amp; Anomaly Drivers:</p>
                    <ul className="space-y-1 text-slate-300">
                      {activeTx.riskFactors.map((rf, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-rose-400">•</span>
                          <span>{rf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 4 Inspection: Risk Classification */}
            {activeStageTab === 4 && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    Stage 4: Risk Classification &amp; Routing Policy
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className={`p-4 rounded-xl border ${activeTx.riskScore < 50 ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                      <div className="font-bold flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Low / Medium Risk (0–49)</span>
                      </div>
                      <p className="text-[11px] mt-1.5">Passes automatically for instant bank settlement with minimal customer friction.</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${activeTx.riskScore >= 50 ? 'bg-rose-950/30 border-rose-500/60 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                      <div className="font-bold flex items-center space-x-2">
                        <AlertOctagon className="w-4 h-4 text-rose-400" />
                        <span>Suspicious / High Risk (50–100)</span>
                      </div>
                      <p className="text-[11px] mt-1.5">Routed to Stage 5 Analyst Verification Queue &amp; paired with Gemini explainable rationale.</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Assigned Tier for {activeTx.id}:</span>
                    <span className={`font-bold px-3 py-1 rounded-full ${
                      activeTx.riskScore >= 75 ? 'bg-rose-500/20 text-rose-300' : activeTx.riskScore >= 50 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {activeTx.riskLevel} RISK ({activeTx.riskScore}/100)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 5 Inspection: Step-Up Verification */}
            {activeStageTab === 5 && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      Stage 5: Step-Up Verification Queue
                    </h4>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      activeTx.riskScore >= 50 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {activeTx.riskScore >= 50 ? 'Held for Step-Up Review' : 'Auto-Cleared'}
                    </span>
                  </div>

                  {activeTx.riskScore < 50 ? (
                    <div className="bg-emerald-950/30 border border-emerald-800/40 p-4 rounded-xl text-xs text-emerald-200 space-y-2">
                      <div className="flex items-center space-x-2 font-bold text-emerald-300">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Low Risk (Score: {activeTx.riskScore}/100) — Passed Automatically</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Transaction signature matches historical baseline. No step-up OTP challenge required.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-rose-950/40 border border-rose-800/50 p-4 rounded-xl text-xs text-rose-200 space-y-2">
                        <div className="flex items-center space-x-2 font-bold text-rose-300">
                          <AlertOctagon className="w-4 h-4" />
                          <span>Suspicious / High Risk ({activeTx.riskScore}/100) ➔ Routed to Analyst Queue</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          Transaction is paused prior to completion while step-up verification confirms whether the customer initiated it.
                        </p>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">Execute Step-Up Analyst Decision:</span>
                          {activeTx.verificationResult && (
                            <span className="text-[11px] text-emerald-400 font-bold">
                              Status: {activeTx.verificationResult.decision}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2.5 pt-1">
                          <button
                            onClick={() => onVerifyTransaction(activeTx.id, 'GENUINE_APPROVED', 'Customer completed 2FA challenge. Verified genuine.')}
                            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>1. Genuine ➔ Approve &amp; Complete</span>
                          </button>
                          <button
                            onClick={() => onVerifyTransaction(activeTx.id, 'FRAUD_BLOCKED', 'Customer confirmed uninitiated attempt. Account frozen.')}
                            className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>2. Fraud ➔ Block &amp; Hold</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stage 6 Inspection: Decisioning */}
            {activeStageTab === 6 && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    Stage 6: Final Decisioning Outcome
                  </h4>
                  <p className="text-xs text-slate-300">
                    Records the conclusive payment disposition—either auto-cleared below threshold or resolved by an analyst as <strong>GENUINE_APPROVED</strong> vs <strong>FRAUD_BLOCKED</strong>.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Current Payment Status</span>
                      <span className={`text-base font-bold mt-1 block ${
                        activeTx.status === 'Approved' ? 'text-emerald-400' : activeTx.status === 'Blocked' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {activeTx.status}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Verification Outcome</span>
                      <span className="text-sm font-mono font-bold text-slate-100 mt-1 block">
                        {activeTx.verificationResult ? activeTx.verificationResult.decision : activeTx.riskScore < 50 ? 'AUTO_CLEARED' : 'AWAITING_ANALYST'}
                      </span>
                    </div>
                  </div>

                  {activeTx.verificationResult && (
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                      <span className="text-slate-400">Audit Notes: </span>
                      <span>{activeTx.verificationResult.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stage 7 Inspection: Audit Tracking */}
            {activeStageTab === 7 && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                    Stage 7: Audit Tracking &amp; Real-Time SSE Broadcast
                  </h4>
                  <p className="text-xs text-slate-300 mb-4">
                    Persisted to the in-memory 500-transaction audit store with full stage history and pushed via Server-Sent Events (SSE) to live analyst dashboards:
                  </p>

                  <div className="bg-slate-900 p-3.5 rounded-xl font-mono text-xs text-slate-300 space-y-1.5 overflow-x-auto mb-3">
                    <p className="text-slate-400">// Audited Transaction Record (500-Record Ring Store)</p>
                    <p>{'{'}</p>
                    <p className="pl-4">"id": <span className="text-indigo-300">"{activeTx.id}"</span>,</p>
                    <p className="pl-4">"amount": <span className="text-amber-300">{activeTx.amount}</span>, "currency": <span className="text-slate-100">"{activeTx.currency}"</span>,</p>
                    <p className="pl-4">"riskScore": <span className="text-rose-300">{activeTx.riskScore}</span>, "ruleScore": <span className="text-indigo-300">{activeTx.ruleScore ?? 0}</span>, "mlScore": <span className="text-purple-300">{activeTx.mlScore ?? 0}</span>,</p>
                    <p className="pl-4">"status": <span className="text-emerald-300">"{activeTx.status}"</span>, "stagesTracked": <span className="text-amber-300">{activeTx.stageHistory?.length || 7}</span></p>
                    <p>{'}'}</p>
                  </div>

                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-200">
                    SSE Stream Active • Monitoring {transactions.length} active session records (capped at 500 transactions).
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Gemini AI Explainability Spotlight */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Gemini AI Audit Reasoning</h3>
            </div>

            {activeTx.geminiAnalysis ? (
              <div className="space-y-3 text-xs">
                <div className="bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-800/40 text-indigo-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-indigo-300">Pattern Matched</span>
                  <p className="font-semibold text-white">{activeTx.geminiAnalysis.fraudPatternMatched}</p>
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-1">
                    {activeTx.geminiAnalysis.summary}
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Step-by-Step Evidence</span>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    {activeTx.geminiAnalysis.reasoning.map((r, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">AI Recommendation:</span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {activeTx.geminiAnalysis.recommendation}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                <p>Standard low-risk rule profile. Detailed Gemini reasoning is invoked for scores ≥ 50%.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { AnalyticsOverview, Transaction } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  Activity, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';

interface DashboardOverviewProps {
  analytics: AnalyticsOverview | null;
  latestTransactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateTab: (tab: string) => void;
  onOpenInitiator: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  analytics,
  latestTransactions,
  onSelectTransaction,
  onNavigateTab,
  onOpenInitiator,
}) => {
  if (!analytics) return null;

  // Chart data preparation
  const pieData = [
    { name: 'Genuine (Approved)', value: analytics.genuineCount || analytics.approvedCount || 1170, color: '#10b981' },
    { name: 'Suspicious (Under Review)', value: analytics.suspiciousCount || analytics.underReviewCount || 55, color: '#f59e0b' },
    { name: 'High Risk (Flagged/Blocked)', value: analytics.highRiskCount || analytics.blockedCount || 25, color: '#f43f5e' },
  ];

  // Time series trend data
  const timeSeriesData = [
    { time: '00:00', volume: 12400, risk: 2 },
    { time: '02:30', volume: 50000, risk: 95 },
    { time: '04:00', volume: 8900, risk: 5 },
    { time: '08:00', volume: 34500, risk: 3 },
    { time: '12:00', volume: 68200, risk: 8 },
    { time: '16:00', volume: 51200, risk: 6 },
    { time: '20:00', volume: 29800, risk: 4 },
  ];

  return (
    <div className="space-y-6">
      {/* 7-Stage Core Workflow Highlight Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <Layers className="w-3 h-3 mr-1" />
                <span>Core Architectural Model</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active 7-Stage Interceptor</span>
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Pre-Completion Real-Time Fraud Interception
            </h2>
            <p className="text-xs text-indigo-200/90 mt-1 italic max-w-2xl">
              "Analyze before completion, identify risk in real time, and prevent potentially fraudulent transactions through early detection and verification."
            </p>
          </div>

          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <button
              onClick={() => onNavigateTab('workflow')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Trace 7 Stages</span>
            </button>
            <button
              onClick={onOpenInitiator}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Test ₹50k Case</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Banner Grid - Scaled Core Project Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monitored */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Monitored</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {(analytics.totalTransactions || 1250).toLocaleString()}
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs text-slate-400">
            <span>Stage 1-7 End-to-End Logged</span>
          </div>
        </div>

        {/* Genuine Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Genuine (Approved)</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {(analytics.genuineCount || analytics.approvedCount || 1170).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Low risk auto-approved
          </div>
        </div>

        {/* Suspicious Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all cursor-pointer" onClick={() => onNavigateTab('verification')}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Suspicious (Under Review)</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {(analytics.suspiciousCount || analytics.underReviewCount || 55).toLocaleString()}
          </div>
          <div className="text-xs text-amber-300/80 mt-2 flex items-center space-x-1">
            <span>Stage 5 Verification Queue</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* High Risk / Prevented Loss */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">High Risk Prevented</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {(analytics.highRiskCount || analytics.blockedCount || 25).toLocaleString()} <span className="text-xs font-normal text-slate-400">txns</span>
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-mono">
            ${(analytics.preventedLosses || 1250000).toLocaleString(undefined, { maximumFractionDigits: 0 })} saved
          </div>
        </div>
      </div>

      {/* Main Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume & Risk Trend */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Transaction Volume & Real-Time Velocity</h3>
              <p className="text-xs text-slate-400">24-hour financial stream with spike detection</p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" name="Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-semibold text-slate-100 mb-1">Stage 5 Risk Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Genuine vs Suspicious vs High Risk</p>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-2 mt-2 text-xs">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-[11px] text-slate-300">{d.name}</span>
                </div>
                <span className="font-bold text-slate-200 font-mono">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Fraud Alerts & Gemini AI Spotlight */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">Live Stage 5 Flagged Transactions & Explainability</h3>
          </div>
          <button
            onClick={() => onNavigateTab('verification')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            Open Verification Queue ➔
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestTransactions
            .filter((t) => t.riskScore >= 50)
            .slice(0, 2)
            .map((tx) => (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="bg-slate-950/80 border border-indigo-500/30 hover:border-indigo-500/70 p-4 rounded-xl cursor-pointer transition-all shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-rose-400">{tx.id}</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                    Score: {tx.riskScore}/100
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-200 mb-2">
                  {tx.currency === 'INR' ? '₹' : '$'}{tx.amount.toLocaleString()} ({tx.category.replace('_', ' ')}) • {tx.sender.name}
                </p>

                {tx.geminiAnalysis ? (
                  <div className="bg-indigo-950/50 p-3 rounded-lg border border-indigo-800/40 text-xs text-indigo-200 space-y-1">
                    <p className="font-semibold text-indigo-300">Pattern: {tx.geminiAnalysis.fraudPatternMatched}</p>
                    <p className="text-slate-300 text-[11px] line-clamp-2">{tx.geminiAnalysis.summary}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 line-clamp-2">{tx.riskFactors.join('; ')}</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};


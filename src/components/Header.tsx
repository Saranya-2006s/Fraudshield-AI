import React from 'react';
import { User } from 'firebase/auth';
import { 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Sliders, 
  Play, 
  Pause, 
  BarChart3, 
  BookOpen, 
  Layers, 
  UserCheck,
  Zap,
  CheckCircle2,
  Database,
  LogIn,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isStreaming: boolean;
  onToggleStream: () => void;
  totalTransactions: number;
  genuineCount: number;
  suspiciousCount: number;
  highRiskCount: number;
  fraudPercentage: number;
  preventedLosses: number;
  pendingVerificationCount: number;
  onOpenInitiator: () => void;
  user?: User | null;
  dbSyncedCount?: number;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onOpenDbStudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isStreaming,
  onToggleStream,
  totalTransactions,
  genuineCount,
  suspiciousCount,
  highRiskCount,
  fraudPercentage,
  preventedLosses,
  pendingVerificationCount,
  onOpenInitiator,
  user,
  dbSyncedCount = 0,
  onSignIn,
  onSignOut,
  onOpenDbStudio,
}) => {
  const tabs = [
    { id: 'workflow', label: '7-Stage Core Workflow', icon: Layers, badge: 'Pipeline' },
    { id: 'dashboard', label: 'Live Dashboard', icon: Activity },
    { id: 'verification', label: 'Stage 5 Verification Queue', icon: UserCheck, count: pendingVerificationCount },
    { id: 'transactions', label: 'Transaction Monitoring', icon: ShieldAlert },
    { id: 'rules', label: 'Fraud Rules Engine', icon: Sliders },
    { id: 'sandbox', label: 'ML Sandbox & Retrain', icon: Cpu },
    { id: 'analytics', label: 'Analytics & ROC', icon: BarChart3 },
    { id: 'docs', label: 'Project Docs & Viva Q&A', icon: BookOpen },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-2xl">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-rose-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-mono">
                FraudShield<span className="text-indigo-400">-AI</span>
              </h1>
              <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                7-Stage Real-Time Pipeline
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              "Analyze before completion, identify risk in real time, and prevent potentially fraudulent transactions."
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="hidden xl:flex items-center space-x-4 text-xs bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-1.5 font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">Total:</span>
            <span className="font-bold text-slate-100">{totalTransactions.toLocaleString()}</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800"></div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">Genuine:</span>
            <span className="font-bold text-emerald-400">{genuineCount.toLocaleString()}</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800"></div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">Suspicious:</span>
            <span className="font-bold text-amber-400">{suspiciousCount.toLocaleString()}</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800"></div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">High Risk:</span>
            <span className="font-bold text-rose-400">{highRiskCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenInitiator}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            title="Initiate transaction like ₹50,000 Chennai case"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Initiate Txn (₹50k)</span>
          </button>

          <button
            onClick={onToggleStream}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm cursor-pointer ${
              isStreaming
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title="Toggle SSE Real-time Live Transaction Feed"
          >
            <span className="relative flex h-2 w-2">
              {isStreaming && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isStreaming ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            {isStreaming ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Live Feed</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Paused</span>
              </>
            )}
          </button>

          {user ? (
            <div className="flex items-center space-x-1.5 bg-slate-950/90 border border-emerald-500/30 rounded-lg px-2.5 py-1 text-xs">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold hidden sm:inline">
                DB Synced ({dbSyncedCount})
              </span>
              <span className="text-slate-400 text-[11px] hidden md:inline max-w-[110px] truncate">
                • {user.displayName || user.email}
              </span>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="p-1 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                  title="Sign out from Firestore"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            onSignIn && (
              <button
                onClick={onSignIn}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                title="Sign in with Google to persist transactions, rules & ML config in Cloud Firestore"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connect DB</span>
              </button>
            )
          )}
          {onOpenDbStudio && (
            <button
              onClick={onOpenDbStudio}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer"
              title="Open standalone Firestore Database Studio (?view=db-studio)"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>DB Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex space-x-1 overflow-x-auto scrollbar-none py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};


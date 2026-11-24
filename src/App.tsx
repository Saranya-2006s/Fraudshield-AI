import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { Database, LogIn } from 'lucide-react';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  signInWithGoogle,
  signOutFromFirebase,
} from './firebase';
import {
  saveModelConfigToFirestore,
  saveTransactionToFirestore,
  seedInitialWorkspaceIfEmpty,
  syncAllRulesToFirestore,
  updateTransactionGeminiInFirestore,
  updateTransactionVerificationInFirestore,
  upsertUserProfile,
} from './services/firestoreSync';
import { Transaction, AnalyticsOverview, AnalyticsPayload, FraudRule, MLModelMetrics, FilterOptions, TransactionStatus } from './types';
import { Header } from './components/Header';
import { LiveAlertStream } from './components/LiveAlertStream';
import { DashboardOverview } from './components/DashboardOverview';
import { StageWorkflowVisualizer } from './components/StageWorkflowVisualizer';
import { VerificationQueue } from './components/VerificationQueue';
import { LiveTransactionInitiator } from './components/LiveTransactionInitiator';
import { TransactionsTable } from './components/TransactionsTable';
import { RulesManager } from './components/RulesManager';
import { MLSandbox } from './components/MLSandbox';
import { AnalyticsView } from './components/AnalyticsView';
import { ProjectDocsAndViva } from './components/ProjectDocsAndViva';
import { TransactionModal } from './components/TransactionModal';
import { DatabaseStudio } from './components/DatabaseStudio';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('workflow');
  const [isDbStudio, setIsDbStudio] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('view') === 'db-studio';
  });
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isInitiatorOpen, setIsInitiatorOpen] = useState<boolean>(false);

  // Data Stores
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [analyticsPayload, setAnalyticsPayload] = useState<AnalyticsPayload | null>(null);
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [metrics, setMetrics] = useState<MLModelMetrics | null>(null);

  // Auth & Firestore Persistence State
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [dbTransactions, setDbTransactions] = useState<Transaction[]>([]);
  const seededUidRef = useRef<string | null>(null);

  // Selected Transaction for Modal
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Filters State
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    riskLevel: 'ALL',
    status: 'ALL',
    category: 'ALL',
    minAmount: 0,
    maxAmount: 1000000,
    timeRange: 'all',
  });

  // Fetch Transactions from API
  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams({
        search: filters.search,
        riskLevel: filters.riskLevel,
        status: filters.status,
        category: filters.category,
        minAmount: String(filters.minAmount),
        maxAmount: String(filters.maxAmount),
        page: String(page),
        limit: '25',
      });

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(() => {
          const serverTxs = data.transactions as Transaction[];
          const dbIds = new Set(dbTransactions.map((t) => t.id));
          const merged = [...dbTransactions, ...serverTxs.filter((t) => !dbIds.has(t.id))];
          merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          return merged.filter((tx) => {
            if (filters.search) {
              const s = filters.search.toLowerCase();
              const hit =
                tx.id.toLowerCase().includes(s) ||
                tx.sender.name.toLowerCase().includes(s) ||
                tx.receiver.name.toLowerCase().includes(s) ||
                tx.merchant.toLowerCase().includes(s) ||
                tx.sender.country.toLowerCase().includes(s);
              if (!hit) return false;
            }
            if (filters.riskLevel !== 'ALL' && tx.riskLevel !== filters.riskLevel) return false;
            if (filters.status !== 'ALL' && tx.status !== filters.status) return false;
            if (filters.category !== 'ALL' && tx.category !== filters.category) return false;
            return true;
          });
        });
        setTotalTransactions(Math.max(data.total, dbTransactions.length));
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  // Fetch Analytics & Rules
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = (await res.json()) as AnalyticsPayload;
        setAnalyticsPayload(data);
        setAnalytics(data.overview);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchModelMetrics = async () => {
    try {
      const res = await fetch('/api/model/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchAnalytics();
    fetchRules();
    fetchModelMetrics();
  }, [filters, page]);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (!firebaseUser) {
        setDbTransactions([]);
        seededUidRef.current = null;
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore real-time listeners — strictly gated on authReady && user
  useEffect(() => {
    if (!authReady || !user) return;

    let cancelled = false;

    const initWorkspace = async () => {
      try {
        await upsertUserProfile(user);
        if (seededUidRef.current !== user.uid) {
          const [txRes, rulesRes, metricsRes] = await Promise.all([
            fetch('/api/transactions?limit=15'),
            fetch('/api/rules'),
            fetch('/api/model/metrics'),
          ]);
          const seedTx = txRes.ok ? ((await txRes.json()).transactions as Transaction[]) : [];
          const seedRules = rulesRes.ok ? ((await rulesRes.json()) as FraudRule[]) : [];
          const seedMetrics = metricsRes.ok ? ((await metricsRes.json()) as MLModelMetrics) : null;
          if (!cancelled) {
            await seedInitialWorkspaceIfEmpty(user.uid, seedTx, seedRules, seedMetrics);
            seededUidRef.current = user.uid;
          }
        }
      } catch (err) {
        console.error('Failed initializing Firestore workspace:', err);
      }
    };

    initWorkspace();

    const txQuery = query(collection(db, 'transactions'), where('ownerId', '==', user.uid));
    const unsubTx = onSnapshot(
      txQuery,
      (snapshot) => {
        const loaded = snapshot.docs.map((d) => d.data() as Transaction);
        loaded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setDbTransactions(loaded);
        setTransactions((prev) => {
          const dbIds = new Set(loaded.map((t) => t.id));
          const liveExtras = prev.filter((t) => !dbIds.has(t.id));
          return [...loaded, ...liveExtras].slice(0, 100);
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'transactions');
      }
    );

    const rulesQuery = query(collection(db, 'fraudRules'), where('ownerId', '==', user.uid));
    const unsubRules = onSnapshot(
      rulesQuery,
      (snapshot) => {
        if (snapshot.empty) return;
        const loadedRules = snapshot.docs.map((d) => d.data() as FraudRule);
        loadedRules.sort((a, b) => a.id.localeCompare(b.id));
        setRules(loadedRules);
        fetch('/api/rules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loadedRules),
        }).catch(() => {});
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'fraudRules');
      }
    );

    const modelRef = doc(db, 'modelConfigs', user.uid);
    const unsubModel = onSnapshot(
      modelRef,
      (snap) => {
        if (!snap.exists()) return;
        const cfg = snap.data();
        setMetrics((prev) =>
          prev
            ? {
                ...prev,
                algorithm: cfg.algorithm,
                accuracy: cfg.accuracy,
                precision: cfg.precision,
                recall: cfg.recall,
                f1Score: cfg.f1Score,
                aucRoc: cfg.aucRoc,
                totalTrainedOn: cfg.totalTrainedOn,
                lastTrained: cfg.lastTrained,
              }
            : prev
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `modelConfigs/${user.uid}`);
      }
    );

    return () => {
      cancelled = true;
      unsubTx();
      unsubRules();
      unsubModel();
    };
  }, [authReady, user]);

  // SSE Stream Listener
  useEffect(() => {
    let eventSource: EventSource | null = null;

    if (isStreaming) {
      eventSource = new EventSource('/api/stream');

      eventSource.onmessage = (event) => {
        try {
          const newTx = JSON.parse(event.data) as Transaction;
          if (newTx.id) {
            setTransactions((prev) => {
              const exists = prev.some((t) => t.id === newTx.id);
              if (exists) {
                return prev.map((t) => (t.id === newTx.id ? newTx : t));
              }
              setTotalTransactions((count) => count + 1);
              return [newTx, ...prev.slice(0, 49)];
            });
            fetchAnalytics();
            fetchRules();
          }
        } catch (e) {
          // ignore handshake
        }
      };
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isStreaming]);

  // Handlers
  const handleToggleStream = async () => {
    try {
      const res = await fetch('/api/stream/toggle', { method: 'POST' });
      const data = await res.json();
      setIsStreaming(data.liveSimulationActive);
    } catch (e) {
      setIsStreaming(!isStreaming);
    }
  };

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err?.message || 'Google Sign-In was cancelled or failed.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutFromFirebase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDbStudio = (open: boolean) => {
    setIsDbStudio(open);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (open) {
        url.searchParams.set('view', 'db-studio');
      } else {
        url.searchParams.delete('view');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: TransactionStatus) => {
    try {
      const res = await fetch(`/api/transactions/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newStatus }),
      });
      if (res.ok) {
        const updated = (await res.json()) as Transaction;
        setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
        if (selectedTx?.id === id) setSelectedTx(updated);
        if (user) {
          await updateTransactionVerificationInFirestore(updated, user.uid);
        }
        fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Stage 5 Verification Decision: Genuine vs Fraud
  const handleVerifyTransaction = async (
    id: string,
    decision: 'GENUINE_APPROVED' | 'FRAUD_BLOCKED',
    notes?: string
  ) => {
    try {
      const res = await fetch(`/api/transactions/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes, reviewedBy: user?.displayName || 'Security Analyst / FraudShield AI' }),
      });
      if (res.ok) {
        const updated = (await res.json()) as Transaction;
        setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
        if (selectedTx?.id === id) setSelectedTx(updated);
        if (user) {
          await updateTransactionVerificationInFirestore(updated, user.uid);
        }
        fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyzeWithGemini = async (id: string) => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/analyze-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const analysis = await res.json();
        let enrichedTx: Transaction | null = null;
        setTransactions((prev) =>
          prev.map((t) => {
            if (t.id === id) {
              enrichedTx = { ...t, geminiAnalysis: analysis };
              return enrichedTx;
            }
            return t;
          })
        );
        if (selectedTx?.id === id) {
          const updatedSelected = { ...selectedTx, geminiAnalysis: analysis };
          setSelectedTx(updatedSelected);
          enrichedTx = updatedSelected;
        }
        if (user && enrichedTx) {
          await updateTransactionGeminiInFirestore(enrichedTx, user.uid);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleUpdateRules = async (newRules: FraudRule[]) => {
    setRules(newRules);
    try {
      await fetch('/api/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRules),
      });
      if (user) {
        await syncAllRulesToFirestore(newRules, user.uid);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateSingle = async (raw: any): Promise<Transaction> => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(raw),
    });
    const created = (await res.json()) as Transaction;
    if (user && created?.id) {
      await saveTransactionToFirestore(created, user.uid);
    }
    fetchTransactions();
    fetchAnalytics();
    return created;
  };

  const handleBatchProcess = async (items: any[]) => {
    const res = await fetch('/api/transactions/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: items }),
    });
    const result = await res.json();
    if (user && Array.isArray(result?.transactions)) {
      for (const tx of result.transactions.slice(0, 20)) {
        await saveTransactionToFirestore(tx, user.uid);
      }
    }
    fetchTransactions();
    fetchAnalytics();
    return result;
  };

  const handleRetrainModel = async (algorithm: string, hyperparams: any) => {
    const res = await fetch('/api/model/retrain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm, ...hyperparams }),
    });
    const updatedMetrics = (await res.json()) as MLModelMetrics;
    setMetrics(updatedMetrics);
    if (user) {
      await saveModelConfigToFirestore(updatedMetrics, user.uid, hyperparams?.estimators);
    }
    fetchAnalytics();
    return updatedMetrics;
  };

  const handleTriggerSimulatedAnomaly = () => {
    handleSimulateSingle({
      id: `TXN${Math.floor(1000 + Math.random() * 9000)}`,
      amount: 50000,
      currency: 'INR',
      category: 'online_banking',
      merchant: 'Online Transfer Portal',
      sender: {
        name: 'Rajesh Kumar',
        country: 'IN',
        location: 'Chennai, India',
        deviceType: 'New Device',
        avgTransactionAmount: 2500,
        ipAddress: '157.48.201.44',
      },
      receiver: {
        name: 'Offshore P2P Escrow',
        country: 'IN',
        bank: 'Commercial Bank',
      },
      enableAiReasoning: true,
    });
  };

  // Pending verification count
  const pendingCount = transactions.filter(
    (t) => (t.status === 'Under Review' || t.status === 'Flagged' || t.riskScore >= 50) && !t.verificationResult
  ).length;

  if (isDbStudio) {
    return (
      <DatabaseStudio
        user={user}
        authReady={authReady}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onExitStudio={() => handleToggleDbStudio(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header with 7-stage indicators */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
        onToggleStream={handleToggleStream}
        totalTransactions={analytics?.totalTransactions || totalTransactions || 1250}
        genuineCount={analytics?.genuineCount || analytics?.approvedCount || 1170}
        suspiciousCount={analytics?.suspiciousCount || analytics?.underReviewCount || 55}
        highRiskCount={analytics?.highRiskCount || analytics?.blockedCount || 25}
        fraudPercentage={analytics?.fraudPercentage || 6.4}
        preventedLosses={analytics?.preventedLosses || 1250000}
        pendingVerificationCount={pendingCount}
        onOpenInitiator={() => setIsInitiatorOpen(true)}
        user={user}
        dbSyncedCount={dbTransactions.length}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onOpenDbStudio={() => handleToggleDbStudio(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Cloud Firestore Database Connection Banner when not signed in */}
        {authReady && !user && (
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-xs">
              <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-100">Persistent Cloud Firestore Database Ready</p>
                <p className="text-slate-400 text-[11px]">
                  Sign in with Google to save audited transactions, Stage 5 decisions, custom rules, and ML model configs across sessions.
                </p>
                {authError && <p className="text-rose-400 text-[11px] mt-1">{authError}</p>}
              </div>
            </div>
            <button
              onClick={handleSignIn}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in with Google</span>
            </button>
          </div>
        )}

        {/* Live SSE Feed Bar on Dashboard view */}
        {(activeTab === 'dashboard' || activeTab === 'workflow') && (
          <LiveAlertStream
            latestTransactions={transactions}
            onSelectTransaction={setSelectedTx}
            onTriggerSimulatedAnomaly={handleTriggerSimulatedAnomaly}
          />
        )}

        {/* Tab 1: 7-Stage Core Workflow Visualizer */}
        {activeTab === 'workflow' && (
          <StageWorkflowVisualizer
            transactions={transactions}
            selectedTx={selectedTx}
            onSelectTransaction={setSelectedTx}
            onVerifyTransaction={handleVerifyTransaction}
            onOpenInitiator={() => setIsInitiatorOpen(true)}
          />
        )}

        {/* Tab 2: Live Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            analytics={analytics}
            latestTransactions={transactions}
            onSelectTransaction={setSelectedTx}
            onNavigateTab={setActiveTab}
            onOpenInitiator={() => setIsInitiatorOpen(true)}
          />
        )}

        {/* Tab 3: Stage 5 Verification Queue */}
        {activeTab === 'verification' && (
          <VerificationQueue
            transactions={transactions}
            onVerifyTransaction={handleVerifyTransaction}
            onSelectTransaction={setSelectedTx}
          />
        )}

        {/* Tab 4: Transaction Monitoring Table */}
        {activeTab === 'transactions' && (
          <TransactionsTable
            transactions={transactions}
            total={totalTransactions}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            filters={filters}
            onFilterChange={setFilters}
            onSelectTransaction={setSelectedTx}
            onAnalyzeWithGemini={handleAnalyzeWithGemini}
            onUpdateStatus={handleUpdateStatus}
            isLoadingAi={isLoadingAi}
          />
        )}

        {/* Tab 5: Rules Engine */}
        {activeTab === 'rules' && <RulesManager rules={rules} onUpdateRules={handleUpdateRules} />}

        {/* Tab 6: ML Sandbox & Retraining */}
        {activeTab === 'sandbox' && (
          <MLSandbox
            metrics={metrics}
            onSimulateSingle={handleSimulateSingle}
            onBatchProcess={handleBatchProcess}
            onRetrainModel={handleRetrainModel}
          />
        )}

        {/* Tab 7: Analytics & Metrics */}
        {activeTab === 'analytics' && (
          <AnalyticsView analytics={analytics} analyticsPayload={analyticsPayload} metrics={metrics} />
        )}

        {/* Tab 8: Project Docs & Viva Q&A */}
        {activeTab === 'docs' && <ProjectDocsAndViva />}
      </main>

      {/* Transaction Details Inspector Modal */}
      <TransactionModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onUpdateStatus={handleUpdateStatus}
        onVerifyTransaction={handleVerifyTransaction}
        onAnalyzeWithGemini={handleAnalyzeWithGemini}
        isLoadingAi={isLoadingAi}
      />

      {/* Live Transaction Initiator Modal */}
      <LiveTransactionInitiator
        isOpen={isInitiatorOpen}
        onClose={() => setIsInitiatorOpen(false)}
        onSubmitTransaction={async (txData) => {
          await handleSimulateSingle(txData);
        }}
        onNavigateWorkflow={() => setActiveTab('workflow')}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FraudShield-AI Enterprise Fraud Engine • 7-Stage Interception Architecture</span>
          <span>Status: <strong className="text-emerald-400 font-mono">0.0.0.0:3000 Pipeline Active</strong></span>
        </div>
      </footer>
    </div>
  );
}


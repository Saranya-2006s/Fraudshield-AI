import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import {
  ArrowLeft,
  Check,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileJson,
  FolderOpen,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Table2,
  Trash2,
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';
import { db, handleFirestoreError, OperationType } from '../firebase';

type CollectionKey = 'transactions' | 'fraudRules' | 'modelConfigs' | 'userProfile';

interface StudioDoc {
  docId: string;
  path: string;
  data: Record<string, any>;
}

interface DatabaseStudioProps {
  user: User | null;
  authReady: boolean;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onExitStudio: () => void;
}

const COLLECTION_META: {
  id: CollectionKey;
  label: string;
  firestorePath: string;
  description: string;
  deletable: boolean;
}[] = [
  {
    id: 'transactions',
    label: 'transactions',
    firestorePath: '/transactions/{transactionId}',
    description: '7-stage audited transaction records, risk scores, features, and verification outcomes.',
    deletable: true,
  },
  {
    id: 'fraudRules',
    label: 'fraudRules',
    firestorePath: '/fraudRules/{ruleId}',
    description: 'Configurable heuristic rules, weights, trigger counters, and DSL expressions.',
    deletable: true,
  },
  {
    id: 'modelConfigs',
    label: 'modelConfigs',
    firestorePath: '/modelConfigs/{configId}',
    description: 'Persisted ML classifier algorithm, hyperparameter configuration, and accuracy metrics.',
    deletable: false,
  },
  {
    id: 'userProfile',
    label: 'users / private',
    firestorePath: '/users/{userId}/private/profile',
    description: 'Isolated private analyst profile record protected by owner-only access rules.',
    deletable: false,
  },
];

function normalizeValue(val: any): any {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object' && typeof val.toDate === 'function') {
    return val.toDate().toISOString();
  }
  if (Array.isArray(val)) {
    return val.map(normalizeValue);
  }
  if (typeof val === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = normalizeValue(v);
    }
    return out;
  }
  return val;
}

export const DatabaseStudio: React.FC<DatabaseStudioProps> = ({
  user,
  authReady,
  onSignIn,
  onSignOut,
  onExitStudio,
}) => {
  const [activeCollection, setActiveCollection] = useState<CollectionKey>('transactions');
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeletePath, setConfirmDeletePath] = useState<string | null>(null);

  const [docsByCollection, setDocsByCollection] = useState<Record<CollectionKey, StudioDoc[]>>({
    transactions: [],
    fraudRules: [],
    modelConfigs: [],
    userProfile: [],
  });

  const [selectedDoc, setSelectedDoc] = useState<StudioDoc | null>(null);

  const fetchAllCollections = async (currentUser: User) => {
    setIsLoading(true);
    setLoadError(null);

    const nextState: Record<CollectionKey, StudioDoc[]> = {
      transactions: [],
      fraudRules: [],
      modelConfigs: [],
      userProfile: [],
    };

    try {
      try {
        const txSnap = await getDocs(
          query(collection(db, 'transactions'), where('ownerId', '==', currentUser.uid))
        );
        nextState.transactions = txSnap.docs
          .map((d) => ({
            docId: d.id,
            path: `transactions/${d.id}`,
            data: normalizeValue(d.data()),
          }))
          .sort((a, b) =>
            String(b.data.timestamp || '').localeCompare(String(a.data.timestamp || ''))
          );
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'transactions');
      }

      try {
        const rulesSnap = await getDocs(
          query(collection(db, 'fraudRules'), where('ownerId', '==', currentUser.uid))
        );
        nextState.fraudRules = rulesSnap.docs
          .map((d) => ({
            docId: d.id,
            path: `fraudRules/${d.id}`,
            data: normalizeValue(d.data()),
          }))
          .sort((a, b) => String(a.data.id || '').localeCompare(String(b.data.id || '')));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'fraudRules');
      }

      try {
        const modelRef = doc(db, 'modelConfigs', currentUser.uid);
        const modelSnap = await getDoc(modelRef);
        if (modelSnap.exists()) {
          nextState.modelConfigs = [
            {
              docId: modelSnap.id,
              path: `modelConfigs/${modelSnap.id}`,
              data: normalizeValue(modelSnap.data()),
            },
          ];
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `modelConfigs/${currentUser.uid}`);
      }

      try {
        const profileRef = doc(db, 'users', currentUser.uid, 'private', 'profile');
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          nextState.userProfile = [
            {
              docId: profileSnap.id,
              path: `users/${currentUser.uid}/private/profile`,
              data: normalizeValue(profileSnap.data()),
            },
          ];
        }
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.GET,
          `users/${currentUser.uid}/private/profile`
        );
      }

      setDocsByCollection(nextState);
      const currentList = nextState[activeCollection];
      setSelectedDoc((prev) => {
        if (prev) {
          const updatedMatch = currentList.find((d) => d.path === prev.path);
          if (updatedMatch) return updatedMatch;
        }
        return currentList[0] || null;
      });
    } catch (err: any) {
      setLoadError(err?.message || 'Unable to load Firestore collections.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authReady && user) {
      fetchAllCollections(user);
    } else if (authReady && !user) {
      setDocsByCollection({
        transactions: [],
        fraudRules: [],
        modelConfigs: [],
        userProfile: [],
      });
      setSelectedDoc(null);
    }
  }, [authReady, user]);

  useEffect(() => {
    const list = docsByCollection[activeCollection];
    setSelectedDoc(list[0] || null);
    setConfirmDeletePath(null);
  }, [activeCollection]);

  const activeDocs = docsByCollection[activeCollection];
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return activeDocs;
    const q = searchQuery.toLowerCase();
    return activeDocs.filter(
      (d) =>
        d.docId.toLowerCase().includes(q) ||
        JSON.stringify(d.data).toLowerCase().includes(q)
    );
  }, [activeDocs, searchQuery]);

  const activeMeta = COLLECTION_META.find((m) => m.id === activeCollection)!;

  const totalDocuments =
    docsByCollection.transactions.length +
    docsByCollection.fraudRules.length +
    docsByCollection.modelConfigs.length +
    docsByCollection.userProfile.length;

  const handleCopyJson = async (docItem: StudioDoc) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(docItem.data, null, 2));
      setCopiedId(docItem.path);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard access denied
    }
  };

  const handleExportCollection = () => {
    const payload = filteredDocs.map((d) => ({ _docId: d.docId, _path: d.path, ...d.data }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `firestore-${activeCollection}-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteDoc = async (docItem: StudioDoc) => {
    if (!user) return;
    if (confirmDeletePath !== docItem.path) {
      setConfirmDeletePath(docItem.path);
      return;
    }
    try {
      if (activeCollection === 'transactions') {
        await deleteDoc(doc(db, 'transactions', docItem.docId));
      } else if (activeCollection === 'fraudRules') {
        await deleteDoc(doc(db, 'fraudRules', docItem.docId));
      }
      setConfirmDeletePath(null);
      await fetchAllCollections(user);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docItem.path);
    }
  };

  const firebaseConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Studio Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onExitStudio}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to FraudShield</span>
            </button>

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white tracking-tight">
                  Firestore Database Studio
                </h1>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-[340px] sm:max-w-[520px]">
                  {firebaseConfig.projectId} / {firebaseConfig.firestoreDatabaseId}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={firebaseConsoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Firebase Console</span>
            </a>

            {user ? (
              <>
                <button
                  onClick={() => fetchAllCollections(user)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg border border-slate-800 bg-slate-950 text-xs">
                  <span className="text-slate-300 truncate max-w-[160px]">
                    {user.email}
                  </span>
                  <button
                    onClick={onSignOut}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-300 hover:bg-slate-900 transition-colors cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      {!authReady ? (
        <div className="flex-1 flex items-center justify-center p-8 text-sm text-slate-400">
          Connecting to Firebase Authentication...
        </div>
      ) : !user ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-5">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                Connect Your Cloud Firestore Database
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sign in with your verified Google account to browse live collections, inspect document schemas, filter records, and export JSON snapshots from{' '}
                <span className="font-mono text-slate-300">{firebaseConfig.projectId}</span>.
              </p>
            </div>
            <button
              onClick={onSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Left Sidebar: Collections & Schema Info */}
          <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/40 p-4 space-y-6">
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Collections
                </span>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {totalDocuments} docs
                </span>
              </div>
              <nav className="space-y-1">
                {COLLECTION_META.map((col) => {
                  const count = docsByCollection[col.id].length;
                  const isActive = activeCollection === col.id;
                  return (
                    <button
                      key={col.id}
                      onClick={() => setActiveCollection(col.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FolderOpen
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        />
                        <span className="font-mono truncate">{col.label}</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-slate-800 pt-4 px-2 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Collection Schema</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-400 leading-relaxed">
                <p className="font-mono text-slate-300 break-all">{activeMeta.firestorePath}</p>
                <p>{activeMeta.description}</p>
                <p className="text-slate-500">
                  Scoped to UID <span className="font-mono text-slate-400">{user.uid.slice(0, 10)}…</span>
                </p>
              </div>
            </div>
          </aside>

          {/* Center Table / Document List */}
          <section className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col min-h-[520px]">
            <div className="p-4 border-b border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-white font-mono">
                    {activeMeta.label}
                  </h2>
                  <p className="text-[11px] text-slate-400 tabular-nums">
                    Showing {filteredDocs.length} of {activeDocs.length} documents
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        viewMode === 'table'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Table2 className="w-3.5 h-3.5" />
                      <span>Table</span>
                    </button>
                    <button
                      onClick={() => setViewMode('json')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        viewMode === 'json'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileJson className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </button>
                  </div>

                  <button
                    onClick={handleExportCollection}
                    disabled={filteredDocs.length === 0}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 transition-colors cursor-pointer disabled:opacity-40"
                    title="Download collection as JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by document ID, status, merchant, algorithm..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {loadError && (
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/30 text-xs text-rose-300">
                  {loadError}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              {filteredDocs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  {isLoading
                    ? 'Loading documents from Cloud Firestore...'
                    : 'No documents match your filter in this collection.'}
                </div>
              ) : viewMode === 'table' ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900/80 text-[11px] text-slate-400 border-b border-slate-800 sticky top-0">
                    {activeCollection === 'transactions' && (
                      <tr>
                        <th className="py-2.5 px-3 font-medium">Transaction</th>
                        <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                        <th className="py-2.5 px-3 font-medium text-right">Risk</th>
                        <th className="py-2.5 px-3 font-medium">Status</th>
                      </tr>
                    )}
                    {activeCollection === 'fraudRules' && (
                      <tr>
                        <th className="py-2.5 px-3 font-medium">Rule ID</th>
                        <th className="py-2.5 px-3 font-medium">Name</th>
                        <th className="py-2.5 px-3 font-medium text-right">Weight</th>
                        <th className="py-2.5 px-3 font-medium">State</th>
                      </tr>
                    )}
                    {activeCollection === 'modelConfigs' && (
                      <tr>
                        <th className="py-2.5 px-3 font-medium">Algorithm</th>
                        <th className="py-2.5 px-3 font-medium text-right">Accuracy</th>
                        <th className="py-2.5 px-3 font-medium text-right">AUC-ROC</th>
                      </tr>
                    )}
                    {activeCollection === 'userProfile' && (
                      <tr>
                        <th className="py-2.5 px-3 font-medium">Document</th>
                        <th className="py-2.5 px-3 font-medium">Email</th>
                        <th className="py-2.5 px-3 font-medium">Role</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {filteredDocs.map((item) => {
                      const isSelected = selectedDoc?.path === item.path;
                      const d = item.data;
                      return (
                        <tr
                          key={item.path}
                          onClick={() => setSelectedDoc(item)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-950/35' : 'hover:bg-slate-900/60'
                          }`}
                        >
                          {activeCollection === 'transactions' && (
                            <>
                              <td className="py-2.5 px-3">
                                <div className="font-mono font-medium text-slate-100">
                                  {d.id}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                  {d.merchant}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200">
                                {d.currency} {Number(d.amount || 0).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                                <span
                                  className={
                                    Number(d.riskScore) >= 75
                                      ? 'text-rose-400'
                                      : Number(d.riskScore) >= 50
                                      ? 'text-amber-400'
                                      : 'text-emerald-400'
                                  }
                                >
                                  {d.riskScore}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-300">{d.status}</td>
                            </>
                          )}
                          {activeCollection === 'fraudRules' && (
                            <>
                              <td className="py-2.5 px-3 font-mono text-slate-100">{d.id}</td>
                              <td className="py-2.5 px-3 text-slate-200 truncate max-w-[180px]">
                                {d.name}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                                {d.weight}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={
                                    d.enabled ? 'text-emerald-400' : 'text-slate-500'
                                  }
                                >
                                  {d.enabled ? 'Enabled' : 'Disabled'}
                                </span>
                              </td>
                            </>
                          )}
                          {activeCollection === 'modelConfigs' && (
                            <>
                              <td className="py-2.5 px-3 font-mono text-slate-100">
                                {d.algorithm}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-400">
                                {d.accuracy}%
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200">
                                {d.aucRoc}
                              </td>
                            </>
                          )}
                          {activeCollection === 'userProfile' && (
                            <>
                              <td className="py-2.5 px-3 font-mono text-slate-100">
                                {item.docId}
                              </td>
                              <td className="py-2.5 px-3 text-slate-300">{d.email}</td>
                              <td className="py-2.5 px-3 font-mono text-emerald-400">
                                {d.role}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="divide-y divide-slate-800/70">
                  {filteredDocs.map((item) => {
                    const isSelected = selectedDoc?.path === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => setSelectedDoc(item)}
                        className={`w-full text-left p-3 transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-950/35' : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="font-mono text-xs text-emerald-400 truncate">
                          {item.docId}
                        </div>
                        <pre className="mt-1 text-[11px] font-mono text-slate-400 line-clamp-2 whitespace-pre-wrap break-all">
                          {JSON.stringify(item.data)}
                        </pre>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Right Pane: Document Inspector */}
          <section className="lg:col-span-4 flex flex-col bg-slate-950">
            {selectedDoc ? (
              <>
                <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400">
                      Document Inspector
                    </span>
                    <h3 className="text-xs font-mono text-emerald-400 break-all mt-0.5">
                      /{selectedDoc.path}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyJson(selectedDoc)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      {copiedId === selectedDoc.path ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {activeMeta.deletable && (
                      <button
                        onClick={() => handleDeleteDoc(selectedDoc)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          confirmDeletePath === selectedDoc.path
                            ? 'border-rose-500 bg-rose-600 text-white'
                            : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-rose-300'
                        }`}
                        title="Delete document from Cloud Firestore"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>
                          {confirmDeletePath === selectedDoc.path ? 'Confirm Delete' : 'Delete'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap break-words bg-slate-900/70 border border-slate-800 rounded-lg p-4">
                    {JSON.stringify(selectedDoc.data, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-500">
                Select a document from the collection list to inspect its fields and JSON payload.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

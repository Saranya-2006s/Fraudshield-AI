import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { FraudRule, MLModelMetrics, Transaction } from '../types';

const ID_PATTERN = /^[a-zA-Z0-9_\-]+$/;
const VALID_CATEGORIES = new Set([
  'wire_transfer',
  'online_shopping',
  'crypto_cashout',
  'pos_terminal',
  'atm_withdrawal',
  'p2p_transfer',
  'upi_payment',
  'online_banking',
]);
const VALID_STATUSES = new Set([
  'Approved',
  'Flagged',
  'Blocked',
  'Under Review',
  'Pending Verification',
  'Completed',
]);
const VALID_RISK_LEVELS = new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const VALID_RECOMMENDATIONS = new Set([
  'ALLOW',
  'STEP_UP_AUTH',
  'FREEZE_ACCOUNT',
  'BLOCK_TRANSACTION',
  'MANUAL_VERIFICATION',
]);
const VALID_ALGORITHMS = new Set([
  'RandomForestClassifier',
  'IsolationForest',
  'XGBoostClassifier',
  'LogisticRegression',
]);

function clampStr(val: unknown, fallback: string, maxLen: number): string {
  const s = typeof val === 'string' && val.trim().length > 0 ? val.trim() : fallback;
  return s.slice(0, maxLen);
}

function sanitizeId(val: unknown, fallbackPrefix: string): string {
  const raw = typeof val === 'string' ? val.replace(/[^a-zA-Z0-9_\-]/g, '_') : '';
  const id = raw.length >= 2 ? raw.slice(0, 64) : `${fallbackPrefix}_${Date.now()}`;
  return ID_PATTERN.test(id) ? id : `${fallbackPrefix}_${Date.now()}`;
}

export function toFirestoreTxDocId(ownerId: string, txId: string): string {
  const safeOwner = ownerId.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 20);
  const safeTx = sanitizeId(txId, 'TXN');
  return `${safeOwner}_${safeTx}`.slice(0, 128);
}

export function toFirestoreRuleDocId(ownerId: string, ruleId: string): string {
  const safeOwner = ownerId.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 20);
  const safeRule = sanitizeId(ruleId, 'RULE');
  return `${safeOwner}_${safeRule}`.slice(0, 128);
}

export function sanitizeTransactionForFirestore(tx: Transaction, ownerId: string) {
  const safeId = sanitizeId(tx.id, 'TXN');
  const rawCurrency = (tx.currency || 'USD').toUpperCase().replace(/[^A-Z]/g, '');
  const currency = rawCurrency.length >= 3 && rawCurrency.length <= 8 ? rawCurrency : 'USD';
  const category = VALID_CATEGORIES.has(tx.category) ? tx.category : 'online_banking';
  const status = VALID_STATUSES.has(tx.status) ? tx.status : 'Approved';
  const riskLevel = VALID_RISK_LEVELS.has(tx.riskLevel) ? tx.riskLevel : 'LOW';
  const riskScore = Math.min(100, Math.max(0, Number(tx.riskScore) || 0));
  const fraudProbability = Math.min(100, Math.max(0, Number(tx.fraudProbability ?? riskScore) || 0));
  const mlConfidence = Math.min(1, Math.max(0, Number(tx.mlConfidence) || 0.9));

  const sender: Record<string, unknown> = {
    id: clampStr(tx.sender?.id, 'ACC-00001', 64),
    name: clampStr(tx.sender?.name, 'Account Holder', 120),
    account: clampStr(tx.sender?.account, '**** 0000', 40),
    country: clampStr(tx.sender?.country, 'US', 16),
    deviceId: clampStr(tx.sender?.deviceId, 'DEV-UNKNOWN', 80),
    ipAddress: clampStr(tx.sender?.ipAddress, '127.0.0.1', 64),
    avgTransactionAmount: Math.max(0, Number(tx.sender?.avgTransactionAmount) || 500),
  };
  if (tx.sender?.location) sender.location = clampStr(tx.sender.location, 'Unknown', 160);
  if (tx.sender?.deviceType) sender.deviceType = clampStr(tx.sender.deviceType, 'Known Device', 60);

  const receiver: Record<string, unknown> = {
    id: clampStr(tx.receiver?.id, 'ACC-RECV1', 64),
    name: clampStr(tx.receiver?.name, 'Recipient Entity', 160),
    account: clampStr(tx.receiver?.account, '**** 1111', 40),
    bank: clampStr(tx.receiver?.bank, 'Commercial Bank', 160),
    country: clampStr(tx.receiver?.country, 'US', 16),
  };
  if (tx.receiver?.location) receiver.location = clampStr(tx.receiver.location, 'Unknown', 160);

  const riskFactors =
    Array.isArray(tx.riskFactors) && tx.riskFactors.length > 0
      ? tx.riskFactors.slice(0, 16).map((f) => clampStr(f, 'Standard signature verified', 300))
      : ['Standard signature verified'];

  const docData: Record<string, unknown> = {
    id: safeId,
    ownerId,
    timestamp: clampStr(tx.timestamp, new Date().toISOString(), 64),
    amount: Math.max(0.01, Number(tx.amount) || 1),
    currency,
    sender,
    receiver,
    category,
    merchant: clampStr(tx.merchant, String(receiver.name), 160),
    status,
    riskScore,
    fraudProbability,
    riskLevel,
    riskFactors,
    mlConfidence,
    processingTimeMs: Math.max(0, Number(tx.processingTimeMs) || 8.4),
  };

  if (Number.isFinite(tx.ruleScore)) docData.ruleScore = Math.max(0, tx.ruleScore as number);
  if (Number.isFinite(tx.mlScore)) docData.mlScore = Math.min(100, Math.max(0, tx.mlScore as number));
  if (tx.preprocessedFeatures && typeof tx.preprocessedFeatures === 'object' && !Array.isArray(tx.preprocessedFeatures)) {
    docData.preprocessedFeatures = JSON.parse(JSON.stringify(tx.preprocessedFeatures));
  }
  if (tx.geminiAnalysis) {
    const ga = tx.geminiAnalysis;
    const rec = VALID_RECOMMENDATIONS.has(ga.recommendation) ? ga.recommendation : 'MANUAL_VERIFICATION';
    const reasoning =
      Array.isArray(ga.reasoning) && ga.reasoning.length > 0
        ? ga.reasoning.slice(0, 10).map((r) => clampStr(r, 'Automated triage note', 500))
        : ['Automated triage completed'];
    const cleanGa: Record<string, unknown> = {
      summary: clampStr(ga.summary, 'Fraud risk analysis summary', 2000),
      reasoning,
      recommendation: rec,
      fraudPatternMatched: clampStr(ga.fraudPatternMatched, 'Behavioral Anomaly', 160),
      riskScoreAdjustment: Number(ga.riskScoreAdjustment) || 0,
    };
    if (ga.source) cleanGa.source = clampStr(ga.source, 'gemini', 80);
    if (typeof ga.cached === 'boolean') cleanGa.cached = ga.cached;
    docData.geminiAnalysis = cleanGa;
  }
  if (typeof tx.isSimulated === 'boolean') docData.isSimulated = tx.isSimulated;
  if (typeof tx.currentStage === 'number') {
    docData.currentStage = Math.min(7, Math.max(1, Math.round(tx.currentStage)));
  }
  if (Array.isArray(tx.stageHistory) && tx.stageHistory.length > 0) {
    docData.stageHistory = tx.stageHistory.slice(0, 7).map((st) => ({
      stage: Math.min(7, Math.max(1, Number(st.stage) || 1)),
      name: clampStr(st.name, 'Stage', 80),
      description: clampStr(st.description, 'Completed', 400),
      status: st.status || 'completed',
      timestamp: clampStr(st.timestamp, new Date().toISOString(), 64),
    }));
  }
  if (tx.verificationResult) {
    const vr: Record<string, unknown> = {
      decision: tx.verificationResult.decision || 'PENDING',
    };
    if (tx.verificationResult.reviewedBy) vr.reviewedBy = clampStr(tx.verificationResult.reviewedBy, 'Analyst', 120);
    if (tx.verificationResult.notes) vr.notes = clampStr(tx.verificationResult.notes, '', 500);
    if (tx.verificationResult.verifiedAt) vr.verifiedAt = clampStr(tx.verificationResult.verifiedAt, new Date().toISOString(), 64);
    docData.verificationResult = vr;
  }

  return docData;
}

export async function upsertUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}/private/profile`;
  const ref = doc(db, 'users', user.uid, 'private', 'profile');
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const payload: Record<string, unknown> = {
        uid: user.uid,
        email: clampStr(user.email, 'analyst@fraudshield.local', 254),
        displayName: clampStr(user.displayName || user.email?.split('@')[0], 'Security Analyst', 120),
        role: 'analyst',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (user.photoURL && user.photoURL.trim().length > 0) payload.photoURL = clampStr(user.photoURL, '', 1000);
      await setDoc(ref, payload);
    } else {
      const updatePayload: Record<string, unknown> = {
        displayName: clampStr(user.displayName || user.email?.split('@')[0], 'Security Analyst', 120),
        updatedAt: serverTimestamp(),
      };
      if (user.photoURL && user.photoURL.trim().length > 0) updatePayload.photoURL = clampStr(user.photoURL, '', 1000);
      await updateDoc(ref, updatePayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveTransactionToFirestore(tx: Transaction, ownerId: string): Promise<void> {
  const docId = toFirestoreTxDocId(ownerId, tx.id);
  const path = `transactions/${docId}`;
  const ref = doc(db, 'transactions', docId);
  try {
    const clean = sanitizeTransactionForFirestore(tx, ownerId);
    await setDoc(ref, {
      ...clean,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateTransactionVerificationInFirestore(tx: Transaction, ownerId: string): Promise<void> {
  const docId = toFirestoreTxDocId(ownerId, tx.id);
  const path = `transactions/${docId}`;
  const ref = doc(db, 'transactions', docId);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await saveTransactionToFirestore(tx, ownerId);
      return;
    }
    const clean = sanitizeTransactionForFirestore(tx, ownerId);
    const updatePayload: Record<string, unknown> = {
      status: clean.status,
      riskLevel: clean.riskLevel,
      currentStage: clean.currentStage ?? 7,
      updatedAt: serverTimestamp(),
    };
    if (clean.stageHistory) updatePayload.stageHistory = clean.stageHistory;
    if (clean.verificationResult) updatePayload.verificationResult = clean.verificationResult;
    await updateDoc(ref, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateTransactionGeminiInFirestore(tx: Transaction, ownerId: string): Promise<void> {
  const docId = toFirestoreTxDocId(ownerId, tx.id);
  const path = `transactions/${docId}`;
  const ref = doc(db, 'transactions', docId);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await saveTransactionToFirestore(tx, ownerId);
      return;
    }
    const clean = sanitizeTransactionForFirestore(tx, ownerId);
    if (!clean.geminiAnalysis) return;
    await updateDoc(ref, {
      geminiAnalysis: clean.geminiAnalysis,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveRuleToFirestore(rule: FraudRule, ownerId: string): Promise<void> {
  const docId = toFirestoreRuleDocId(ownerId, rule.id);
  const path = `fraudRules/${docId}`;
  const ref = doc(db, 'fraudRules', docId);
  try {
    const cleanId = sanitizeId(rule.id, 'R');
    const cleanRule = {
      id: cleanId,
      ownerId,
      name: clampStr(rule.name, 'Custom Rule', 120),
      description: typeof rule.description === 'string' ? rule.description.slice(0, 400) : '',
      category: clampStr(rule.category, 'Behavioral', 48),
      enabled: Boolean(rule.enabled),
      weight: Math.min(100, Math.max(1, Number(rule.weight) || 10)),
      condition: clampStr(rule.condition, 'amount > 0', 300),
      triggerCount: Math.max(0, Number(rule.triggerCount) || 0),
    };
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ...cleanRule,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        name: cleanRule.name,
        description: cleanRule.description,
        category: cleanRule.category,
        enabled: cleanRule.enabled,
        weight: cleanRule.weight,
        condition: cleanRule.condition,
        triggerCount: cleanRule.triggerCount,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncAllRulesToFirestore(rules: FraudRule[], ownerId: string): Promise<void> {
  for (const r of rules) {
    await saveRuleToFirestore(r, ownerId);
  }
}

export async function saveModelConfigToFirestore(
  metrics: MLModelMetrics,
  ownerId: string,
  estimators = 150
): Promise<void> {
  const path = `modelConfigs/${ownerId}`;
  const ref = doc(db, 'modelConfigs', ownerId);
  try {
    const alg = VALID_ALGORITHMS.has(metrics.algorithm) ? metrics.algorithm : 'RandomForestClassifier';
    const payload = {
      ownerId,
      algorithm: alg,
      estimators: Math.min(1000, Math.max(10, Number(estimators) || 150)),
      accuracy: Math.min(100, Math.max(0, Number(metrics.accuracy) || 98.4)),
      precision: Math.min(100, Math.max(0, Number(metrics.precision) || 96.8)),
      recall: Math.min(100, Math.max(0, Number(metrics.recall) || 94.3)),
      f1Score: Math.min(100, Math.max(0, Number(metrics.f1Score) || 95.5)),
      aucRoc: Math.min(1, Math.max(0, Number(metrics.aucRoc) || 0.991)),
      totalTrainedOn: Math.max(1, Number(metrics.totalTrainedOn) || 250000),
      lastTrained: clampStr(metrics.lastTrained, new Date().toISOString(), 64),
    };
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function seedInitialWorkspaceIfEmpty(
  ownerId: string,
  initialTransactions: Transaction[],
  initialRules: FraudRule[],
  initialMetrics: MLModelMetrics | null
): Promise<void> {
  let existingTxEmpty = false;
  try {
    const existingTxSnap = await getDocs(
      query(collection(db, 'transactions'), where('ownerId', '==', ownerId), limit(1))
    );
    existingTxEmpty = existingTxSnap.empty;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'transactions');
  }

  if (existingTxEmpty && initialTransactions.length > 0) {
    try {
      const txBatch = writeBatch(db);
      for (const tx of initialTransactions.slice(0, 15)) {
        const docId = toFirestoreTxDocId(ownerId, tx.id);
        const clean = sanitizeTransactionForFirestore(tx, ownerId);
        txBatch.set(doc(db, 'transactions', docId), {
          ...clean,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await txBatch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }
  }

  let existingRulesEmpty = false;
  try {
    const existingRulesSnap = await getDocs(
      query(collection(db, 'fraudRules'), where('ownerId', '==', ownerId), limit(1))
    );
    existingRulesEmpty = existingRulesSnap.empty;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'fraudRules');
  }

  if (existingRulesEmpty && initialRules.length > 0) {
    try {
      const rulesBatch = writeBatch(db);
      for (const r of initialRules) {
        const docId = toFirestoreRuleDocId(ownerId, r.id);
        rulesBatch.set(doc(db, 'fraudRules', docId), {
          id: sanitizeId(r.id, 'R'),
          ownerId,
          name: clampStr(r.name, 'Rule', 120),
          description: typeof r.description === 'string' ? r.description.slice(0, 400) : '',
          category: clampStr(r.category, 'Behavioral', 48),
          enabled: Boolean(r.enabled),
          weight: Math.min(100, Math.max(1, Number(r.weight) || 10)),
          condition: clampStr(r.condition, 'amount > 0', 300),
          triggerCount: Math.max(0, Number(r.triggerCount) || 0),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await rulesBatch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'fraudRules');
    }
  }

  if (initialMetrics) {
    const modelPath = `modelConfigs/${ownerId}`;
    const modelRef = doc(db, 'modelConfigs', ownerId);
    let modelExists = false;
    try {
      const modelSnap = await getDoc(modelRef);
      modelExists = modelSnap.exists();
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, modelPath);
    }
    if (!modelExists) {
      await saveModelConfigToFirestore(initialMetrics, ownerId);
    }
  }
}

export async function clearUserTransactionsInFirestore(ownerId: string): Promise<void> {
  const path = 'transactions';
  try {
    const snap = await getDocs(query(collection(db, 'transactions'), where('ownerId', '==', ownerId)));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

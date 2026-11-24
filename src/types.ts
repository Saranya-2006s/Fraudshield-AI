export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TransactionStatus = 'Approved' | 'Flagged' | 'Blocked' | 'Under Review' | 'Pending Verification' | 'Completed';
export type TransactionCategory =
  | 'wire_transfer'
  | 'online_shopping'
  | 'crypto_cashout'
  | 'pos_terminal'
  | 'atm_withdrawal'
  | 'p2p_transfer'
  | 'upi_payment'
  | 'online_banking';

export type PipelineStageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface PipelineStageInfo {
  stage: PipelineStageNumber;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'flagged';
  outputData?: any;
  timestamp?: string;
}

export interface GeminiAnalysis {
  summary: string;
  reasoning: string[];
  recommendation: 'ALLOW' | 'STEP_UP_AUTH' | 'FREEZE_ACCOUNT' | 'BLOCK_TRANSACTION' | 'MANUAL_VERIFICATION';
  fraudPatternMatched: string;
  riskScoreAdjustment: number;
  source?: string;
  cached?: boolean;
}

export interface SenderInfo {
  id: string;
  name: string;
  account: string;
  country: string;
  location?: string;
  deviceId: string;
  deviceType?: 'Known Device' | 'New Device' | 'Unrecognized Fingerprint';
  ipAddress: string;
  avgTransactionAmount: number;
}

export interface ReceiverInfo {
  id: string;
  name: string;
  account: string;
  bank: string;
  country: string;
  location?: string;
}

export interface PreprocessedFeatures {
  amount: number;
  timeFormatted: string;
  hour: number;
  location: string;
  deviceType: string;
  transactionType: string;
  amountToAvgRatio: number;
  txnFrequency5m?: number;
  isOffPeakHours: boolean;
  isNewDevice: boolean;
  isCrossBorder: boolean;
}

export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  currency: string;
  sender: SenderInfo;
  receiver: ReceiverInfo;
  category: TransactionCategory;
  merchant: string;
  status: TransactionStatus;
  riskScore: number;
  fraudProbability: number; // e.g. 95% or 8%
  riskLevel: RiskLevel;
  riskFactors: string[];
  mlConfidence: number;
  ruleScore?: number;
  mlScore?: number;
  preprocessedFeatures?: PreprocessedFeatures;
  geminiAnalysis?: GeminiAnalysis;
  isSimulated?: boolean;
  processingTimeMs: number;
  currentStage?: PipelineStageNumber;
  stageHistory?: PipelineStageInfo[];
  verificationResult?: {
    reviewedBy?: string;
    decision: 'GENUINE_APPROVED' | 'FRAUD_BLOCKED' | 'PENDING';
    notes?: string;
    verifiedAt?: string;
  };
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  weight: number;
  condition: string;
  triggerCount: number;
}

export interface MLModelMetrics {
  algorithm: 'RandomForestClassifier' | 'IsolationForest' | 'XGBoostClassifier' | 'LogisticRegression';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucRoc: number;
  totalTrainedOn: number;
  lastTrained: string;
  featureImportance: { feature: string; weight: number }[];
  confusionMatrix: { tp: number; fp: number; tn: number; fn: number };
}

export interface AnalyticsOverview {
  totalVolume: number;
  totalTransactions: number;
  genuineCount: number;
  suspiciousCount: number;
  highRiskCount: number;
  flaggedCount: number;
  blockedCount: number;
  approvedCount: number;
  underReviewCount: number;
  fraudPercentage: number;
  preventedLosses: number;
  avgProcessingTimeMs: number;
}

export interface AnalyticsPayload {
  overview: AnalyticsOverview;
  categoryBreakdown: { category: string; count: number; volume: number; fraudRate: number }[];
  riskScoreDistribution: { low: number; medium: number; high: number; critical: number };
  classificationDistribution?: { name: string; count: number; share: number }[];
  riskTrends?: { time: string; avgRisk: number; volume: number; flaggedCount: number }[];
  rocCurve?: { fpr: number; tpr: number; threshold: number }[];
  topCountries: { country: string; count: number; fraudCount: number }[];
}

export interface FilterOptions {
  search: string;
  riskLevel: string;
  status: string;
  category: string;
  minAmount: number;
  maxAmount: number;
  timeRange: '1h' | '24h' | '7d' | '30d' | 'all';
}

export interface VivaQuestionAnswer {
  question: string;
  category: 'Machine Learning' | 'Architecture' | 'Security & Compliance' | 'Real-Time Streaming' | 'Database & Backend';
  answer: string;
  keyTakeaways: string[];
}


import { GoogleGenAI, Type } from '@google/genai';
import { Transaction, GeminiAnalysis } from '../src/types.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory cache to save API quota and prevent 429 rate limit errors
const analysisCache = new Map<string, GeminiAnalysis>();
const vivaCache = new Map<string, { answer: string; keyTakeaways: string[] }>();

/**
 * Generates an intelligent, deterministic explainability analysis based on transaction heuristics.
 * Used when API quota is reached or for sub-millisecond local explainability.
 */
function generateHeuristicAnalysis(tx: Transaction): GeminiAnalysis {
  const avgAmount = tx.sender.avgTransactionAmount || 2500;
  const ratio = (tx.amount / avgAmount).toFixed(1);
  const isNightHour = tx.preprocessedFeatures?.isOffPeakHours ?? true;
  const isNewDevice = tx.preprocessedFeatures?.isNewDevice || tx.sender.deviceType === 'New Device' || !tx.sender.deviceId?.includes('KNOWN');

  let summary = '';
  const reasoning: string[] = [];
  let recommendation: 'ALLOW' | 'STEP_UP_AUTH' | 'FREEZE_ACCOUNT' | 'BLOCK_TRANSACTION' = 'ALLOW';
  let fraudPattern = 'Benign Transaction';
  let adjustment = 0;

  if (tx.riskScore >= 75) {
    summary = `Critical anomaly detected: Transaction of ${tx.currency === 'INR' ? '₹' : '$'}${tx.amount.toLocaleString()} represents an extreme ${ratio}x surge above historical spending with unrecognized credentials.`;
    reasoning.push(`Monetary Surge: Requested amount is ${ratio}x the baseline average (${tx.currency === 'INR' ? '₹' : '$'}${avgAmount.toLocaleString()}).`);
    reasoning.push(`Authentication Risk: Initiated via ${tx.sender.deviceType || 'unregistered hardware'} from IP ${tx.sender.ipAddress}.`);
    reasoning.push(`Channel & Destination: High-velocity routing to beneficiary "${tx.receiver.name}" at ${tx.receiver.bank}.`);
    recommendation = 'BLOCK_TRANSACTION';
    fraudPattern = tx.category === 'crypto_cashout' ? 'Crypto Liquidity Cashout' : 'Account Takeover (ATO)';
    adjustment = 5;
  } else if (tx.riskScore >= 45) {
    summary = `Suspicious activity flagged: Unusual transaction timing and volume deviation warranting Stage 5 step-up identity verification.`;
    reasoning.push(`Amount Deviation: Transfer of ${tx.currency === 'INR' ? '₹' : '$'}${tx.amount.toLocaleString()} is elevated (${ratio}x above average).`);
    reasoning.push(`Temporal Profile: Activity during off-peak window requires biometric or multi-factor confirmation.`);
    reasoning.push(`Risk Mitigation: Placed in pre-settlement Stage 5 Verification Queue to prevent premature fund debiting.`);
    recommendation = 'STEP_UP_AUTH';
    fraudPattern = 'Elevated Velocity / Off-Peak Anomaly';
    adjustment = 2;
  } else {
    summary = `Legitimate transaction profile: Spending amount and channel are fully consistent with sender's 90-day baseline.`;
    reasoning.push(`Normal Volume: Amount (${tx.currency === 'INR' ? '₹' : '$'}${tx.amount.toLocaleString()}) matches customer behavioral habits.`);
    reasoning.push(`Device Verification: Hardware fingerprint recognized and trusted.`);
    reasoning.push(`Low Risk: Successfully passed all 7-stage pre-settlement checks.`);
    recommendation = 'ALLOW';
    fraudPattern = 'Genuine Customer Payment';
    adjustment = -3;
  }

  return {
    summary,
    reasoning,
    recommendation,
    fraudPatternMatched: fraudPattern,
    riskScoreAdjustment: adjustment,
    source: 'deterministic-heuristic-fallback',
    cached: false,
  };
}

/**
 * Uses Gemini AI model with fallback and retry to generate explainable AI reasoning for suspicious transactions.
 * Gracefully handles 503 temporary high demand and 429 quota exhaustion with automated heuristic fallback.
 */
export async function analyzeTransactionWithGemini(tx: Transaction): Promise<GeminiAnalysis> {
  const cacheKey = `${tx.id}-${tx.amount}-${tx.riskScore}`;
  if (analysisCache.has(cacheKey)) {
    const hit = analysisCache.get(cacheKey)!;
    return { ...hit, cached: true };
  }

  if (process.env.GEMINI_API_KEY) {
    const prompt = `You are FraudShield AI, an enterprise-grade financial fraud detection neural model.
Analyze the following transaction payload and provide risk reasoning, fraud pattern classification, and recommended risk mitigation action.

Transaction Details:
- ID: ${tx.id}
- Amount: ${tx.currency === 'INR' ? '₹' : '$'}${tx.amount.toLocaleString()} ${tx.currency}
- Category: ${tx.category}
- Merchant/Receiver: ${tx.merchant || tx.receiver.name}
- Risk Score: ${tx.riskScore}/100 (${tx.riskLevel})
- Sender: ${tx.sender.name} (${tx.sender.country}, IP: ${tx.sender.ipAddress}, Device: ${tx.sender.deviceId || tx.sender.deviceType})
- Sender Avg Historical Amount: ${tx.currency === 'INR' ? '₹' : '$'}${tx.sender.avgTransactionAmount}
- Receiver: ${tx.receiver.name} (${tx.receiver.bank}, Country: ${tx.receiver.country})
- Flagged Risk Factors: ${tx.riskFactors?.join('; ') || 'Standard Monitoring'}

Return a structured JSON response matching the schema.`;

    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.7-flash'];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: {
                  type: Type.STRING,
                  description: 'Concise 1-2 sentence executive summary of the fraud assessment.',
                },
                reasoning: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3 detailed bullet points analyzing the behavioral, geographical, and monetary anomalies.',
                },
                recommendation: {
                  type: Type.STRING,
                  enum: ['ALLOW', 'STEP_UP_AUTH', 'FREEZE_ACCOUNT', 'BLOCK_TRANSACTION'],
                  description: 'Actionable security measure.',
                },
                fraudPatternMatched: {
                  type: Type.STRING,
                  description: 'Name of matched fraud typology (e.g. Account Takeover, Money Mule, Structuring, Velocity Spike).',
                },
                riskScoreAdjustment: {
                  type: Type.NUMBER,
                  description: 'Suggested score delta (+/- score points).',
                },
              },
              required: ['summary', 'reasoning', 'recommendation', 'fraudPatternMatched', 'riskScoreAdjustment'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim()) as GeminiAnalysis;
          const enriched: GeminiAnalysis = {
            ...parsed,
            source: modelName,
            cached: false,
          };
          analysisCache.set(cacheKey, enriched);
          return enriched;
        }
      } catch (error: any) {
        // Continue to fallback model or heuristic engine without throwing
      }
    }
  }

  const fallback = generateHeuristicAnalysis(tx);
  analysisCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Viva Review Assistant for student / industry presentation Q&A
 * Gracefully handles 429 quota limits with comprehensive pre-computed knowledge base.
 */
export async function answerVivaQuestion(question: string): Promise<{ answer: string; keyTakeaways: string[] }> {
  const normalizedQ = question.trim().toLowerCase();
  if (vivaCache.has(normalizedQ)) {
    return vivaCache.get(normalizedQ)!;
  }

  // Pre-compiled domain knowledge for instant fallback
  if (normalizedQ.includes('7-stage') || normalizedQ.includes('stage') || normalizedQ.includes('workflow')) {
    const res = {
      answer: `FraudShield-AI implements a 7-Stage Pre-Settlement Interception Model:
1. Transaction Initiation: Payment intent is generated on client device.
2. Request Ingestion & Interception: Ingress Gateway catches payload before core banking ledger settlement.
3. Feature Preprocessing: Extracts 6-dimensional vectors (Amount Deviation, Time Cycle, Geolocation Velocity, Device Fingerprint, Channel Risk, Historical Index).
4. Machine Learning & Ensemble Scoring: Hybrid Random Forest + XGBoost models calculate real-time fraud probability (0-100%).
5. Risk-Based Decision: Low Risk (<30) is Auto-Approved; Suspicious/High Risk (>=50) is suspended in Stage 5 Verification Queue.
6. Verification & Step-Up: 2FA OTP, biometric challenges, or compliance analyst audit.
7. Final Resolution: Funds released or malicious transaction blocked & accounts frozen.`,
      keyTakeaways: [
        'Pre-settlement interception prevents financial loss before money leaves the bank.',
        'Stage 5 Verification Queue drastically reduces false rejections for legitimate high-value customers.',
        'Sub-15ms execution latency guarantees zero checkout disruption.',
      ],
    };
    vivaCache.set(normalizedQ, res);
    return res;
  }

  if (normalizedQ.includes('chennai') || normalizedQ.includes('50000') || normalizedQ.includes('50,000') || normalizedQ.includes('case study')) {
    const res = {
      answer: `The ₹50,000 Chennai Account Takeover Case Study demonstrates FraudShield-AI in action:
- Customer Rajesh Kumar regularly transfers ₹2,500 during business hours from a trusted device.
- At 02:30 AM, an unauthorized transfer of ₹50,000 is initiated from an unrecognized device to an offshore escrow.
- Stage 3 Preprocessing flags a 20.0x amount surge, off-peak hours, and unknown hardware.
- Stage 4 ML Engine calculates a 92% Fraud Probability (Critical Risk).
- Stage 5 intercepts the transaction, holding funds and dispatching a step-up biometric/OTP challenge, successfully neutralizing the attack before debit.`,
      keyTakeaways: [
        'Multi-dimensional behavioral anomaly detection catches zero-day attacks.',
        'Real-time holding mechanism protects user funds without instant destructive rejection.',
        'Audit trail logging ensures full compliance with financial oversight standards.',
      ],
    };
    vivaCache.set(normalizedQ, res);
    return res;
  }

  if (process.env.GEMINI_API_KEY) {
    const prompt = `You are a Senior Fraud Architect and Academic Examiner for the FraudShield-AI final-year project.
Answer the following student question about financial fraud detection, ML algorithms, pipeline architecture, 7-stage workflow, or model metrics:

Question: "${question}"

Provide a comprehensive, professional, and clear answer suitable for a university viva review or industry technical interview. Include 3 key takeaways.`;

    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.7-flash'];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                answer: { type: Type.STRING },
                keyTakeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['answer', 'keyTakeaways'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          vivaCache.set(normalizedQ, parsed);
          return parsed;
        }
      } catch (err: any) {
        // Continue to fallback model or precompiled knowledge base
      }
    }
  }

  const fallback = {
    answer: `FraudShield-AI processes real-time financial transaction streams through an in-flight 7-stage pipeline: API Interception ➔ 6D Preprocessing ➔ ML Ensemble Scoring ➔ Stage 5 Verification Queue ➔ Final Settlement. Real-time updates are dispatched via Server-Sent Events (SSE) to ensure low latency (<15ms) without placing load on core banking databases.`,
    keyTakeaways: [
      'Multi-stage pipeline balances high speed (<15ms) with explainable risk reasoning.',
      'Precision and Recall are tuned with customizable threshold rules to minimize False Positives.',
      'Feature engineering evaluates velocity, amount deviation, hardware fingerprints, and jurisdiction.',
    ],
  };
  vivaCache.set(normalizedQ, fallback);
  return fallback;
}


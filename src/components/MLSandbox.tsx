import React, { useState } from 'react';
import { MLModelMetrics, Transaction, TransactionCategory } from '../types';
import { Cpu, Play, Upload, RefreshCw, Sparkles, CheckCircle, AlertTriangle, Layers, Database } from 'lucide-react';

interface MLSandboxProps {
  metrics: MLModelMetrics | null;
  onSimulateSingle: (raw: any) => Promise<Transaction>;
  onBatchProcess: (items: any[]) => Promise<any>;
  onRetrainModel: (algorithm: string, hyperparams: any) => Promise<any>;
}

export const MLSandbox: React.FC<MLSandboxProps> = ({
  metrics,
  onSimulateSingle,
  onBatchProcess,
  onRetrainModel,
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'model'>('single');

  // Single Simulation Form State
  const [formState, setFormState] = useState({
    amount: 15000,
    currency: 'USD',
    category: 'crypto_cashout' as TransactionCategory,
    senderName: 'Michael Corleone',
    senderCountry: 'US',
    senderAvgAmount: 1200,
    receiverName: 'Apex Cayman Vault',
    receiverCountry: 'KY',
    receiverBank: 'Cayman First Trust Bank',
    enableAiReasoning: true,
  });

  const [simulationResult, setSimulationResult] = useState<Transaction | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Batch CSV/JSON State
  const [batchJson, setBatchJson] = useState(`[
  {
    "amount": 28500,
    "category": "wire_transfer",
    "sender": { "name": "Elena Rostova", "country": "RU", "avgTransactionAmount": 800 },
    "receiver": { "name": "Panama Holdings Ltd", "country": "PAN", "bank": "BHD Panama" }
  },
  {
    "amount": 120,
    "category": "online_shopping",
    "sender": { "name": "John Smith", "country": "US", "avgTransactionAmount": 150 },
    "receiver": { "name": "Target Store", "country": "US", "bank": "Chase" }
  }
]`);
  const [batchResult, setBatchResult] = useState<any | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Retrain State
  const [selectedAlg, setSelectedAlg] = useState<string>('RandomForestClassifier');
  const [estimators, setEstimators] = useState(150);
  const [isRetraining, setIsRetraining] = useState(false);

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    const payload = {
      amount: formState.amount,
      currency: formState.currency,
      category: formState.category,
      merchant: formState.receiverName,
      sender: {
        name: formState.senderName,
        country: formState.senderCountry,
        avgTransactionAmount: formState.senderAvgAmount,
        account: '**** 9102',
        deviceId: 'DEV-SIMULATED-01',
        ipAddress: '185.220.101.5',
      },
      receiver: {
        name: formState.receiverName,
        country: formState.receiverCountry,
        bank: formState.receiverBank,
        account: '**** 4401',
      },
      enableAiReasoning: formState.enableAiReasoning,
    };

    const res = await onSimulateSingle(payload);
    setSimulationResult(res);
    setIsSimulating(false);
  };

  const handleRunBatch = async () => {
    setBatchError(null);
    try {
      const parsed = JSON.parse(batchJson);
      if (!Array.isArray(parsed)) {
        setBatchError('Batch payload must be a JSON array of transaction objects.');
        return;
      }
      setIsProcessingBatch(true);
      const res = await onBatchProcess(parsed);
      setBatchResult(res);
      setIsProcessingBatch(false);
    } catch {
      setBatchError('Invalid JSON formatting in batch input.');
      setIsProcessingBatch(false);
    }
  };

  const handleRetrainSubmit = async () => {
    setIsRetraining(true);
    await onRetrainModel(selectedAlg, { estimators });
    setIsRetraining(false);
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Machine Learning Sandbox & Testbed</h2>
            <p className="text-xs text-slate-400">Simulate single transactions, batch test dataset payloads, and train ML model parameters</p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'single' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Single Transaction Test
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'batch' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Batch Dataset Tester
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'model' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Model Retraining & Confusion Matrix
          </button>
        </div>
      </div>

      {/* Tab 1: Single Transaction Form */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleSimulateSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100 mb-2">Simulate Transaction Payload</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  value={formState.amount}
                  onChange={(e) => setFormState({ ...formState, amount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="crypto_cashout">Crypto Cashout</option>
                  <option value="wire_transfer">Wire Transfer</option>
                  <option value="online_shopping">Online Shopping</option>
                  <option value="p2p_transfer">P2P Transfer</option>
                  <option value="pos_terminal">POS Terminal</option>
                  <option value="atm_withdrawal">ATM Withdrawal</option>
                </select>
              </div>
            </div>

            {/* Sender Info */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">Sender Profile</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 text-[10px]">Name</label>
                  <input
                    type="text"
                    value={formState.senderName}
                    onChange={(e) => setFormState({ ...formState, senderName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px]">Country (ISO)</label>
                  <input
                    type="text"
                    value={formState.senderCountry}
                    onChange={(e) => setFormState({ ...formState, senderCountry: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px]">Historical Avg ($)</label>
                  <input
                    type="number"
                    value={formState.senderAvgAmount}
                    onChange={(e) => setFormState({ ...formState, senderAvgAmount: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Receiver Info */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">Recipient Profile</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 text-[10px]">Name / Merchant</label>
                  <input
                    type="text"
                    value={formState.receiverName}
                    onChange={(e) => setFormState({ ...formState, receiverName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px]">Country (ISO)</label>
                  <input
                    type="text"
                    value={formState.receiverCountry}
                    onChange={(e) => setFormState({ ...formState, receiverCountry: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px]">Bank Entity</label>
                  <input
                    type="text"
                    value={formState.receiverBank}
                    onChange={(e) => setFormState({ ...formState, receiverBank: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSimulating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Play className="w-4 h-4" />
              <span>{isSimulating ? 'Processing ML Prediction...' : 'Run ML Prediction & Gemini AI'}</span>
            </button>
          </form>

          {/* Simulation Output Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 mb-3">Model Scoring Output</h3>

            {!simulationResult ? (
              <div className="text-center py-20 text-slate-500 text-xs">
                Fill out the payload parameters and click Run ML Prediction to view risk probability score.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Calculated Fraud Score</span>
                    <span className="text-3xl font-black font-mono text-slate-100">
                      {simulationResult.riskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                    </span>
                    {typeof simulationResult.ruleScore === 'number' && typeof simulationResult.mlScore === 'number' && (
                      <span className="block text-[11px] font-mono text-slate-400 mt-1">
                        Rule Engine: {simulationResult.ruleScore} • ML Classifier: {simulationResult.mlScore}
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      simulationResult.riskLevel === 'CRITICAL'
                        ? 'bg-rose-500 text-white'
                        : simulationResult.riskLevel === 'HIGH'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-500 text-slate-950'
                    }`}
                  >
                    {simulationResult.riskLevel} Risk
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <span className="font-semibold text-slate-300 block">Triggered Risk Factors</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                    {simulationResult.riskFactors.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </div>

                {simulationResult.geminiAnalysis && (
                  <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5 text-indigo-300 font-bold">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>Gemini AI Explainable Rationale</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        {simulationResult.geminiAnalysis.source && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                            {simulationResult.geminiAnalysis.source}
                          </span>
                        )}
                        {simulationResult.geminiAnalysis.cached && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                            cached
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-200">{simulationResult.geminiAnalysis.summary}</p>

                    <div className="text-[11px] text-indigo-200 bg-indigo-950/80 p-2 rounded border border-indigo-800/40 font-mono">
                      Recommended Remediation: {simulationResult.geminiAnalysis.recommendation}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Batch Tester */}
      {activeTab === 'batch' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Batch JSON / CSV Dataset Payload</h3>
            <p className="text-slate-400 text-[11px]">Paste multiple transaction objects to test classifier throughput & batch predictions.</p>

            <textarea
              rows={10}
              value={batchJson}
              onChange={(e) => {
                setBatchJson(e.target.value);
                if (batchError) setBatchError(null);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:border-indigo-500"
            ></textarea>

            {batchError && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-300 text-[11px]">
                {batchError}
              </div>
            )}

            <button
              onClick={handleRunBatch}
              disabled={isProcessingBatch}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{isProcessingBatch ? 'Processing Batch...' : 'Process Batch Dataset'}</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 mb-3">Batch Processing Summary</h3>

            {!batchResult ? (
              <div className="text-center py-20 text-slate-500 text-xs">
                Run batch processing to view accuracy metrics and prediction breakdowns.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Total</span>
                    <span className="text-xl font-bold font-mono text-slate-100">{batchResult.summary.totalProcessed}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Blocked/Flagged</span>
                    <span className="text-xl font-bold font-mono text-rose-400">{batchResult.summary.blockedCount + batchResult.summary.flaggedCount}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Fraud Rate</span>
                    <span className="text-xl font-bold font-mono text-amber-400">{batchResult.summary.fraudRatePct}%</span>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {batchResult.transactions.map((tx: Transaction) => (
                    <div key={tx.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-mono font-bold text-slate-200">{tx.id}</span>
                        <span className="text-slate-400 ml-2">${tx.amount} ({tx.category})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.riskScore >= 55 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        Score: {tx.riskScore}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Model Retraining */}
      {activeTab === 'model' && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Hyperparameter & Algorithm Retraining</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Select Classifier Algorithm</label>
                <select
                  value={selectedAlg}
                  onChange={(e) => setSelectedAlg(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="RandomForestClassifier">Random Forest Ensemble (Recommended)</option>
                  <option value="XGBoostClassifier">XGBoost Gradient Boosting</option>
                  <option value="IsolationForest">Isolation Forest Anomaly Detector</option>
                  <option value="LogisticRegression">Logistic Regression Baseline</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estimators / Trees ({estimators})</label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="25"
                  value={estimators}
                  onChange={(e) => setEstimators(parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <button
                onClick={handleRetrainSubmit}
                disabled={isRetraining}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/30"
              >
                <RefreshCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
                <span>{isRetraining ? 'Training Model on 250k Samples...' : 'Retrain Classifier Model'}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Live Model Confusion Matrix & Metrics</h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl text-center">
                <span className="text-emerald-400 text-[10px] block">True Positive (TP)</span>
                <span className="text-lg font-bold font-mono text-emerald-300">{metrics.confusionMatrix.tp}</span>
              </div>
              <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl text-center">
                <span className="text-amber-400 text-[10px] block">False Positive (FP)</span>
                <span className="text-lg font-bold font-mono text-amber-300">{metrics.confusionMatrix.fp}</span>
              </div>
              <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl text-center">
                <span className="text-rose-400 text-[10px] block">False Negative (FN)</span>
                <span className="text-lg font-bold font-mono text-rose-300">{metrics.confusionMatrix.fn}</span>
              </div>
              <div className="bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-xl text-center">
                <span className="text-indigo-400 text-[10px] block">True Negative (TN)</span>
                <span className="text-lg font-bold font-mono text-indigo-300">{metrics.confusionMatrix.tn}</span>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Precision</span>
                <span className="font-bold font-mono text-slate-200">{metrics.precision}%</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Recall</span>
                <span className="font-bold font-mono text-slate-200">{metrics.recall}%</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">AUC-ROC</span>
                <span className="font-bold font-mono text-indigo-400">{metrics.aucRoc}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

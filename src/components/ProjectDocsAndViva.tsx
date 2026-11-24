import React, { useState } from 'react';
import { BookOpen, HelpCircle, Sparkles, Layers, FolderTree, ArrowRight, CheckCircle2, ShieldCheck, Send, ShieldAlert, Cpu, Database, Check } from 'lucide-react';

export const ProjectDocsAndViva: React.FC = () => {
  const [vivaQuestion, setVivaQuestion] = useState('');
  const [vivaResponse, setVivaResponse] = useState<{ answer: string; keyTakeaways: string[] } | null>(null);
  const [isLoadingViva, setIsLoadingViva] = useState(false);

  const sampleQuestions = [
    'Explain the 7-Stage FraudShield-AI workflow and why Stage 5 performs verification before completion.',
    'Walk through the ₹50,000 Chennai Account Takeover case study step-by-step.',
    'What 6 feature categories are extracted in Stage 3 Data Preprocessing?',
    'Why is "Flag -> Verify -> Act" superior to a naive "Fraud -> Immediate Reject" model in banking?',
    'How does FraudShield-AI achieve sub-50ms inference latency without blocking high-volume genuine users?',
  ];

  const handleAskViva = async (q: string) => {
    setVivaQuestion(q);
    setIsLoadingViva(true);
    try {
      const res = await fetch('/api/viva-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setVivaResponse(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingViva(false);
    }
  };

  const workflowStages = [
    { num: '1', title: 'Ingestion', desc: 'Payment request intercepted pre-settlement in real time before funds move.', icon: '📥' },
    { num: '2', title: 'Feature Preprocessing', desc: 'Extracts 6 risk vectors: 5m velocity, avg ratio, cross-border, category, time, device/IP.', icon: '⚙️' },
    { num: '3', title: 'Rule + ML Scoring', desc: '6 configurable weighted rules + RandomForest-style ML inference score 0–100 in < 15 ms.', icon: '🧠' },
    { num: '4', title: 'Risk Classification', desc: 'Low risk (< 50) passes automatically; suspicious & high risk (>= 50) routed to queue.', icon: '⚖️' },
    { num: '5', title: 'Step-Up Verification', desc: 'Step-up OTP verification & analyst triage paired with Gemini AI explainable rationale.', icon: '🛡️' },
    { num: '6', title: 'Decisioning', desc: 'Genuine verified transfers are approved; confirmed fraud is blocked and frozen.', icon: '✅' },
    { num: '7', title: 'Audit Tracking', desc: 'Complete stage history stored in 500-record audit log & streamed live over SSE.', icon: '📡' },
  ];

  const roadmapPhases = [
    { phase: 'Phase 1 (Week 1)', title: 'Planning & Core 7-Stage Spec', status: 'Completed', items: ['7-Stage Architecture Blueprint', 'Chennai Case Study Specs', 'Database Schema'] },
    { phase: 'Phase 2 (Week 2)', title: 'Frontend UI & Flow Visualizer', status: 'Completed', items: ['Interactive 7-Stage Flow Inspector', 'Verification Queue UI', 'Dashboard'] },
    { phase: 'Phase 3 (Week 3)', title: 'Backend APIs & Pipeline', status: 'Completed', items: ['Express 7-Stage Handlers', 'Stage 5 Verification Endpoint', 'Rules Engine'] },
    { phase: 'Phase 4 (Week 4)', title: 'ML Engine & Preprocessing', status: 'Completed', items: ['6-Dimensional Feature Extractor', 'Random Forest / XGBoost', 'Confusion Matrix'] },
    { phase: 'Phase 5 (Week 5)', title: 'Gemini AI Explainability', status: 'Completed', items: ['@google/genai Integration', 'Anomaly Root-Cause Reasoning', 'Viva Assistant'] },
    { phase: 'Phase 6 (Week 6)', title: 'Real-Time SSE Streaming', status: 'Completed', items: ['Live Broadcast Event Bus', 'Live Alert Feed', 'Chennai Test Scenario Injector'] },
    { phase: 'Phase 7 (Week 7)', title: 'Analytics & Viva Defense Prep', status: 'Completed', items: ['ROC Curve Visualizers', 'Metric Breakdowns', 'Viva Defense Q&A'] },
    { phase: 'Phase 8 (Week 8)', title: 'Production Deployment', status: 'Completed', items: ['Docker Containerization', 'Cloud Run Port 3000 Readiness', 'Final Project Report'] },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              FraudShield AI – Intelligent Real-Time Banking Fraud Detection & Risk Analysis
            </h2>
            <p className="text-xs text-slate-400">
              7-Stage Core Workflow Architecture, Feature Preprocessing, Case Studies, and Examiner Q&A
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full self-start md:self-auto">
          Anna University • Nov 2026
        </span>
      </div>

      {/* Academic Project Report Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Authors (B.Tech IT)</span>
          <p className="text-xs font-bold text-slate-100 mt-1">Saptha Preethi S (922523205142)</p>
          <p className="text-xs font-bold text-slate-100">Saranya S (922523205143)</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Project Supervisor</span>
          <p className="text-xs font-bold text-indigo-300 mt-1">Dr. P. Arockia Mary, M.E., Ph.D.</p>
          <p className="text-[11px] text-slate-400">Department of Information Technology</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Institution</span>
          <p className="text-xs font-bold text-slate-100 mt-1">V.S.B. Engineering College, Karur</p>
          <p className="text-[11px] text-slate-400">Affiliated to Anna University, Chennai</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Scoring Formula</span>
          <p className="text-xs font-bold font-mono text-amber-300 mt-1">Rule Score + ML Score</p>
          <p className="text-[11px] text-slate-400">Hybrid 6-Feature Classifier + Gemini XAI</p>
        </div>
      </div>

      {/* 7-Stage Core Architectural Specification */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">7-Stage FraudShield-AI Architecture Specification</h3>
          </div>
          <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30">
            Pre-Settlement Interception Model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 pt-2">
          {workflowStages.map((st) => (
            <div key={st.num} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{st.icon}</span>
                  <span className="text-[10px] font-mono font-bold bg-slate-800 text-indigo-400 px-1.5 py-0.5 rounded">
                    S{st.num}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200">{st.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Viva Assistant */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">AI Viva Review Assistant & Project Examiner</h3>
        </div>
        <p className="text-xs text-slate-300">
          Ask technical questions about FraudShield AI algorithms, system tradeoffs, feature engineering, or security compliance to prepare for your final review/viva.
        </p>

        {/* Sample Questions Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {sampleQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleAskViva(sq)}
              className="text-[11px] bg-slate-950/80 hover:bg-indigo-950/80 text-indigo-200 border border-indigo-500/30 px-3 py-1.5 rounded-xl transition-all text-left cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center space-x-2 pt-2">
          <input
            type="text"
            placeholder="Ask anything about FraudShield AI 7-stage architecture, ML metrics, or real-time streaming..."
            value={vivaQuestion}
            onChange={(e) => setVivaQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskViva(vivaQuestion)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleAskViva(vivaQuestion)}
            disabled={isLoadingViva || !vivaQuestion}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isLoadingViva ? 'Consulting AI...' : 'Ask AI'}</span>
          </button>
        </div>

        {/* Response Card */}
        {vivaResponse && (
          <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-xl space-y-3 text-xs text-slate-200">
            <h4 className="font-bold text-indigo-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Examiner Response</span>
            </h4>

            <p className="leading-relaxed text-slate-300 whitespace-pre-line">{vivaResponse.answer}</p>

            <div className="bg-indigo-950/50 p-3 rounded-lg border border-indigo-800/40 space-y-1.5">
              <span className="font-bold text-indigo-300 text-[11px] block">Key Viva Defense Takeaways:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {vivaResponse.keyTakeaways.map((kt, i) => (
                  <li key={i}>{kt}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Feature Preprocessing & Chennai Case Study Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6 Preprocessing Dimensions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">Stage 3 Feature Preprocessing Dimensions</h3>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-3">
              <span className="font-mono text-indigo-400 font-bold">1.</span>
              <div>
                <span className="font-bold text-slate-200">Transaction Amount & Deviation:</span>
                <p className="text-slate-400 text-[11px]">Calculates ratio against customer 90-day moving average (`amount / avgAmount`). Flags &gt;10x surges.</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-3">
              <span className="font-mono text-indigo-400 font-bold">2.</span>
              <div>
                <span className="font-bold text-slate-200">Time & Hour of Day:</span>
                <p className="text-slate-400 text-[11px]">Extracts 24-hour cycle and flags dormant-hour transfers (00:00 - 05:00 AM).</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-3">
              <span className="font-mono text-indigo-400 font-bold">3.</span>
              <div>
                <span className="font-bold text-slate-200">Geographic & IP Velocity:</span>
                <p className="text-slate-400 text-[11px]">Calculates impossible travel speed (km/h) between successive transactions (e.g. Chennai to Moscow).</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-3">
              <span className="font-mono text-indigo-400 font-bold">4.</span>
              <div>
                <span className="font-bold text-slate-200">Device & Browser Fingerprint:</span>
                <p className="text-slate-400 text-[11px]">Checks if device ID or hardware hash has ever been seen on customer profile.</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-3">
              <span className="font-mono text-indigo-400 font-bold">5.</span>
              <div>
                <span className="font-bold text-slate-200">Transaction Type & Channel:</span>
                <p className="text-slate-400 text-[11px]">Online banking, Wire, POS, Crypto Cashout weighted with domain-specific baseline risk.</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-3">
              <span className="font-mono text-indigo-400 font-bold">6.</span>
              <div>
                <span className="font-bold text-slate-200">Historical Profile & Risk Index:</span>
                <p className="text-slate-400 text-[11px]">Past chargebacks, prior dispute flags, and rapid velocity count in the past 60 minutes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 8-Week Development Roadmap */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100">8-Week Project Development Roadmap</h3>

          <div className="grid grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {roadmapPhases.map((phase, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] font-mono text-indigo-400 font-semibold block">{phase.phase}</span>
                <span className="font-bold text-slate-100 block mt-0.5">{phase.title}</span>
                <div className="mt-2 space-y-0.5 text-[10px] text-slate-400">
                  {phase.items.map((item, i) => (
                    <div key={i} className="flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Presentation Highlights & Technology Stack (Slides 9 & 11) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-100">System Highlights &amp; Technology Stack</h3>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">&lt; 15 ms Inference</span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">7 Pipeline Stages</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">6 Configurable Rules</span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30">0–100 Risk Score</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Frontend</span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• React 19 &amp; TypeScript</li>
              <li>• Tailwind CSS v4</li>
              <li>• Recharts &amp; Motion</li>
            </ul>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Backend</span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• Node.js + Express REST API</li>
              <li>• Server-Sent Events (SSE)</li>
              <li>• Vite + esbuild build</li>
            </ul>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">AI / ML</span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• RandomForest-style 6-feature model</li>
              <li>• Google GenAI (Gemini) + fallback</li>
              <li>• ML Sandbox &amp; retraining</li>
            </ul>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Data &amp; Audit</span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• In-memory stores (500-txn cap)</li>
              <li>• Seeded baseline + live simulation</li>
              <li>• Full 7-stage audit trail</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Advantages, Limitations & Future Enhancements (Slides 12–14) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-emerald-400">Advantages</h3>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            <li>✓ Real-time detection before payment completes</li>
            <li>✓ Fewer false positives via step-up verification</li>
            <li>✓ Hybrid rules + ML catches known &amp; novel fraud</li>
            <li>✓ Explainable decisions with Gemini &amp; fallback</li>
            <li>✓ Tunable rule weights, retraining &amp; full SSE audit trail</li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-amber-400">Current Limitations</h3>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            <li>• Evaluated on synthetic &amp; seeded simulation streams</li>
            <li>• In-memory storage resets on restart (500-txn cap)</li>
            <li>• External AI dependency falls back to deterministic logic</li>
            <li>• Single-session prototype scale prior to bank DB integration</li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-indigo-400">Future Enhancements</h3>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            <li>1. Persistent database with role-based access control</li>
            <li>2. Real banking data &amp; graph-based deep learning</li>
            <li>3. Apache Kafka event streaming for horizontal scale</li>
            <li>4. Automated drift monitoring &amp; federated learning</li>
            <li>5. Real-time customer alert mobile companion app</li>
          </ul>
        </div>
      </div>
    </div>
  );
};


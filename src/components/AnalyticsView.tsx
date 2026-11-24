import React from 'react';
import { MLModelMetrics, AnalyticsOverview, AnalyticsPayload } from '../types';
import { BarChart3, Award, TrendingUp, PieChart as PieIcon, Activity, Grid } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
  Cell,
} from 'recharts';

interface AnalyticsViewProps {
  analytics: AnalyticsOverview | null;
  analyticsPayload?: AnalyticsPayload | null;
  metrics: MLModelMetrics | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, analyticsPayload, metrics }) => {
  if (!analytics || !metrics) return null;

  const countryData = [
    { country: 'Cayman Islands (KY)', fraudCount: 42, volume: 184000 },
    { country: 'Cyprus (CY)', fraudCount: 38, volume: 142000 },
    { country: 'Panama (PAN)', fraudCount: 29, volume: 98000 },
    { country: 'Russia (RU)', fraudCount: 31, volume: 110000 },
    { country: 'United States (US)', fraudCount: 12, volume: 45000 },
    { country: 'United Kingdom (GB)', fraudCount: 9, volume: 32000 },
  ];

  const classificationData = analyticsPayload?.classificationDistribution || [
    { name: 'Genuine', count: analytics.genuineCount || 1170, share: 90.6 },
    { name: 'Suspicious', count: analytics.suspiciousCount || 55, share: 5.8 },
    { name: 'High-risk', count: analytics.highRiskCount || 25, share: 3.6 },
  ];

  const classificationColors = ['#10b981', '#f59e0b', '#f43f5e'];

  const riskTrends = analyticsPayload?.riskTrends && analyticsPayload.riskTrends.length > 0
    ? analyticsPayload.riskTrends
    : [
        { time: 'T-7', avgRisk: 22, volume: 12400, flaggedCount: 1 },
        { time: 'T-6', avgRisk: 31, volume: 18200, flaggedCount: 2 },
        { time: 'T-5', avgRisk: 64, volume: 42000, flaggedCount: 4 },
        { time: 'T-4', avgRisk: 28, volume: 15600, flaggedCount: 1 },
        { time: 'T-3', avgRisk: 52, volume: 31400, flaggedCount: 3 },
        { time: 'T-2', avgRisk: 45, volume: 27900, flaggedCount: 2 },
        { time: 'T-1', avgRisk: 38, volume: 21500, flaggedCount: 2 },
      ];

  const rocCurveData = analyticsPayload?.rocCurve || [
    { fpr: 0, tpr: 0, threshold: 0.99 },
    { fpr: 0.02, tpr: 0.89, threshold: 0.85 },
    { fpr: 0.05, tpr: 0.94, threshold: 0.75 },
    { fpr: 0.1, tpr: 0.97, threshold: 0.65 },
    { fpr: 0.2, tpr: 0.985, threshold: 0.5 },
    { fpr: 0.35, tpr: 0.992, threshold: 0.35 },
    { fpr: 0.5, tpr: 0.996, threshold: 0.2 },
    { fpr: 0.75, tpr: 0.999, threshold: 0.1 },
    { fpr: 1, tpr: 1, threshold: 0.01 },
  ];

  const { tp, fp, tn, fn } = metrics.confusionMatrix;
  const falsePositiveRate = Number(((fp / Math.max(1, fp + tn)) * 100).toFixed(3));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">FraudShield Analytics &amp; ROC Evaluation</h2>
            <p className="text-xs text-slate-400">
              Risk trends, classification distribution, feature importance, confusion matrix metrics, and ROC curve
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs text-indigo-300">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>
              F1 Score: <strong className="font-mono">{metrics.f1Score}%</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs text-emerald-300">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>
              AUC-ROC: <strong className="font-mono">{metrics.aucRoc}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Row 1: Risk Trends & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trends */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">Risk Trends Over Recent Traffic</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Average risk score progression across live transaction windows</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrends}>
                <defs>
                  <linearGradient id="riskTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgRisk"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#riskTrendGrad)"
                  name="Avg Risk Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROC Curve */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">ROC Curve ({metrics.algorithm})</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              AUC = {metrics.aucRoc}
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">True Positive Rate (TPR) vs False Positive Rate (FPR) across thresholds</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis
                  dataKey="fpr"
                  type="number"
                  domain={[0, 1]}
                  stroke="#94a3b8"
                  fontSize={11}
                  label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 1]}
                  stroke="#94a3b8"
                  fontSize={11}
                  label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tpr"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  name="True Positive Rate"
                />
                <Line
                  type="linear"
                  dataKey="fpr"
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                  name="Random Baseline"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Fraud Classification Distribution & Confusion Matrix Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fraud Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-1">
            <PieIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">Fraud Classification Share</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Traffic share across Genuine, Suspicious, and High-risk classes</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classificationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Transactions">
                  {classificationData.map((entry, idx) => (
                    <Cell key={entry.name} fill={classificationColors[idx % classificationColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix & Evaluation Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Grid className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100">Confusion Matrix &amp; Classification Metrics</h3>
            </div>
            <p className="text-xs text-slate-400">
              Evaluated on {metrics.totalTrainedOn.toLocaleString()} samples ({metrics.algorithm})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl text-center">
              <span className="text-emerald-400 text-[10px] block">True Positive (TP)</span>
              <span className="text-lg font-bold font-mono text-emerald-300">{tp.toLocaleString()}</span>
            </div>
            <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl text-center">
              <span className="text-amber-400 text-[10px] block">False Positive (FP)</span>
              <span className="text-lg font-bold font-mono text-amber-300">{fp.toLocaleString()}</span>
            </div>
            <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl text-center">
              <span className="text-rose-400 text-[10px] block">False Negative (FN)</span>
              <span className="text-lg font-bold font-mono text-rose-300">{fn.toLocaleString()}</span>
            </div>
            <div className="bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-xl text-center">
              <span className="text-indigo-400 text-[10px] block">True Negative (TN)</span>
              <span className="text-lg font-bold font-mono text-indigo-300">{tn.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Accuracy</span>
              <span className="font-bold font-mono text-slate-200">{metrics.accuracy}%</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Precision</span>
              <span className="font-bold font-mono text-slate-200">{metrics.precision}%</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Recall</span>
              <span className="font-bold font-mono text-slate-200">{metrics.recall}%</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">F1-Score</span>
              <span className="font-bold font-mono text-indigo-300">{metrics.f1Score}%</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">FPR</span>
              <span className="font-bold font-mono text-amber-300">{falsePositiveRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Feature Importance & Jurisdictional Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 mb-1">Random Forest Feature Importance Weights</h3>
          <p className="text-xs text-slate-400 mb-4">Gini impurity reduction across 6 preprocessed feature variables</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={metrics.featureImportance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={11} width={140} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="weight" fill="#6366f1" radius={[0, 6, 6, 0]} name="Weight" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic Fraud Heat Map Data */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 mb-1">High-Risk Jurisdictional Volume</h3>
          <p className="text-xs text-slate-400 mb-4">Cross-border destination risk distribution</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="country" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="volume" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Loss Exposure ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

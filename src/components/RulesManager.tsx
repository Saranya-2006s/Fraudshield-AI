import React, { useState } from 'react';
import { FraudRule } from '../types';
import { Sliders, Plus, ToggleLeft, ToggleRight, Trash2, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

interface RulesManagerProps {
  rules: FraudRule[];
  onUpdateRules: (rules: FraudRule[]) => void;
}

export const RulesManager: React.FC<RulesManagerProps> = ({ rules, onUpdateRules }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    category: 'Behavioral',
    weight: 20,
    condition: '',
  });

  const handleToggleRule = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    onUpdateRules(updated);
  };

  const handleWeightChange = (id: string, weight: number) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, weight } : r));
    onUpdateRules(updated);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name || !newRule.condition) return;

    const rule: FraudRule = {
      id: `R${Math.floor(100 + Math.random() * 900)}`,
      name: newRule.name,
      description: newRule.description || 'Custom heuristic rule',
      category: newRule.category,
      enabled: true,
      weight: newRule.weight,
      condition: newRule.condition,
      triggerCount: 0,
    };

    onUpdateRules([...rules, rule]);
    setShowAddModal(false);
    setNewRule({ name: '', description: '', category: 'Behavioral', weight: 20, condition: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Fraud Detection Rules Engine</h2>
            <p className="text-xs text-slate-400">Configure weighted heuristics, anomaly thresholds, and automated risk scoring rules</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Fraud Rule</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-5 rounded-2xl border transition-all ${
              rule.enabled
                ? 'bg-slate-900 border-slate-800 shadow-lg hover:border-slate-700'
                : 'bg-slate-950/50 border-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">{rule.id}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                    {rule.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-1">{rule.name}</h3>
              </div>

              <button
                onClick={() => handleToggleRule(rule.id)}
                className="text-slate-400 hover:text-indigo-400 transition-colors"
                title={rule.enabled ? 'Disable Rule' : 'Enable Rule'}
              >
                {rule.enabled ? (
                  <ToggleRight className="w-8 h-8 text-indigo-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">{rule.description}</p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 mb-4 overflow-x-auto">
              {rule.condition}
            </div>

            {/* Weight Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Risk Score Impact (Weight):</span>
                <span className="font-bold text-indigo-400 font-mono">+{rule.weight} points</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={rule.weight}
                disabled={!rule.enabled}
                onChange={(e) => handleWeightChange(rule.id, parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer disabled:opacity-30"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Triggered Count: <strong className="text-slate-300 font-mono">{rule.triggerCount}</strong></span>
              <span className={rule.enabled ? 'text-emerald-400' : 'text-slate-500'}>
                {rule.enabled ? '• Active in Rule Chain' : '• Suspended'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Create New Custom Fraud Rule</h3>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Velocity Check (> 5 txns/hr)"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={newRule.category}
                  onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Behavioral">Behavioral</option>
                  <option value="Financial">Financial</option>
                  <option value="Geographic">Geographic</option>
                  <option value="Temporal">Temporal</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short rationale for rule"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">DSL Condition Expression</label>
                <input
                  type="text"
                  required
                  placeholder="amount > sender.avg * 8 AND category == 'wire'"
                  value={newRule.condition}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Weight Score (+{newRule.weight})</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={newRule.weight}
                  onChange={(e) => setNewRule({ ...newRule, weight: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Transaction, TransactionCategory } from '../types';
import { 
  X, 
  Zap, 
  Send, 
  ShieldAlert, 
  Smartphone, 
  Clock, 
  MapPin, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface LiveTransactionInitiatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTransaction: (txData: any) => Promise<void>;
  onNavigateWorkflow: () => void;
}

export const LiveTransactionInitiator: React.FC<LiveTransactionInitiatorProps> = ({
  isOpen,
  onClose,
  onSubmitTransaction,
  onNavigateWorkflow,
}) => {
  const [amount, setAmount] = useState<number>(50000);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [senderName, setSenderName] = useState<string>('Rajesh Kumar');
  const [senderLocation, setSenderLocation] = useState<string>('Chennai, India');
  const [deviceType, setDeviceType] = useState<'Known Device' | 'New Device' | 'Unrecognized Fingerprint'>('New Device');
  const [category, setCategory] = useState<TransactionCategory>('online_banking');
  const [merchant, setMerchant] = useState<string>('Online Transfer Portal');
  const [timeHour, setTimeHour] = useState<string>('02:30 AM');
  const [avgAmount, setAvgAmount] = useState<number>(2500);
  const [receiverName, setReceiverName] = useState<string>('Offshore P2P Merchant Escrow');
  const [receiverCountry, setReceiverCountry] = useState<string>('IN');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  if (!isOpen) return null;

  // Preset 1: User's explicit case study (₹50,000 Chennai ATO at 02:30 AM on New Device)
  const applyPresetChennaiATO = () => {
    setAmount(50000);
    setCurrency('INR');
    setSenderName('Rajesh Kumar');
    setSenderLocation('Chennai, India');
    setDeviceType('New Device');
    setCategory('online_banking');
    setMerchant('Online Transfer Portal');
    setTimeHour('02:30 AM');
    setAvgAmount(2500);
    setReceiverName('Offshore P2P Merchant Escrow');
    setReceiverCountry('IN');
  };

  // Preset 2: Low Risk Grocery ₹500
  const applyPresetGrocery = () => {
    setAmount(500);
    setCurrency('INR');
    setSenderName('Ananya Sharma');
    setSenderLocation('Bengaluru, India');
    setDeviceType('Known Device');
    setCategory('upi_payment');
    setMerchant('Blinkit Instant Groceries');
    setTimeHour('11:15 AM');
    setAvgAmount(600);
    setReceiverName('Blinkit Store #401');
    setReceiverCountry('IN');
  };

  // Preset 3: Offshore Crypto Cashout $18,450
  const applyPresetOffshoreCrypto = () => {
    setAmount(18450);
    setCurrency('USD');
    setSenderName('Alexander Wright');
    setSenderLocation('New York, USA');
    setDeviceType('Unrecognized Fingerprint');
    setCategory('crypto_cashout');
    setMerchant('Nexus Crypto Exchange');
    setTimeHour('03:12 AM');
    setAvgAmount(1200);
    setReceiverName('Nexus Offshore Vault');
    setReceiverCountry('KY');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const payload = {
        amount,
        currency,
        category,
        merchant,
        time: timeHour,
        timeHour,
        enableAiReasoning: true,
        isSimulated: true,
        sender: {
          name: senderName,
          country: senderLocation.includes('India') ? 'IN' : 'US',
          location: senderLocation,
          deviceId: deviceType === 'Known Device' ? 'DEV-KNOWN-PHONE-1' : 'DEV-NEW-ANDROID-91',
          deviceType,
          ipAddress: '157.48.201.44',
          avgTransactionAmount: avgAmount,
        },
        receiver: {
          name: receiverName,
          country: receiverCountry,
          bank: 'Global Commercial Bank',
        },
      };

      await onSubmitTransaction(payload);
      setIsSubmitting(false);
      setSubmissionResult({
        success: true,
        amount,
        currency,
        senderName,
      });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl relative">
        {/* Modal Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-5 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Initiate Transaction & Launch 7-Stage Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                Trigger real-time early fraud detection before funds are finalized
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Scenario Preset Chips */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/50">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Load Preset Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyPresetChennaiATO}
              className="px-3 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800/60 transition-all cursor-pointer"
            >
              🚨 Preset 1: Chennai ATO (₹50,000, 02:30 AM, New Device)
            </button>
            <button
              type="button"
              onClick={applyPresetGrocery}
              className="px-3 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-800/60 transition-all cursor-pointer"
            >
              ✅ Preset 2: Grocery UPI (₹500, Known Device)
            </button>
            <button
              type="button"
              onClick={applyPresetOffshoreCrypto}
              className="px-3 py-1.5 bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 text-xs font-semibold rounded-lg border border-purple-800/60 transition-all cursor-pointer"
            >
              ⚠️ Preset 3: Crypto Cashout ($18,450, Cayman)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount & Currency */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Transaction Amount *
              </label>
              <div className="flex space-x-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500"
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                </select>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-indigo-500"
                  placeholder="e.g. 50000"
                />
              </div>
            </div>

            {/* Baseline Average */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                User Baseline Historical Average ({currency}) *
              </label>
              <input
                type="number"
                required
                value={avgAmount}
                onChange={(e) => setAvgAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:border-indigo-500"
                placeholder="e.g. 2500"
              />
              <span className="text-[10px] text-indigo-400 mt-1 block">
                Calculated Amount Spike: {avgAmount > 0 ? (amount / avgAmount).toFixed(1) : '0'}x normal
              </span>
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Sender Name *
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500"
              />
            </div>

            {/* Sender Location */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Location (Stage 2 Feature) *
              </label>
              <input
                type="text"
                required
                value={senderLocation}
                onChange={(e) => setSenderLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500"
                placeholder="e.g. Chennai, India"
              />
            </div>

            {/* Device Hardware Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Device Fingerprint Signature *
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500"
              >
                <option value="New Device">New Device (Unregistered Hardware)</option>
                <option value="Known Device">Known Device (Registered Biometrics)</option>
                <option value="Unrecognized Fingerprint">Unrecognized Fingerprint / Proxy</option>
              </select>
            </div>

            {/* Time of Transaction */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Time of Transaction *
              </label>
              <input
                type="text"
                value={timeHour}
                onChange={(e) => setTimeHour(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:border-indigo-500"
                placeholder="e.g. 02:30 AM"
              />
            </div>

            {/* Category / Transaction Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Transaction Type / Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500"
              >
                <option value="online_banking">Online Banking Transfer</option>
                <option value="upi_payment">UPI / Instant Pay</option>
                <option value="crypto_cashout">Crypto Cashout / Offshore</option>
                <option value="wire_transfer">Wire Transfer</option>
                <option value="pos_terminal">POS Terminal Swipe</option>
                <option value="online_shopping">Online E-Commerce Purchase</option>
              </select>
            </div>

            {/* Receiver Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Recipient / Beneficiary *
              </label>
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submission Success Toast */}
          {submissionResult && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>Transaction Ingested into 7-Stage Pipeline!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Analyzed {submissionResult.currency} {submissionResult.amount.toLocaleString()} for {submissionResult.senderName}. 
                Now viewing in Real-Time Flowchart.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateWorkflow();
                }}
                className="flex items-center space-x-1 font-semibold text-emerald-300 hover:text-emerald-200 underline cursor-pointer pt-1"
              >
                <span>View Stage Progression in Flow Visualizer ➔</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Intercepting & Evaluating...' : 'Execute 7-Stage Pipeline'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

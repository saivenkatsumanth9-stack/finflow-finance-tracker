import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Plus, 
  Trash2, 
  Check, 
  CalendarClock, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  X,
  CreditCard
} from 'lucide-react';

export default function RecurringBills() {
  const { 
    recurringBills, 
    addRecurringBill, 
    deleteRecurringBill, 
    markBillAsPaid, 
    transactions, 
    profile,
    budgets
  } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add Form state
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState('monthly');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Utilities');

  // 1. Calculate Monthly Overhead
  const totalMonthlyOverhead = useMemo(() => {
    return recurringBills.reduce((sum, bill) => {
      let monthlyCost = bill.amount;
      if (bill.cycle === 'weekly') monthlyCost = bill.amount * 4.33; // ~4.33 weeks per month
      else if (bill.cycle === 'yearly') monthlyCost = bill.amount / 12;
      return sum + monthlyCost;
    }, 0);
  }, [recurringBills]);

  // Helper: Get days remaining count
  const getDaysDiff = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper: Format countdown badge
  const getCountdownBadge = (dateStr) => {
    const diff = getDaysDiff(dateStr);
    if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, type: 'overdue' };
    if (diff === 0) return { label: 'due today', type: 'today' };
    if (diff === 1) return { label: 'due tomorrow', type: 'tomorrow' };
    return { label: `in ${diff} days`, type: 'upcoming' };
  };

  // 2. Auto-Detect repeating bills from transactions history
  const suggestions = useMemo(() => {
    // Group transactions by merchant
    const merchantCounts = {};
    const merchantAmounts = {};
    const merchantCategories = {};

    // Only scan expenses that are not explicitly marked as recurring yet
    transactions
      .filter(tx => tx.type === 'expense' && !tx.isRecurring)
      .forEach(tx => {
        const key = tx.merchant.toLowerCase().trim();
        merchantCounts[key] = (merchantCounts[key] || 0) + 1;
        merchantAmounts[key] = tx.amount; // capture latest amount
        merchantCategories[key] = tx.category;
      });

    const list = [];
    Object.keys(merchantCounts).forEach(key => {
      // Suggest if purchased >= 2 times, and not already in recurring bills list
      const alreadyRegistered = recurringBills.some(b => b.merchant.toLowerCase().trim() === key);
      
      // Match merchant name clean caps
      const matchTx = transactions.find(t => t.merchant.toLowerCase().trim() === key);
      const cleanName = matchTx ? matchTx.merchant : key;

      if (merchantCounts[key] >= 2 && !alreadyRegistered && key !== 'miscellaneous expense') {
        list.push({
          merchant: cleanName,
          amount: merchantAmounts[key],
          category: merchantCategories[key] || 'Utilities',
          count: merchantCounts[key]
        });
      }
    });

    return list.slice(0, 3); // show top 3 suggestions
  }, [transactions, recurringBills]);

  // Form submit handler
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!merchant || !amount || !dueDate) return;

    addRecurringBill({
      merchant,
      amount: Number(amount),
      cycle,
      nextDueDate: new Date(dueDate).toISOString(),
      category
    });

    // Reset Form
    setMerchant('');
    setAmount('');
    setCycle('monthly');
    setDueDate('');
    setCategory('Utilities');
    setShowAddModal(false);
  };

  const handleApplySuggestion = (sug) => {
    // Auto sets next due date to 1 month from now
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);

    addRecurringBill({
      merchant: sug.merchant,
      amount: sug.amount,
      cycle: 'monthly',
      nextDueDate: nextDate.toISOString(),
      category: sug.category
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary tracking-tight">Bills Tracker</h1>
          <p className="text-text-muted text-sm mt-0.5">Manage subsciptions and recurring utilities invoices.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-accent hover:bg-accent/90 text-text-primary py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-transform hover:scale-[1.02] neon-glow"
        >
          <Plus className="w-4 h-4" /> Add Bill
        </button>
      </div>

      {/* Summary Banner */}
      <div className="bg-surface p-5 rounded-2xl border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] text-text-muted font-semibold uppercase block">Monthly Overhead Cost</span>
          <span className="font-mono text-2xl md:text-3xl font-bold text-text-primary mt-1 block">
            {profile.currency}{Math.round(totalMonthlyOverhead).toLocaleString('en-IN')}
            <span className="text-xs text-text-muted font-sans font-normal"> / month</span>
          </span>
        </div>

        <div className="bg-surface-2 px-4 py-2 rounded-xl border border-border text-xs text-text-muted">
          Active Subscriptions: <strong className="text-text-primary">{recurringBills.length}</strong>
        </div>
      </div>

      {/* Auto-detect suggestions banner */}
      {suggestions.length > 0 && (
        <div className="bg-surface p-5 rounded-2xl border border-accent/20 space-y-3 shadow-inner select-none">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-2" />
            <h3 className="font-display font-bold text-sm text-text-primary">Auto-Detected Recurring Spends</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            FinFlow scanned your recent transaction logs and identified repeating purchases. Would you like to track them as monthly subscriptions?
          </p>
          
          <div className="flex flex-col gap-2 pt-1">
            {suggestions.map(sug => (
              <div 
                key={sug.merchant} 
                className="flex items-center justify-between bg-surface-2 border border-border/80 p-2.5 rounded-xl text-xs hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-bg-app text-[10px] font-bold text-accent font-mono">x{sug.count} repeats</span>
                  <span className="font-bold text-text-primary">{sug.merchant}</span>
                  <span className="text-text-muted font-mono">• {profile.currency}{sug.amount}</span>
                </div>
                <button
                  onClick={() => handleApplySuggestion(sug)}
                  className="bg-accent/15 hover:bg-accent hover:text-text-primary border border-accent/25 text-accent text-[10px] py-1 px-3 rounded-lg flex items-center gap-1 transition-all"
                >
                  Track Bill <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bills Cards Grid */}
      {recurringBills.length === 0 ? (
        <div className="bg-surface p-12 rounded-2xl border border-border text-center flex flex-col items-center justify-center py-20">
          <CalendarClock className="w-16 h-16 text-text-muted/20 mb-4" />
          <h3 className="font-display font-bold text-base text-text-primary">No recurring bills</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm">Keep tabs on rent, gym cards, internet, or Netflix subscriptions to avoid late fees.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-5 bg-surface-2 border border-border hover:border-accent text-xs font-semibold py-2 px-4 rounded-xl transition-all"
          >
            Add first bill &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurringBills.map(bill => {
            const badge = getCountdownBadge(bill.nextDueDate);
            const isOverdue = badge.type === 'overdue';

            let badgeColors = 'bg-accent/10 border-accent/20 text-accent';
            if (isOverdue) badgeColors = 'bg-danger/10 border-danger/25 text-danger font-bold';
            else if (badge.type === 'today') badgeColors = 'bg-warning/15 border-warning/30 text-warning font-bold';

            return (
              <div 
                key={bill.id}
                className={`bg-surface p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]
                  ${isOverdue ? 'border-danger/30 shadow-md shadow-danger/5 animate-shake' : 'border-border'}
                `}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted">
                        <CreditCard className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-primary leading-tight">{bill.merchant}</span>
                        <span className="text-[10px] text-text-muted capitalize">{bill.cycle} • {bill.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete bill for ${bill.merchant}?`)) {
                          deleteRecurringBill(bill.id);
                        }
                      }}
                      className="text-text-muted hover:text-danger p-1 rounded-lg hover:bg-surface-2 transition-colors"
                      title="Delete bill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Amount & Countdown */}
                  <div className="flex items-baseline justify-between mt-2 select-none">
                    <span className="font-mono text-lg font-bold text-text-primary">
                      {profile.currency}{bill.amount}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[9px] border rounded-full uppercase tracking-wider ${badgeColors}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Due Date Details */}
                  <div className="bg-surface-2/45 border border-border/80 rounded-xl p-2.5 mt-4 text-[10px] text-text-muted flex justify-between font-mono">
                    <span>NEXT DUE DATE:</span>
                    <span className="font-semibold text-text-primary">
                      {new Date(bill.nextDueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Mark as paid Action */}
                <button
                  onClick={() => markBillAsPaid(bill.id)}
                  className="mt-5 w-full bg-surface-2 hover:bg-accent hover:text-text-primary text-text-primary border border-border py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Check className="w-4 h-4 text-accent-2" /> Mark as Paid
                </button>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-app/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-lg text-text-primary mb-4">Add Subscription / Bill</h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              {/* Merchant Name */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Merchant / Utility Name</label>
                <input
                  type="text"
                  placeholder="Netflix, Spotify, Gym, Rent, Internet..."
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl py-2.5 px-3.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Billing Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-text-muted">
                    {profile.currency}
                  </span>
                  <input
                    type="number"
                    placeholder="500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2.5 pl-8 pr-4 font-mono font-bold text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>
              </div>

              {/* Cycle and Category row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Billing Cycle</label>
                  <select
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    {budgets.map(b => (
                      <option key={b.id} value={b.name}>{b.emoji} {b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">First Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl py-2.5 px-3.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-text-primary py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all neon-glow"
              >
                Track Bill
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

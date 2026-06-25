import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Trash2, 
  Coins, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  Target, 
  Sparkles, 
  X, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function Goals() {
  const { 
    goals, 
    addGoal, 
    deleteGoal, 
    addGoalFunds, 
    withdrawGoalFunds, 
    profile, 
    budgets 
  } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAction, setFundAction] = useState('add'); // 'add' or 'withdraw'
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [fundAmount, setFundAmount] = useState('');

  // Add Form state
  const [goalName, setGoalName] = useState('');
  const [goalEmoji, setGoalEmoji] = useState('🎯');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalCategory, setGoalCategory] = useState('');
  const [goalType, setGoalType] = useState('Emergency fund');

  const goalTypes = [
    { id: 'Emergency fund', emoji: '🛡️' },
    { id: 'Vacation', emoji: '🌴' },
    { id: 'Gadget', emoji: '💻' },
    { id: 'Education', emoji: '🎓' },
    { id: 'Vehicle', emoji: '🚗' },
    { id: 'Home', emoji: '🏠' },
    { id: 'Wedding', emoji: '💍' },
    { id: 'Custom', emoji: '🎯' }
  ];

  // Listen to the custom confetti trigger from FinanceContext
  useEffect(() => {
    const handleConfetti = (e) => {
      const milestone = e.detail?.milestone;
      if (milestone === 100) {
        // Massive burst
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 }
        });
      } else {
        // Standard milestone splash
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    };

    window.addEventListener('confetti-trigger', handleConfetti);
    return () => window.removeEventListener('confetti-trigger', handleConfetti);
  }, []);

  // Calculate monthly contribution needed
  const getMonthlyContribution = (goal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return 0;

    const today = new Date();
    const target = new Date(goal.targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = diffDays / 30.4; // Average days in month

    if (diffMonths <= 0) return remaining;
    return Math.round(remaining / diffMonths);
  };

  const daysRemaining = (dateStr) => {
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!goalName || !goalTarget || !goalDate) return;

    addGoal({
      name: goalName,
      emoji: goalEmoji,
      targetAmount: Number(goalTarget),
      currentAmount: 0,
      targetDate: new Date(goalDate).toISOString(),
      linkedCategory: goalCategory || null,
      type: goalType
    });

    // Reset Form
    setGoalName('');
    setGoalTarget('');
    setGoalDate('');
    setGoalCategory('');
    setGoalType('Emergency fund');
    setGoalEmoji('🛡️');
    setShowAddModal(false);
  };

  const handleFundSubmit = (e) => {
    e.preventDefault();
    if (!fundAmount || Number(fundAmount) <= 0 || !selectedGoalId) return;

    if (fundAction === 'add') {
      addGoalFunds(selectedGoalId, Number(fundAmount));
    } else {
      withdrawGoalFunds(selectedGoalId, Number(fundAmount));
    }

    setFundAmount('');
    setShowFundModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary tracking-tight">Goals Tracker</h1>
          <p className="text-text-muted text-sm mt-0.5">Define long-term achievements and save step-by-step.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-accent hover:bg-accent/90 text-text-primary py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-transform hover:scale-[1.02] neon-glow"
        >
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      {/* Empty State */}
      {goals.length === 0 ? (
        <div className="bg-surface p-12 rounded-2xl border border-border text-center flex flex-col items-center justify-center py-20">
          <Target className="w-16 h-16 text-text-muted/20 mb-4" />
          <h3 className="font-display font-bold text-base text-text-primary">No savings goals set</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm">Create a goal for an emergency fund, travel vacation, or gadgets. FinFlow helps track your steps.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-5 bg-surface-2 border border-border hover:border-accent text-xs font-semibold py-2 px-4 rounded-xl transition-all"
          >
            Add your first goal &rarr;
          </button>
        </div>
      ) : (
        /* Goals Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = percent >= 100;
            const monthlyContribution = getMonthlyContribution(goal);
            const daysLeft = daysRemaining(goal.targetDate);

            // Circular progress SVG values
            const radius = 32;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (percent / 100) * circumference;

            return (
              <div 
                key={goal.id}
                className={`bg-surface p-5 rounded-2xl border border-border flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]
                  ${isCompleted ? 'border-accent-2/30 shadow-md shadow-accent-2/5' : ''}
                `}
              >
                <div>
                  {/* Card Title & Emoji */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-xl">
                        {goal.emoji}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-primary leading-tight">{goal.name}</span>
                        <span className="text-[10px] text-text-muted mt-0.5">{goal.type}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete goal "${goal.name}"?`)) {
                          deleteGoal(goal.id);
                        }
                      }}
                      className="text-text-muted hover:text-danger p-1 rounded-lg hover:bg-surface-2 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Circle and stats grid */}
                  <div className="flex items-center gap-4 py-2">
                    {/* SVG circular progress */}
                    <div className="relative w-16 h-16 shrink-0">
                      <svg className="w-full h-full -rotate-90">
                        {/* Background track */}
                        <circle
                          cx="32"
                          cy="32"
                          r={radius}
                          stroke="#1E2330"
                          strokeWidth="5"
                          fill="transparent"
                        />
                        {/* Active stroke */}
                        <circle
                          cx="32"
                          cy="32"
                          r={radius}
                          stroke={isCompleted ? '#00D4AA' : '#6C63FF'}
                          strokeWidth="5"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      {/* Percent text */}
                      <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[10px] text-text-primary">
                        {percent}%
                      </span>
                    </div>

                    {/* Stats values */}
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-text-muted font-medium block text-[9px] uppercase">Amount Saved</span>
                        <span className="font-mono font-bold text-text-primary">
                          {profile.currency}{goal.currentAmount.toLocaleString('en-IN')} 
                          <span className="text-text-muted font-normal font-sans text-[10px]"> / {profile.currency}{goal.targetAmount.toLocaleString('en-IN')}</span>
                        </span>
                      </div>
                      
                      {daysLeft > 0 && !isCompleted ? (
                        <div className="flex items-center gap-1 text-[10px] text-text-muted">
                          <Calendar className="w-3 h-3 text-warning" />
                          <span>{daysLeft} days remaining</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-accent-2 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-accent-2" />
                          <span>Completed! 🎉</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Target contributions details */}
                  <div className="bg-surface-2/50 border border-border/80 rounded-xl p-3 mt-4 text-xs space-y-2 select-none">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Target Month Cap:</span>
                      <span className="font-mono text-text-primary font-semibold">
                        {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {!isCompleted ? (
                      <div className="flex justify-between items-center pt-1 border-t border-border/30">
                        <span className="text-text-muted">Savings Needed / Month:</span>
                        <span className="font-mono text-accent font-bold">
                          {profile.currency}{monthlyContribution.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pt-1 border-t border-border/30 text-accent-2 font-semibold">
                        <span>Milestone Achieved!</span>
                        <Sparkles className="w-4 h-4 text-accent-2 animate-pulse" />
                      </div>
                    )}

                    {goal.linkedCategory && (
                      <div className="flex justify-between text-[10px] border-t border-border/30 pt-1">
                        <span className="text-text-muted">Linked category budget:</span>
                        <span className="text-text-primary font-medium">{goal.linkedCategory}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="grid grid-cols-2 gap-2 mt-5 select-none pt-3 border-t border-border/40">
                  <button
                    onClick={() => {
                      setSelectedGoalId(goal.id);
                      setFundAction('withdraw');
                      setShowFundModal(true);
                    }}
                    disabled={goal.currentAmount <= 0}
                    className="bg-surface-2 hover:bg-bg-app text-text-muted hover:text-text-primary py-2 rounded-xl text-[10px] font-semibold border border-border transition-colors disabled:opacity-40"
                  >
                    Withdraw
                  </button>

                  <button
                    onClick={() => {
                      setSelectedGoalId(goal.id);
                      setFundAction('add');
                      setShowFundModal(true);
                    }}
                    disabled={isCompleted}
                    className="bg-accent/10 border border-accent/25 hover:bg-accent text-accent hover:text-text-primary py-2 rounded-xl text-[10px] font-semibold transition-colors disabled:opacity-40"
                  >
                    Add Funds
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-app/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-lg text-text-primary mb-4">Create Savings Goal</h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              {/* Name input */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="Goa Trip, New MacBook, Emergency..."
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl py-2.5 px-3.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Type Preset Select */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Goal Type</label>
                  <select
                    value={goalType}
                    onChange={(e) => {
                      setGoalType(e.target.value);
                      const matched = goalTypes.find(t => t.id === e.target.value);
                      if (matched) setGoalEmoji(matched.emoji);
                    }}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    {goalTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.emoji} {t.id}</option>
                    ))}
                  </select>
                </div>

                {/* Emoji Pick */}
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={goalEmoji}
                    onChange={(e) => setGoalEmoji(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-center text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Target amount */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Target Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-text-muted">{profile.currency}</span>
                  <input
                    type="number"
                    placeholder="10000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2.5 pl-8 pr-4 font-mono font-bold text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>
              </div>

              {/* Target Date */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Target Achievement Date</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl py-2.5 px-3.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Linked category */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Link Category Budget (Optional)</label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="">No link</option>
                  {budgets.map(b => (
                    <option key={b.id} value={b.name}>{b.emoji} {b.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-text-primary py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all neon-glow"
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add/Withdraw Funds Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-app/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowFundModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-lg text-text-primary mb-4 capitalize">
              {fundAction === 'add' ? 'Add Funds to Goal' : 'Withdraw Funds from Goal'}
            </h3>
            
            <form onSubmit={handleFundSubmit} className="space-y-4">
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-text-muted">
                    {profile.currency}
                  </span>
                  <input
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2.5 pl-8 pr-4 font-mono font-bold text-sm focus:outline-none focus:border-accent"
                    placeholder="0"
                    required
                  />
                </div>
                <span className="text-[10px] text-text-muted mt-1 block">
                  {fundAction === 'add' 
                    ? 'Funds will be transferred out of your primary savings/cash account.' 
                    : 'Withdrawing will refund the cash back into your primary savings account.'
                  }
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-text-primary py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all neon-glow"
              >
                {fundAction === 'add' ? 'Confirm Addition' : 'Confirm Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

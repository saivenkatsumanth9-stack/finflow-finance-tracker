import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Plus, 
  RotateCcw, 
  HelpCircle, 
  TrendingUp, 
  Edit3, 
  Check, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

export default function Budgets() {
  const { 
    transactions, 
    budgets, 
    updateBudgetLimit, 
    toggleBudgetRollover, 
    setAllBudgets,
    profile, 
    updateProfile,
    addTransaction
  } = useFinance();

  const [incomeInput, setIncomeInput] = useState(profile.monthlyIncome);
  const [spendLimitInput, setSpendLimitInput] = useState(profile.monthlySpendLimit || 50000);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editingLimit, setEditingLimit] = useState('');
  const [quickAddBudgetId, setQuickAddBudgetId] = useState(null);
  const [quickAddAmount, setQuickAddAmount] = useState('');
  const [quickAddMerchant, setQuickAddMerchant] = useState('');

  // Define Category Groupings for 50/30/20 split
  const GROUP_MAPPING = {
    'Food & dining': 'Needs',
    'Transport': 'Needs',
    'Health': 'Needs',
    'Utilities': 'Needs',
    'Rent': 'Needs',
    'Shopping': 'Wants',
    'Entertainment': 'Wants',
    'Other': 'Wants',
    'Savings': 'Savings',
    'Investment': 'Savings'
  };

  const templates = {
    'professional': { label: 'Working Professional (50/30/20)', needs: 50, wants: 30, savings: 20 },
    'student': { label: 'Student (40/40/20)', needs: 40, wants: 40, savings: 20 },
    'freelancer': { label: 'Freelancer (35/25/40)', needs: 35, wants: 25, savings: 40 }
  };

  const [activeTemplate, setActiveTemplate] = useState('professional');

  // Handle template application
  const applyTemplate = (templateKey) => {
    setActiveTemplate(templateKey);
    const temp = templates[templateKey];
    
    // Auto calculate and update actual limits set to approximate ideal splits
    // Group totals based on percentages of Monthly Spend Limit (Debited Cap)
    const needsTotal = (spendLimitInput * temp.needs) / 100;
    const wantsTotal = (spendLimitInput * temp.wants) / 100;
    const savingsTotal = (spendLimitInput * temp.savings) / 100;

    // Distribute among subcategories
    const newBudgets = budgets.map(b => {
      let limit = 0;
      const group = GROUP_MAPPING[b.name];
      if (group === 'Needs') {
        // Needs (Rent is big, others distributed)
        if (b.name === 'Rent') limit = needsTotal * 0.5;
        else if (b.name === 'Food & dining') limit = needsTotal * 0.25;
        else if (b.name === 'Utilities') limit = needsTotal * 0.12;
        else if (b.name === 'Transport') limit = needsTotal * 0.08;
        else limit = needsTotal * 0.05; // Health
      } else if (group === 'Wants') {
        // Wants
        if (b.name === 'Shopping') limit = wantsTotal * 0.5;
        else if (b.name === 'Entertainment') limit = wantsTotal * 0.35;
        else limit = wantsTotal * 0.15; // Other
      } else {
        // Savings
        if (b.name === 'Savings') limit = savingsTotal * 0.4;
        else limit = savingsTotal * 0.6; // Investment
      }
      return { ...b, limit: Math.round(limit) };
    });

    setAllBudgets(newBudgets);
    updateProfile({ 
      monthlyIncome: Number(incomeInput),
      monthlySpendLimit: Number(spendLimitInput)
    });
  };

  // Sync Income and Spend Limit to profile on blur/submit
  const handleIncomeBlur = () => {
    updateProfile({ 
      monthlyIncome: Number(incomeInput),
      monthlySpendLimit: Number(spendLimitInput)
    });
  };

  // Calculate actual category spending for current month
  const categorySpent = useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return tx.type === 'expense' &&
             txDate.getMonth() === now.getMonth() && 
             txDate.getFullYear() === now.getFullYear();
    });

    const totals = {};
    budgets.forEach(b => {
      totals[b.name] = 0;
    });

    currentMonthExpenses.forEach(tx => {
      if (totals[tx.category] !== undefined) {
        totals[tx.category] += tx.amount;
      }
    });

    return totals;
  }, [transactions, budgets]);

  // Aggregate limits and spent by Group (Needs/Wants/Savings)
  const groupStats = useMemo(() => {
    const stats = {
      Needs: { limit: 0, spent: 0 },
      Wants: { limit: 0, spent: 0 },
      Savings: { limit: 0, spent: 0 }
    };

    budgets.forEach(b => {
      const group = GROUP_MAPPING[b.name] || 'Wants';
      stats[group].limit += b.limit;
      stats[group].spent += categorySpent[b.name] || 0;
    });

    return stats;
  }, [budgets, categorySpent]);

  // Calculate Ideal Splits vs Actual Limits based on Spend Limit (Debited Cap)
  const idealSplits = useMemo(() => {
    const temp = templates[activeTemplate];
    return {
      Needs: (spendLimitInput * temp.needs) / 100,
      Wants: (spendLimitInput * temp.wants) / 100,
      Savings: (spendLimitInput * temp.savings) / 100
    };
  }, [spendLimitInput, activeTemplate]);

  // Handle Budget Limit Save
  const saveLimitEdit = (budgetId) => {
    if (editingLimit !== '' && !isNaN(editingLimit)) {
      updateBudgetLimit(budgetId, Number(editingLimit));
    }
    setEditingBudgetId(null);
  };

  // Quick Add Expense Inline
  const handleQuickAdd = (categoryName) => {
    if (!quickAddAmount || isNaN(quickAddAmount)) return;
    
    // Find first active account
    const accId = transactions[0]?.accountId || 'acc-hdfc-savings';
    
    addTransaction({
      amount: Number(quickAddAmount),
      type: 'expense',
      category: categoryName,
      merchant: quickAddMerchant || `Quick expense for ${categoryName}`,
      note: 'Quick added from budgets page',
      date: new Date().toISOString(),
      accountId: accId,
      mood: 'happy',
      isRecurring: false
    });

    // Reset inline forms
    setQuickAddBudgetId(null);
    setQuickAddAmount('');
    setQuickAddMerchant('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-text-primary">
          Budget Planner
        </h1>
        <p className="text-text-muted text-sm mt-0.5">
          Formulate your monthly target divisions with the 50/30/20 auto-split engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Split Engine Panel (1 Column) */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
            <h3 className="font-display font-bold text-sm text-text-primary mb-4">50/30/20 Engine</h3>
            
            <div className="space-y-4">
              {/* Income & Spend Limit inputs */}
              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">
                    {profile.labelMode === 'credit-debit' ? 'Monthly Net Income (Credited)' : 'Monthly Net Income'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-text-muted">{profile.currency}</span>
                    <input
                      type="number"
                      value={incomeInput}
                      onChange={(e) => setIncomeInput(Number(e.target.value))}
                      onBlur={handleIncomeBlur}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2 pl-8 pr-4 font-mono font-bold text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">
                    {profile.labelMode === 'credit-debit' ? 'Monthly Spend Limit (Debited Cap)' : 'Monthly Spend Limit'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-text-muted">{profile.currency}</span>
                    <input
                      type="number"
                      value={spendLimitInput}
                      onChange={(e) => setSpendLimitInput(Number(e.target.value))}
                      onBlur={handleIncomeBlur}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2 pl-8 pr-4 font-mono font-bold text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                  <span className="text-[9px] text-text-muted mt-1 block">The templates partition this spend cap among categories instead of splitting your net income.</span>
                </div>
              </div>

              {/* Template selection */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-2">Select Template Preset</label>
                <div className="flex flex-col gap-2">
                  {Object.keys(templates).map(key => (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key)}
                      className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold text-left transition-all
                        ${activeTemplate === key 
                          ? 'bg-accent/15 border-accent text-accent' 
                          : 'bg-surface-2 border-border text-text-muted hover:border-text-muted/30 hover:text-text-primary'
                        }
                      `}
                    >
                      {templates[key].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actual vs Ideal Comparison Widget */}
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
            <h3 className="font-display font-bold text-sm text-text-primary mb-4">Split Allocation Analysis</h3>
            
            <div className="space-y-4">
              {['Needs', 'Wants', 'Savings'].map(group => {
                const ideal = idealSplits[group];
                const actual = groupStats[group].limit;
                const deviation = actual - ideal;
                const devColor = deviation > 0 ? 'text-danger' : deviation < 0 ? 'text-accent-2' : 'text-text-muted';
                const devSign = deviation > 0 ? '+' : '';

                return (
                  <div key={group} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-text-primary">{group}</span>
                      <span className={`text-[10px] font-mono font-bold ${devColor}`}>
                        Actual: {profile.currency}{actual.toLocaleString('en-IN')} ({devSign}{profile.currency}{deviation.toLocaleString('en-IN')})
                      </span>
                    </div>

                    {/* Progress visual comparison */}
                    <div className="space-y-1">
                      {/* Ideal */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-text-muted uppercase w-8 font-semibold">Ideal:</span>
                        <div className="h-1.5 flex-1 bg-surface-2 rounded-full overflow-hidden">
                          <div className="h-full bg-accent-2/50" style={{ width: `${Math.min(100, (ideal / incomeInput) * 100)}%` }} />
                        </div>
                      </div>
                      {/* Actual */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-text-muted uppercase w-8 font-semibold">Limit:</span>
                        <div className="h-1.5 flex-1 bg-surface-2 rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${Math.min(100, (actual / incomeInput) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Categories budget cards grid (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Budget Categories</h3>
                <p className="text-xs text-text-muted mt-0.5">Edit limit inline, toggle rollover, and add transactions</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-surface-2 border border-border font-mono text-xs text-accent-2 font-bold flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Active Budgets
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {budgets.map(b => {
                const spent = categorySpent[b.name] || 0;
                const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
                const remaining = b.limit - spent;

                // Color variables
                const isOverBudget = remaining < 0;
                const remainingEmoji = isOverBudget ? '🔴' : percent > 80 ? '🟡' : '🟢';
                
                const barColor = isOverBudget 
                  ? 'bg-danger shadow-[0_0_8px_rgba(255,92,92,0.4)]' 
                  : percent > 80 
                    ? 'bg-warning' 
                    : 'bg-accent-2';

                const isEditing = editingBudgetId === b.id;

                return (
                  <div 
                    key={b.id} 
                    className={`bg-surface-2/45 p-4 rounded-xl border transition-all duration-300 hover:bg-surface-2/70
                      ${isOverBudget 
                        ? 'border-danger/30 hover:border-danger/60 shadow-md shadow-danger/5 animate-shake' 
                        : 'border-border hover:border-text-muted/30'
                      }
                    `}
                  >
                    {/* Category Title & Emoji */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{b.emoji}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-text-primary">{b.name}</span>
                          <span className="text-[10px] text-text-muted">{GROUP_MAPPING[b.name]}</span>
                        </div>
                      </div>
                      <span className="text-sm select-none">{remainingEmoji}</span>
                    </div>

                    {/* Limit Editing block */}
                    <div className="mb-3 flex items-center gap-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editingLimit}
                            onChange={(e) => setEditingLimit(e.target.value)}
                            className="bg-bg-app border border-accent rounded px-1.5 py-0.5 text-xs text-text-primary w-20 font-mono focus:outline-none"
                            placeholder="Limit"
                          />
                          <button 
                            onClick={() => saveLimitEdit(b.id)}
                            className="p-1 bg-accent rounded text-text-primary hover:bg-accent/80 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <span>Limit:</span>
                          <span className="font-mono text-text-primary font-semibold">
                            {profile.currency}{b.limit.toLocaleString('en-IN')}
                          </span>
                          <button 
                            onClick={() => {
                              setEditingBudgetId(b.id);
                              setEditingLimit(b.limit);
                            }}
                            className="p-1 hover:text-accent hover:bg-bg-app/40 rounded transition-colors"
                            title="Edit inline limit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted">
                        <span>Spent: {profile.currency}{spent.toLocaleString('en-IN')}</span>
                        <span className={`font-semibold ${isOverBudget ? 'text-danger' : 'text-accent-2'}`}>
                          {isOverBudget ? 'Over by ' : 'Left: '}
                          {profile.currency}{Math.abs(remaining).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Rollover and Quick Add controls */}
                    <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-2 select-none">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={b.rollover}
                          onChange={() => toggleBudgetRollover(b.id)}
                          className="rounded border-border text-accent bg-bg-app focus:ring-0 focus:ring-offset-0 w-3 h-3"
                        />
                        <span className="text-[10px] text-text-muted font-medium hover:text-text-primary transition-colors">Rollover</span>
                      </label>

                      {quickAddBudgetId === b.id ? (
                        <div className="flex flex-col gap-1.5 w-full mt-2 bg-bg-app/50 p-2 rounded-lg border border-border animate-slide-in">
                          <input
                            type="number"
                            placeholder="Amount"
                            value={quickAddAmount}
                            onChange={(e) => setQuickAddAmount(e.target.value)}
                            className="bg-surface border border-border rounded px-2 py-1 text-xs text-text-primary w-full font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Merchant/note"
                            value={quickAddMerchant}
                            onChange={(e) => setQuickAddMerchant(e.target.value)}
                            className="bg-surface border border-border rounded px-2 py-1 text-xs text-text-primary w-full"
                          />
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => setQuickAddBudgetId(null)}
                              className="text-[10px] text-text-muted px-2 py-1 hover:text-text-primary"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleQuickAdd(b.name)}
                              className="text-[10px] bg-accent text-text-primary px-2 py-1 rounded"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setQuickAddBudgetId(b.id)}
                          className="flex items-center gap-1 bg-surface hover:bg-bg-app text-text-muted hover:text-text-primary text-[10px] py-1 px-2.5 rounded-lg border border-border/60 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Quick Add
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

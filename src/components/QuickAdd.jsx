import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Smile, Meh, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function QuickAdd() {
  const { 
    accounts, 
    budgets, 
    addTransaction, 
    profile, 
    transactions 
  } = useFinance();

  const [formType, setFormType] = useState('expense'); // 'expense' | 'income'
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Food & dining');
  const [mood, setMood] = useState('happy');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');

  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'stressed', emoji: '😰', label: 'Stressed' },
    { id: 'bored', emoji: '😴', label: 'Bored' },
    { id: 'celebrating', emoji: '🎉', label: 'Celebrating' },
    { id: 'sad', emoji: '😔', label: 'Sad' },
    { id: 'impulsive', emoji: '😤', label: 'Impulsive' }
  ];

  // Calculate Today's Cash Flow
  const todayCashFlow = (() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTxs = transactions.filter(t => t.date.split('T')[0] === todayStr);
    
    const income = todayTxs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = todayTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense };
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    addTransaction({
      amount: Number(amount),
      type: formType,
      category,
      merchant: merchant || (formType === 'income' ? 'Income credit' : 'Miscellaneous Expense'),
      note: merchant || (formType === 'income' ? 'Quick added credit' : 'Quick added expense'),
      date: new Date().toISOString(),
      accountId,
      mood: formType === 'expense' ? mood : null,
      isRecurring: false
    });

    // Reset form
    setAmount('');
    setMerchant('');
    setMood('happy');
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Today's Cash Flow Widget */}
      <div className="bg-surface p-5 rounded-2xl border border-border">
        <h3 className="font-display font-bold text-sm text-text-primary mb-3">Today's Cash Flow</h3>
        
        <div className="space-y-3">
          {/* Income Bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-text-muted flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-accent-2" /> {profile.labelMode === 'credit-debit' ? 'Credited Today' : 'Income Today'}
              </span>
              <span className="font-mono text-accent-2">{profile.currency}{todayCashFlow.income.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-2 transition-all duration-500" 
                style={{ width: `${todayCashFlow.income > 0 ? Math.min(100, (todayCashFlow.income / 10000) * 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Expense Bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-text-muted flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-danger" /> {profile.labelMode === 'credit-debit' ? 'Debited Today' : 'Spent Today'}
              </span>
              <span className="font-mono text-danger">{profile.currency}{todayCashFlow.expense.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-danger transition-all duration-500" 
                style={{ width: `${todayCashFlow.expense > 0 ? Math.min(100, (todayCashFlow.expense / 5000) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="bg-surface p-5 rounded-2xl border border-border">
        <h3 className="font-display font-bold text-sm text-text-primary mb-3">
          {profile.labelMode === 'credit-debit' 
            ? (formType === 'income' ? 'Quick Add Credit' : 'Quick Add Debit') 
            : (formType === 'income' ? 'Quick Add Income' : 'Quick Add Expense')}
        </h3>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-surface-2 p-1 rounded-xl border border-border select-none mb-4">
          <button
            type="button"
            onClick={() => { setFormType('expense'); setCategory('Food & dining'); }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${formType === 'expense' ? 'bg-accent text-text-primary font-bold shadow' : 'text-text-muted hover:text-text-primary'}`}
          >
            {profile.labelMode === 'credit-debit' ? 'Debit (-)' : 'Expense'}
          </button>
          <button
            type="button"
            onClick={() => { setFormType('income'); setCategory('Salary'); }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${formType === 'income' ? 'bg-accent-2 text-bg-app font-bold shadow' : 'text-text-muted hover:text-text-primary'}`}
          >
            {profile.labelMode === 'credit-debit' ? 'Credit (+)' : 'Income'}
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input */}
          <div>
            <label className="text-text-muted text-[11px] font-semibold uppercase block mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-lg text-text-muted">
                {profile.currency}
              </span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-xl py-2.5 pl-8 pr-4 font-mono font-bold text-text-primary focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>
          </div>

          {/* Merchant / Source */}
          <div>
            <label className="text-text-muted text-[11px] font-semibold uppercase block mb-1">
              {formType === 'income' ? 'Source / Payer' : 'Merchant / Note'}
            </label>
            <input
              type="text"
              placeholder={formType === 'income' ? 'Employer, parents, sale...' : 'Zomato, Uber, DMart...'}
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted/65"
              required
            />
          </div>

          {/* Dropdowns row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-muted text-[11px] font-semibold uppercase block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-xl py-2.5 px-3 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
              >
                {formType === 'expense' ? (
                  budgets.map(b => (
                    <option key={b.id} value={b.name}>
                      {b.emoji} {b.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Salary">💰 Salary</option>
                    <option value="Investments">📈 Investments</option>
                    <option value="Other">🏷️ Other</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-text-muted text-[11px] font-semibold uppercase block mb-1">
                {profile.labelMode === 'credit-debit' 
                  ? (formType === 'income' ? 'Credited To' : 'Debited From') 
                  : 'Account'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-xl py-2.5 px-3 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mood Selector (Only for expenses) */}
          {formType === 'expense' && (
            <div>
              <label className="text-text-muted text-[11px] font-semibold uppercase block mb-1.5">Mood Tag</label>
              <div className="grid grid-cols-6 gap-2">
                {moods.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(m.id)}
                    title={m.label}
                    className={`py-2 rounded-lg text-lg flex items-center justify-center border transition-all duration-200
                      ${mood === m.id 
                        ? 'bg-accent/15 border-accent shadow-sm scale-110' 
                        : 'bg-surface-2 border-border hover:bg-surface-2/80 hover:border-text-muted/30'
                      }
                    `}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className={`w-full mt-2 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 neon-glow
              ${formType === 'income' 
                ? 'bg-accent-2 text-bg-app hover:bg-accent-2/95 shadow-md shadow-accent-2/10' 
                : 'bg-accent text-text-primary hover:bg-accent/90'
              }
            `}
          >
            <Plus className="w-4 h-4" />{' '}
            {profile.labelMode === 'credit-debit' 
              ? (formType === 'income' ? 'Add Credit' : 'Add Debit') 
              : (formType === 'income' ? 'Add Income' : 'Add Expense')}
          </button>
        </form>
      </div>
    </div>
  );
}

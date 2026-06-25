import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORY_ICONS } from './Dashboard';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Plus, 
  X, 
  Calendar, 
  DollarSign, 
  Tag, 
  HelpCircle,
  Clock,
  Briefcase,
  Layers,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function Transactions() {
  const {
    transactions,
    budgets,
    accounts,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    bulkDeleteTransactions,
    bulkCategorizeTransactions,
    profile
  } = useFinance();

  // Search & Filters state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [moodFilter, setMoodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Bulk Edit state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [showBulkPanel, setShowBulkPanel] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null); // Detail View
  const [isEditingTx, setIsEditingTx] = useState(false); // Edit Mode inside Detail View

  // Add Form state
  const [formType, setFormType] = useState('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food & dining');
  const [formMerchant, setFormMerchant] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAccount, setFormAccount] = useState(accounts[0]?.id || '');
  const [formMood, setFormMood] = useState('happy');

  // Edit Form state (shares values with selectedTx)
  const [editAmount, setEditAmount] = useState('');
  const [editMerchant, setEditMerchant] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editAccount, setEditAccount] = useState('');
  const [editMood, setEditMood] = useState('');

  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'stressed', emoji: '😰', label: 'Stressed' },
    { id: 'bored', emoji: '😴', label: 'Bored' },
    { id: 'celebrating', emoji: '🎉', label: 'Celebrating' },
    { id: 'sad', emoji: '😔', label: 'Sad' },
    { id: 'impulsive', emoji: '😤', label: 'Impulsive' }
  ];

  // 1. Filter and Sort logic
  const filteredTxs = useMemo(() => {
    return transactions
      .filter(tx => {
        // Fuzzy search
        const q = search.toLowerCase();
        const matchesSearch = 
          tx.merchant.toLowerCase().includes(q) || 
          tx.category.toLowerCase().includes(q) || 
          (tx.note && tx.note.toLowerCase().includes(q));

        // Filters
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
        const matchesAccount = accountFilter === 'all' || tx.accountId === accountFilter;
        const matchesMood = moodFilter === 'all' || tx.mood === moodFilter;
        
        const min = minAmount !== '' ? Number(minAmount) : 0;
        const max = maxAmount !== '' ? Number(maxAmount) : Infinity;
        const matchesAmount = tx.amount >= min && tx.amount <= max;

        return matchesSearch && matchesType && matchesCategory && matchesAccount && matchesMood && matchesAmount;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        return 0;
      });
  }, [transactions, search, typeFilter, categoryFilter, accountFilter, moodFilter, sortBy, minAmount, maxAmount]);

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredTxs.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk actions handlers
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) {
      bulkDeleteTransactions(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkCategorize = (e) => {
    e.preventDefault();
    if (!bulkCategory) return;
    bulkCategorizeTransactions(selectedIds, bulkCategory);
    setSelectedIds([]);
    setShowBulkPanel(false);
  };

  // Hours worked calculations
  const calculateHours = (amount) => {
    if (!amount || isNaN(amount) || profile.hourlyRate <= 0) return 0;
    return (amount / profile.hourlyRate).toFixed(1);
  };

  // Add form submission
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0) return;

    addTransaction({
      amount: Number(formAmount),
      type: formType,
      category: formCategory,
      merchant: formMerchant || (formType === 'income' ? 'Salary payout' : 'General Store'),
      note: formNote,
      date: new Date(formDate).toISOString(),
      accountId: formAccount,
      mood: formType === 'expense' ? formMood : null,
      isRecurring: false
    });

    // Reset and close
    setFormAmount('');
    setFormMerchant('');
    setFormNote('');
    setFormMood('happy');
    setShowAddModal(false);
  };

  // Open Detail View
  const handleOpenDetail = (tx) => {
    setSelectedTx(tx);
    setEditAmount(tx.amount);
    setEditMerchant(tx.merchant);
    setEditCategory(tx.category);
    setEditNote(tx.note || '');
    setEditDate(tx.date.split('T')[0]);
    setEditAccount(tx.accountId);
    setEditMood(tx.mood || 'happy');
    setIsEditingTx(false);
  };

  // Save Edit Transaction
  const handleSaveEdit = () => {
    if (!editAmount || isNaN(editAmount)) return;
    
    updateTransaction({
      ...selectedTx,
      amount: Number(editAmount),
      merchant: editMerchant,
      category: editCategory,
      note: editNote,
      date: new Date(editDate).toISOString(),
      accountId: editAccount,
      mood: selectedTx.type === 'expense' ? editMood : null
    });

    setSelectedTx(null);
    setIsEditingTx(false);
  };

  // Similar past transactions
  const similarTransactions = useMemo(() => {
    if (!selectedTx) return [];
    return transactions.filter(t => 
      t.id !== selectedTx.id &&
      t.merchant.toLowerCase().includes(selectedTx.merchant.toLowerCase())
    ).slice(0, 3);
  }, [selectedTx, transactions]);

  // Check how a transaction fits in the budget
  const budgetImpact = useMemo(() => {
    if (!selectedTx || selectedTx.type !== 'expense') return null;
    const category = selectedTx.category;
    const budgetObj = budgets.find(b => b.name === category);
    if (!budgetObj || budgetObj.limit === 0) return null;

    // Total spent in this category
    const totalSpent = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        const selDate = new Date(selectedTx.date);
        return t.type === 'expense' && 
               t.category === category &&
               tDate.getMonth() === selDate.getMonth() &&
               tDate.getFullYear() === selDate.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const share = (selectedTx.amount / budgetObj.limit) * 100;
    return {
      limit: budgetObj.limit,
      totalSpent,
      share
    };
  }, [selectedTx, transactions, budgets]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary tracking-tight">Transactions</h1>
          <p className="text-text-muted text-sm mt-0.5">Search, filter, edit, or perform bulk changes on records.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-accent hover:bg-accent/90 text-text-primary py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-transform hover:scale-[1.02] neon-glow"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-surface p-5 rounded-2xl border border-border space-y-4">
        {/* Row 1: Search & Basic filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Fuzzy search merchants, notes, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl py-2 pl-9 pr-4 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Types</option>
              <option value="expense">{profile.labelMode === 'credit-debit' ? 'Debited (-)' : 'Expense'}</option>
              <option value="income">{profile.labelMode === 'credit-debit' ? 'Credited (+)' : 'Income'}</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>

        {/* Row 2: Advanced filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-border/40">
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Categories</option>
              {budgets.map(b => (
                <option key={b.id} value={b.name}>{b.emoji} {b.name}</option>
              ))}
              <option value="Salary">💰 Salary</option>
            </select>
          </div>

          <div>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Moods</option>
              {moods.map(m => (
                <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>
              ))}
            </select>
          </div>

          {/* Min/Max Amount inputs */}
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl py-2 px-2 text-xs font-mono focus:outline-none focus:border-accent"
            />
            <span className="text-text-muted text-[10px]">to</span>
            <input
              type="number"
              placeholder="Max"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl py-2 px-2 text-xs font-mono focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {selectedIds.length > 0 && (
        <div className="bg-surface border-l-4 border-accent p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between animate-slide-in shadow-md">
          <span className="text-xs text-text-primary font-medium">
            Selected <strong className="text-accent">{selectedIds.length}</strong> transactions
          </span>
          
          <div className="flex items-center gap-3">
            {showBulkPanel ? (
              <form onSubmit={handleBulkCategorize} className="flex items-center gap-2">
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="bg-surface-2 border border-border rounded-lg py-1 px-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  required
                >
                  <option value="">Choose category</option>
                  {budgets.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
                <button type="submit" className="bg-accent text-text-primary text-[10px] font-semibold py-1.5 px-3 rounded hover:bg-accent/80">
                  Save
                </button>
                <button type="button" onClick={() => setShowBulkPanel(false)} className="text-[10px] text-text-muted hover:text-text-primary px-1">
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <button
                  onClick={() => setShowBulkPanel(true)}
                  className="bg-surface-2 border border-border hover:border-accent/40 text-text-primary px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Bulk Categorize
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="bg-danger/10 border border-danger/35 hover:bg-danger text-danger hover:text-text-primary px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                </button>
              </>
            )}
            
            <button onClick={() => setSelectedIds([])} className="text-text-muted hover:text-text-primary text-xs p-1">
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Transaction List Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        {filteredTxs.length === 0 ? (
          <div className="py-24 text-center">
            <Layers className="w-12 h-12 text-text-muted/15 mx-auto mb-3" />
            <span className="text-sm text-text-muted">No transactions matched your filter settings.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/30 text-text-muted select-none text-[10px] uppercase font-semibold">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === filteredTxs.length && filteredTxs.length > 0}
                      className="rounded border-border text-accent bg-bg-app focus:ring-0 w-3.5 h-3.5"
                    />
                  </th>
                  <th className="py-3 px-3">Merchant / Note</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Account</th>
                  <th className="py-3 px-3 text-center">Mood</th>
                  <th className="py-3 px-3 text-right">Hours</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTxs.map(tx => {
                  const Icon = CATEGORY_ICONS[tx.category] || Tag;
                  const isIncome = tx.type === 'income';
                  const accountObj = accounts.find(a => a.id === tx.accountId);
                  const isSelected = selectedIds.includes(tx.id);
                  const hours = calculateHours(tx.amount);

                  return (
                    <tr 
                      key={tx.id}
                      className={`hover:bg-surface-2/45 transition-colors cursor-pointer group
                        ${isSelected ? 'bg-accent/5' : ''}
                      `}
                      onClick={() => handleOpenDetail(tx)}
                    >
                      {/* Checkbox cell */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(tx.id)}
                          className="rounded border-border text-accent bg-bg-app focus:ring-0 w-3.5 h-3.5"
                        />
                      </td>

                      {/* Merchant */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg border ${isIncome ? 'bg-accent-2/15 border-accent-2/20 text-accent-2' : 'bg-accent/15 border-accent/20 text-accent'}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-text-primary leading-tight group-hover:text-accent transition-colors">
                              {tx.merchant}
                            </span>
                            {tx.note && <span className="text-[10px] text-text-muted truncate max-w-[150px]">{tx.note}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 font-mono text-[11px] text-text-muted">
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-surface-2 border border-border text-[10px] font-medium">
                          {tx.category}
                        </span>
                      </td>

                      {/* Account */}
                      <td className="py-3 px-3">
                        <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accountObj?.color || '#999' }} />
                          {accountObj?.name || 'External'}
                        </span>
                      </td>

                      {/* Mood */}
                      <td className="py-3 px-3 text-center text-sm font-semibold select-none">
                        {tx.mood ? moods.find(m => m.id === tx.mood)?.emoji : '—'}
                      </td>

                      {/* Work Hours Spent */}
                      <td className="py-3 px-3 text-right font-mono text-xs text-text-muted">
                        {!isIncome && hours > 0 ? `${hours} hrs` : '—'}
                      </td>

                      {/* Amount */}
                      <td className={`py-3 px-4 text-right font-mono font-bold text-xs ${isIncome ? 'text-accent-2' : 'text-text-primary'}`}>
                        {isIncome ? '+' : '-'}{profile.currency}{tx.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-app/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-lg text-text-primary mb-4">Add Transaction</h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 bg-surface-2 p-1 rounded-xl border border-border select-none">
                <button
                  type="button"
                  onClick={() => { setFormType('expense'); setFormCategory('Food & dining'); }}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${formType === 'expense' ? 'bg-accent text-text-primary font-bold shadow' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {profile.labelMode === 'credit-debit' ? 'Debited (-)' : 'Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => { setFormType('income'); setFormCategory('Salary'); }}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${formType === 'income' ? 'bg-accent-2 text-bg-app font-bold shadow' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {profile.labelMode === 'credit-debit' ? 'Credited (+)' : 'Income'}
                </button>
              </div>

              {/* Amount & Time Cost */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-text-muted">{profile.currency}</span>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 pl-7 pr-4 font-mono font-bold text-sm focus:outline-none focus:border-accent"
                    placeholder="0"
                    required
                  />
                </div>
                {formType === 'expense' && Number(formAmount) > 0 && (
                  <span className="text-[10px] text-text-muted mt-1 block font-medium flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-accent" />
                    Cost: <strong className="text-text-primary font-bold">{calculateHours(formAmount)} hours</strong> of your life.
                  </span>
                )}
              </div>

              {/* Merchant / Payout Name */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Merchant / Payer</label>
                <input
                  type="text"
                  value={formMerchant}
                  onChange={(e) => setFormMerchant(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-accent"
                  placeholder={formType === 'income' ? 'Company Name' : 'Swiggy, DMart, Uber...'}
                  required
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  {formType === 'expense' ? (
                    budgets.map(b => (
                      <option key={b.id} value={b.name}>{b.emoji} {b.name}</option>
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

              {/* Date & Account selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">
                    {profile.labelMode === 'credit-debit' 
                      ? (formType === 'income' ? 'Credited To' : 'Debited From') 
                      : 'Account'}
                  </label>
                  <select
                    value={formAccount}
                    onChange={(e) => setFormAccount(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-accent"
                  placeholder="Additional details..."
                />
              </div>

              {/* Mood picker */}
              {formType === 'expense' && (
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1.5">Mood Tag</label>
                  <div className="grid grid-cols-6 gap-2">
                    {moods.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormMood(m.id)}
                        title={m.label}
                        className={`py-2 rounded-lg text-lg flex items-center justify-center border transition-all duration-200
                          ${formMood === m.id 
                            ? 'bg-accent/15 border-accent shadow-sm scale-105' 
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

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-text-primary py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all neon-glow"
              >
                Create Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Detail View Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-app/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative">
            <button 
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              Transaction Details
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase border font-semibold tracking-wider
                ${selectedTx.type === 'income' ? 'bg-accent-2/10 border-accent-2/20 text-accent-2' : 'bg-accent/10 border-accent/20 text-accent'}
              `}>
                {selectedTx.type === 'income'
                  ? (profile.labelMode === 'credit-debit' ? 'Credited' : 'Income')
                  : (profile.labelMode === 'credit-debit' ? 'Debited' : 'Expense')
                }
              </span>
            </h3>

            {!isEditingTx ? (
              /* Detail Display Mode */
              <div className="space-y-5">
                
                {/* Big Amount display */}
                <div className="bg-surface-2/50 rounded-xl p-4 border border-border flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted font-semibold uppercase">Total Amount</span>
                    <span className={`font-mono font-bold text-xl md:text-2xl ${selectedTx.type === 'income' ? 'text-accent-2' : 'text-text-primary'}`}>
                      {profile.currency}{selectedTx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {selectedTx.type === 'expense' && (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-text-muted font-semibold uppercase">Hours Traded</span>
                      <span className="font-mono font-bold text-xs text-text-primary flex items-center gap-1.5 mt-1">
                        <Briefcase className="w-3.5 h-3.5 text-accent" />
                        {calculateHours(selectedTx.amount)} Hours
                      </span>
                    </div>
                  )}
                </div>

                {/* Details list */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted font-semibold block uppercase">Merchant / Source</span>
                    <span className="font-bold text-text-primary mt-0.5 block">{selectedTx.merchant}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-semibold block uppercase">Category</span>
                    <span className="font-medium text-text-primary mt-0.5 block">{selectedTx.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-semibold block uppercase">Date Created</span>
                    <span className="font-medium text-text-primary mt-0.5 block font-mono">
                      {new Date(selectedTx.date).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-semibold block uppercase">Account</span>
                    <span className="font-medium text-text-primary mt-0.5 block">
                      {accounts.find(a => a.id === selectedTx.accountId)?.name || 'External'}
                    </span>
                  </div>
                  {selectedTx.type === 'expense' && (
                    <div>
                      <span className="text-[10px] text-text-muted font-semibold block uppercase">Emotional Mood</span>
                      <span className="font-bold text-text-primary mt-0.5 block">
                        {selectedTx.mood 
                          ? `${moods.find(m => m.id === selectedTx.mood)?.emoji} ${moods.find(m => m.id === selectedTx.mood)?.label}` 
                          : 'No mood recorded'
                        }
                      </span>
                    </div>
                  )}
                  {selectedTx.note && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-text-muted font-semibold block uppercase">Internal Note</span>
                      <p className="text-text-primary bg-surface-2 p-2 rounded-lg border border-border mt-1">{selectedTx.note}</p>
                    </div>
                  )}
                </div>

                {/* Budget impact analysis */}
                {budgetImpact && (
                  <div className="bg-surface-2 p-4 rounded-xl border border-border space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-text-muted">Impact on {selectedTx.category} Budget</span>
                      <span className="font-mono text-text-primary">
                        Spent {profile.currency}{budgetImpact.totalSpent.toLocaleString('en-IN')} / {profile.currency}{budgetImpact.limit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-bg-app rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${Math.min(100, (budgetImpact.totalSpent / budgetImpact.limit) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-text-muted mt-1 block">
                      This transaction alone represents <strong className="text-accent">{budgetImpact.share.toFixed(1)}%</strong> of your total category limit.
                    </span>
                  </div>
                )}

                {/* Similar past history list */}
                {similarTransactions.length > 0 && (
                  <div>
                    <span className="text-[10px] text-text-muted font-semibold block uppercase mb-2">Similar past transactions</span>
                    <div className="space-y-2">
                      {similarTransactions.map(st => (
                        <div key={st.id} className="flex justify-between items-center bg-bg-app/40 border border-border p-2 rounded-lg text-xs font-mono">
                          <span className="text-text-muted">{new Date(st.date).toLocaleDateString('en-IN')}</span>
                          <span className="text-text-primary font-semibold font-sans">{st.merchant}</span>
                          <span className="font-bold">{profile.currency}{st.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions row */}
                <div className="flex justify-between pt-4 border-t border-border/60 mt-3 select-none">
                  <button
                    onClick={() => {
                      deleteTransaction(selectedTx.id);
                      setSelectedTx(null);
                    }}
                    className="bg-danger/10 border border-danger/25 hover:bg-danger text-danger hover:text-text-primary py-2 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>

                  <button
                    onClick={() => setIsEditingTx(true)}
                    className="bg-surface-2 border border-border hover:border-accent text-text-primary py-2 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit details
                  </button>
                </div>

              </div>
            ) : (
              /* Detail Edit Form Mode */
              <div className="space-y-4">
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Amount</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs font-mono font-bold text-text-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Merchant / Source</label>
                  <input
                    type="text"
                    value={editMerchant}
                    onChange={(e) => setEditMerchant(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none"
                  >
                    {selectedTx.type === 'expense' ? (
                      budgets.map(b => (
                        <option key={b.id} value={b.name}>{b.emoji} {b.name}</option>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Date</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">
                      {profile.labelMode === 'credit-debit' 
                        ? (selectedTx.type === 'income' ? 'Credited To' : 'Debited From') 
                        : 'Account'}
                    </label>
                    <select
                      value={editAccount}
                      onChange={(e) => setEditAccount(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none"
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Note</label>
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none"
                  />
                </div>

                {selectedTx.type === 'expense' && (
                  <div>
                    <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1.5">Mood Tag</label>
                    <div className="grid grid-cols-6 gap-2">
                      {moods.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setEditMood(m.id)}
                          className={`py-2 rounded-lg text-lg flex items-center justify-center border transition-all duration-200
                            ${editMood === m.id 
                              ? 'bg-accent/15 border-accent shadow-sm' 
                              : 'bg-surface-2 border-border hover:bg-surface-2/80'
                            }
                          `}
                        >
                          {m.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4 select-none">
                  <button
                    type="button"
                    onClick={() => setIsEditingTx(false)}
                    className="text-xs text-text-muted hover:text-text-primary px-3 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="bg-accent text-text-primary px-4 py-2 rounded-xl text-xs font-semibold hover:bg-accent/80"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

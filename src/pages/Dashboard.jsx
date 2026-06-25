import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import StatCard from '../components/StatCard';
import Heatmap from '../components/Heatmap';
import Sparkline from '../components/Sparkline';
import QuickAdd from '../components/QuickAdd';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Building2, 
  TrendingUp, 
  Calendar,
  Utensils,
  ShoppingBag,
  Car,
  Film,
  HeartPulse,
  Zap,
  Home,
  PiggyBank,
  Tag,
  Clock,
  Sparkles,
  Flame,
  AlertTriangle
} from 'lucide-react';

// Map categories to icons
export const CATEGORY_ICONS = {
  'Food & dining': Utensils,
  'Shopping': ShoppingBag,
  'Transport': Car,
  'Entertainment': Film,
  'Health': HeartPulse,
  'Utilities': Zap,
  'Rent': Home,
  'Savings': PiggyBank,
  'Investment': TrendingUp,
  'Other': Tag,
  'Salary': ArrowUpRight
};

export default function Dashboard() {
  const { 
    transactions, 
    budgets, 
    accounts, 
    recurringBills, 
    profile,
    streaks
  } = useFinance();

  // 1. Calculate Stats for Summary Bar
  const stats = useMemo(() => {
    // Net Worth = sum of balances
    const netWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const now = new Date();
    const currentMonthTxs = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === now.getMonth() && 
             txDate.getFullYear() === now.getFullYear();
    });

    const income = currentMonthTxs
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const spent = currentMonthTxs
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Days left in budget period (end of month)
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const daysLeft = Math.max(0, lastDay - now.getDate());

    // Total budget limit
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

    return {
      netWorth,
      income,
      spent,
      daysLeft,
      totalBudget
    };
  }, [transactions, accounts, budgets]);

  // 2. Calculate Top 5 Categories Spent
  const topCategories = useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return tx.type === 'expense' &&
             txDate.getMonth() === now.getMonth() && 
             txDate.getFullYear() === now.getFullYear();
    });

    const categoryTotals = {};
    currentMonthExpenses.forEach(tx => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

    const sorted = Object.keys(categoryTotals)
      .map(name => {
        const spent = categoryTotals[name];
        const budgetObj = budgets.find(b => b.name === name);
        const limit = budgetObj ? budgetObj.limit : 0;
        const emoji = budgetObj ? budgetObj.emoji : '🏷️';
        const percent = limit > 0 ? (spent / limit) * 100 : 0;
        return { name, spent, limit, emoji, percent };
      })
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);

    return sorted;
  }, [transactions, budgets]);

  // 3. Upcoming Bills (next 7 days)
  const upcomingBills = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    return recurringBills
      .filter(bill => {
        const dueDate = new Date(bill.nextDueDate);
        return dueDate >= now && dueDate <= sevenDaysFromNow;
      })
      .map(bill => {
        const dueDate = new Date(bill.nextDueDate);
        const diffTime = Math.abs(dueDate - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let countdown = '';
        if (diffDays === 0) countdown = 'today';
        else if (diffDays === 1) countdown = 'tomorrow';
        else countdown = `in ${diffDays} days`;

        return { ...bill, countdown };
      })
      .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  }, [recurringBills]);

  // 4. Relative time format for transactions
  const timeAgo = (dateStr) => {
    const txDate = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - txDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) return 'Just now';
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  // Recent 10 transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 10);
  }, [transactions]);

  // Budget spent percentage for circular ring
  const budgetSpentPercent = stats.totalBudget > 0 
    ? (stats.spent / stats.totalBudget) * 100 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary tracking-tight">
            Dashboard
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            Welcome back, <span className="text-accent font-semibold">{profile.name}</span>.
          </p>
        </div>

        {/* Streaks and Sparkline Header */}
        <div className="flex flex-wrap items-center gap-4">
          {streaks.budgetStreak > 0 && (
            <div className="flex items-center gap-2 bg-[#2E2015] border border-warning/30 px-3.5 py-1.5 rounded-full select-none">
              <Flame className="w-5 h-5 text-warning fill-warning animate-bounce" />
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted leading-none uppercase font-bold">On-Budget Streak</span>
                <span className="font-mono text-xs font-bold text-warning">{streaks.budgetStreak} Days Streak</span>
              </div>
            </div>
          )}
          
          <div className="bg-surface border border-border py-1.5 px-4 rounded-full">
            <Sparkline />
          </div>
        </div>
      </div>

      {/* Grid: 3 columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main 2-column contents (left/center) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Net Worth" 
              value={stats.netWorth} 
              type="balance" 
              subtitle="Sum of all accounts" 
            />
            <StatCard 
              title={profile.labelMode === 'credit-debit' ? 'Credited This Month' : 'Income This Month'} 
              value={stats.income} 
              type="income" 
              subtitle="All income channels" 
            />
            <StatCard 
              title={profile.labelMode === 'credit-debit' ? 'Debited This Month' : 'Expenses This Month'} 
              value={stats.spent} 
              type="spend" 
              subtitle={`Budget Limit: ${profile.currency}${stats.totalBudget.toLocaleString('en-IN')}`}
              subtitleColor={budgetSpentPercent > 80 ? 'text-danger font-bold' : ''}
              trend={{ 
                value: budgetSpentPercent.toFixed(0), 
                positive: budgetSpentPercent < 100 
              }} 
            />
            <StatCard 
              title="Days Left in Period" 
              value={stats.daysLeft} 
              type="days" 
              subtitle="Resets end of month" 
            />
          </div>

          {/* Heatmap Grid */}
          <Heatmap />

          {/* Category Split vs Recent Transactions Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Categories Card */}
            <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Top Spending Categories</h3>
                <p className="text-xs text-text-muted mt-0.5">Most consumed budgets this month</p>
              </div>

              {topCategories.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Sparkles className="w-8 h-8 text-text-muted/30 mb-2" />
                  <span className="text-xs text-text-muted">No expenses recorded yet.</span>
                </div>
              ) : (
                <div className="space-y-4 mt-5 flex-1 justify-center flex flex-col">
                  {topCategories.map(cat => {
                    const barColor = cat.percent > 100 
                      ? 'bg-danger shadow-[0_0_12px_#FF5C5CB0]' 
                      : cat.percent > 80 
                        ? 'bg-warning' 
                        : 'bg-accent';

                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="flex items-center gap-1.5 text-text-primary">
                            <span>{cat.emoji}</span>
                            <span className="truncate max-w-[120px]">{cat.name}</span>
                          </span>
                          <span className="font-mono text-text-muted">
                            <strong className="text-text-primary">{profile.currency}{cat.spent.toLocaleString('en-IN')}</strong>
                            {cat.limit > 0 && ` / ${cat.percent.toFixed(0)}%`}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                            style={{ width: `${Math.min(100, cat.percent || (cat.spent / stats.income * 100) || 5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Bills Card */}
            <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Upcoming Bills (7 Days)</h3>
                <p className="text-xs text-text-muted mt-0.5">Recurring fees and subscriptions due soon</p>
              </div>

              {upcomingBills.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center flex-1">
                  <Calendar className="w-8 h-8 text-text-muted/30 mb-2" />
                  <span className="text-xs text-text-muted">All paid up! No bills due next 7 days.</span>
                </div>
              ) : (
                <div className="divide-y divide-border mt-3 flex-1 flex flex-col justify-center">
                  {upcomingBills.map(bill => (
                    <div key={bill.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary">{bill.merchant}</span>
                        <span className="text-[10px] text-text-muted capitalize">{bill.cycle} • {bill.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold">{profile.currency}{bill.amount}</span>
                        <span className={`px-2.5 py-0.5 text-[9px] rounded-full border font-semibold uppercase tracking-wider
                          ${bill.countdown === 'today' 
                            ? 'bg-danger/10 border-danger text-danger' 
                            : 'bg-warning/10 border-warning text-warning'
                          }
                        `}>
                          {bill.countdown}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Recent Transactions List */}
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
            <h3 className="font-display font-bold text-sm text-text-primary mb-4">Recent Transactions</h3>
            
            {recentTransactions.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <Clock className="w-10 h-10 text-text-muted/20 mb-3" />
                <span className="text-xs text-text-muted">No transactions found. Add some to get started.</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentTransactions.map(tx => {
                  const Icon = CATEGORY_ICONS[tx.category] || Tag;
                  const isIncome = tx.type === 'income';

                  return (
                    <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2/40 border border-border/50 hover:bg-surface-2 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${isIncome ? 'bg-accent-2/10 border-accent-2/20 text-accent-2' : 'bg-accent/10 border-accent/20 text-accent'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary leading-snug">{tx.merchant}</span>
                          <span className="text-[10px] text-text-muted leading-tight">
                            {tx.category} • {timeAgo(tx.date)} {tx.mood && `• Mood: ${tx.mood === 'happy' ? '😊' : tx.mood === 'stressed' ? '😰' : tx.mood === 'bored' ? '😴' : tx.mood === 'celebrating' ? '🎉' : tx.mood === 'sad' ? '😔' : '😤'}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-bold ${isIncome ? 'text-accent-2' : 'text-text-primary'}`}>
                          {isIncome ? '+' : '-'}{profile.currency}{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right column (Desktop layout) */}
        <div className="lg:col-span-1 hidden lg:block">
          <QuickAdd />
        </div>

      </div>
      
    </div>
  );
}

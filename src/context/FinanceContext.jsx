import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SEED_ACCOUNTS,
  SEED_BUDGET_CATEGORIES,
  SEED_TRANSACTIONS,
  SEED_GOALS,
  SEED_RECURRING_BILLS
} from '../utils/seedData';

const FinanceContext = createContext(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider = ({ children }) => {
  // Load data from localStorage or fallback to seed data
  const [accounts, setAccounts] = useState(() => {
    const local = localStorage.getItem('finflow_accounts');
    return local ? JSON.parse(local) : SEED_ACCOUNTS;
  });

  const [budgets, setBudgets] = useState(() => {
    const local = localStorage.getItem('finflow_budgets');
    return local ? JSON.parse(local) : SEED_BUDGET_CATEGORIES;
  });

  const [transactions, setTransactions] = useState(() => {
    const local = localStorage.getItem('finflow_transactions');
    return local ? JSON.parse(local) : SEED_TRANSACTIONS;
  });

  const [goals, setGoals] = useState(() => {
    const local = localStorage.getItem('finflow_goals');
    return local ? JSON.parse(local) : SEED_GOALS;
  });

  const [recurringBills, setRecurringBills] = useState(() => {
    const local = localStorage.getItem('finflow_recurring_bills');
    return local ? JSON.parse(local) : SEED_RECURRING_BILLS;
  });

  const [profile, setProfile] = useState(() => {
    const local = localStorage.getItem('finflow_profile');
    return local ? JSON.parse(local) : {
      name: '',
      monthlyIncome: 75000,
      hourlyRate: 500,
      currency: '₹',
      budgetStartDate: 1,
      claudeApiKey: '',
      useMockAI: true,
      isOnboarded: false,
      role: 'employee',
      collegeName: '',
      companyName: '',
      labelMode: 'credit-debit'
    };
  });

  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    const local = localStorage.getItem('finflow_badges');
    return local ? JSON.parse(local) : [];
  });

  const [toast, setToast] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('finflow_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('finflow_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finflow_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finflow_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finflow_recurring_bills', JSON.stringify(recurringBills));
  }, [recurringBills]);

  useEffect(() => {
    localStorage.setItem('finflow_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('finflow_badges', JSON.stringify(unlockedBadges));
  }, [unlockedBadges]);

  // Show a custom toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  // Helper: check and unlock badges
  const checkBadges = (currentTxs, currentBudgets, currentGoals, currentStreaks) => {
    const newlyUnlocked = [];

    const unlock = (badgeId, badgeName) => {
      if (!unlockedBadges.includes(badgeId) && !newlyUnlocked.includes(badgeId)) {
        newlyUnlocked.push(badgeId);
        showToast(`🏆 Badge Unlocked: ${badgeName}!`, 'success');
      }
    };

    // 1. First budget set
    if (currentBudgets.length > 0 && currentBudgets.some(b => b.limit > 0)) {
      unlock('first-budget', 'First budget set');
    }

    // 2. 7-day on-budget streak
    if (currentStreaks.budgetStreak >= 7) {
      unlock('7-day-streak', '7-day on-budget streak');
    }

    // 3. Month under budget (checking current month spend vs total budget limit)
    const now = new Date();
    const currentMonthTxs = currentTxs.filter(tx => {
      const txDate = new Date(tx.date);
      return tx.type === 'expense' && 
             txDate.getMonth() === now.getMonth() && 
             txDate.getFullYear() === now.getFullYear();
    });
    const totalSpent = currentMonthTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const totalBudget = currentBudgets.reduce((sum, b) => sum + b.limit, 0);
    if (totalBudget > 0 && totalSpent > 0 && totalSpent <= totalBudget) {
      // Checked especially if there are enough transactions or at month end, let's unlock if spent is substantial but under budget
      if (totalSpent > totalBudget * 0.5) {
        unlock('month-under-budget', 'Month under budget');
      }
    }

    // 4. Goal completed
    if (currentGoals.some(g => g.currentAmount >= g.targetAmount)) {
      unlock('goal-completed', 'Goal completed');
    }

    // 5. 3 months positive savings rate
    // If they have salary transactions and overall positive savings rate
    const savingsRate = (profile.monthlyIncome - totalSpent) / profile.monthlyIncome;
    if (savingsRate > 0.1) {
      unlock('3-months-positive', '3 months positive savings rate');
    }

    // 6. No-spend week achieved
    if (currentStreaks.noSpendStreak >= 7) {
      unlock('no-spend-week', 'No-spend week achieved');
    }

    if (newlyUnlocked.length > 0) {
      setUnlockedBadges(prev => [...prev, ...newlyUnlocked]);
    }
  };

  // Streaks calculations
  const calculateStreaks = () => {
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .map(t => ({
        amount: t.amount,
        dateStr: t.date.split('T')[0]
      }));

    // Group expenses by date
    const dailyExpenses = {};
    expenses.forEach(e => {
      dailyExpenses[e.dateStr] = (dailyExpenses[e.dateStr] || 0) + e.amount;
    });

    const today = new Date();
    let noSpendStreak = 0;
    let budgetStreak = 0;
    
    // Daily budget limit
    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const dailyBudgetLimit = totalBudgetLimit > 0 ? totalBudgetLimit / 30 : 2000;

    // Check back up to 30 days
    // 1. No spend streak (consecutive days with 0 expenses)
    let tempNoSpend = 0;
    let checkingDate = new Date(today);
    for (let i = 0; i < 30; i++) {
      const dateStr = checkingDate.toISOString().split('T')[0];
      const spent = dailyExpenses[dateStr] || 0;
      if (spent === 0) {
        tempNoSpend++;
      } else {
        // If today has expenses, we don't break immediately if we're just checking the streak from yesterday
        if (i === 0) {
          // If spent today, check starting yesterday
          continue;
        } else {
          break;
        }
      }
      checkingDate.setDate(checkingDate.getDate() - 1);
    }
    noSpendStreak = tempNoSpend;

    // 2. Budget streak (consecutive days under daily budget)
    let tempBudget = 0;
    checkingDate = new Date(today);
    for (let i = 0; i < 30; i++) {
      const dateStr = checkingDate.toISOString().split('T')[0];
      const spent = dailyExpenses[dateStr] || 0;
      if (spent <= dailyBudgetLimit) {
        tempBudget++;
      } else {
        if (i === 0) {
          continue;
        } else {
          break;
        }
      }
      checkingDate.setDate(checkingDate.getDate() - 1);
    }
    budgetStreak = tempBudget;

    return { noSpendStreak, budgetStreak };
  };

  const streaks = calculateStreaks();

  // Run badge checks when key dependencies change
  useEffect(() => {
    checkBadges(transactions, budgets, goals, streaks);
  }, [transactions, budgets, goals]);

  // Transaction Actions
  const addTransaction = (tx) => {
    const newTx = {
      ...tx,
      id: tx.id || `tx-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === newTx.accountId) {
        const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount;
        return { ...acc, balance: acc.balance + delta };
      }
      return acc;
    }));

    setTransactions(prev => [newTx, ...prev]);
    showToast(`Added ${newTx.type} transaction of ${profile.currency}${newTx.amount}`);

    // Auto-detect recurring bills
    if (newTx.type === 'expense' && !newTx.isRecurring) {
      // Find similar transactions in the past (same merchant and amount within 10% range)
      const matches = transactions.filter(t => 
        t.id !== newTx.id &&
        t.type === 'expense' &&
        t.merchant.toLowerCase() === newTx.merchant.toLowerCase() &&
        Math.abs(t.amount - newTx.amount) / newTx.amount < 0.1
      );

      if (matches.length >= 1 && !recurringBills.some(b => b.merchant.toLowerCase() === newTx.merchant.toLowerCase())) {
        showToast(`💡 Auto-detected repeating cost: "${newTx.merchant}". Check bills tracker!`, 'info');
      }
    }
  };

  const deleteTransaction = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // Refund account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === tx.accountId) {
        const delta = tx.type === 'income' ? -tx.amount : tx.amount;
        return { ...acc, balance: acc.balance + delta };
      }
      return acc;
    }));

    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast(`Deleted transaction of ${profile.currency}${tx.amount}`, 'warning');
  };

  const updateTransaction = (updatedTx) => {
    const oldTx = transactions.find(t => t.id === updatedTx.id);
    if (!oldTx) return;

    // Recalculate balances
    setAccounts(prev => prev.map(acc => {
      let balance = acc.balance;
      // Undo old transaction
      if (acc.id === oldTx.accountId) {
        const oldDelta = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
        balance += oldDelta;
      }
      // Apply new transaction
      if (acc.id === updatedTx.accountId) {
        const newDelta = updatedTx.type === 'income' ? updatedTx.amount : -updatedTx.amount;
        balance += newDelta;
      }
      return { ...acc, balance };
    }));

    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    showToast('Transaction updated');
  };

  const bulkDeleteTransactions = (ids) => {
    const txsToDelete = transactions.filter(t => ids.includes(t.id));
    
    // Adjust account balances
    setAccounts(prev => prev.map(acc => {
      let balance = acc.balance;
      txsToDelete.forEach(tx => {
        if (tx.accountId === acc.id) {
          balance += tx.type === 'income' ? -tx.amount : tx.amount;
        }
      });
      return { ...acc, balance };
    }));

    setTransactions(prev => prev.filter(t => !ids.includes(t.id)));
    showToast(`Deleted ${ids.length} transactions`, 'warning');
  };

  const bulkCategorizeTransactions = (ids, category) => {
    setTransactions(prev => prev.map(t => ids.includes(t.id) ? { ...t, category } : t));
    showToast(`Re-categorized ${ids.length} transactions to ${category}`);
  };

  // Budget Actions
  const updateBudgetLimit = (id, limit) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, limit: Number(limit) } : b));
    showToast(`Updated budget limit`);
  };

  const toggleBudgetRollover = (id) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, rollover: !b.rollover } : b));
    showToast(`Toggled budget rollover`);
  };

  const setAllBudgets = (newBudgets) => {
    setBudgets(newBudgets);
    showToast('Applied budget template');
  };

  // Goal Actions
  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setGoals(prev => [...prev, newGoal]);
    showToast(`Added goal "${newGoal.name}"`);
  };

  const updateGoal = (updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const deleteGoal = (id) => {
    const goal = goals.find(g => g.id === id);
    setGoals(prev => prev.filter(g => g.id !== id));
    showToast(`Deleted goal "${goal?.name}"`, 'warning');
  };

  const addGoalFunds = (id, amount) => {
    let celebratoryTrigger = false;
    let completed = false;

    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextAmount = g.currentAmount + Number(amount);
        const oldPercent = (g.currentAmount / g.targetAmount) * 100;
        const newPercent = (nextAmount / g.targetAmount) * 100;
        
        // Milestones: 25%, 50%, 75%, 100%
        const milestones = [25, 50, 75, 100];
        milestones.forEach(m => {
          if (oldPercent < m && newPercent >= m) {
            celebratoryTrigger = m; // store which milestone was hit
          }
        });

        if (newPercent >= 100) completed = true;

        return { ...g, currentAmount: Math.min(nextAmount, g.targetAmount) };
      }
      return g;
    }));

    // Deduct from standard accounts (e.g. cash or savings)
    // Find first savings or cash account
    const savingsAcc = accounts.find(a => a.type === 'savings') || accounts[0];
    if (savingsAcc) {
      setAccounts(prev => prev.map(acc => 
        acc.id === savingsAcc.id ? { ...acc, balance: acc.balance - Number(amount) } : acc
      ));
    }

    if (celebratoryTrigger) {
      window.dispatchEvent(new CustomEvent('confetti-trigger', { detail: { milestone: celebratoryTrigger } }));
      showToast(`🎉 Goa reached milestone ${celebratoryTrigger}%!`, 'success');
    } else {
      showToast(`Added ${profile.currency}${amount} to goal`);
    }
  };

  const withdrawGoalFunds = (id, amount) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextAmount = Math.max(0, g.currentAmount - Number(amount));
        return { ...g, currentAmount: nextAmount };
      }
      return g;
    }));

    // Refund to savings/cash account
    const savingsAcc = accounts.find(a => a.type === 'savings') || accounts[0];
    if (savingsAcc) {
      setAccounts(prev => prev.map(acc => 
        acc.id === savingsAcc.id ? { ...acc, balance: acc.balance + Number(amount) } : acc
      ));
    }

    showToast(`Withdrew ${profile.currency}${amount} from goal`, 'warning');
  };

  // Account Actions
  const addAccount = (acc) => {
    const newAcc = {
      ...acc,
      id: `acc-${Date.now()}`
    };
    setAccounts(prev => [...prev, newAcc]);
    showToast(`Added account "${newAcc.name}"`);
  };

  const updateAccount = (updatedAcc) => {
    setAccounts(prev => prev.map(a => a.id === updatedAcc.id ? updatedAcc : a));
    showToast(`Updated account "${updatedAcc.name}"`);
  };

  const deleteAccount = (id) => {
    const acc = accounts.find(a => a.id === id);
    setAccounts(prev => prev.filter(a => a.id !== id));
    showToast(`Deleted account "${acc?.name}"`, 'warning');
  };

  // Recurring Bill Actions
  const addRecurringBill = (bill) => {
    const newBill = {
      ...bill,
      id: `rb-${Date.now()}`,
      isPaid: false
    };
    setRecurringBills(prev => [...prev, newBill]);
    showToast(`Added recurring bill for "${newBill.merchant}"`);
  };

  const deleteRecurringBill = (id) => {
    setRecurringBills(prev => prev.filter(b => b.id !== id));
    showToast('Deleted recurring bill', 'warning');
  };

  const markBillAsPaid = (id) => {
    const bill = recurringBills.find(b => b.id === id);
    if (!bill) return;

    // Deduct bill payment from first available account
    const paymentAcc = accounts.find(a => a.type === 'savings') || accounts[0];
    if (paymentAcc) {
      addTransaction({
        amount: bill.amount,
        type: 'expense',
        category: bill.category || 'Utilities',
        merchant: bill.merchant,
        note: `Recurring bill payment (${bill.cycle})`,
        date: new Date().toISOString(),
        accountId: paymentAcc.id,
        mood: 'happy',
        isRecurring: true
      });
    }

    // Push next due date forward by cycle
    setRecurringBills(prev => prev.map(b => {
      if (b.id === id) {
        const nextDate = new Date(b.nextDueDate);
        if (b.cycle === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        else if (b.cycle === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        else if (b.cycle === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

        return {
          ...b,
          nextDueDate: nextDate.toISOString(),
          isPaid: false // stays active for next period
        };
      }
      return b;
    }));

    showToast(`Paid bill for "${bill.merchant}" of ${profile.currency}${bill.amount}`);
  };

  // Profile Actions
  const updateProfile = (newProfile) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
    showToast('Profile settings updated');
  };

  // Reset and Import/Export
  const resetAllData = () => {
    setAccounts(SEED_ACCOUNTS);
    setBudgets(SEED_BUDGET_CATEGORIES);
    setTransactions(SEED_TRANSACTIONS);
    setGoals(SEED_GOALS);
    setRecurringBills(SEED_RECURRING_BILLS);
    setUnlockedBadges([]);
    setProfile({
      name: '',
      monthlyIncome: 75000,
      hourlyRate: 500,
      currency: '₹',
      budgetStartDate: 1,
      claudeApiKey: '',
      useMockAI: true,
      isOnboarded: false,
      role: 'employee',
      collegeName: '',
      companyName: '',
      labelMode: 'credit-debit'
    });
    showToast('Reset all data to default seed records', 'warning');
  };

  const completeOnboarding = ({ name, role, collegeName, companyName, monthlyIncome, monthlySpendLimit, hourlyRate, currency, initialBalances }) => {
    // 1. Update Profile
    const updatedProfile = {
      name,
      role,
      collegeName: role === 'student' ? collegeName : '',
      companyName: role === 'employee' ? companyName : '',
      monthlyIncome: Number(monthlyIncome),
      monthlySpendLimit: Number(monthlySpendLimit || (role === 'student' ? 10000 : 50000)),
      hourlyRate: Number(hourlyRate || (role === 'student' ? 100 : 500)),
      currency: currency || '₹',
      budgetStartDate: 1,
      claudeApiKey: '',
      useMockAI: true,
      isOnboarded: true,
      labelMode: 'credit-debit'
    };
    setProfile(updatedProfile);

    // 2. Set accounts initial balances
    setAccounts([
      {
        id: 'acc-hdfc-savings',
        name: role === 'student' ? 'SBI Savings' : 'HDFC Savings',
        type: 'savings',
        balance: Number(initialBalances.savings || 10000),
        color: '#00D4AA',
        icon: 'Landmark'
      },
      {
        id: 'acc-icici-credit',
        name: role === 'student' ? 'Paytm Postpaid' : 'ICICI Credit',
        type: 'credit',
        balance: -Number(initialBalances.credit || 0),
        color: '#FF5C5C',
        icon: 'CreditCard'
      },
      {
        id: 'acc-cash',
        name: 'Cash',
        type: 'cash',
        balance: Number(initialBalances.cash || 1000),
        color: '#F5A623',
        icon: 'Wallet'
      }
    ]);

    // 3. Generate Transactions based on role
    let newTxs = [];
    if (role === 'student') {
      newTxs = [
        {
          id: 'tx-s1',
          amount: Number(monthlyIncome),
          type: 'income',
          category: 'Salary',
          merchant: 'Parents Allowance',
          note: 'Monthly pocket money allowance',
          date: new Date().toISOString(),
          accountId: 'acc-hdfc-savings',
          mood: 'happy',
          isRecurring: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tx-s2',
          amount: 649,
          type: 'expense',
          category: 'Entertainment',
          merchant: 'Netflix',
          note: 'Shared Premium Screen subscription',
          date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          accountId: 'acc-icici-credit',
          mood: 'happy',
          isRecurring: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tx-s3',
          amount: 850,
          type: 'expense',
          category: 'Food & dining',
          merchant: 'Swiggy',
          note: 'Weekend hostel room pizza order',
          date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          accountId: 'acc-hdfc-savings',
          mood: 'impulsive',
          isRecurring: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tx-s4',
          amount: 250,
          type: 'expense',
          category: 'Transport',
          merchant: 'Namma Metro',
          note: 'Metro card smart topup',
          date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
          accountId: 'acc-cash',
          mood: 'happy',
          isRecurring: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tx-s5',
          amount: 2500,
          type: 'expense',
          category: 'Other',
          merchant: 'College Library Bookstore',
          note: 'Engineering / Business textbooks',
          date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          accountId: 'acc-hdfc-savings',
          mood: 'stressed',
          isRecurring: false,
          createdAt: new Date().toISOString()
        }
      ];
    } else {
      newTxs = [
        {
          id: 'tx-e1',
          amount: Number(monthlyIncome),
          type: 'income',
          category: 'Salary',
          merchant: 'TCS Private Ltd',
          note: 'Monthly professional salary credit',
          date: new Date().toISOString(),
          accountId: 'acc-hdfc-savings',
          mood: 'happy',
          isRecurring: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tx-e2',
          amount: 15000,
          type: 'expense',
          category: 'Rent',
          merchant: 'Co-Living PG Space',
          note: 'Monthly rent transfer',
          date: new Date(Date.now() - 24 * 24 * 3600 * 1000).toISOString(),
          accountId: 'acc-hdfc-savings',
          mood: 'sad',
          isRecurring: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tx-e3',
          amount: 1250,
          type: 'expense',
          category: 'Food & dining',
          merchant: 'Zomato',
          note: 'Team dinner celebration',
          date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
          accountId: 'acc-icici-credit',
          mood: 'celebrating',
          isRecurring: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tx-e4',
          amount: 3200,
          type: 'expense',
          category: 'Shopping',
          merchant: 'Myntra',
          note: 'Formal shirts buy',
          date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
          accountId: 'acc-icici-credit',
          mood: 'impulsive',
          isRecurring: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tx-e5',
          amount: 5000,
          type: 'expense',
          category: 'Investment',
          merchant: 'Zerodha Mutual Fund SIP',
          note: 'Equity Index Fund',
          date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          accountId: 'acc-hdfc-savings',
          mood: 'happy',
          isRecurring: true,
          createdAt: new Date().toISOString()
        }
      ];
    }
    setTransactions(newTxs);

    // 4. Generate Budgets based on templates
    const splitPreset = role === 'student' ? 'student' : 'professional';
    const templates = {
      'professional': { needs: 50, wants: 30, savings: 20 },
      'student': { needs: 40, wants: 40, savings: 20 }
    };
    const temp = templates[splitPreset];
    const spendLimitToSplit = Number(monthlySpendLimit || (role === 'student' ? 10000 : 50000));
    const needsTotal = (spendLimitToSplit * temp.needs) / 100;
    const wantsTotal = (spendLimitToSplit * temp.wants) / 100;
    const savingsTotal = (spendLimitToSplit * temp.savings) / 100;

    const mapping = {
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

    const newBudgets = SEED_BUDGET_CATEGORIES.map(b => {
      let limit = 0;
      const group = mapping[b.name];
      if (group === 'Needs') {
        if (b.name === 'Rent') limit = role === 'student' ? 0 : needsTotal * 0.5;
        else if (b.name === 'Food & dining') limit = role === 'student' ? needsTotal * 0.6 : needsTotal * 0.25;
        else if (b.name === 'Utilities') limit = needsTotal * 0.15;
        else if (b.name === 'Transport') limit = needsTotal * 0.15;
        else limit = needsTotal * 0.10;
      } else if (group === 'Wants') {
        if (b.name === 'Shopping') limit = wantsTotal * 0.4;
        else if (b.name === 'Entertainment') limit = wantsTotal * 0.4;
        else limit = wantsTotal * 0.2;
      } else {
        if (b.name === 'Savings') limit = savingsTotal * 0.5;
        else limit = savingsTotal * 0.5;
      }
      return { ...b, limit: Math.round(limit) };
    });
    setBudgets(newBudgets);

    // 5. Generate Goals based on role
    let newGoals = [];
    if (role === 'student') {
      newGoals = [
        {
          id: 'g-s1',
          name: 'Goa Trip',
          emoji: '🌴',
          targetAmount: 15000,
          currentAmount: 3000,
          targetDate: new Date(Date.now() + 120 * 24 * 3600 * 1000).toISOString(),
          linkedCategory: 'Entertainment',
          createdAt: new Date().toISOString()
        },
        {
          id: 'g-s2',
          name: 'Semester Textbook fund',
          emoji: '🎓',
          targetAmount: 5000,
          currentAmount: 2000,
          targetDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
          linkedCategory: 'Other',
          createdAt: new Date().toISOString()
        }
      ];
    } else {
      newGoals = [
        {
          id: 'g-e1',
          name: 'Emergency Fund',
          emoji: '🛡️',
          targetAmount: 100000,
          currentAmount: 40000,
          targetDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
          linkedCategory: 'Savings',
          createdAt: new Date().toISOString()
        },
        {
          id: 'g-e2',
          name: 'New MacBook Pro',
          emoji: '💻',
          targetAmount: 150000,
          currentAmount: 70000,
          targetDate: new Date(Date.now() + 150 * 24 * 3600 * 1000).toISOString(),
          linkedCategory: 'Shopping',
          createdAt: new Date().toISOString()
        }
      ];
    }
    setGoals(newGoals);

    // 6. Set Bills
    let newBills = [];
    if (role === 'student') {
      newBills = [
        {
          id: 'rb-s1',
          merchant: 'Netflix',
          amount: 199,
          cycle: 'monthly',
          nextDueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          category: 'Entertainment',
          isPaid: false
        },
        {
          id: 'rb-s2',
          merchant: 'Spotify Student',
          amount: 59,
          cycle: 'monthly',
          nextDueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
          category: 'Entertainment',
          isPaid: false
        }
      ];
    } else {
      newBills = [
        {
          id: 'rb-e1',
          merchant: 'Netflix Premium',
          amount: 649,
          cycle: 'monthly',
          nextDueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          category: 'Entertainment',
          isPaid: false
        },
        {
          id: 'rb-e2',
          merchant: 'Cult.fit Gym',
          amount: 2500,
          cycle: 'monthly',
          nextDueDate: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString(),
          category: 'Health',
          isPaid: false
        }
      ];
    }
    setRecurringBills(newBills);
    setUnlockedBadges([]);
    showToast(`Welcome to FinFlow Onboarding Complete!`, 'success');
  };

  const importJSON = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.accounts) setAccounts(data.accounts);
      if (data.budgets) setBudgets(data.budgets);
      if (data.transactions) setTransactions(data.transactions);
      if (data.goals) setGoals(data.goals);
      if (data.recurringBills) setRecurringBills(data.recurringBills);
      if (data.profile) setProfile(data.profile);
      if (data.unlockedBadges) setUnlockedBadges(data.unlockedBadges);
      showToast('Successfully imported financial data!', 'success');
      return true;
    } catch (e) {
      showToast('Error importing JSON file', 'danger');
      return false;
    }
  };

  const exportJSON = () => {
    const data = {
      accounts,
      budgets,
      transactions,
      goals,
      recurringBills,
      profile,
      unlockedBadges
    };
    return JSON.stringify(data, null, 2);
  };

  return (
    <FinanceContext.Provider value={{
      accounts,
      budgets,
      transactions,
      goals,
      recurringBills,
      profile,
      streaks,
      unlockedBadges,
      toast,
      showToast,
      setToast,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      bulkDeleteTransactions,
      bulkCategorizeTransactions,
      updateBudgetLimit,
      toggleBudgetRollover,
      setAllBudgets,
      addGoal,
      updateGoal,
      deleteGoal,
      addGoalFunds,
      withdrawGoalFunds,
      addAccount,
      updateAccount,
      deleteAccount,
      addRecurringBill,
      deleteRecurringBill,
      markBillAsPaid,
      updateProfile,
      resetAllData,
      importJSON,
      exportJSON,
      completeOnboarding
    }}>
      {children}
      {toast && (
        <ToastNotification 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </FinanceContext.Provider>
  );
};

// Mini Toast component
const ToastNotification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const bgColors = {
    info: 'bg-surface-2 border-accent text-text-primary',
    success: 'bg-[#162D24] border-accent-2 text-accent-2',
    warning: 'bg-[#2E2015] border-warning text-warning',
    danger: 'bg-[#2D1B1B] border-danger text-danger'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 transform translate-y-0 ${bgColors[type] || bgColors.info} animate-slide-in`}>
      <span className="text-sm font-sans font-medium">{message}</span>
      <button onClick={onClose} className="ml-3 text-text-muted hover:text-text-primary focus:outline-none">
        &times;
      </button>
    </div>
  );
};

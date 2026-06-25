// Seed data for FinFlow

export const SEED_ACCOUNTS = [
  {
    id: 'acc-hdfc-savings',
    name: 'HDFC Savings',
    type: 'savings',
    balance: 85000,
    color: '#00D4AA', // teal-green
    icon: 'Landmark'
  },
  {
    id: 'acc-icici-credit',
    name: 'ICICI Credit',
    type: 'credit',
    balance: -12000,
    color: '#FF5C5C', // red
    icon: 'CreditCard'
  },
  {
    id: 'acc-cash',
    name: 'Cash',
    type: 'cash',
    balance: 2500,
    color: '#F5A623', // orange/amber
    icon: 'Wallet'
  }
];

export const SEED_BUDGET_CATEGORIES = [
  {
    id: 'b-food',
    name: 'Food & dining',
    emoji: '🍔',
    limit: 15000,
    color: '#6C63FF', // Purple
    rollover: true
  },
  {
    id: 'b-shopping',
    name: 'Shopping',
    emoji: '🛍️',
    limit: 10000,
    color: '#00D4AA', // Teal
    rollover: false
  },
  {
    id: 'b-transport',
    name: 'Transport',
    emoji: '🚗',
    limit: 5000,
    color: '#F5A623', // Amber
    rollover: true
  },
  {
    id: 'b-entertainment',
    name: 'Entertainment',
    emoji: '🍿',
    limit: 8000,
    color: '#FF5C5C', // Red
    rollover: false
  },
  {
    id: 'b-health',
    name: 'Health',
    emoji: '🏥',
    limit: 4000,
    color: '#EC4899', // Pink
    rollover: false
  },
  {
    id: 'b-utilities',
    name: 'Utilities',
    emoji: '⚡',
    limit: 6000,
    color: '#3B82F6', // Blue
    rollover: false
  },
  {
    id: 'b-rent',
    name: 'Rent',
    emoji: '🏠',
    limit: 25000,
    color: '#8B5CF6', // Violet
    rollover: false
  },
  {
    id: 'b-savings',
    name: 'Savings',
    emoji: '🐷',
    limit: 15000,
    color: '#10B981', // Emerald
    rollover: true
  },
  {
    id: 'b-investment',
    name: 'Investment',
    emoji: '📈',
    limit: 20000,
    color: '#6366F1', // Indigo
    rollover: true
  },
  {
    id: 'b-other',
    name: 'Other',
    emoji: '🏷️',
    limit: 5000,
    color: '#9CA3AF', // Gray
    rollover: false
  }
];

export const SEED_TRANSACTIONS = [
  {
    id: 'tx-1',
    amount: 25000,
    type: 'income',
    category: 'Salary',
    merchant: 'Razorpay Software',
    note: 'Freelance project final milestone payout',
    date: '2026-06-25T10:00:00Z',
    accountId: 'acc-hdfc-savings',
    mood: 'happy',
    isRecurring: false,
    receiptImage: null,
    createdAt: '2026-06-25T10:00:00Z'
  },
  {
    id: 'tx-2',
    amount: 1250,
    type: 'expense',
    category: 'Food & dining',
    merchant: 'Zomato',
    note: 'Dinner party with colleagues',
    date: '2026-06-24T20:30:00Z',
    accountId: 'acc-icici-credit',
    mood: 'celebrating',
    isRecurring: false,
    receiptImage: null,
    createdAt: '2026-06-24T20:30:00Z'
  },
  {
    id: 'tx-3',
    amount: 450,
    type: 'expense',
    category: 'Transport',
    merchant: 'Uber',
    note: 'Ride to office',
    date: '2026-06-24T08:45:00Z',
    accountId: 'acc-icici-credit',
    mood: 'stressed',
    isRecurring: false,
    receiptImage: null,
    createdAt: '2026-06-24T08:45:00Z'
  },
  {
    id: 'tx-4',
    amount: 649,
    type: 'expense',
    category: 'Entertainment',
    merchant: 'Netflix',
    note: 'Monthly Premium Subscription',
    date: '2026-06-22T00:00:00Z',
    accountId: 'acc-icici-credit',
    mood: 'bored',
    isRecurring: true,
    receiptImage: null,
    createdAt: '2026-06-22T00:00:00Z'
  },
  {
    id: 'tx-5',
    amount: 3200,
    type: 'expense',
    category: 'Shopping',
    merchant: 'Myntra',
    note: 'Bought jacket and sneakers',
    date: '2026-06-21T16:15:00Z',
    accountId: 'acc-icici-credit',
    mood: 'impulsive',
    isRecurring: false,
    receiptImage: null,
    createdAt: '2026-06-21T16:15:00Z'
  },
  {
    id: 'tx-6',
    amount: 850,
    type: 'expense',
    category: 'Food & dining',
    merchant: 'Swiggy',
    note: 'Biryani cravings at midnight',
    date: '2026-06-20T23:50:00Z',
    accountId: 'acc-cash',
    mood: 'happy',
    isRecurring: false,
    receiptImage: null,
    createdAt: '2026-06-20T23:50:00Z'
  },
  {
    id: 'tx-7',
    amount: 15000,
    type: 'expense',
    category: 'Rent',
    merchant: 'Co-Living PG Space',
    note: 'Monthly room rent contribution',
    date: '2026-06-01T09:00:00Z',
    accountId: 'acc-hdfc-savings',
    mood: 'sad',
    isRecurring: true,
    receiptImage: null,
    createdAt: '2026-06-01T09:00:00Z'
  },
  {
    id: 'tx-8',
    amount: 2500,
    type: 'expense',
    category: 'Health',
    merchant: 'Cult.fit',
    note: 'Gym monthly membership',
    date: '2026-06-05T07:00:00Z',
    accountId: 'acc-hdfc-savings',
    mood: 'happy',
    isRecurring: true,
    receiptImage: null,
    createdAt: '2026-06-05T07:00:00Z'
  },
  {
    id: 'tx-9',
    amount: 119,
    type: 'expense',
    category: 'Entertainment',
    merchant: 'Spotify',
    note: 'Premium music streaming plan',
    date: '2026-05-28T02:00:00Z',
    accountId: 'acc-icici-credit',
    mood: 'happy',
    isRecurring: true,
    receiptImage: null,
    createdAt: '2026-05-28T02:00:00Z'
  },
  {
    id: 'tx-10',
    amount: 4500,
    type: 'expense',
    category: 'Shopping',
    merchant: 'DMart',
    note: 'Monthly groceries and household items',
    date: '2026-06-18T11:30:00Z',
    accountId: 'acc-hdfc-savings',
    mood: 'bored',
    isRecurring: false,
    receiptImage: null,
    createdAt: '2026-06-18T11:30:00Z'
  },
  {
    id: 'tx-11',
    amount: 349,
    type: 'expense',
    category: 'Utilities',
    merchant: 'Jio Fiber',
    note: 'Internet broadband recharge',
    date: '2026-06-17T14:20:00Z',
    accountId: 'acc-cash',
    mood: 'happy',
    isRecurring: true,
    receiptImage: null,
    createdAt: '2026-06-17T14:20:00Z'
  },
  {
    id: 'tx-12',
    amount: 5000,
    type: 'expense',
    category: 'Investment',
    merchant: 'Zerodha Coin',
    note: 'Nifty 50 Index Mutual Fund SIP',
    date: '2026-06-15T09:15:00Z',
    accountId: 'acc-hdfc-savings',
    mood: 'happy',
    isRecurring: true,
    receiptImage: null,
    createdAt: '2026-06-15T09:15:00Z'
  },
  {
    id: 'tx-13',
    amount: 1800,
    type: 'expense',
    category: 'Food & dining',
    merchant: 'Social Offline Pub',
    note: 'Weekend drinks with school friends',
    date: '2026-06-13T22:00:00Z',
    accountId: 'acc-icici-credit',
    mood: 'celebrating',
    isRecurring: false,
    receiptImage: null,
    createdAt: '2026-06-13T22:00:00Z'
  },
  {
    id: 'tx-14',
    amount: 1200,
    type: 'expense',
    category: 'Shopping',
    merchant: 'Amazon India',
    note: 'Urgent mobile screen replacement guard',
    date: '2026-06-12T10:45:00Z',
    accountId: 'acc-icici-credit',
    mood: 'stressed',
    isRecurring: false,
    receiptImage: null,
    createdAt: '2026-06-12T10:45:00Z'
  },
  {
    id: 'tx-15',
    amount: 75000,
    type: 'income',
    category: 'Salary',
    merchant: 'TCS Private Ltd',
    note: 'Monthly salary credit',
    date: '2026-06-01T08:00:00Z',
    accountId: 'acc-hdfc-savings',
    mood: 'happy',
    isRecurring: true,
    receiptImage: null,
    createdAt: '2026-06-01T08:00:00Z'
  },
  {
    id: 'tx-16',
    amount: 980,
    type: 'expense',
    category: 'Food & dining',
    merchant: 'Dominos Pizza',
    note: 'Impulsive office snack order',
    date: '2026-06-10T17:30:00Z',
    accountId: 'acc-icici-credit',
    mood: 'impulsive',
    isRecurring: false,
    receiptImage: null,
    createdAt: '2026-06-10T17:30:00Z'
  },
  {
    id: 'tx-17',
    amount: 1200,
    type: 'expense',
    category: 'Other',
    merchant: 'Apollo Pharmacy',
    note: 'Allergy medicines and masks',
    date: '2026-06-08T13:10:00Z',
    accountId: 'acc-cash',
    mood: 'sad',
    isRecurring: false,
    receiptImage: null,
    createdAt: '2026-06-08T13:10:00Z'
  },
  {
    id: 'tx-18',
    amount: 3500,
    type: 'expense',
    category: 'Shopping',
    merchant: 'DMart',
    note: 'Apparel and groceries buyout',
    date: '2026-06-06T15:20:00Z',
    accountId: 'acc-cash',
    mood: 'bored',
    isRecurring: false,
    receiptImage: null,
    createdAt: '2026-06-06T15:20:00Z'
  },
  {
    id: 'tx-19',
    amount: 250,
    type: 'expense',
    category: 'Transport',
    merchant: 'Namma Metro',
    note: 'Metro card auto topup',
    date: '2026-06-03T09:00:00Z',
    accountId: 'acc-cash',
    mood: 'happy',
    isRecurring: false,
    receiptImage: null,
    createdAt: '2026-06-03T09:00:00Z'
  },
  {
    id: 'tx-20',
    amount: 3800,
    type: 'expense',
    category: 'Utilities',
    merchant: 'BESCOM Electricity',
    note: 'Monthly power bill payment',
    date: '2026-06-02T11:00:00Z',
    accountId: 'acc-hdfc-savings',
    mood: 'stressed',
    isRecurring: true,
    receiptImage: null,
    createdAt: '2026-06-02T11:00:00Z'
  }
];

export const SEED_GOALS = [
  {
    id: 'g-emergency',
    name: 'Emergency Fund',
    emoji: '🛡️',
    targetAmount: 100000,
    currentAmount: 40000,
    targetDate: '2026-12-31T23:59:59Z',
    linkedCategory: 'Savings',
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'g-goa',
    name: 'Goa Trip',
    emoji: '🌴',
    targetAmount: 25000,
    currentAmount: 18000,
    targetDate: '2026-10-15T23:59:59Z',
    linkedCategory: 'Entertainment',
    createdAt: '2026-03-10T12:00:00Z'
  }
];

export const SEED_RECURRING_BILLS = [
  {
    id: 'rb-netflix',
    merchant: 'Netflix',
    amount: 649,
    cycle: 'monthly',
    nextDueDate: '2026-07-02T00:00:00Z',
    category: 'Entertainment',
    isPaid: false
  },
  {
    id: 'rb-spotify',
    merchant: 'Spotify',
    amount: 119,
    cycle: 'monthly',
    nextDueDate: '2026-06-28T00:00:00Z',
    category: 'Entertainment',
    isPaid: false
  },
  {
    id: 'rb-cultfit',
    merchant: 'Cult.fit',
    amount: 2500,
    cycle: 'monthly',
    nextDueDate: '2026-07-05T00:00:00Z',
    category: 'Health',
    isPaid: false
  }
];

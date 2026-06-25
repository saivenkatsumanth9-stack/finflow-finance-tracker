// AI Helper for FinFlow Assistant

// 1. Generate Context payload
export function generateFinancialContext(store) {
  const { transactions, budgets, goals, accounts, profile } = store;

  const now = new Date();
  const currentMonthTxs = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === now.getMonth() && 
           txDate.getFullYear() === now.getFullYear();
  });

  const totalSpent = currentMonthTxs
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const categoryTotals = {};
  currentMonthTxs
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

  const topCategories = Object.keys(categoryTotals).map(name => {
    const b = budgets.find(x => x.name === name);
    const limit = b ? b.limit : 0;
    return {
      category: name,
      spent: categoryTotals[name],
      limit
    };
  }).sort((a, b) => b.spent - a.spent);

  // Group spends by mood
  const moodBreakdown = {};
  currentMonthTxs
    .filter(tx => tx.type === 'expense' && tx.mood)
    .forEach(tx => {
      moodBreakdown[tx.mood] = (moodBreakdown[tx.mood] || 0) + tx.amount;
    });

  return {
    name: profile.name,
    monthly_income: profile.monthlyIncome,
    total_spent_this_month: totalSpent,
    budget_limit: budgets.reduce((sum, b) => sum + b.limit, 0),
    top_categories: topCategories,
    recent_transactions: transactions.slice(0, 5).map(t => ({
      merchant: t.merchant,
      amount: t.amount,
      type: t.type,
      category: t.category,
      mood: t.mood,
      date: t.date.split('T')[0]
    })),
    goals: goals.map(g => ({
      name: g.name,
      target: g.targetAmount,
      current: g.currentAmount,
      percent: Math.round((g.currentAmount / g.targetAmount) * 100)
    })),
    mood_breakdown: moodBreakdown,
    net_worth: accounts.reduce((sum, acc) => sum + acc.balance, 0)
  };
}

// 2. Fetch Anthropic Claude API
export async function callClaudeApi(apiKey, userMessage, context) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        // Browsers block direct api.anthropic.com calls unless CORS is bypassed.
        // We write the standard endpoint call; in dev or via extension this may pass,
        // otherwise it will catch and fallback gracefully to the simulator.
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: `You are FinFlow's personal finance assistant. You have access to the user's complete financial data: transactions, budgets, goals, and account balances provided in the context. Answer questions about their finances clearly and helpfully. When giving advice, be specific to their actual numbers. Keep responses concise (under 150 words). Use INR (₹) for all amounts. Be encouraging but honest about overspending.`,
        messages: [
          {
            role: 'user',
            content: `User query: "${userMessage}"\n\nFinancial Context: ${JSON.stringify(context, null, 2)}`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'API Request failed');
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API call failed:', error);
    throw new Error(
      error.message.includes('Failed to fetch') 
        ? 'CORS Restriction: Direct browser calls to Anthropic are blocked for key safety. Try using the Local AI simulator.' 
        : error.message
    );
  }
}

// 3. Smart Local AI Simulator
export function getLocalAIResponse(query, context) {
  const q = query.toLowerCase();
  const currency = '₹';
  const name = context.name;

  // Question 1: How did I do this month?
  if (q.includes('how did i do') || q.includes('this month') || q.includes('status')) {
    const spent = context.total_spent_this_month;
    const limit = context.budget_limit;
    const savings = context.monthly_income - spent;
    const savingsPercent = context.monthly_income > 0 ? Math.round((savings / context.monthly_income) * 100) : 0;

    if (spent > limit) {
      return `Hi ${name}, you've spent ${currency}${spent.toLocaleString('en-IN')} this month, which exceeds your total budget of ${currency}${limit.toLocaleString('en-IN')}. We have crossed limits in some categories. I suggest pausing non-essential shopping to recover your positive cash flow.`;
    } else {
      return `Looking solid, ${name}! You've spent ${currency}${spent.toLocaleString('en-IN')} out of your ${currency}${limit.toLocaleString('en-IN')} budget. That leaves you with a savings rate of ${savingsPercent}% (${currency}${savings.toLocaleString('en-IN')} saved). You are currently staying well within your safe zone!`;
    }
  }

  // Question 2: Where can I cut spending?
  if (q.includes('cut spending') || q.includes('save money') || q.includes('reduce') || q.includes('spend less')) {
    if (context.top_categories.length === 0) {
      return `No transaction history found to analyze. Once you add expenses, I will check your highest categories and identify where leaks can be cut!`;
    }

    const top = context.top_categories[0];
    const suggestions = [];
    if (top.category === 'Food & dining') {
      suggestions.push(`Your biggest category is Food & dining (${currency}${top.spent.toLocaleString('en-IN')}). Try packing lunch or reducing Swiggy order frequencies by 25% to save easily.`);
    } else if (top.category === 'Shopping') {
      suggestions.push(`Shopping is taking up ${currency}${top.spent.toLocaleString('en-IN')}. Consider checking out items using the 48-hour rule to filter impulsive desires.`);
    } else {
      suggestions.push(`Your largest spending is in "${top.category}" (${currency}${top.spent.toLocaleString('en-IN')}). Look at recent transactions here to see if any are optional.`);
    }

    // Mood insight if stressed
    if (context.mood_breakdown.stressed > 1500) {
      suggestions.push(`Also, you spent ${currency}${context.mood_breakdown.stressed.toLocaleString('en-IN')} when feeling Stressed. Emotional spending is a major leak. Try replacement activities like exercise!`);
    }

    return `Here is your strategy: ${suggestions.join(' ')}`;
  }

  // Question 3: Am I on track for my goals?
  if (q.includes('goals') || q.includes('track') || q.includes('goa') || q.includes('emergency')) {
    if (context.goals.length === 0) {
      return `You haven't configured any savings goals yet. Head over to the Goals Tracker page to define emergency buffers or vacation funds!`;
    }

    const goalStatus = context.goals.map(g => {
      return `"${g.name}" is ${g.percent}% complete (${g.current}/${g.target})`;
    }).join(', ');

    const emergency = context.goals.find(g => g.name.toLowerCase().includes('emergency'));
    let emergencyAdvice = '';
    if (emergency && emergency.percent < 50) {
      emergencyAdvice = ` Focus on building your Emergency Fund to at least 3 months of expenses first to stay bulletproof.`;
    }

    return `You're making progress! Here is your status: ${goalStatus}.${emergencyAdvice}`;
  }

  // Question 4: What's my biggest expense category?
  if (q.includes('biggest expense') || q.includes('largest spend') || q.includes('category')) {
    if (context.top_categories.length === 0) {
      return `You haven't spent anything this month yet! Once you log expenses, I will show your top category.`;
    }
    const top = context.top_categories[0];
    return `Your biggest category this month is **${top.category}**, with a total spent of **${currency}${top.spent.toLocaleString('en-IN')}** (limit: ${currency}${top.limit.toLocaleString('en-IN')}).`;
  }

  // Question 5: How much can I save this month?
  if (q.includes('how much can i save') || q.includes('savings rate') || q.includes('save this month')) {
    const spent = context.total_spent_this_month;
    const income = context.monthly_income;
    const projected = Math.max(0, income - spent);
    const rate = income > 0 ? ((projected / income) * 100).toFixed(0) : 0;

    return `Based on your monthly net income of ${currency}${income.toLocaleString('en-IN')} and current spending of ${currency}${spent.toLocaleString('en-IN')}, you are on track to save **${currency}${projected.toLocaleString('en-IN')}** this month. That is a **${rate}%** savings rate!`;
  }

  // Keyword: swiggy or zomato or food
  if (q.includes('swiggy') || q.includes('zomato') || q.includes('food') || q.includes('dining')) {
    const foodTotal = context.top_categories.find(c => c.category === 'Food & dining')?.spent || 0;
    return `Your total Food & dining spend is ${currency}${foodTotal.toLocaleString('en-IN')}. Eating out is convenient, but cooking at home can free up close to 40% of this budget. Try setting a weekly Swiggy cap of ₹1,000!`;
  }

  // Keyword: mood or emotional
  if (q.includes('mood') || q.includes('emotional') || q.includes('stressed') || q.includes('impulsive')) {
    const stressTotal = context.mood_breakdown.stressed || 0;
    const impulsiveTotal = context.mood_breakdown.impulsive || 0;
    const emotionalTotal = stressTotal + impulsiveTotal;

    if (emotionalTotal > 0) {
      return `Emotional triggers (Stressed + Impulsive) account for ${currency}${emotionalTotal.toLocaleString('en-IN')} of your spending. Identifying the feeling *before* clicking check-out is the secret to cutting this.`;
    }
    return `You haven't logged any emotional/impulsive expenses this month. Keep tagging transactions with your emotional state when you add them!`;
  }

  // General fallbacks
  return `Hi ${name}! I'm your FinFlow financial guide. Currently, your Net Worth is ${currency}${context.net_worth.toLocaleString('en-IN')} across your accounts. This month, you've earned ${currency}${context.monthly_income.toLocaleString('en-IN')} and spent ${currency}${context.total_spent_this_month.toLocaleString('en-IN')}. Ask me about budgeting, saving, or your goals!`;
}

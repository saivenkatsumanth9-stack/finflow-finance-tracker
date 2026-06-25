import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  BarChart3, 
  Smile, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  Award,
  Clock,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export default function Analytics() {
  const { transactions, budgets, profile } = useFinance();
  const [activeTab, setActiveTab] = useState('spending');

  // Helper date tools
  const now = useMemo(() => new Date(), []);
  
  // Filter current month expenses
  const currentMonthExpenses = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return tx.type === 'expense' && 
             txDate.getMonth() === now.getMonth() && 
             txDate.getFullYear() === now.getFullYear();
    });
  }, [transactions, now]);

  // Donut Chart: Current month spending by category
  const donutData = useMemo(() => {
    const totals = {};
    currentMonthExpenses.forEach(tx => {
      totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
    });

    return Object.keys(totals).map(name => {
      const budgetObj = budgets.find(b => b.name === name);
      return {
        name,
        value: totals[name],
        color: budgetObj ? budgetObj.color : '#9CA3AF'
      };
    });
  }, [currentMonthExpenses, budgets]);

  // Area Chart: 6-month expense trend
  const areaData = useMemo(() => {
    const data = [];
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const monthIndex = d.getMonth();
      const year = d.getFullYear();

      const monthSpent = transactions
        .filter(tx => {
          const txDate = new Date(tx.date);
          return tx.type === 'expense' && 
                 txDate.getMonth() === monthIndex && 
                 txDate.getFullYear() === year;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      const monthIncome = transactions
        .filter(tx => {
          const txDate = new Date(tx.date);
          return tx.type === 'income' && 
                 txDate.getMonth() === monthIndex && 
                 txDate.getFullYear() === year;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      data.push({
        name: monthLabel,
        spent: monthSpent,
        income: monthIncome
      });
    }
    return data;
  }, [transactions, now]);

  // Top Merchants list
  const topMerchants = useMemo(() => {
    const counts = {};
    currentMonthExpenses.forEach(tx => {
      counts[tx.merchant] = (counts[tx.merchant] || 0) + tx.amount;
    });
    return Object.keys(counts)
      .map(name => ({ name, value: counts[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [currentMonthExpenses]);

  // Stats: Averages and records
  const stats = useMemo(() => {
    // Average daily spent
    const daysInMonth = now.getDate(); // up to today
    const totalSpent = currentMonthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
    const avgDailyThisMonth = daysInMonth > 0 ? totalSpent / daysInMonth : 0;

    // Last month spent
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthTxs = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return tx.type === 'expense' && 
             txDate.getMonth() === lastMonth.getMonth() && 
             txDate.getFullYear() === lastMonth.getFullYear();
    });
    const lastMonthTotal = lastMonthTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const daysInLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    const avgDailyLastMonth = lastMonthTotal / daysInLastMonth;

    // Biggest single expense
    const biggestExpense = currentMonthExpenses.length > 0
      ? currentMonthExpenses.reduce((max, tx) => tx.amount > max.amount ? tx : max, currentMonthExpenses[0])
      : null;

    return {
      avgDailyThisMonth,
      avgDailyLastMonth,
      biggestExpense
    };
  }, [currentMonthExpenses, transactions, now]);

  // Mood Tab calculations
  const moodData = useMemo(() => {
    const totals = {};
    const counts = {};
    
    currentMonthExpenses.forEach(tx => {
      if (tx.mood) {
        totals[tx.mood] = (totals[tx.mood] || 0) + tx.amount;
        counts[tx.mood] = (counts[tx.mood] || 0) + 1;
      }
    });

    const moodColors = {
      happy: '#00D4AA',
      stressed: '#FF5C5C',
      bored: '#3B82F6',
      celebrating: '#6C63FF',
      sad: '#EC4899',
      impulsive: '#F5A623'
    };

    return Object.keys(totals).map(mood => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      spent: totals[mood],
      count: counts[mood],
      fill: moodColors[mood] || '#6C63FF'
    }));
  }, [currentMonthExpenses]);

  // Mood Insight text
  const moodInsight = useMemo(() => {
    const stressedObj = moodData.find(m => m.name === 'Stressed');
    const happyObj = moodData.find(m => m.name === 'Happy');
    
    if (stressedObj && happyObj && happyObj.spent > 0) {
      const diff = ((stressedObj.spent - happyObj.spent) / happyObj.spent) * 100;
      if (diff > 0) {
        return `You spent ${diff.toFixed(0)}% more when stressed vs happy. Deep breathing or a walk is cheaper than impulsive therapy purchases!`;
      }
    }
    
    // Fallback/alternative insight
    const impulsiveObj = moodData.find(m => m.name === 'Impulsive');
    if (impulsiveObj && impulsiveObj.spent > 3000) {
      return `Impulsive buying represented ₹${impulsiveObj.spent.toLocaleString('en-IN')} of this month's spending. Consider holding items in your cart for 48 hours.`;
    }

    return 'Your spending habits are relatively emotionally balanced this month. Keep tracking mood tags to unlock personalized recommendations.';
  }, [moodData]);

  // Hours Worked Tab calculations
  const hoursData = useMemo(() => {
    const totals = {};
    currentMonthExpenses.forEach(tx => {
      totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
    });

    const rate = profile.hourlyRate > 0 ? profile.hourlyRate : 1;

    return Object.keys(totals).map(name => {
      const budgetObj = budgets.find(b => b.name === name);
      const hours = totals[name] / rate;
      return {
        name,
        hours: Math.round(hours * 10) / 10,
        spent: totals[name],
        color: budgetObj ? budgetObj.color : '#6B7280'
      };
    }).sort((a, b) => b.hours - a.hours);
  }, [currentMonthExpenses, budgets, profile.hourlyRate]);

  // Trends Tab calculations
  const trendsData = useMemo(() => {
    const data = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const monthIndex = d.getMonth();
      const year = d.getFullYear();

      const spent = transactions
        .filter(tx => tx.type === 'expense' && new Date(tx.date).getMonth() === monthIndex && new Date(tx.date).getFullYear() === year)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const income = transactions
        .filter(tx => tx.type === 'income' && new Date(tx.date).getMonth() === monthIndex && new Date(tx.date).getFullYear() === year)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const rate = income > 0 ? ((income - spent) / income) * 100 : 0;

      data.push({
        name: monthLabel,
        spent,
        income,
        rate: Math.max(0, Math.round(rate))
      });
    }
    return data;
  }, [transactions, now]);

  // Render Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-xl shadow-xl font-mono text-xs flex flex-col gap-0.5">
          <span className="font-sans font-semibold text-text-muted text-[10px] uppercase">{label}</span>
          {payload.map((p, i) => (
            <span key={i} style={{ color: p.color || p.fill }}>
              {p.name}: <strong>{profile.currency}{p.value.toLocaleString('en-IN')}</strong>
            </span>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary tracking-tight">
          Analytics & Insights
        </h1>
        <p className="text-text-muted text-sm mt-0.5">
          Unlock granular correlations across category spends, emotional triggers, and labor hour costs.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-surface p-1 rounded-xl border border-border overflow-x-auto select-none">
        {[
          { id: 'spending', label: 'Spending Trends', icon: BarChart3 },
          { id: 'mood', label: 'Emotion & Mood', icon: Smile },
          { id: 'hours', label: 'Life-Hour Cost', icon: Briefcase },
          { id: 'trends', label: 'Budget Trends', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                ${activeTab === tab.id 
                  ? 'bg-accent text-text-primary font-bold shadow' 
                  : 'text-text-muted hover:text-text-primary'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Tabs */}
      <div className="space-y-6">
        
        {/* SPENDING TAB */}
        {activeTab === 'spending' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Donut Category Chart */}
            <div className="bg-surface p-5 rounded-2xl border border-border lg:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Spend by Category</h3>
                <p className="text-xs text-text-muted mt-0.5">Current month breakdown</p>
              </div>
              
              {donutData.length === 0 ? (
                <div className="py-20 text-center text-xs text-text-muted">No transactions recorded this month.</div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-4">
                  <div className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Custom Legend */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-4 text-[10px] text-text-muted">
                    {donutData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full min-w-[8px]" style={{ backgroundColor: d.color }} />
                        <span className="truncate">{d.name}</span>
                        <span className="font-mono text-text-primary ml-auto">{((d.value / currentMonthExpenses.reduce((sum, tx) => sum + tx.amount, 0)) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Area Chart: Spends over Time */}
            <div className="bg-surface p-5 rounded-2xl border border-border lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Cash Flow History</h3>
                <p className="text-xs text-text-muted mt-0.5">Income vs Expenses over the last 6 months</p>
              </div>
              
              <div className="h-[250px] w-full mt-5 font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF5C5C" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#FF5C5C" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#00D4AA" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252B38" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" name="Spent" dataKey="spent" stroke="#FF5C5C" fillOpacity={1} fill="url(#colorSpent)" strokeWidth={2} />
                    <Area type="monotone" name="Income" dataKey="income" stroke="#00D4AA" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mini widgets row */}
            <div className="bg-surface p-5 rounded-2xl border border-border lg:col-span-1 space-y-4">
              <h3 className="font-display font-bold text-sm text-text-primary">Monthly Highlights</h3>
              
              <div className="space-y-3.5">
                {/* Daily Averages */}
                <div className="bg-surface-2/40 border border-border p-3.5 rounded-xl">
                  <span className="text-[10px] text-text-muted block font-semibold uppercase">Avg Daily Spend This Month</span>
                  <span className="font-mono text-lg font-bold text-text-primary block mt-0.5">
                    {profile.currency}{Math.round(stats.avgDailyThisMonth).toLocaleString('en-IN')}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[10px]">
                    {stats.avgDailyThisMonth <= stats.avgDailyLastMonth ? (
                      <span className="text-accent-2 font-semibold flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        -{(((stats.avgDailyLastMonth - stats.avgDailyThisMonth) / (stats.avgDailyLastMonth || 1)) * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-danger font-semibold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        +{(((stats.avgDailyThisMonth - stats.avgDailyLastMonth) / (stats.avgDailyLastMonth || 1)) * 100).toFixed(0)}%
                      </span>
                    )}
                    <span className="text-text-muted">vs last month ({profile.currency}{Math.round(stats.avgDailyLastMonth)}/day)</span>
                  </div>
                </div>

                {/* Biggest Spend */}
                <div className="bg-surface-2/40 border border-border p-3.5 rounded-xl">
                  <span className="text-[10px] text-text-muted block font-semibold uppercase">Biggest Single Expense</span>
                  {stats.biggestExpense ? (
                    <>
                      <span className="font-mono text-lg font-bold text-danger block mt-0.5">
                        {profile.currency}{stats.biggestExpense.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-text-muted mt-0.5 block truncate">
                        Spent on <strong className="text-text-primary font-bold">{stats.biggestExpense.merchant}</strong> ({stats.biggestExpense.category})
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-text-muted block mt-1">No expenses registered.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Merchants Card */}
            <div className="bg-surface p-5 rounded-2xl border border-border lg:col-span-2">
              <h3 className="font-display font-bold text-sm text-text-primary mb-4">Top 5 Merchants</h3>
              
              {topMerchants.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted">No merchant transaction counts.</div>
              ) : (
                <div className="divide-y divide-border/60">
                  {topMerchants.map((merch, i) => (
                    <div key={merch.name} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-[10px] font-bold text-text-muted font-mono">{i + 1}</span>
                        <span className="text-xs font-semibold text-text-primary">{merch.name}</span>
                      </div>
                      <span className="font-mono text-xs font-bold">{profile.currency}{merch.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* MOOD TAB */}
        {activeTab === 'mood' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Mood Chart */}
            <div className="bg-surface p-5 rounded-2xl border border-border lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Spend by Emotional Mood</h3>
                <p className="text-xs text-text-muted mt-0.5">Total rupees spent grouped by mood tag</p>
              </div>

              {moodData.length === 0 ? (
                <div className="py-24 text-center text-xs text-text-muted">No mood tags found on transactions. Add mood tags in the Quick Add or Transactions tab!</div>
              ) : (
                <div className="h-[250px] w-full mt-5 font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#252B38" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="spent" radius={[8, 8, 0, 0]}>
                        {moodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* AI Mood Insight box */}
            <div className="bg-surface p-5 rounded-2xl border border-border lg:col-span-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                    <Smile className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-text-primary">Psychological Spent Insight</h3>
                </div>

                <div className="p-4 rounded-xl bg-[#2E2015] border border-warning/20 text-warning text-xs leading-relaxed font-sans shadow-sm flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-warning" />
                  <div>
                    <span className="font-bold block uppercase text-[9px] tracking-wider mb-0.5">Correlation Alert</span>
                    {moodInsight}
                  </div>
                </div>

                <div className="bg-surface-2 p-3.5 rounded-xl border border-border text-xs">
                  <span className="text-[10px] text-text-muted uppercase font-semibold">Mood spend counts this month:</span>
                  <div className="mt-2.5 space-y-2 font-mono">
                    {moodData.map(m => (
                      <div key={m.name} className="flex justify-between items-center text-xs">
                        <span className="text-text-primary font-sans">{m.name} Tag</span>
                        <span className="text-text-muted">{m.count} purchases • {profile.currency}{m.spent.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOURS WORKED TAB */}
        {activeTab === 'hours' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Category converted to work hours */}
            <div className="bg-surface p-5 rounded-2xl border border-border lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Expense Conversion to Labor Hours</h3>
                <p className="text-xs text-text-muted mt-0.5">Hours you worked to earn the money spent per category (based on {profile.currency}{profile.hourlyRate}/hr)</p>
              </div>

              {hoursData.length === 0 ? (
                <div className="py-24 text-center text-xs text-text-muted">No labor data. Set hourly rate in settings!</div>
              ) : (
                <div className="space-y-4 mt-5">
                  {hoursData.map(item => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-text-primary">{item.name}</span>
                        <span className="font-mono text-text-muted">
                          <strong className="text-text-primary">{item.hours} hours</strong> worked ({profile.currency}{item.spent.toLocaleString('en-IN')})
                        </span>
                      </div>
                      <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (item.hours / 60) * 100)}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Yearly conversion highlights */}
            <div className="bg-surface p-5 rounded-2xl border border-border lg:col-span-1 space-y-4">
              <h3 className="font-display font-bold text-sm text-text-primary">Labor Projection</h3>
              
              <div className="space-y-3.5 text-xs">
                <p className="text-text-muted leading-relaxed">
                  By tracking the "Hours worked" equivalent, we understand that money represents life energy. This monthly spend equates to:
                </p>

                <div className="bg-surface-2 p-4 rounded-xl border border-border space-y-3 font-sans">
                  <div>
                    <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Monthly Labor Spent</span>
                    <span className="font-mono text-xl font-bold text-accent-2 block mt-0.5">
                      {hoursData.reduce((sum, item) => sum + item.hours, 0).toFixed(1)} Hours
                    </span>
                    <span className="text-[10px] text-text-muted">of work traded this month</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Yearly Work Projection</span>
                    <span className="font-mono text-xl font-bold text-text-primary block mt-0.5">
                      {(hoursData.reduce((sum, item) => sum + item.hours, 0) * 12).toFixed(0)} Hours
                    </span>
                    <span className="text-[10px] text-text-muted">equivalent of labor per year</span>
                  </div>
                </div>
                
                <div className="p-3 bg-surface-2 border border-border rounded-xl">
                  <span className="font-semibold block text-[10px] uppercase text-text-muted mb-1">Time Cost translation:</span>
                  <span className="italic">"If you earn {profile.currency}{profile.hourlyRate}/hour, buying a ₹5,000 gadget actually consumes 10 hours of active office labor."</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRENDS TAB */}
        {activeTab === 'trends' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Month-over-Month Cash flow */}
            <div className="bg-surface p-5 rounded-2xl border border-border lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Month-over-Month Cash Flow</h3>
                <p className="text-xs text-text-muted mt-0.5">Comparison of spending vs earning limits for the last 4 months</p>
              </div>

              <div className="h-[250px] w-full mt-5 font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252B38" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="spent" name="Spent" fill="#FF5C5C" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="income" name="Income" fill="#00D4AA" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Savings Rate MoM */}
            <div className="bg-surface p-5 rounded-2xl border border-border lg:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Savings Rate Trend</h3>
                <p className="text-xs text-text-muted mt-0.5">Percentage of net income retained monthly</p>
              </div>

              <div className="space-y-4 flex-1 justify-center flex flex-col mt-4">
                {trendsData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-xs border-b border-border/50 py-2.5 last:border-b-0">
                    <span className="font-bold text-text-primary">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-2" style={{ width: `${item.rate}%` }} />
                      </div>
                      <span className="font-mono font-bold text-accent-2 w-8 text-right">{item.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

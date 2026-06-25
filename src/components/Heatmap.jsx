import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';

export default function Heatmap() {
  const { transactions, profile } = useFinance();

  const heatmapData = useMemo(() => {
    // Generate dates for the last 90 days
    const days = [];
    const today = new Date();
    
    // Group transactions by date string YYYY-MM-DD
    const dailyTotals = {};
    transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const dateStr = tx.date.split('T')[0];
        dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + tx.amount;
      });

    // We want 13 weeks (91 days) ending today
    // To align rows to days of the week (Sun-Sat), let's find the Sunday of 13 weeks ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 90);
    
    // Align to Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const tempDate = new Date(startDate);
    while (tempDate <= today) {
      const dateStr = tempDate.toISOString().split('T')[0];
      const spent = dailyTotals[dateStr] || 0;
      days.push({
        date: new Date(tempDate),
        dateStr,
        spent
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    return days;
  }, [transactions]);

  // Color categories based on spend amount
  const getColorClass = (spent) => {
    if (spent === 0) return 'bg-[#1E2330] hover:bg-[#2A3142]';
    if (spent < 500) return 'bg-[#6C63FF]/30 hover:bg-[#6C63FF]/50 border border-accent/20';
    if (spent < 2000) return 'bg-[#6C63FF]/60 hover:bg-[#6C63FF]/80 border border-accent/40';
    if (spent < 5000) return 'bg-[#6C63FF] hover:bg-[#6C63FF]/90 border border-accent/60';
    return 'bg-[#00D4AA] hover:bg-[#00D4AA]/90 border border-accent-2/60'; // High spend glows teal-green
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Group into columns of weeks (7 days each)
  const weeks = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-sm text-text-primary">Spending Heatmap</h3>
          <p className="text-xs text-text-muted mt-0.5">Daily expense density for the last 3 months</p>
        </div>
        
        {/* Heatmap Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#1E2330]"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#6C63FF]/30"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#6C63FF]/60"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#6C63FF]"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#00D4AA]"></div>
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {/* Day of week labels */}
        <div className="flex flex-col justify-between py-1 text-[9px] text-text-muted font-medium pr-1 select-none">
          <span>M</span>
          <span>W</span>
          <span>F</span>
          <span>S</span>
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-1.5">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className={`w-[13px] h-[13px] rounded-sm transition-all duration-200 cursor-pointer relative group ${getColorClass(day.spent)}`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-40">
                    <div className="bg-surface-2 border border-border text-[10px] text-text-primary px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl font-mono flex flex-col gap-0.5">
                      <span className="font-sans font-semibold text-text-muted text-[8px] uppercase">
                        {formatDate(day.date)}
                      </span>
                      <span>
                        Spent: <strong className="text-text-primary font-bold">{profile.currency}{day.spent.toLocaleString('en-IN')}</strong>
                      </span>
                    </div>
                    <div className="w-1.5 h-1.5 bg-surface-2 border-r border-b border-border rotate-45 -mt-1"></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

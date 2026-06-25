import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ArrowUpRight, ArrowDownRight, Calendar, PiggyBank } from 'lucide-react';

function AnimatedNumber({ value, currency = '₹', duration = 1000 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  // Format currency with commas
  const formatNum = (val) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <span className="font-mono font-bold text-2xl md:text-3xl lg:text-4xl text-text-primary tracking-tight">
      {currency}{formatNum(displayValue)}
    </span>
  );
}

export default function StatCard({ title, value, type, trend, subtitle, subtitleColor }) {
  const { profile } = useFinance();

  const icons = {
    balance: <PiggyBank className="w-5 h-5 text-accent" />,
    income: <ArrowUpRight className="w-5 h-5 text-accent-2" />,
    spend: <ArrowDownRight className="w-5 h-5 text-danger" />,
    days: <Calendar className="w-5 h-5 text-warning" />
  };

  const borderColors = {
    balance: 'border-l-4 border-accent hover:border-accent/80',
    income: 'border-l-4 border-accent-2 hover:border-accent-2/80',
    spend: 'border-l-4 border-danger hover:border-danger/80',
    days: 'border-l-4 border-warning hover:border-warning/80'
  };

  return (
    <div className={`bg-surface p-5 rounded-2xl border border-border flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:bg-surface-2 ${borderColors[type]} shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-muted text-xs md:text-sm font-medium">{title}</span>
        <div className="p-2 rounded-xl bg-surface-2 border border-border">
          {icons[type]}
        </div>
      </div>
      
      <div className="mb-2">
        {type === 'days' ? (
          <span className="font-mono font-bold text-2xl md:text-3xl lg:text-4xl text-text-primary tracking-tight">
            {value} <span className="text-sm font-sans font-normal text-text-muted">days</span>
          </span>
        ) : (
          <AnimatedNumber value={value} currency={profile.currency} />
        )}
      </div>

      <div className="flex items-center justify-between mt-1 text-xs">
        <span className={`${subtitleColor || 'text-text-muted'} font-medium`}>{subtitle}</span>
        {trend && (
          <span className={`flex items-center gap-0.5 font-semibold ${trend.positive ? 'text-accent-2' : 'text-danger'}`}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}

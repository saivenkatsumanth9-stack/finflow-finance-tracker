import React from 'react';
import { useFinance } from '../context/FinanceContext';
import MonthlyReport from '../components/MonthlyReport';
import { 
  Flame, 
  Award, 
  Sparkles, 
  Compass, 
  Lock, 
  Unlock,
  ShieldAlert
} from 'lucide-react';

export default function Gamification() {
  const { streaks, unlockedBadges } = useFinance();

  const badgeTemplates = [
    {
      id: 'first-budget',
      name: 'First budget set',
      desc: 'Configured your initial category limits',
      icon: '🥉',
      color: 'border-amber-700/40 text-amber-700 bg-amber-700/5'
    },
    {
      id: '7-day-streak',
      name: '7-day on-budget streak',
      desc: 'Kept daily expenses under cap for a week',
      icon: '🥈',
      color: 'border-slate-400/40 text-slate-400 bg-slate-400/5'
    },
    {
      id: 'month-under-budget',
      name: 'Month under budget',
      desc: 'Maintained total monthly spent under limit',
      icon: '🥇',
      color: 'border-yellow-500/40 text-yellow-500 bg-yellow-500/5'
    },
    {
      id: 'goal-completed',
      name: 'Goal completed',
      desc: 'Successfully reached 100% of a savings goal',
      icon: '💎',
      color: 'border-cyan-400/40 text-cyan-400 bg-cyan-400/5 shadow-cyan-500/10'
    },
    {
      id: '3-months-positive',
      name: '3 months positive savings',
      desc: 'Kept savings rate positive for 3 periods',
      icon: '🦸',
      color: 'border-purple-500/40 text-purple-500 bg-purple-500/5'
    },
    {
      id: 'no-spend-week',
      name: 'No-spend week achieved',
      desc: 'Unlocked 7 consecutive days of zero expenses',
      icon: '🧘',
      color: 'border-emerald-400/40 text-emerald-400 bg-emerald-400/5'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary tracking-tight">
          Streaks & Badges
        </h1>
        <p className="text-text-muted text-sm mt-0.5">
          Level up your financial discipline. Earn streaks and unlock prestigious achievement badges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Streaks meters (1 Column) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-full select-none">
            <h3 className="font-display font-bold text-sm text-text-primary mb-4">Habit Streaks</h3>
            
            <div className="space-y-4">
              {/* On Budget Streak */}
              <div className="bg-surface-2 p-5 rounded-xl border border-warning/10 relative overflow-hidden group">
                {/* Glow behind */}
                <div className="absolute -right-8 -top-8 w-20 h-20 bg-warning/5 rounded-full blur-xl group-hover:bg-warning/10 transition-colors" />
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/15 rounded-xl border border-warning/30">
                    <Flame className="w-6 h-6 text-warning fill-warning" />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-bold block uppercase">On-Budget Streak</span>
                    <span className="font-mono text-xl font-bold text-text-primary block mt-0.5">
                      {streaks.budgetStreak} <span className="text-xs font-sans text-text-muted font-normal">consecutive days</span>
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-text-muted mt-3.5 leading-relaxed">
                  Days in a row spent less than your daily average category caps. Stay under to keep the fire burning!
                </p>
              </div>

              {/* No Spend Streak */}
              <div className="bg-surface-2 p-5 rounded-xl border border-accent-2/10 relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-20 h-20 bg-accent-2/5 rounded-full blur-xl group-hover:bg-accent-2/10 transition-colors" />

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-2/15 rounded-xl border border-accent-2/30">
                    <Compass className="w-6 h-6 text-accent-2" />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-bold block uppercase">No-Spend Streak</span>
                    <span className="font-mono text-xl font-bold text-text-primary block mt-0.5">
                      {streaks.noSpendStreak} <span className="text-xs font-sans text-text-muted font-normal">consecutive days</span>
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-text-muted mt-3.5 leading-relaxed">
                  Days in a row with zero non-essential expenses logged. Helps build powerful saving reserves.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Badges board (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
            <h3 className="font-display font-bold text-sm text-text-primary mb-4">Achievement Badges</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badgeTemplates.map(badge => {
                const isUnlocked = unlockedBadges.includes(badge.id);

                return (
                  <div 
                    key={badge.id}
                    className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-3.5
                      ${isUnlocked 
                        ? `${badge.color} border-l-4 border-solid shadow-sm hover:scale-[1.01]` 
                        : 'border-border/60 opacity-45 grayscale bg-surface-2/10 select-none'
                      }
                    `}
                  >
                    {/* Badge Emoji / Icon */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl shrink-0 bg-surface-2 border border-border/80 relative">
                      {badge.icon}
                      {/* Lock state indicators */}
                      <span className="absolute -bottom-1.5 -right-1.5 p-0.5 bg-surface border border-border rounded-full text-[9px]">
                        {isUnlocked ? (
                          <Unlock className="w-2.5 h-2.5 text-accent-2" />
                        ) : (
                          <Lock className="w-2.5 h-2.5 text-text-muted" />
                        )}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-text-primary block leading-tight">
                        {badge.name}
                      </span>
                      <p className="text-[10px] text-text-muted leading-relaxed">
                        {badge.desc}
                      </p>
                      {isUnlocked && (
                        <span className="text-[8px] font-semibold text-accent-2 uppercase tracking-wider block mt-1">
                          Unlocked Achievement
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Monthly Report Card widget */}
      <MonthlyReport />

    </div>
  );
}

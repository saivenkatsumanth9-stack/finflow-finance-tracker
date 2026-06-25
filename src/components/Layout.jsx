import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  LayoutDashboard, 
  PiggyBank, 
  History, 
  Target, 
  BarChart3, 
  CalendarClock, 
  Camera, 
  Award, 
  Settings, 
  Menu, 
  X,
  Flame,
  Bot
} from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab, toggleAIChat }) {
  const { profile, streaks } = useFinance();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'goals', label: 'Goals Tracker', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'bills', label: 'Bills Tracker', icon: CalendarClock },
    { id: 'scanner', label: 'Receipt Scanner', icon: Camera },
    { id: 'gamification', label: 'Streaks & Badges', icon: Award },
    { id: 'settings', label: 'Settings & Profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg-app text-text-primary flex flex-col md:flex-row overflow-x-hidden font-sans">
      
      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-accent-2 flex items-center justify-center font-display font-bold text-bg-app">
            F
          </div>
          <span className="font-display font-bold text-lg tracking-tight">FinFlow</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Flame streak */}
          {streaks.budgetStreak > 0 && (
            <div className="flex items-center gap-1 bg-surface-2 px-2.5 py-1 rounded-full border border-border">
              <Flame className="w-4 h-4 text-warning fill-warning" />
              <span className="font-mono text-xs font-semibold">{streaks.budgetStreak}d</span>
            </div>
          )}
          {/* AI Toggle Button */}
          <button 
            onClick={toggleAIChat}
            className="p-1.5 rounded-lg bg-surface-2 border border-border text-accent-2 hover:bg-accent-2 hover:text-bg-app transition-colors"
          >
            <Bot className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Desktop/Tablet Left Sidebar */}
      <aside 
        className={`hidden md:flex flex-col border-r border-border h-screen sticky top-0 transition-all duration-300 z-30 glass-sidebar
          ${sidebarOpen ? 'w-[240px]' : 'w-[80px]'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 min-w-[36px] rounded-lg bg-gradient-to-tr from-accent to-accent-2 flex items-center justify-center font-display font-bold text-bg-app text-xl shadow-lg shadow-accent/20">
              FF
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-display font-bold text-md leading-none tracking-tight">FinFlow</span>
                <span className="text-[10px] text-text-muted mt-0.5">Your money, understood</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left
                  ${isActive 
                    ? 'bg-accent/15 border border-accent/30 text-accent font-medium neon-glow' 
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-2 border border-transparent'
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'}`} />
                {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
                {isActive && sidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border bg-surface/30">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 min-w-[36px] rounded-full bg-surface-2 border border-border flex items-center justify-center font-display font-bold text-accent-2 text-md">
              {profile.name[0]}
            </div>
            {sidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{profile.name}</span>
                <span className="text-xs text-text-muted truncate">Hourly: {profile.currency}{profile.hourlyRate}/hr</span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="mt-4 w-full py-1 text-center text-xs text-text-muted hover:text-text-primary border border-border rounded-lg bg-surface-2/50 transition-colors"
            >
              Collapse Sidebar
            </button>
          )}
          {!sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="mt-4 w-full py-1 flex justify-center text-text-muted hover:text-text-primary"
            >
              &raquo;
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-24 md:pb-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 border-t border-border backdrop-filter backdrop-blur-lg flex justify-around py-2 px-1 z-30">
        {menuItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200
                ${isActive ? 'text-accent font-medium' : 'text-text-muted hover:text-text-primary'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        {/* Toggle for settings/scanner/badge on mobile */}
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200
            ${activeTab === 'scanner' || activeTab === 'gamification' || activeTab === 'settings' ? 'text-accent' : 'text-text-muted'}
          `}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Scan</span>
        </button>
      </nav>
    </div>
  );
}

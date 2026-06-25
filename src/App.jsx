import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import Layout from './components/Layout';
import AIAssistant from './components/AIAssistant';

// Pages
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import RecurringBills from './pages/RecurringBills';
import ReceiptScanner from './pages/ReceiptScanner';
import Gamification from './pages/Gamification';
import Settings from './pages/Settings';

// Floating Chat trigger button
import { MessageSquareCode, Bot } from 'lucide-react';

function AppContent() {
  const { profile } = useFinance();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiChatOpen, setAIChatOpen] = useState(false);

  if (!profile.isOnboarded) {
    return <Onboarding />;
  }

  // Render correct tab page
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'budgets':
        return <Budgets />;
      case 'transactions':
        return <Transactions />;
      case 'goals':
        return <Goals />;
      case 'analytics':
        return <Analytics />;
      case 'bills':
        return <RecurringBills />;
      case 'scanner':
        return <ReceiptScanner />;
      case 'gamification':
        return <Gamification />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      toggleAIChat={() => setAIChatOpen(!aiChatOpen)}
    >
      {renderPage()}
      
      {/* Floating AI chat assistant drawer */}
      <AIAssistant 
        isOpen={aiChatOpen} 
        onClose={() => setAIChatOpen(false)} 
      />

      {/* Floating AI Action Button (Hidden on Mobile, as top navbar has it) */}
      <div className="fixed bottom-6 right-6 z-30 hidden md:block">
        <button
          onClick={() => setAIChatOpen(!aiChatOpen)}
          className={`p-4 rounded-full bg-accent hover:bg-accent/90 text-text-primary shadow-xl border border-accent/30 flex items-center justify-center transition-all duration-300 hover:scale-110 neon-glow
            ${aiChatOpen ? 'rotate-90 bg-surface border-border text-accent-2' : ''}
          `}
          title="FinFlow Finance AI Assistant"
        >
          {aiChatOpen ? (
            <XIcon className="w-6 h-6" />
          ) : (
            <Bot className="w-6 h-6 text-accent-2" />
          )}
        </button>
      </div>
    </Layout>
  );
}

// Quick inline XIcon helper
const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}

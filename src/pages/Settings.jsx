import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  User, 
  CreditCard, 
  Settings as SettingsIcon, 
  Trash2, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  Bot, 
  ShieldAlert,
  Moon
} from 'lucide-react';

export default function Settings() {
  const {
    accounts,
    addAccount,
    deleteAccount,
    profile,
    updateProfile,
    resetAllData,
    importJSON,
    exportJSON
  } = useFinance();

  // Profile Form States
  const [profileName, setProfileName] = useState(profile.name);
  const [profileIncome, setProfileIncome] = useState(profile.monthlyIncome);
  const [profileSpendLimit, setProfileSpendLimit] = useState(profile.monthlySpendLimit || 50000);
  const [profileHourly, setProfileHourly] = useState(profile.hourlyRate);
  const [profileCurrency, setProfileCurrency] = useState(profile.currency || '₹');
  const [profileStartDay, setProfileStartDay] = useState(profile.budgetStartDate || 1);
  const [apiKey, setApiKey] = useState(profile.claudeApiKey || '');
  const [useMockAI, setUseMockAI] = useState(profile.useMockAI);
  const [collegeName, setCollegeName] = useState(profile.collegeName || '');
  const [companyName, setCompanyName] = useState(profile.companyName || '');
  const [labelMode, setLabelMode] = useState(profile.labelMode || 'credit-debit');

  // Accounts Form States
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState('savings');
  const [accBalance, setAccBalance] = useState('');
  const [accColor, setAccColor] = useState('#6C63FF');
  const [accIcon, setAccIcon] = useState('Landmark');

  // JSON Import States
  const [importText, setImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);

  const accountColors = [
    '#6C63FF', // purple
    '#00D4AA', // teal
    '#FF5C5C', // red
    '#F5A623', // orange
    '#3B82F6', // blue
    '#EC4899', // pink
    '#8B5CF6'  // violet
  ];

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      monthlyIncome: Number(profileIncome),
      monthlySpendLimit: Number(profileSpendLimit),
      hourlyRate: Number(profileHourly),
      currency: profileCurrency,
      budgetStartDate: Number(profileStartDay),
      claudeApiKey: apiKey,
      useMockAI,
      collegeName,
      companyName,
      labelMode
    });
  };

  const handleAddAccountSubmit = (e) => {
    e.preventDefault();
    if (!accName || !accBalance || isNaN(accBalance)) return;

    addAccount({
      name: accName,
      type: accType,
      balance: Number(accBalance),
      color: accColor,
      icon: accIcon
    });

    // Reset Form
    setAccName('');
    setAccBalance('');
    setAccColor('#6C63FF');
    setShowAddAccount(false);
  };

  const handleExport = () => {
    const jsonString = exportJSON();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(jsonString);
    const exportFileDefaultName = `FinFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!importText) return;
    const success = importJSON(importText);
    if (success) {
      setImportText('');
      setShowImportArea(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary tracking-tight">Settings & Accounts</h1>
        <p className="text-text-muted text-sm mt-0.5">Manage user credentials, accounts ledger and backup storage preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card (2 Columns Left/Top) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
            <h3 className="font-display font-bold text-sm text-text-primary mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-accent" /> Profile Configuration
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Monthly Income Target</label>
                  <input
                    type="number"
                    value={profileIncome}
                    onChange={(e) => setProfileIncome(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3.5 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Monthly Spend Limit (Debited Cap)</label>
                  <input
                    type="number"
                    value={profileSpendLimit}
                    onChange={(e) => setProfileSpendLimit(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3.5 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Hourly Work Rate</label>
                  <input
                    type="number"
                    value={profileHourly}
                    onChange={(e) => setProfileHourly(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3.5 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Currency Symbol</label>
                    <select
                      value={profileCurrency}
                      onChange={(e) => setProfileCurrency(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="₹">₹ INR</option>
                      <option value="$">$ USD</option>
                      <option value="€">€ EUR</option>
                      <option value="£">£ GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Budget Period Start</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={profileStartDay}
                      onChange={(e) => setProfileStartDay(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Role Specific details */}
                {profile.role === 'student' ? (
                  <div>
                    <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">College Name</label>
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                )}

                {/* Label Terminology Mode Selection */}
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Transaction Terminology Mode</label>
                  <select
                    value={labelMode}
                    onChange={(e) => setLabelMode(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="credit-debit">Credited (+) / Debited (-) (Banking Mode)</option>
                    <option value="income-expense">Income / Expense (Traditional Mode)</option>
                  </select>
                </div>

              </div>

              {/* Claude API Settings */}
              <div className="border-t border-border/60 pt-4 mt-5 space-y-4">
                <h4 className="font-display font-bold text-xs text-text-primary flex items-center gap-2">
                  <Bot className="w-4 h-4 text-accent-2" /> Anthropic Claude AI Settings
                </h4>
                
                <div className="bg-surface-2 p-3.5 border border-border rounded-xl space-y-2 text-xs">
                  <span className="text-warning font-semibold block text-[10px] uppercase flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Direct Browser CORS Warning
                  </span>
                  <p className="text-text-muted leading-relaxed text-[11px]">
                    Direct browser requests to Anthropic's Claude API are blocked by security protocols (CORS). FinFlow defaults to a highly-sophisticated **Local AI Simulator** that parses your transactions offline without exposing your key or hitting server blocks. To test direct API calls, turn off simulation and supply your Anthropic Key below (requires a browser extension like CORS Bypass or developer local proxy).
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useMockAI}
                      onChange={(e) => setUseMockAI(e.target.checked)}
                      className="rounded border-border text-accent bg-bg-app focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                    />
                    <span className="text-xs text-text-primary font-medium hover:text-accent transition-colors">
                      Run Local AI Heuristics Simulator (Recommended)
                    </span>
                  </label>

                  {!useMockAI && (
                    <div className="animate-fadeIn">
                      <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Claude API Secret Key</label>
                      <input
                        type="password"
                        placeholder="sk-ant-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full bg-surface-2 border border-border rounded-xl py-2.5 px-3.5 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-text-primary py-2 px-5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-transform hover:scale-[1.02] mt-4 neon-glow"
              >
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </form>
          </div>
        </div>

        {/* Accounts management (1 Column Right/Bottom) */}
        <div className="space-y-6">
          
          {/* Accounts List */}
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent-2" /> Accounts Ledger
              </h3>
              <button
                onClick={() => setShowAddAccount(!showAddAccount)}
                className="p-1.5 rounded-lg bg-surface-2 border border-border text-text-muted hover:text-text-primary transition-colors"
                title="Add account"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Inline Add Account Form */}
            {showAddAccount && (
              <form onSubmit={handleAddAccountSubmit} className="bg-bg-app/40 border border-border p-4 rounded-xl space-y-3.5 mb-4 animate-slide-in">
                <div>
                  <label className="text-text-muted text-[9px] font-bold uppercase block mb-1">Account Label</label>
                  <input
                    type="text"
                    placeholder="ICICI, Cash, Wallet..."
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-lg py-1.5 px-2.5 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-text-muted text-[9px] font-bold uppercase block mb-1">Account Type</label>
                    <select
                      value={accType}
                      onChange={(e) => setAccType(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-lg py-1.5 px-2 text-xs focus:outline-none"
                    >
                      <option value="savings">Savings</option>
                      <option value="current">Current</option>
                      <option value="credit">Credit Card</option>
                      <option value="cash">Cash</option>
                      <option value="investment">Investment</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-text-muted text-[9px] font-bold uppercase block mb-1">Initial Balance</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={accBalance}
                      onChange={(e) => setAccBalance(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-lg py-1.5 px-2 text-xs font-mono focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="text-text-muted text-[9px] font-bold uppercase block mb-1.5">Color Tag</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {accountColors.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAccColor(c)}
                        className={`w-5 h-5 rounded-full border transition-all ${accColor === c ? 'border-text-primary scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent-2 text-bg-app text-xs font-bold py-2 rounded-lg"
                >
                  Create Ledger Account
                </button>
              </form>
            )}

            {/* Accounts Listing */}
            <div className="space-y-2.5">
              {accounts.map(acc => (
                <div key={acc.id} className="flex justify-between items-center bg-surface-2/45 border border-border p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: acc.color }} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-text-primary leading-tight">{acc.name}</span>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">{acc.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-text-primary">
                      {profile.currency}{acc.balance.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => {
                        if (accounts.length <= 1) {
                          alert("Must maintain at least one financial account ledger.");
                          return;
                        }
                        if (window.confirm(`Delete account ledger "${acc.name}"?`)) {
                          deleteAccount(acc.id);
                        }
                      }}
                      className="text-text-muted hover:text-danger p-1 rounded-lg hover:bg-surface-2 transition-colors"
                      title="Delete account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Backup Preferences */}
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-text-primary">Data Backup & Reset</h3>
            
            <div className="grid grid-cols-2 gap-2 text-xs select-none">
              <button
                onClick={handleExport}
                className="bg-surface-2 hover:bg-bg-app text-text-primary border border-border py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all font-semibold"
              >
                <Download className="w-3.5 h-3.5 text-accent-2" /> Export JSON
              </button>
              
              <button
                onClick={() => setShowImportArea(!showImportArea)}
                className="bg-surface-2 hover:bg-bg-app text-text-primary border border-border py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all font-semibold"
              >
                <Upload className="w-3.5 h-3.5 text-accent" /> Import JSON
              </button>
            </div>

            {/* JSON Import Area */}
            {showImportArea && (
              <form onSubmit={handleImportSubmit} className="space-y-3.5 bg-bg-app/40 border border-border p-3.5 rounded-xl animate-slide-in">
                <textarea
                  placeholder="Paste JSON data here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full h-24 bg-surface border border-border rounded-lg p-2 font-mono text-[9px] focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-accent text-text-primary text-xs font-semibold py-2 rounded-lg"
                >
                  Verify & Import
                </button>
              </form>
            )}

            <button
              onClick={() => {
                if (window.confirm("Confirm reset? This wipes localStorage and restores original Indian seed entries.")) {
                  resetAllData();
                }
              }}
              className="w-full bg-danger/10 border border-danger/25 hover:bg-danger text-danger hover:text-text-primary py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Factory Reset Ledger
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

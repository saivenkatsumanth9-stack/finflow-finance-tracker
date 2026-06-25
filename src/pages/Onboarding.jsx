import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  GraduationCap, 
  Briefcase, 
  ArrowRight, 
  Sparkles, 
  Wallet, 
  CheckCircle,
  Building
} from 'lucide-react';

export default function Onboarding() {
  const { completeOnboarding, profile } = useFinance();
  const [step, setStep] = useState(1);
  
  // Setup States
  const [role, setRole] = useState('employee'); // 'student' | 'employee'
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlySpendLimit, setMonthlySpendLimit] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [currency, setCurrency] = useState('₹');

  // Account balances states
  const [savingsBalance, setSavingsBalance] = useState('');
  const [creditBalance, setCreditBalance] = useState('');
  const [cashBalance, setCashBalance] = useState('');

  const handleNextStep = () => {
    if (step === 1) {
      // Pre-fill fields based on role selection for better UX
      if (role === 'student') {
        setMonthlyIncome('15000');
        setMonthlySpendLimit('10000');
        setHourlyRate('100');
        setSavingsBalance('8000');
        setCreditBalance('0');
        setCashBalance('1500');
      } else {
        setMonthlyIncome('75000');
        setMonthlySpendLimit('50000');
        setHourlyRate('500');
        setSavingsBalance('85000');
        setCreditBalance('12000');
        setCashBalance('2500');
      }
      setStep(2);
    } else if (step === 2) {
      if (!name) {
        alert("Please enter your name.");
        return;
      }
      if (role === 'student' && !collegeName) {
        alert("Please enter your college name.");
        return;
      }
      if (role === 'employee' && !companyName) {
        alert("Please enter your company name.");
        return;
      }
      if (!monthlyIncome || Number(monthlyIncome) <= 0) {
        alert("Please enter a valid monthly income/allowance.");
        return;
      }
      setStep(3);
    }
  };

  const handleBackStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleFinish = (e) => {
    e.preventDefault();

    completeOnboarding({
      name,
      role,
      collegeName,
      companyName,
      monthlyIncome: Number(monthlyIncome),
      monthlySpendLimit: Number(monthlySpendLimit),
      hourlyRate: Number(hourlyRate),
      currency,
      initialBalances: {
        savings: Number(savingsBalance || 0),
        credit: Number(creditBalance || 0),
        cash: Number(cashBalance || 0)
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-primary flex items-center justify-center p-4 font-sans select-none">
      
      {/* Onboarding Box */}
      <div className="w-full max-w-lg bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden glass-sidebar">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-2/10 rounded-full blur-3xl" />

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-accent to-accent-2 flex items-center justify-center font-display font-bold text-bg-app text-sm shadow">
              F
            </div>
            <span className="font-display font-bold text-sm tracking-tight">FinFlow Setup</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold font-mono">
            <span className={step === 1 ? 'text-accent' : ''}>01</span>
            <span>/</span>
            <span className={step === 2 ? 'text-accent' : ''}>02</span>
            <span>/</span>
            <span className={step === 3 ? 'text-accent' : ''}>03</span>
          </div>
        </div>

        {/* STEP 1: Select Role */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <h2 className="font-display font-bold text-2xl leading-tight">Welcome to FinFlow</h2>
              <p className="text-text-muted text-xs mt-1">Let's configure your ledger. Choose your primary occupation:</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student Card */}
              <button
                onClick={() => setRole('student')}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all duration-300
                  ${role === 'student' 
                    ? 'bg-accent/10 border-accent text-text-primary shadow-lg shadow-accent/10 scale-102' 
                    : 'bg-surface-2 border-border text-text-muted hover:border-text-muted/30 hover:bg-surface-2/80'
                  }
                `}
              >
                <div className={`p-2.5 rounded-xl border ${role === 'student' ? 'bg-accent/25 border-accent text-accent' : 'bg-surface border-border text-text-muted'}`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold block text-text-primary">College Student</span>
                  <span className="text-[10px] leading-relaxed block mt-0.5">Budget allowance, track canteen/metro spends, build goals.</span>
                </div>
              </button>

              {/* Employee Card */}
              <button
                onClick={() => setRole('employee')}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all duration-300
                  ${role === 'employee' 
                    ? 'bg-accent-2/10 border-accent-2 text-text-primary shadow-lg shadow-accent-2/10 scale-102' 
                    : 'bg-surface-2 border-border text-text-muted hover:border-text-muted/30 hover:bg-surface-2/80'
                  }
                `}
              >
                <div className={`p-2.5 rounded-xl border ${role === 'employee' ? 'bg-accent-2/25 border-accent-2 text-accent-2' : 'bg-surface border-border text-text-muted'}`}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold block text-text-primary">Working Professional</span>
                  <span className="text-[10px] leading-relaxed block mt-0.5">Track salary credits, investments, PG rent bills, evaluate labor hours.</span>
                </div>
              </button>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full bg-accent hover:bg-accent/90 text-text-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md neon-glow"
            >
              Continue Setup <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Profile inputs */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center">
              <h2 className="font-display font-bold text-xl leading-tight">Profile Details</h2>
              <p className="text-text-muted text-xs mt-0.5">Fill in your financial parameters</p>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Dynamic Input based on role */}
              {role === 'student' ? (
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">College / University Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="IIT Bombay, Delhi University..."
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Company / Organization</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="TCS, Google, Freelancer..."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Income/allowance & wage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">
                    {role === 'student' ? 'Monthly Allowance' : 'Monthly Net Salary'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-text-muted">{currency}</span>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2.5 pl-7 pr-3 text-xs font-mono focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">
                    {role === 'student' ? 'Hourly study wage (est)' : 'Hourly Labor Rate'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-text-muted">{currency}</span>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2.5 pl-7 pr-3 text-xs font-mono focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Spend Limit Cap */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Monthly Spend Limit (Debited Cap)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-text-muted">{currency}</span>
                  <input
                    type="number"
                    value={monthlySpendLimit}
                    onChange={(e) => setMonthlySpendLimit(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2.5 pl-7 pr-3 text-xs font-mono focus:outline-none focus:border-accent"
                    required
                  />
                </div>
                <span className="text-[9px] text-text-muted mt-1 block">Your categories budgets limits will be split based on this spend limit.</span>
              </div>

              {/* Currency selector */}
              <div>
                <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-accent"
                >
                  <option value="₹">₹ INR (Indian Rupee)</option>
                  <option value="$">$ USD (US Dollar)</option>
                  <option value="€">€ EUR (Euro)</option>
                  <option value="£">£ GBP (British Pound)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 select-none pt-2">
              <button
                onClick={handleBackStep}
                className="flex-1 bg-surface-2 hover:bg-surface-2/80 text-text-muted py-2.5 rounded-xl text-xs font-semibold border border-border transition-all"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 bg-accent hover:bg-accent/90 text-text-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow neon-glow"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Initial account balances */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center">
              <h2 className="font-display font-bold text-xl leading-tight">Starting Ledgers</h2>
              <p className="text-text-muted text-xs mt-0.5">Define initial bank/cash balances</p>
            </div>

            <form onSubmit={handleFinish} className="space-y-4">
              <div className="space-y-3.5">
                {/* Savings */}
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">
                    {role === 'student' ? 'SBI Savings Account Balance' : 'HDFC Bank Balance'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-text-muted">{currency}</span>
                    <input
                      type="number"
                      value={savingsBalance}
                      onChange={(e) => setSavingsBalance(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2.5 pl-7 pr-3 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Credit */}
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">
                    {role === 'student' ? 'Paytm Postpaid / Credit Balance (Due)' : 'ICICI Credit Card Balance (Due)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-text-muted">{currency}</span>
                    <input
                      type="number"
                      value={creditBalance}
                      onChange={(e) => setCreditBalance(e.target.value)}
                      placeholder="0 (Enter positive amount if due)"
                      className="w-full bg-surface-2 border border-border rounded-xl py-2.5 pl-7 pr-3 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <span className="text-[9px] text-text-muted mt-1 block">Enter current card/bill dues as positive; it registers as debited.</span>
                </div>

                {/* Cash */}
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Cash In Hand</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-text-muted">{currency}</span>
                    <input
                      type="number"
                      value={cashBalance}
                      onChange={(e) => setCashBalance(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2.5 pl-7 pr-3 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 select-none pt-2 mt-4">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="flex-1 bg-surface-2 hover:bg-surface-2/80 text-text-muted py-2.5 rounded-xl text-xs font-semibold border border-border transition-all"
                >
                  Back
                </button>
                
                <button
                  type="submit"
                  className="flex-1 bg-accent-2 text-bg-app py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-accent-2/10 hover:scale-[1.02]"
                >
                  <CheckCircle className="w-4 h-4" /> Launch FinFlow
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { parseReceiptText, MOCK_RECEIPTS } from '../utils/ocrHelper';
import { createWorker } from 'tesseract.js';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  AlertCircle, 
  FileText, 
  Plus, 
  Loader2,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

export default function ReceiptScanner() {
  const { addTransaction, accounts, budgets, profile } = useFinance();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Parsed Form fields
  const [parsedData, setParsedData] = useState(null);
  const [formMerchant, setFormMerchant] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food & dining');
  const [formDate, setFormDate] = useState('');
  const [formAccount, setFormAccount] = useState(accounts[0]?.id || '');
  const [formMood, setFormMood] = useState('happy');

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setParsedData(null);
    setErrorMsg('');
  };

  // Run real OCR scan using Tesseract.js
  const runOCR = async (file) => {
    setIsScanning(true);
    setScanProgress(0);
    setExtractedText('Initializing OCR engine...');
    setErrorMsg('');

    try {
      const worker = await createWorker('eng');
      
      // Update progress
      setExtractedText('Scanning image pixels...');
      setScanProgress(30);

      const ret = await worker.recognize(file);
      setScanProgress(80);
      setExtractedText('Extracting line items and prices...');
      
      const text = ret.data.text;
      setExtractedText(text);
      await worker.terminate();

      setScanProgress(100);
      setTimeout(() => {
        const parsed = parseReceiptText(text);
        applyParsedData(parsed);
        setIsScanning(false);
      }, 500);

    } catch (err) {
      console.error(err);
      setErrorMsg("Couldn't read the receipt clearly. Try simulated demo scan or enter details manually.");
      setIsScanning(false);
    }
  };

  // Run simulated OCR scan with high-fidelity template text
  const runSimulatedScan = (type) => {
    setIsScanning(true);
    setScanProgress(0);
    setParsedData(null);
    setErrorMsg('');
    setImagePreview(null);
    setImage(null);

    const mock = MOCK_RECEIPTS[type];
    
    // Simulate real-time word-by-word extraction
    let currentPercent = 0;
    const interval = setInterval(() => {
      currentPercent += 20;
      setScanProgress(currentPercent);
      
      if (currentPercent === 20) setExtractedText('Accessing simulated receipt buffer...');
      if (currentPercent === 40) setExtractedText('Running layout text-block analysis...');
      if (currentPercent === 60) setExtractedText('Extracting item price values...');
      if (currentPercent === 80) setExtractedText(mock.text.substring(0, 150) + '\n...');
      
      if (currentPercent >= 100) {
        clearInterval(interval);
        setExtractedText(mock.text);
        
        setTimeout(() => {
          const parsed = parseReceiptText(mock.text);
          applyParsedData(parsed);
          setIsScanning(false);
        }, 500);
      }
    }, 500);
  };

  // Helper to load parsed values to input states
  const applyParsedData = (parsed) => {
    setParsedData(parsed);
    setFormMerchant(parsed.merchant);
    setFormAmount(parsed.amount);
    setFormCategory(parsed.category);
    setFormDate(parsed.date);
  };

  // Handle final submission to transactions database
  const handleConfirmSave = (e) => {
    e.preventDefault();
    if (!formAmount || isNaN(formAmount) || Number(formAmount) <= 0) return;

    addTransaction({
      amount: Number(formAmount),
      type: 'expense',
      category: formCategory,
      merchant: formMerchant || 'Scanned Receipt Expense',
      note: 'Auto-extracted from receipt scan',
      date: new Date(formDate).toISOString(),
      accountId: formAccount,
      mood: formMood,
      isRecurring: false
    });

    // Reset page states
    setImage(null);
    setImagePreview(null);
    setParsedData(null);
    setExtractedText('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary tracking-tight">Receipt Scanner</h1>
        <p className="text-text-muted text-sm mt-0.5">Upload a receipt photo or test with our offline simulated demo invoices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scanning Panel (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface p-5 rounded-2xl border border-border flex flex-col items-center justify-center relative min-h-[300px]">
            {isScanning && (
              /* Laser Scanner Animation overlay */
              <div className="absolute inset-0 bg-bg-app/40 backdrop-blur-[1px] flex flex-col items-center justify-center z-20 rounded-2xl overflow-hidden p-6 select-none">
                <div className="scanner-laser" />
                <Loader2 className="w-10 h-10 text-accent-2 animate-spin mb-4" />
                <span className="font-display font-bold text-sm text-text-primary mb-2">Analyzing Receipt...</span>
                
                {/* Progress Bar */}
                <div className="w-48 h-1.5 bg-surface-2 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-accent-2 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                </div>

                {/* Real-time terminal parsing feed */}
                <pre className="font-mono text-[9px] text-[#00D4AA] max-w-sm w-full bg-bg-app p-3 rounded-lg border border-border/80 h-20 overflow-y-auto whitespace-pre-wrap leading-tight shadow-inner">
                  {extractedText}
                </pre>
              </div>
            )}

            {/* Error Message banner */}
            {errorMsg && (
              <div className="w-full bg-[#2D1B1B] border border-danger/20 text-danger p-3 rounded-xl mb-4 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block uppercase text-[9px]">OCR Reader Issue</span>
                  {errorMsg}
                </div>
              </div>
            )}

            {/* Default State or Image Preview */}
            {!imagePreview ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4 text-text-muted">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-sm text-text-primary">Upload your Receipt</h3>
                <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">Supports JPG, PNG, WebP invoices. Click below to load file.</p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="mt-5 flex gap-3 justify-center select-none">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-accent hover:bg-accent/90 text-text-primary text-xs font-semibold py-2 px-4 rounded-xl transition-all"
                  >
                    Select File
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="relative max-h-[350px] overflow-hidden rounded-xl border border-border bg-bg-app">
                  <img 
                    src={imagePreview} 
                    alt="Receipt preview" 
                    className="max-h-[350px] object-contain opacity-75"
                  />
                </div>
                <div className="mt-4 flex gap-3 select-none">
                  <button
                    onClick={() => { setImage(null); setImagePreview(null); setParsedData(null); }}
                    className="text-text-muted hover:text-text-primary text-xs py-2 px-4"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => runOCR(image)}
                    className="bg-accent hover:bg-accent/90 text-text-primary text-xs font-semibold py-2 px-5 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Start OCR Scan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Simulated Demo Presets Card */}
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm select-none">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-accent-2" />
              <h3 className="font-display font-bold text-sm text-text-primary">Instant Simulated Scans (Offline-Friendly)</h3>
            </div>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              No real receipts on hand? Test the extraction logic immediately by triggering one of these pre-loaded Indian merchant mock bills:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => runSimulatedScan('zomato')}
                className="py-2.5 px-3 bg-surface-2 border border-border rounded-xl hover:border-accent text-xs font-semibold text-center transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
              >
                🍕 Zomato Pizza
              </button>
              <button
                onClick={() => runSimulatedScan('swiggy')}
                className="py-2.5 px-3 bg-surface-2 border border-border rounded-xl hover:border-accent text-xs font-semibold text-center transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
              >
                🥦 Swiggy Groceries
              </button>
              <button
                onClick={() => runSimulatedScan('uber')}
                className="py-2.5 px-3 bg-surface-2 border border-border rounded-xl hover:border-accent text-xs font-semibold text-center transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
              >
                🚗 Uber Taxi Fare
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Form panel (Right 1 column) */}
        <div className="lg:col-span-1">
          {parsedData ? (
            <div className="bg-surface p-5 rounded-2xl border border-accent-2/30 shadow-lg shadow-accent-2/5 animate-fadeIn">
              <h3 className="font-display font-bold text-sm text-text-primary mb-1 flex items-center gap-2">
                <Check className="w-4 h-4 text-accent-2" />
                Scan Confirmed
              </h3>
              <p className="text-xs text-text-muted mb-4">Extracted data. Please verify and confirm details below:</p>

              <form onSubmit={handleConfirmSave} className="space-y-4">
                {/* Merchant */}
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Merchant / Payer</label>
                  <input
                    type="text"
                    value={formMerchant}
                    onChange={(e) => setFormMerchant(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-text-muted">
                      {profile.currency}
                    </span>
                    <input
                      type="number"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl py-2 pl-7 pr-3 font-mono font-bold text-xs focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    {budgets.map(b => (
                      <option key={b.id} value={b.name}>{b.emoji} {b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">Receipt Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Account Selection */}
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1">
                    {profile.labelMode === 'credit-debit' ? 'Debited From' : 'Charge Account'}
                  </label>
                  <select
                    value={formAccount}
                    onChange={(e) => setFormAccount(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Mood Tag */}
                <div>
                  <label className="text-text-muted text-[10px] font-semibold uppercase block mb-1.5">Purchase Mood</label>
                  <select
                    value={formMood}
                    onChange={(e) => setFormMood(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="happy">😊 Happy</option>
                    <option value="stressed">😰 Stressed</option>
                    <option value="bored">😴 Bored</option>
                    <option value="celebrating">🎉 Celebrating</option>
                    <option value="sad">😔 Sad</option>
                    <option value="impulsive">😤 Impulsive</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent-2 text-bg-app py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-accent-2/10 hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" /> Confirm & Add Transaction
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-surface p-5 rounded-2xl border border-border text-center py-10">
              <FileText className="w-10 h-10 text-text-muted/20 mx-auto mb-3" />
              <h3 className="font-display font-bold text-xs text-text-primary">No scanned data yet</h3>
              <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                Once you select a receipt image and start the OCR scanner, the parsed data fields will populate here for review.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

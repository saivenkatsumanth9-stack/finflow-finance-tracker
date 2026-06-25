// OCR parsing utility for receipt scanning

const INDIAN_MERCHANTS = [
  'Zomato', 'Swiggy', 'Uber', 'DMart', 'Jio', 'Netflix', 'Spotify', 
  'Cult.fit', 'BESCOM', 'Myntra', 'Amazon', 'Airtel', 'Razorpay', 
  'Decathlon', 'Apollo Pharmacy', 'Dominos', 'Namma Metro', 'Starbucks'
];

export function parseReceiptText(text) {
  if (!text) return { merchant: '', amount: 0, date: '', category: 'Other' };

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // 1. Detect Merchant Name
  let merchant = '';
  // Check if any known merchant matches the text
  for (const known of INDIAN_MERCHANTS) {
    const regex = new RegExp(`\\b${known}\\b`, 'i');
    if (regex.test(text)) {
      merchant = known;
      break;
    }
  }

  // If no known merchant, fallback to first non-trivial line of text (often logo/name)
  if (!merchant && lines.length > 0) {
    // Find first line that isn't just numbers/symbols
    const textLines = lines.filter(l => /[A-Za-z]{3,}/.test(l));
    if (textLines.length > 0) {
      merchant = textLines[0].substring(0, 30); // limit length
    } else {
      merchant = 'Unknown Merchant';
    }
  }

  // 2. Detect Date
  let date = '';
  // Try formats like DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD
  const dateRegex = /(\d{2}[-/.]\d{2}[-/.]\d{4})|(\d{4}[-/.]\d{2}[-/.]\d{2})/g;
  const dateMatches = text.match(dateRegex);
  if (dateMatches && dateMatches.length > 0) {
    const rawDate = dateMatches[0].replace(/\./g, '-').replace(/\//g, '-');
    // Check if it's DD-MM-YYYY or YYYY-MM-DD
    const parts = rawDate.split('-');
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      date = rawDate;
    } else {
      // DD-MM-YYYY -> YYYY-MM-DD
      date = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  } else {
    // Check for text dates like "24-Jun-2026" or "Jun 24, 2026"
    const textDateRegex = /\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/i;
    const textDateMatch = text.match(textDateRegex);
    if (textDateMatch) {
      try {
        const dObj = new Date(textDateMatch[0]);
        if (!isNaN(dObj.getTime())) {
          date = dObj.toISOString().split('T')[0];
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Fallback to today if no date detected
  if (!date) {
    date = new Date().toISOString().split('T')[0];
  }

  // 3. Detect Amount (Grand Total)
  // Usually the largest decimal number on the receipt is the grand total
  let amount = 0;
  const decimalRegex = /[₹rs\.\s]*\b(\d+[\.,]\d{2})\b/gi;
  const matches = [...text.matchAll(decimalRegex)];
  const values = [];

  matches.forEach(match => {
    const valStr = match[1].replace(',', '.');
    const val = parseFloat(valStr);
    if (!isNaN(val) && val > 0) {
      values.push(val);
    }
  });

  if (values.length > 0) {
    amount = Math.max(...values);
  } else {
    // Fallback search: look for any integers if no decimals are found
    const integerRegex = /(?:total|pay|due|amt|amount|rs|₹)[\s:]*(\d+)/i;
    const intMatch = text.match(integerRegex);
    if (intMatch) {
      amount = parseInt(intMatch[1]);
    }
  }

  // 4. Auto Categorize based on Merchant name or content
  let category = 'Other';
  const foodKeywords = ['zomato', 'swiggy', 'restaurant', 'food', 'hotel', 'cafe', 'dining', 'pizza', 'burger', 'kitchen'];
  const transportKeywords = ['uber', 'ola', 'metro', 'taxi', 'railway', 'irctc', 'ride', 'travel'];
  const shoppingKeywords = ['dmart', 'myntra', 'amazon', 'flipkart', 'reliance', 'mart', 'store', 'retail', 'decathlon'];
  const entertainmentKeywords = ['netflix', 'spotify', 'movie', 'cinema', 'bookmyshow', 'hotstar', 'prime'];
  const utilityKeywords = ['electricity', 'bescom', 'jio', 'airtel', 'fiber', 'wifi', 'broadband', 'recharge', 'water'];
  const healthKeywords = ['apollo', 'pharmacy', 'medplus', 'doctor', 'hospital', 'gym', 'cult.fit'];

  const lowerText = text.toLowerCase();
  
  if (foodKeywords.some(kw => lowerText.includes(kw))) category = 'Food & dining';
  else if (transportKeywords.some(kw => lowerText.includes(kw))) category = 'Transport';
  else if (shoppingKeywords.some(kw => lowerText.includes(kw))) category = 'Shopping';
  else if (entertainmentKeywords.some(kw => lowerText.includes(kw))) category = 'Entertainment';
  else if (utilityKeywords.some(kw => lowerText.includes(kw))) category = 'Utilities';
  else if (healthKeywords.some(kw => lowerText.includes(kw))) category = 'Health';

  return {
    merchant,
    amount,
    date,
    category
  };
}

// Generate high fidelity simulated receipts for testing OCR
export const MOCK_RECEIPTS = {
  zomato: {
    name: 'Zomato Tax Invoice',
    imgUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100', // small placeholder thumbnail
    text: `
      ZOMATO INVOICE
      Order ID: 290192019
      Merchant: Dominos Pizza
      Date: 24-06-2026
      Time: 20:34:12
      
      ITEMS:
      1x Peppy Paneer Pizza (L) - Rs. 650.00
      1x Garlic Breadsticks - Rs. 149.00
      1x Pepsi (500ml) - Rs. 60.00
      
      Delivery Charge: Rs. 40.00
      Tax & GST (18%): Rs. 154.62
      Discount Coupon: -Rs. 100.00
      ---------------------------------
      GRAND TOTAL: Rs. 953.62
      Paid via HDFC Debit Card
      Thank you for ordering on Zomato!
    `
  },
  swiggy: {
    name: 'Swiggy Instamart Delivery bill',
    text: `
      SWIGGY INSTAMART BILL
      Store ID: IM-BLR-12
      Date: 2026-06-20
      Order Number: SW-90291-82
      
      ITEMS:
      2x Amul Gold Milk (1L) - Rs. 132.00
      1x DMart Premium Basmati Rice (5kg) - Rs. 450.00
      1x Surf Excel Liquid (1.2L) - Rs. 280.00
      1x Happy Dent Gum (Pack) - Rs. 50.00
      
      Handling Charges: Rs. 9.00
      Tax Invoice Total: Rs. 921.00
      ---------------------------------
      NET PAYABLE: Rs. 921.00
      Paid via UPI (PhonePe)
      Instamart: Delivered in 9 minutes.
    `
  },
  uber: {
    name: 'Uber India Trip receipt',
    text: `
      UBER TRIP RECEIPT
      Date: June 24, 2026
      Trip ID: 9a8b7c6d-1234
      Driver Partner: Suresh Kumar
      
      FARE BREAKDOWN:
      Base Fare: Rs. 50.00
      Distance Charge (12.4 km): Rs. 280.00
      Time Charge (32 mins): Rs. 64.00
      Peak Pricing Multiplier (1.2x): Rs. 78.80
      Tolls & Parking: Rs. 40.00
      ---------------------------------
      TRIP TOTAL FARE: Rs. 512.80
      Paid via ICICI Credit Card
      Thanks for riding with Uber!
    `
  }
};

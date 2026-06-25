import React, { useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Download, Award, Calendar } from 'lucide-react';

export default function MonthlyReport() {
  const { transactions, budgets, profile, streaks } = useFinance();
  const canvasRef = useRef(null);

  const stats = React.useMemo(() => {
    const now = new Date();
    const currentMonthTxs = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === now.getMonth() && 
             txDate.getFullYear() === now.getFullYear();
    });

    const income = currentMonthTxs
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const spent = currentMonthTxs
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const savings = Math.max(0, income - spent);
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Check budget categories limits vs spent
    const categoryTotals = {};
    currentMonthTxs
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      });

    let overBudgetsCount = 0;
    let totalBudgetsSet = 0;

    budgets.forEach(b => {
      if (b.limit > 0) {
        totalBudgetsSet++;
        const categorySpent = categoryTotals[b.name] || 0;
        if (categorySpent > b.limit) {
          overBudgetsCount++;
        }
      }
    });

    // Calculate Grade
    let grade = 'A';
    if (overBudgetsCount > 0) {
      if (overBudgetsCount === 1) grade = 'B';
      else if (overBudgetsCount === 2) grade = 'C';
      else grade = 'D';
    }

    // Adjust grade based on savings rate
    if (savingsRate > 30 && grade !== 'A') {
      // Upgrade one level
      if (grade === 'B') grade = 'A';
      else if (grade === 'C') grade = 'B';
      else if (grade === 'D') grade = 'C';
    } else if (savingsRate < 5 && grade === 'A') {
      // Downgrade
      grade = 'B';
    } else if (savingsRate < 0) {
      grade = 'D';
    }

    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    return {
      income,
      spent,
      savings,
      savingsRate,
      overBudgetsCount,
      totalBudgetsSet,
      grade,
      monthName
    };
  }, [transactions, budgets]);

  // Draw the Canvas
  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Set high DPI scale
    canvas.width = 600;
    canvas.height = 400;

    // Background Gradient (Dark Theme matching #0D0F14 and #161A22)
    const grad = ctx.createLinearGradient(0, 0, 600, 400);
    grad.addColorStop(0, '#0D0F14');
    grad.addColorStop(0.5, '#161A22');
    grad.addColorStop(1, '#1A1E29');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 400);

    // Subtle neon glow rings
    ctx.strokeStyle = 'rgba(108, 99, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(600, 0, 200, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 400, 250, 0, Math.PI * 2);
    ctx.stroke();

    // App branding: FinFlow
    ctx.fillStyle = '#6C63FF';
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.fillText('FinFlow', 40, 50);

    ctx.fillStyle = '#6B7280';
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillText('— Your money, understood.', 125, 48);

    // Month Label
    ctx.fillStyle = '#00D4AA';
    ctx.font = 'semibold 13px "Inter", sans-serif';
    ctx.fillText(stats.monthName.toUpperCase(), 40, 95);

    // User Profile
    ctx.fillStyle = '#F0F2F7';
    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.fillText(profile.name, 40, 130);

    // Horizontal Separator
    ctx.strokeStyle = '#252B38';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 160);
    ctx.lineTo(360, 160);
    ctx.stroke();

    // Stats Labels & Values
    ctx.fillStyle = '#6B7280';
    ctx.font = '500 11px "Inter", sans-serif';
    ctx.fillText('MONTHLY EARNINGS', 40, 195);
    ctx.fillText('TOTAL EXPENDITURE', 40, 260);
    ctx.fillText('SAVINGS RATE', 210, 195);
    ctx.fillText('BUDGET ADHERENCE', 210, 260);

    // Currency values
    ctx.fillStyle = '#F0F2F7';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText(`${profile.currency}${stats.income.toLocaleString('en-IN')}`, 40, 222);

    ctx.fillStyle = stats.spent > stats.income ? '#FF5C5C' : '#F0F2F7';
    ctx.fillText(`${profile.currency}${stats.spent.toLocaleString('en-IN')}`, 40, 287);

    ctx.fillStyle = '#00D4AA'; // Teal
    ctx.fillText(`${stats.savingsRate.toFixed(1)}%`, 210, 222);

    const adPercent = stats.totalBudgetsSet > 0 
      ? Math.max(0, 100 - (stats.overBudgetsCount / stats.totalBudgetsSet) * 100)
      : 100;
    ctx.fillStyle = adPercent >= 80 ? '#00D4AA' : adPercent >= 50 ? '#F5A623' : '#FF5C5C';
    ctx.fillText(`${adPercent.toFixed(0)}% kept`, 210, 287);

    // Streak details in footer
    ctx.fillStyle = '#6B7280';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText(`🔥 Budget Streak: ${streaks.budgetStreak} days`, 40, 345);
    ctx.fillText(`🧘 No-Spend Streak: ${streaks.noSpendStreak} days`, 210, 345);

    // Right Side: Grade Display Box
    ctx.fillStyle = '#1E2330';
    ctx.strokeStyle = '#252B38';
    ctx.lineWidth = 2;
    // Draw rounded rect for grade
    const rx = 410, ry = 95, rw = 150, rh = 250;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(rx, ry, rw, rh, 16) : ctx.rect(rx, ry, rw, rh);
    ctx.fill();
    ctx.stroke();

    // Grade subtitle
    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FINANCIAL GRADE', rx + rw / 2, ry + 35);

    // Grade Letter
    let gradeColor = '#00D4AA';
    if (stats.grade === 'B') gradeColor = '#6C63FF';
    else if (stats.grade === 'C') gradeColor = '#F5A623';
    else if (stats.grade === 'D') gradeColor = '#FF5C5C';

    ctx.fillStyle = gradeColor;
    ctx.font = 'bold 96px "Space Grotesk", sans-serif';
    ctx.fillText(stats.grade, rx + rw / 2, ry + 140);

    // Glow highlight underneath grade
    ctx.shadowColor = gradeColor;
    ctx.shadowBlur = 10;
    ctx.fillText(stats.grade, rx + rw / 2, ry + 140);
    // Reset shadow
    ctx.shadowBlur = 0;

    // Grade Description
    ctx.fillStyle = '#F0F2F7';
    ctx.font = 'bold 13px "Inter", sans-serif';
    let gradeDesc = 'Budget Champion';
    if (stats.grade === 'B') gradeDesc = 'Solid Progress';
    else if (stats.grade === 'C') gradeDesc = 'Warning signs';
    else if (stats.grade === 'D') gradeDesc = 'Restructure needed';
    ctx.fillText(gradeDesc, rx + rw / 2, ry + 195);

    ctx.fillStyle = '#6B7280';
    ctx.font = '10px "Inter", sans-serif';
    let categoryText = stats.overBudgetsCount === 0 
      ? 'Perfect spending balance' 
      : `${stats.overBudgetsCount} budget limits crossed`;
    ctx.fillText(categoryText, rx + rw / 2, ry + 220);

    // Reset text alignment
    ctx.textAlign = 'left';
  };

  useEffect(() => {
    drawCard();
  }, [stats, profile, streaks]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `FinFlow_ReportCard_${stats.monthName.replace(' ', '_')}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-6 items-center">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
            <Award className="w-5 h-5 text-accent" />
          </div>
          <h3 className="font-display font-bold text-lg">Monthly Report Card</h3>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          Your FinFlow report card grading is computed automatically. It factors in your budget caps, overall saving percentages, and streak retention. Show off your financial maturity!
        </p>

        <div className="flex flex-col gap-2 font-sans">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Calendar className="w-4 h-4 text-accent-2" />
            <span>Active Period: <strong className="text-text-primary">{stats.monthName}</strong></span>
          </div>
          <div className="text-xs text-text-muted">
            Savings Target Met: <strong className={stats.savingsRate >= 20 ? 'text-accent-2' : 'text-warning'}>{stats.savingsRate.toFixed(1)}% Saved</strong>
          </div>
        </div>

        <button
          onClick={downloadImage}
          className="bg-surface-2 hover:bg-surface-2/80 text-text-primary px-4 py-2.5 rounded-xl border border-border flex items-center gap-2 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <Download className="w-4 h-4 text-accent-2" /> Download Report Card Image
        </button>
      </div>

      {/* Hidden/visible Canvas */}
      <div className="relative border border-border rounded-2xl overflow-hidden shadow-xl max-w-full">
        <canvas 
          ref={canvasRef} 
          className="w-full max-w-[480px] h-[320px] aspect-[3/2] block bg-bg-app"
        />
      </div>
    </div>
  );
}

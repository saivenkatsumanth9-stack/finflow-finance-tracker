import React from 'react';

export default function Sparkline({ data = [55000, 60000, 64000, 68500, 71000, 75500], width = 180, height = 48 }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  // Map values to coordinates
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    // Invert y since SVG 0,0 is top-left
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return { x, y };
  });

  // Build SVG path with bezier curve smoothing
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX1 = curr.x + (next.x - curr.x) / 3;
    const cpY1 = curr.y;
    const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
    const cpY2 = next.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
  }

  // Build path for gradient fill
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Net Worth Trend</span>
        <span className="font-mono text-xs text-accent-2 font-bold">
          +{(((data[data.length - 1] - data[0]) / data[0]) * 100).toFixed(1)}%
        </span>
      </div>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Gradient fill */}
        <path d={fillD} fill="url(#sparklineGrad)" />
        {/* Line stroke */}
        <path
          d={pathD}
          fill="none"
          stroke="#6C63FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_4px_#6C63FF66]"
        />
        {/* Pulsing dot at end point */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3"
          fill="#00D4AA"
          className="pulse-dot"
        />
      </svg>
    </div>
  );
}

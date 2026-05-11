// src/components/dashboard/ActivityChart.jsx
// ----------------------------------------------------------------------------
// Hand-rolled SVG bar chart for the last 7 days of stock movement.
// Two bars per day: blue for IN, amber for OUT.
//
// Why SVG instead of a chart lib?
//   - Zero dependencies, ~80 lines of code
//   - Fully responsive (uses viewBox)
//   - Tailwind-friendly via stroke/fill classes
// ----------------------------------------------------------------------------

import { formatNumber } from '../../utils/format';

export default function ActivityChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        No data
      </div>
    );
  }

  // Find max value for scaling. At least 10 so empty days render nicely.
  const maxValue = Math.max(
    10,
    ...data.flatMap((d) => [d.in_quantity, d.out_quantity])
  );

  const width = 700;
  const height = 220;
  const padding = { top: 16, right: 8, bottom: 30, left: 36 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const bandW = chartW / data.length;
  const barW = bandW * 0.35;
  const gap = bandW * 0.08;

  // Y-axis ticks (4 lines)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    value: Math.round(maxValue * t),
    y: padding.top + chartH - chartH * t,
  }));

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="7-day stock movement chart"
      >
        {/* Y-axis grid lines + labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={t.y}
              y2={t.y}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
            />
            <text
              x={padding.left - 6}
              y={t.y + 3}
              textAnchor="end"
              fontSize="10"
              fill="#94a3b8"
            >
              {t.value}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const cx = padding.left + bandW * i + bandW / 2;
          const inH = (d.in_quantity / maxValue) * chartH;
          const outH = (d.out_quantity / maxValue) * chartH;
          const inX = cx - barW - gap / 2;
          const outX = cx + gap / 2;
          const inY = padding.top + chartH - inH;
          const outY = padding.top + chartH - outH;

          // Format day label as "Mon", "Tue", etc.
          const dayLabel = new Date(d.day).toLocaleDateString('en-US', {
            weekday: 'short',
          });

          return (
            <g key={d.day}>
              {/* IN bar */}
              <rect
                x={inX}
                y={inY}
                width={barW}
                height={inH}
                fill="#2563eb"
                rx="2"
              >
                <title>
                  {dayLabel}: {formatNumber(d.in_quantity)} in
                </title>
              </rect>
              {/* OUT bar */}
              <rect
                x={outX}
                y={outY}
                width={barW}
                height={outH}
                fill="#f59e0b"
                rx="2"
              >
                <title>
                  {dayLabel}: {formatNumber(d.out_quantity)} out
                </title>
              </rect>
              {/* X-axis day label */}
              <text
                x={cx}
                y={height - padding.bottom + 16}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {dayLabel}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex justify-center gap-5 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-600" />
          Stock IN
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
          Stock OUT
        </div>
      </div>
    </div>
  );
}

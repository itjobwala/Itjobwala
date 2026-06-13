'use client';

import type { ResumeVersionSnapshot } from '../../types/resume.types';

interface Props {
  versions: ResumeVersionSnapshot[];
}

const CHART_W  = 320;
const CHART_H  = 110;
const PAD_L    = 28;
const PAD_R    = 16;
const PAD_T    = 12;
const PAD_B    = 22;
const INNER_W  = CHART_W - PAD_L - PAD_R;
const INNER_H  = CHART_H - PAD_T - PAD_B;

function scoreToY(score: number) {
  return PAD_T + INNER_H - (score / 100) * INNER_H;
}

function indexToX(i: number, total: number) {
  if (total === 1) return PAD_L + INNER_W / 2;
  return PAD_L + (i / (total - 1)) * INNER_W;
}

export default function ScoreProgressChart({ versions }: Props) {
  const pts = versions
    .filter(v => v.qa_match_score != null)
    .map((v, i, arr) => ({
      x:     indexToX(i, arr.length),
      y:     scoreToY(v.qa_match_score!),
      score: v.qa_match_score!,
      label: `v${v.version_number}`,
    }));

  if (pts.length === 0) return null;

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');

  const yGridLines = [0, 25, 50, 75, 100];

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      width="100%"
      style={{ overflow: 'visible' }}
    >
      {/* Grid lines */}
      {yGridLines.map(v => {
        const y = scoreToY(v);
        return (
          <g key={v}>
            <line
              x1={PAD_L} y1={y} x2={CHART_W - PAD_R} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1"
              strokeDasharray={v === 0 || v === 100 ? '0' : '3,3'}
            />
            <text
              x={PAD_L - 5} y={y + 3.5}
              fill="rgba(148,163,184,0.45)" fontSize="7" textAnchor="end"
            >
              {v}
            </text>
          </g>
        );
      })}

      {/* Area fill under the line */}
      {pts.length > 1 && (
        <polygon
          points={`${pts[0].x},${PAD_T + INNER_H} ${polyline} ${pts[pts.length - 1].x},${PAD_T + INNER_H}`}
          fill="url(#scoreGrad)"
          opacity="0.25"
        />
      )}

      <defs>
        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0"   />
        </linearGradient>
      </defs>

      {/* Polyline */}
      {pts.length > 1 && (
        <polyline
          points={polyline}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#818cf8" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* Points */}
      {pts.map((p, i) => {
        const isLast    = i === pts.length - 1;
        const prevScore = i > 0 ? pts[i - 1].score : p.score;
        const improved  = p.score > prevScore;
        const dotColor  = isLast ? '#a5b4fc' : improved ? '#10b981' : '#f59e0b';
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={dotColor} opacity="0.9" />
            <circle cx={p.x} cy={p.y} r="7" fill={dotColor} opacity="0.12" />
            {/* Score label above point */}
            <text
              x={p.x} y={p.y - 9}
              fill={dotColor} fontSize="8" textAnchor="middle" fontWeight="bold"
            >
              {p.score}
            </text>
            {/* Version label below axis */}
            <text
              x={p.x} y={CHART_H - 4}
              fill="rgba(148,163,184,0.5)" fontSize="7" textAnchor="middle"
            >
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

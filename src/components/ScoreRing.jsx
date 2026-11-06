export default function ScoreRing({ pct }) {
  const r = 84;
  const c = 2 * Math.PI * r;
  const color = pct >= 75 ? 'var(--ok)' : pct >= 40 ? 'var(--flag)' : 'var(--bad)';
  return (
    <svg className="ring" viewBox="0 0 200 200" role="img" aria-label={pct + ' percent'}>
      <circle cx="100" cy="100" r={r} fill="none" stroke="var(--line)" strokeWidth="16" />
      <circle cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 100 100)"
        style={{ transition: 'stroke-dashoffset .8s ease' }} />
      <text x="100" y="112" textAnchor="middle" fontSize="44" fill="var(--ink)">{pct}%</text>
    </svg>
  );
}

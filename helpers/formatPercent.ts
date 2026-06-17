export const formatPct = (v: unknown) => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number);
  return isNaN(n) ? '—' : `${n.toFixed(1)}%`;
};
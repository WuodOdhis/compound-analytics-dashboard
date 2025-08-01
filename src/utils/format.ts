export function formatCurrency(num: number): string {
  const trillion = 1e12;
  const billion = 1e9;
  const million = 1e6;
  const thousand = 1e3;

  if (num >= trillion) {
    const t = num / trillion;
    return `$${t < 10 ? t.toFixed(2) : t.toFixed(1)}T`;
  }
  if (num >= billion) {
    const b = num / billion;
    return `$${b < 10 ? b.toFixed(2) : b.toFixed(1)}B`;
  }
  if (num >= million) {
    const m = num / million;
    return `$${m < 10 ? m.toFixed(2) : m.toFixed(1)}M`;
  }
  if (num >= thousand) {
    const k = num / thousand;
    return `$${k < 10 ? k.toFixed(2) : k.toFixed(1)}K`;
  }
  return `$${num.toFixed(2)}`;
}
export function getNewRank(prev: string | null, next: string | null) {
  const prevNum = prev ? Number(prev) : 0;
  const nextNum = next ? Number(next) : prevNum + 1;
  if (!prev && !next) return "1";
  if (!prev && next) return String(nextNum / 2);
  if (prev && !next) return String(prevNum + 1);
  const mid = (prevNum + nextNum) / 2;
  if (mid === prevNum || mid === nextNum) {
    return String(prevNum + 0.0001);
  }
  return String(mid);
}

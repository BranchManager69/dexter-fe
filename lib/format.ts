export function shortenMint(mint: string, visible = 6) {
  if (!mint || mint.length <= visible * 2 + 1) return mint;
  const head = mint.slice(0, visible);
  const tail = mint.slice(-visible);
  return `${head}…${tail}`;
}

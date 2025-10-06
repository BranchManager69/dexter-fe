export const solid = (token: string) => `rgb(var(${token}))`;
export const withAlpha = (token: string, alpha: number) => `rgb(var(${token}) / ${alpha})`;

export function safeStringify(value: any): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function extractIframeSrc(input?: string | null): string | null {
  if (!input) return null;

  // 1. iframe embed resmi
  const iframeMatch = input.match(/src\s*=\s*"([^"]+)"/i);
  if (iframeMatch && iframeMatch[1].includes("google.com/maps/embed")) {
    return iframeMatch[1];
  }

  // 2. embed URL langsung
  if (input.includes("google.com/maps/embed")) {
    return input;
  }

  // ❌ 3. Shortlink & place link → TOLAK
  return null;
}

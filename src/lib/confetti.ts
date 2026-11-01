export async function fireConfetti(options?: any) {
  if (typeof window === "undefined") return;
  try {
    const confetti = (await import("canvas-confetti")).default;
    return confetti(options);
  } catch {
    // Graceful fallback if confetti fails to load
  }
}


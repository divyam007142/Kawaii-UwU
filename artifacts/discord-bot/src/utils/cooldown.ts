const cooldowns = new Map<string, Map<string, number>>();

export function checkCooldown(userId: string, command: string, cooldownMs: number): number | null {
  if (!cooldowns.has(command)) cooldowns.set(command, new Map());
  const userCooldowns = cooldowns.get(command)!;
  const now = Date.now();
  const lastUsed = userCooldowns.get(userId) ?? 0;
  const remaining = cooldownMs - (now - lastUsed);
  if (remaining > 0) return remaining;
  userCooldowns.set(userId, now);
  return null;
}

export function formatCooldown(ms: number): string {
  const secs = Math.ceil(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remaining = secs % 60;
  return remaining > 0 ? `${mins}m ${remaining}s` : `${mins}m`;
}

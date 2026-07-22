export function nextDraftVersion(current: string): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!match) throw new Error("Invalid semantic version");
  return `${match[1]}.${Number(match[2]) + 1}.0`;
}

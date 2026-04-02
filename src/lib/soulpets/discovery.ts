const KNOWN_PETS_KEY = "soulpets-known-pets";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getKnownPetIds() {
  if (!canUseStorage()) return [] as string[];

  try {
    const raw = window.localStorage.getItem(KNOWN_PETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function rememberPetId(tokenId: string) {
  if (!canUseStorage() || !tokenId) return;

  const nextIds = [tokenId, ...getKnownPetIds().filter((id) => id !== tokenId)].slice(0, 24);
  window.localStorage.setItem(KNOWN_PETS_KEY, JSON.stringify(nextIds));
}
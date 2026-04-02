import type { ChatResult, EvolutionResult, PetState, SoulInteraction } from "./SoulPets";

const DEFAULT_VISUAL_DNA = {
  color: "grey",
  aura: "none",
  form: "egg",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Map);
}

export function normalizeContractValue<T = unknown>(value: T): T {
  if (typeof value === "bigint") {
    return Number(value) as T;
  }

  if (value instanceof Map) {
    return Object.fromEntries(
      Array.from(value.entries(), ([key, nestedValue]) => [key, normalizeContractValue(nestedValue)]),
    ) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeContractValue(item)) as T;
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeContractValue(nestedValue)]),
    ) as T;
  }

  return value;
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toString(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toVisualDna(value: unknown): PetState["visual_dna"] {
  let normalized = normalizeContractValue(value);

  if (typeof normalized === "string") {
    try {
      normalized = normalizeContractValue(JSON.parse(normalized));
    } catch {
      return DEFAULT_VISUAL_DNA;
    }
  }

  if (!isRecord(normalized)) {
    return DEFAULT_VISUAL_DNA;
  }

  return {
    color: toString(normalized.color, DEFAULT_VISUAL_DNA.color),
    aura: toString(normalized.aura, DEFAULT_VISUAL_DNA.aura),
    form: toString(normalized.form, DEFAULT_VISUAL_DNA.form),
  };
}

export function toPetState(value: unknown): PetState {
  const normalized = normalizeContractValue(value);
  const record = isRecord(normalized) ? normalized : {};
  const traits = isRecord(record.traits) ? record.traits : {};

  return {
    token_id: toString(record.token_id),
    owner: toString(record.owner),
    stage: toString(record.stage, "egg"),
    traits: {
      kindness: toNumber(traits.kindness, 50),
      aggression: toNumber(traits.aggression, 50),
      intelligence: toNumber(traits.intelligence, 50),
      loyalty: toNumber(traits.loyalty, 50),
    },
    evolution_points: toNumber(record.evolution_points),
    visual_dna: toVisualDna(record.visual_dna),
    mood: toString(record.mood, "dormant"),
    interaction_count: toNumber(record.interaction_count),
  };
}

export function toChatResult(value: unknown): ChatResult {
  const normalized = normalizeContractValue(value);
  const record = isRecord(normalized) ? normalized : {};

  return {
    response: toString(record.response, "..."),
    mood: toString(record.mood, "calm"),
    visual_update: toString(record.visual_update, "none"),
    evolution_points: toNumber(record.evolution_points),
    interaction_count: toNumber(record.interaction_count),
  };
}

export function toEvolutionResult(value: unknown): EvolutionResult {
  const normalized = normalizeContractValue(value);
  const record = isRecord(normalized) ? normalized : {};
  const visualDna = toVisualDna(record.visual_dna);

  return {
    new_stage: toString(record.new_stage),
    form: toString(record.form, visualDna.form),
    narrative: toString(record.narrative),
    visual_dna: JSON.stringify(visualDna),
    color: visualDna.color,
    aura: visualDna.aura,
  };
}

export function toSoulInteraction(value: unknown): SoulInteraction {
  const normalized = normalizeContractValue(value);
  const record = isRecord(normalized) ? normalized : {};

  return {
    turn: toNumber(record.turn),
    message: toString(record.message),
    response: toString(record.response),
    trait_updates: toString(record.trait_updates, "{}"),
  };
}
import { describe, expect, it } from "vitest";
import { toChatResult, toPetState, toSoulInteraction } from "@/lib/contracts/soulPetsParsers";

describe("SoulPets contract response parsers", () => {
  it("converts bigint-rich pet state into plain numbers", () => {
    const state = toPetState({
      token_id: "pet_7",
      owner: "0xabc",
      stage: "egg",
      traits: new Map([
        ["kindness", 55n],
        ["aggression", 48n],
        ["intelligence", 63n],
        ["loyalty", 71n],
      ]),
      evolution_points: 12n,
      interaction_count: 4n,
      mood: "happy",
      visual_dna: new Map([
        ["color", "gold"],
        ["aura", "glow"],
        ["form", "egg"],
      ]),
    });

    expect(state.evolution_points).toBe(12);
    expect(state.interaction_count).toBe(4);
    expect(state.traits.loyalty).toBe(71);
  });

  it("normalizes chat results without leaking bigint values", () => {
    const result = toChatResult({
      response: "hello",
      mood: "calm",
      visual_update: "pulse",
      evolution_points: 9n,
      interaction_count: 3n,
    });

    expect(result.evolution_points).toBeTypeOf("number");
    expect(result.interaction_count).toBe(3);
  });

  it("normalizes history turn values", () => {
    const interaction = toSoulInteraction({
      turn: 8n,
      message: "hi",
      response: "hey",
      trait_updates: '{"kindness":2}',
    });

    expect(interaction.turn).toBe(8);
  });
});
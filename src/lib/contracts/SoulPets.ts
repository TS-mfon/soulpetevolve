import { createGenLayerClient } from "../genlayer/client";

const CONTRACT_ADDRESS = "0xBBf8da5b9Baf1720d7181E74481a56A95100846b";

export interface PetState {
  token_id: string;
  owner: string;
  stage: string;
  traits: {
    kindness: number;
    aggression: number;
    intelligence: number;
    loyalty: number;
  };
  evolution_points: number;
  visual_dna: {
    color: string;
    aura: string;
    form: string;
  };
  mood: string;
  interaction_count: number;
}

export interface ChatResult {
  response: string;
  mood: string;
  visual_update: string;
  evolution_points: number;
  interaction_count: number;
}

export interface EvolutionResult {
  new_stage: string;
  form: string;
  narrative: string;
  visual_dna: string;
}

export interface SoulInteraction {
  turn: number;
  message: string;
  response: string;
  trait_updates: string;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  [key: string]: any;
}

class SoulPetsContract {
  private contractAddress: `0x${string}`;

  constructor() {
    this.contractAddress = CONTRACT_ADDRESS as `0x${string}`;
  }

  private getClient(address?: string | null) {
    return createGenLayerClient(address || undefined);
  }

  async mintPet(address: string): Promise<string> {
    const client = this.getClient(address);
    const txHash = await client.writeContract({
      address: this.contractAddress,
      functionName: "mint_pet",
      args: [],
      value: BigInt(0),
    });
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      status: "ACCEPTED" as any,
      retries: 30,
      interval: 5000,
    });
    // Extract token_id from receipt
    const result = (receipt as any)?.result;
    if (typeof result === "string") return result;
    return `pet_${Date.now()}`;
  }

  async chat(address: string, tokenId: string, message: string): Promise<ChatResult> {
    const client = this.getClient(address);
    const txHash = await client.writeContract({
      address: this.contractAddress,
      functionName: "chat",
      args: [tokenId, message],
      value: BigInt(0),
    });
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      status: "ACCEPTED" as any,
      retries: 30,
      interval: 5000,
    });
    const result = (receipt as any)?.result;
    if (result && typeof result === "object") {
      return result as ChatResult;
    }
    return {
      response: "...",
      mood: "calm",
      visual_update: "none",
      evolution_points: 0,
      interaction_count: 0,
    };
  }

  async evolve(address: string, tokenId: string): Promise<EvolutionResult> {
    const client = this.getClient(address);
    const txHash = await client.writeContract({
      address: this.contractAddress,
      functionName: "evolve",
      args: [tokenId],
      value: BigInt(0),
    });
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      status: "ACCEPTED" as any,
      retries: 30,
      interval: 5000,
    });
    const result = (receipt as any)?.result;
    if (result && typeof result === "object") {
      return result as EvolutionResult;
    }
    return { new_stage: "", form: "", narrative: "", visual_dna: "" };
  }

  async getPetState(tokenId: string): Promise<PetState> {
    const client = this.getClient();
    const result: any = await client.readContract({
      address: this.contractAddress,
      functionName: "get_pet_state",
      args: [tokenId],
    });

    // Handle Map responses from GenLayer
    if (result instanceof Map) {
      const obj = Object.fromEntries(result);
      const traits = obj.traits instanceof Map ? Object.fromEntries(obj.traits) : obj.traits;
      const visual_dna = obj.visual_dna instanceof Map ? Object.fromEntries(obj.visual_dna) : obj.visual_dna;
      return { ...obj, traits, visual_dna } as PetState;
    }

    return result as PetState;
  }

  async getSoulHistory(tokenId: string): Promise<SoulInteraction[]> {
    const client = this.getClient();
    const result: any = await client.readContract({
      address: this.contractAddress,
      functionName: "get_soul_history",
      args: [tokenId],
    });

    if (Array.isArray(result)) {
      return result.map((item: any) => {
        if (item instanceof Map) {
          return Object.fromEntries(item) as SoulInteraction;
        }
        return item as SoulInteraction;
      });
    }

    return [];
  }
}

export const soulPetsContract = new SoulPetsContract();

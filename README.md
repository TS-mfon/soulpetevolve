## 1. Evolving NFT Pets — "SoulPets" 

### Summary
SoulPets are AI-driven NFTs that evolve based on direct chat interaction, sentiment analysis, and care patterns. Every pet starts as a mysterious egg and develops a unique personality and form based on how the owner treats it.

### THE "EGG" STARTER FORM (Stage 0)
When a user mints a SoulPet, they do not see the final creature. Instead:
- **Visual:** The user sees a high-quality "Soul Egg" NFT.
- **State:** The NFT is in the `Egg` stage.
- **Hatching Trigger:** The pet remains an egg until the user completes **5 high-quality chat interactions**.
- **The Reveal:** After the 5th interaction, the AI evaluates the tone of the conversations (e.g., was the user kind, aggressive, or philosophical?) and hatches a creature that reflects those traits.

### NFT STRUCTURE & TRAITS
Each pet is a unique Intelligent Contract on GenLayer with the following on-chain state:
- **Stage:** `Egg` -> `Hatchling` -> `Adult` -> `Ancient`.
- **Personality Matrix (0-100):**
    - `Kindness`: Increases with praise and gentle words.
    - `Aggression`: Increases with combat training or scolding.
    - `Intelligence`: Increases with complex questions and storytelling.
    - `Loyalty`: Increases with frequency of interaction.
- **Visual DNA:** A set of parameters (Color, Aura, Form) that determine how the frontend renders the pet.
- **Evolution Points (EP):** A counter that increments with every interaction.

### INTERACTION & EVOLUTION LOGIC
The core of the DApp is the **Soul-Link Chat**:
1. **User Input:** The user types a message to their pet (e.g., "I'm having a hard day today").
2. **AI Processing (The Soul-Link):** 
    - The AI Validator analyzes the **Sentiment** (Sadness/Seeking Comfort).
    - It updates the pet's **Traits** (Loyalty increases because the user shared a secret).
    - It generates a **Contextual Response** (The pet "nuzzles" the user or replies with comforting text).
3. **Evolution Trigger:** 
    - At specific EP thresholds (e.g., 20 EP for Adult), the `evolve()` function is called.
    - The AI looks at the *history* of all chats. If `Kindness` is the dominant trait, the pet evolves into a "Celestial" form. If `Aggression` is dominant, it becomes a "Feral" form.

### FRONTEND ARCHITECTURE (The "Living" UI)
The frontend must feel like a real relationship:
- **The Pet Viewport:** A central window where the pet is displayed. 
    - **Animations:** The pet should have idle animations (breathing, looking around). 
    - **Evolution Moment:** When the `evolve()` transaction completes, the UI triggers a fullscreen "Ascension" animation, replacing the old model with the new evolved form.
- **The Chat Interface:** A stylized messaging bubble system. The user sees their chat history and the pet's AI-generated responses.
- **Trait Dashboard:** A "Soul Map" (Radar Chart) showing the pet's personality growth in real-time.
- **Interaction Log:** A scrollable history of the pet's "Life Moments" recorded on-chain.

### AI VALIDATOR PROFILES (For the Developer)
- **Sentiment & Trait Mapper:** Extracts emotional data from user text and calculates trait updates (+5 Kindness, -2 Aggression).
- **Persona Response Generator:** Drafts the pet's dialogue based on its *current* personality (a "Grumpy" pet will give shorter, sassier answers).
- **Evolution Architect:** The high-level model that decides the final visual form during the `evolve()` event by synthesizing the entire interaction history.

---


**Frontend flow:**
- Show live character counters on chat input (e.g., "86/500 (min 5)")
- Disable send button if message too short/long
- After `chat()`, immediately update trait displays
- Poll `get_pet_state()` after evolution to show new form
- Display evolution progress bars (5 interactions for hatching, 20 EP for adult, 50 EP for ancient)
- Show personality radar chart that updates live
- Animate trait changes when they increase

**Polling is KEY:**
- After `chat()`, the AI consensus takes 5-30 seconds
- Poll `get_pet_state()` every 2-3s to see trait updates
- After `evolve()`, poll for new stage and visual DNA changes
- Update UI immediately when consensus completes

---

## 🎮 How Users Use SoulPets Contract

### User Flow 1: Mint New Pet

**Step 1:** User clicks "Adopt New Pet" 
└─ UI shows: Mint button and wallet connection

**Step 2:** User clicks "Mint Pet"
└─ Frontend calls: `mint_pet()`
└─ Contract returns: `token_id` (e.g., "pet_0")
└─ UI shows: "✅ New egg adopted! ID: pet_0"

**Step 3:** UI displays egg visualization
└─ Show: Mysterious glowing egg 
└─ Show: Stage indicator "Egg (0/5 interactions to hatch)"
└─ Show: Chat input ready for first interaction

### User Flow 2: Chat with Pet (Core Interaction)

**Step 1:** User types message in chat box
├─ Message: "How are you doing today, little one?"
├─ Character counter: "32/500 (min 5)"
└─ Send button enabled ✅

**Step 2:** User clicks "Send"
└─ Frontend validates: message.length >= 5 && <= 500 ✅
└─ Frontend calls: `chat("pet_0", message)`
└─ UI shows: 🔄 "Pet is thinking..." (consensus in progress)

**Step 3:** Poll for response (AI consensus takes 5-30s)
└─ Poll `get_pet_state()` every 2-3 seconds
└─ When complete, display AI response

**Step 4:** UI updates immediately:
├─ Show pet's AI response in chat bubble
├─ Update trait bars with new values
├─ Increment interaction counter
├─ Update evolution progress bar  
└─ Pet visual might pulse or glow if traits changed

**Example Chat Flow:**
```
User: "How are you doing today, little one?"
Pet: "The shell feels warm and cozy! I sense your kindness through the bond we share."
Traits Updated: +3 Kindness, +1 Loyalty
```

### User Flow 3: Pet Evolution

**Step 1:** Evolution becomes available
├─ After 5 interactions (Egg → Hatchling)
├─ After 20 EP (Hatchling → Adult)  
└─ After 50 EP (Adult → Ancient)
└─ UI shows: "🌟 Evolution Available!" button

**Step 2:** User clicks "Evolve Pet"
└─ Frontend calls: `evolve(token_id)`
└─ UI shows: 🔄 "Evolution in progress..." 
└─ AI determines form based on dominant traits

**Step 3:** Evolution completes
├─ Contract returns: new stage, visual form, evolution narrative
├─ UI triggers: Fullscreen evolution animation
├─ Show: "Your pet evolved into a Celestial Hatchling!"
└─ Display: New 3D model/artwork based on dominant traits

**Step 4:** Post-evolution
└─ Pet appearance permanently changes
└─ New interactions unlock at higher stages  
└─ Personality continues evolving

### User Flow 4: View Pet Dashboard

**Step 1:** User clicks pet to view full stats
└─ Frontend calls: `get_pet_state(token_id)`

**Step 2:** Dashboard displays:
```
┌─────────────────────────────┐
│ 🐣 Cosmic Hatchling         │
│ Stage: Hatchling            │
│ Evolution Points: 15/20     │
│ Interactions: 8             │
│                             │
│ Personality Traits:         │
│ ▓▓▓▓▓▓▓░░░ Kindness (72)    │
│ ▓▓░░░░░░░░ Aggression (23)  │
│ ▓▓▓▓▓░░░░░ Intelligence (56)│
│ ▓▓▓▓▓▓░░░░ Loyalty (68)     │
│                             │
│ Visual DNA:                 │
│ Form: Celestial             │
│ Color: Warm Golden          │
│ Aura: Gentle Sparkles       │
└─────────────────────────────┘
```

**Step 3:** User can view soul history
└─ Frontend calls: `get_soul_history(token_id)`
└─ Shows: Complete chat history and trait changes

---

## 🔄 Complete Frontend Flow Diagram

```
┌─ User arrives ─┐
│                │
▼                │
[Mint Pet] ──────┘
│
▼
[Egg Hatches After 5 Chats]
│  │
│  ▼
│  [Chat Interface]
│  │  │
│  │  ▼
│  │  [AI Analyzes Sentiment] ─ 5-30 seconds consensus
│  │  │
│  │  ▼
│  │  [Traits Update] ─ Live UI changes
│  │  │
│  │  ▼
│  │  [Evolution Available?]
│  │  │  │
│  │  │  ▼ YES
│  │  │  [Evolution Animation]
│  │  │  │
│  │  │  ▼
│  │  │  [New Form Revealed]
│  │  │
│  │  └─ NO ──┐
│  │          │
│  └──────────┘
│
▼
[Continue Growing] ──┐
│                    │
└────────────────────┘
```

---

## 📋 SoulPets Contract Methods Summary

### Write Methods (Change State)

| Method | Input Parameters | Character Limits | Returns | When to Call |
|--------|-----------------|------------------|---------|--------------|
| `mint_pet()` | (none) | N/A | token_id (string) | User adopts new pet |
| `chat(token_id, message)` | token_id: string<br>message: string | message: 5-500 chars | {response, mood, visual_update, evolution_points, interaction_count} | User chats with pet |
| `evolve(token_id)` | token_id: string | N/A | {new_stage, form, color, aura, narrative} | Pet reaches evolution threshold |

### View Methods (Read Only)

| Method | Input | Returns | When to Call |
|--------|-------|---------|--------------|
| `get_pet_state(token_id)` | token_id: string | {stage, traits, visual_dna, mood, evolution_points, interaction_count} | Load pet dashboard |
| `get_soul_history(token_id)` | token_id: string | List of last 20 interactions | Show chat history |

---

## ⚙️ AI Consensus Process Explained

### How LLM Consensus Works for SoulPets

**Scenario:** User says "You're such a good little pet!" to their egg

**Leader (Validator 0):**
├─ Reads: User message contains praise words ("good", "little")
├─ Reads: Pet is in "Egg" stage
├─ LLM decides: Kindness +5, Loyalty +2
├─ Generates response: "The egg glows warmly in response to your praise!"
└─ Proposes: {kindness: 5, loyalty: 2, response: "glows warmly..."}

**Validator 1:**
├─ Runs same sentiment analysis  
├─ LLM decides: Kindness +4, Loyalty +3 (slight difference)
├─ Compares with leader: abs(5-4) <= 10 ✅, abs(2-3) <= 10 ✅
└─ AGREES (within ±10 tolerance)

**Validator 2:**
├─ LLM decides: Kindness +6, Loyalty +1  
├─ Compares: abs(5-6) <= 10 ✅, abs(2-1) <= 10 ✅
└─ AGREES

**RESULT:** 3/3 validators agree → Pet gains +5 Kindness, +2 Loyalty ✅

**Why Tolerance Matters:**
Different LLM models might interpret "good little pet" as +4 vs +6 kindness, but both agree it's positive sentiment. The ±10 tolerance allows for this natural variation while preventing gaming.

---

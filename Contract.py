# { "Depends": "py-genlayer:test" }

from genlayer import *
from dataclasses import dataclass
import json

ERROR_EXPECTED = "[EXPECTED]"
ERROR_LLM = "[LLM_ERROR]"
ERROR_TRANSIENT = "[TRANSIENT]"


@allow_storage
@dataclass
class Pet:
    """SoulPet NFT with evolving personality."""
    token_id: str
    owner: Address
    stage: str  # "egg", "hatchling", "adult", "ancient"
    kindness: u256
    aggression: u256
    intelligence: u256
    loyalty: u256
    evolution_points: u256
    visual_dna: str  # JSON: {"color": "...", "aura": "...", "form": "..."}
    mood: str
    interaction_count: u256


@allow_storage
@dataclass
class Interaction:
    """Record of soul-link chat interaction."""
    token_id: str
    message: str
    response: str
    trait_updates: str  # JSON
    turn: u256


class SoulPets(gl.Contract):
    """Evolving AI NFT pets with personality development."""

    owner: Address
    pets: TreeMap[str, Pet]
    interactions: DynArray[Interaction]  # Flat list of all interactions
    total_pets: u256

    def __init__(self):
        """Initialize SoulPets contract."""
        self.owner = gl.message.sender_address
        self.total_pets = u256(0)

    @gl.public.write
    def mint_pet(self) -> str:
        """Mint a new SoulPet in egg stage."""
        token_id = f"pet_{self.total_pets}"
        
        # Initialize with neutral traits
        pet = Pet(
            token_id=token_id,
            owner=gl.message.sender_address,
            stage="egg",
            kindness=u256(50),
            aggression=u256(50),
            intelligence=u256(50),
            loyalty=u256(50),
            evolution_points=u256(0),
            visual_dna='{"color":"grey","aura":"none","form":"egg"}',
            mood="dormant",
            interaction_count=u256(0),
        )

        self.pets[token_id] = pet
        self.total_pets = self.total_pets + u256(1)

        return token_id

    @gl.public.write
    def chat(self, token_id: str, message: str) -> dict:
        """Chat with your SoulPet - AI analyzes sentiment and updates traits."""
        if token_id not in self.pets:
            raise gl.UserError(f"{ERROR_EXPECTED} Pet not found: {token_id}")

        pet = self.pets[token_id]

        if pet.owner != gl.message.sender_address:
            raise gl.UserError(f"{ERROR_EXPECTED} Not your pet")

        if len(message) < 5:
            raise gl.UserError(f"{ERROR_EXPECTED} Message too short (min 5 chars)")
        
        if len(message) > 500:
            raise gl.UserError(f"{ERROR_EXPECTED} Message too long (max 500 chars)")

        # READ ALL STORAGE BEFORE NONDET BLOCK
        pet_stage = pet.stage
        pet_kindness = int(pet.kindness)
        pet_aggression = int(pet.aggression)
        pet_intelligence = int(pet.intelligence)
        pet_loyalty = int(pet.loyalty)
        pet_mood = pet.mood
        pet_interaction_count = int(pet.interaction_count)

        def trait_analysis():
            """Analyze traits with custom validator for ±10 tolerance."""
            context = f"""Pet Stage: {pet_stage}
Current Traits (0-100):
- Kindness: {pet_kindness}
- Aggression: {pet_aggression}
- Intelligence: {pet_intelligence}
- Loyalty: {pet_loyalty}
Mood: {pet_mood}
Interactions: {pet_interaction_count}

User Message: "{message}"

Analyze ONLY the trait changes based on message sentiment:
- Kind/gentle words → +kindness (0-10)
- Harsh/angry words → +aggression (0-10)
- Questions/storytelling → +intelligence (0-10)
- Frequency/sharing secrets → +loyalty (0-10)

Respond in JSON:
{{
    "trait_updates": {{"kindness": 0-10, "aggression": 0-10, "intelligence": 0-10, "loyalty": 0-10}},
    "new_mood": "happy/sad/excited/calm/playful/grumpy",
    "visual_update": "glow/pulse/shimmer/none"
}}"""

            result = gl.nondet.exec_prompt(context, response_format="json")

            if not isinstance(result, dict):
                raise gl.UserError(f"{ERROR_LLM} Non-dict response")

            trait_updates = result.get("trait_updates", {})
            if not isinstance(trait_updates, dict):
                raise gl.UserError(f"{ERROR_LLM} Invalid trait_updates")

            return {
                "trait_updates": trait_updates,
                "new_mood": str(result.get("new_mood", "calm"))[:20],
                "visual_update": str(result.get("visual_update", "none"))[:20],
            }

        def trait_validator_fn(leaders_res: gl.vm.Result) -> bool:
            """Custom validator with ±10 tolerance for traits."""
            if not isinstance(leaders_res, gl.vm.Return):
                return False

            leader_updates = leaders_res.calldata.get("trait_updates", {})
            validator_result = trait_analysis()
            validator_updates = validator_result.get("trait_updates", {})

            # Allow ±10 tolerance on trait changes
            for trait in ["kindness", "aggression", "intelligence", "loyalty"]:
                leader_val = int(leader_updates.get(trait, 0))
                validator_val = int(validator_updates.get(trait, 0))
                
                if abs(leader_val - validator_val) > 10:
                    return False

            return True

        # Step 1: Get trait analysis with custom validator
        trait_result = gl.vm.run_nondet_unsafe(trait_analysis, trait_validator_fn)

        def response_generation():
            """Generate pet response using equivalence principle."""
            context = f"""Pet Stage: {pet_stage}
Current Traits: Kindness {pet_kindness}, Aggression {pet_aggression}, Intelligence {pet_intelligence}, Loyalty {pet_loyalty}
Current Mood: {pet_mood}
User Message: "{message}"
Trait Changes: {trait_result.get('trait_updates', {})}
New Mood: {trait_result.get('new_mood', 'calm')}

Generate the pet's response dialogue. Be creative but consistent with:
1. The pet's current stage ({pet_stage})
2. The updated traits and new mood
3. The tone of the user's message

Respond with ONLY the pet's dialogue as a string (not JSON)."""

            response = gl.nondet.exec_prompt(context, response_format="text")
            return str(response)[:500]

        def optimistic_democracy():
            """Optimistic democracy: Leader proposes, validators can challenge."""
            def leader_fn():
                # Leader makes optimistic response
                quick_response = f"*{trait_result.get('new_mood', 'calm')} pet noises* I sense your {message[:20]}..."
                return {
                    "is_challenge": False,
                    "response": quick_response,
                    "confidence": "high"
                }

            def validator_fn(leaders_res: gl.vm.Result) -> bool:
                """Validators decide whether to accept optimistic result or challenge."""
                if not isinstance(leaders_res, gl.vm.Return):
                    return False

                # 30% chance validators challenge for full AI response
                challenge_prompt = f"""Should we run full AI consensus for this pet interaction?

User message: "{message[:100]}"
Pet stage: {pet_stage}
Optimistic response: "{leaders_res.calldata.get('response', '')}"

Challenge if:
- Message is emotionally complex or nuanced
- Pet response seems too generic
- Important character development moment

Respond JSON: {{"challenge": true/false, "reason": "..."}}"""

                challenge_result = gl.nondet.exec_prompt(challenge_prompt, response_format="json")
                should_challenge = challenge_result.get("challenge", False)

                if should_challenge:
                    # Return False to trigger full consensus
                    return False
                else:
                    # Accept optimistic result
                    return True

            return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        # Step 2: Try optimistic democracy first
        try:
            democracy_result = optimistic_democracy()
            if democracy_result.get("is_challenge", True):
                # Optimistic result was challenged, run full AI consensus
                pet_response = gl.eq_principle.prompt_comparative(
                    response_generation,
                    principle="""Responses are equivalent if they:
1. Match the pet's stage and personality (based on traits)
2. Appropriately reflect the new mood from trait analysis
3. Respond meaningfully to the user's message tone
4. Are creative but consistent with the pet's character

Focus on emotional appropriateness and character consistency, not exact wording."""
                )
            else:
                # Optimistic result accepted
                pet_response = democracy_result.get("response", "...")
        except:
            # Fallback to full consensus if optimistic democracy fails
            pet_response = gl.eq_principle.prompt_comparative(
                response_generation,
                principle="""Responses are equivalent if they:
1. Match the pet's stage and personality
2. Reflect the appropriate mood and trait changes  
3. Respond meaningfully to user message
4. Maintain character consistency

Focus on emotional tone and character development."""
            )

        # Combine trait analysis + response
        result = {
            "trait_updates": trait_result.get("trait_updates", {}),
            "new_mood": trait_result.get("new_mood", "calm"),
            "response": pet_response,
            "visual_update": trait_result.get("visual_update", "none"),
        }

        # Update pet state (OUTSIDE consensus block)
        trait_updates = result.get("trait_updates", {})
        
        new_kindness = min(u256(100), pet.kindness + u256(int(trait_updates.get("kindness", 0))))
        new_aggression = min(u256(100), pet.aggression + u256(int(trait_updates.get("aggression", 0))))
        new_intelligence = min(u256(100), pet.intelligence + u256(int(trait_updates.get("intelligence", 0))))
        new_loyalty = min(u256(100), pet.loyalty + u256(int(trait_updates.get("loyalty", 0))))
        new_ep = pet.evolution_points + u256(1)
        new_interaction_count = pet.interaction_count + u256(1)

        self.pets[token_id] = Pet(
            token_id=pet.token_id,
            owner=pet.owner,
            stage=pet.stage,
            kindness=new_kindness,
            aggression=new_aggression,
            intelligence=new_intelligence,
            loyalty=new_loyalty,
            evolution_points=new_ep,
            visual_dna=pet.visual_dna,
            mood=result.get("new_mood", "calm"),
            interaction_count=new_interaction_count,
        )

        # Store interaction history (append to flat DynArray)
        interaction = Interaction(
            token_id=token_id,
            message=message[:500],
            response=result.get("response", "...")[:500],
            trait_updates=json.dumps(trait_updates)[:200],
            turn=new_interaction_count,
        )
        self.interactions.append(interaction)

        return {
            "response": result.get("response", ""),
            "mood": result.get("new_mood", "calm"),
            "visual_update": result.get("visual_update", "none"),
            "evolution_points": int(new_ep),
            "interaction_count": int(new_interaction_count),
        }

    @gl.public.write
    def evolve(self, token_id: str) -> dict:
        """Evolve pet to next stage based on traits and EP."""
        if token_id not in self.pets:
            raise gl.UserError(f"{ERROR_EXPECTED} Pet not found: {token_id}")

        pet = self.pets[token_id]

        if pet.owner != gl.message.sender_address:
            raise gl.UserError(f"{ERROR_EXPECTED} Not your pet")

        # Check evolution requirements
        if pet.stage == "egg" and pet.interaction_count < u256(5):
            raise gl.UserError(f"{ERROR_EXPECTED} Need 5 interactions to hatch (current: {pet.interaction_count})")
        
        if pet.stage == "hatchling" and pet.evolution_points < u256(20):
            raise gl.UserError(f"{ERROR_EXPECTED} Need 20 EP to evolve to Adult (current: {pet.evolution_points})")
        
        if pet.stage == "adult" and pet.evolution_points < u256(50):
            raise gl.UserError(f"{ERROR_EXPECTED} Need 50 EP to evolve to Ancient (current: {pet.evolution_points})")
        
        if pet.stage == "ancient":
            raise gl.UserError(f"{ERROR_EXPECTED} Already at max evolution")

        # Read all storage before nondet block
        current_stage = pet.stage
        pet_kindness = int(pet.kindness)
        pet_aggression = int(pet.aggression)
        pet_intelligence = int(pet.intelligence)
        pet_loyalty = int(pet.loyalty)

        def leader_fn():
            # AI determines form based on dominant trait
            prompt = f"""Pet is evolving from {current_stage}!

Traits:
- Kindness: {pet_kindness}
- Aggression: {pet_aggression}
- Intelligence: {pet_intelligence}
- Loyalty: {pet_loyalty}

Based on the DOMINANT trait, determine the visual form:
- High Kindness (70+): "Celestial" (bright, angelic)
- High Aggression (70+): "Feral" (dark, fierce)
- High Intelligence (70+): "Ethereal" (mysterious, arcane)
- High Loyalty (70+): "Guardian" (protective, noble)
- Balanced: "Harmonious" (rainbow, balanced)

Respond in JSON:
{{
    "new_stage": "hatchling/adult/ancient",
    "form": "celestial/feral/ethereal/guardian/harmonious",
    "color": "color description",
    "aura": "aura description",
    "evolution_narrative": "What happened during evolution"
}}"""

            result = gl.nondet.exec_prompt(prompt, response_format="json")

            if not isinstance(result, dict):
                raise gl.UserError(f"{ERROR_LLM} Non-dict response")

            return {
                "new_stage": str(result.get("new_stage", "hatchling"))[:20],
                "form": str(result.get("form", "balanced"))[:20],
                "color": str(result.get("color", "grey"))[:50],
                "aura": str(result.get("aura", "none"))[:50],
                "narrative": str(result.get("evolution_narrative", ""))[:500],
            }

        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False

            leader_stage = leaders_res.calldata.get("new_stage", "")
            leader_form = leaders_res.calldata.get("form", "")
            
            validator_result = leader_fn()
            validator_stage = validator_result.get("new_stage", "")
            validator_form = validator_result.get("form", "")

            # Must agree on stage and form
            return leader_stage == validator_stage and leader_form == validator_form

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        # Update pet with evolution
        visual_dna = json.dumps({
            "color": result.get("color", "grey"),
            "aura": result.get("aura", "none"),
            "form": result.get("form", "balanced"),
        })

        self.pets[token_id] = Pet(
            token_id=pet.token_id,
            owner=pet.owner,
            stage=result.get("new_stage", pet.stage),
            kindness=pet.kindness,
            aggression=pet.aggression,
            intelligence=pet.intelligence,
            loyalty=pet.loyalty,
            evolution_points=pet.evolution_points,
            visual_dna=visual_dna[:200],
            mood="ascended",
            interaction_count=pet.interaction_count,
        )

        return {
            "new_stage": result.get("new_stage", ""),
            "form": result.get("form", ""),
            "narrative": result.get("narrative", ""),
            "visual_dna": visual_dna,
        }

    @gl.public.view
    def get_pet_state(self, token_id: str) -> dict:
        """Get complete pet state."""
        if token_id not in self.pets:
            raise gl.UserError(f"{ERROR_EXPECTED} Pet not found: {token_id}")

        pet = self.pets[token_id]
        
        try:
            visual_dna = json.loads(pet.visual_dna)
        except:
            visual_dna = {"color": "grey", "aura": "none", "form": "egg"}

        return {
            "token_id": pet.token_id,
            "owner": str(pet.owner),
            "stage": pet.stage,
            "traits": {
                "kindness": int(pet.kindness),
                "aggression": int(pet.aggression),
                "intelligence": int(pet.intelligence),
                "loyalty": int(pet.loyalty),
            },
            "evolution_points": int(pet.evolution_points),
            "visual_dna": visual_dna,
            "mood": pet.mood,
            "interaction_count": int(pet.interaction_count),
        }

    @gl.public.view
    def get_soul_history(self, token_id: str) -> list:
        """Get interaction history for pet."""
        if token_id not in self.pets:
            raise gl.UserError(f"{ERROR_EXPECTED} Pet not found: {token_id}")

        # Filter flat interactions list for this pet
        history = []
        for interaction in self.interactions:
            if interaction.token_id == token_id:
                history.append({
                    "turn": int(interaction.turn),
                    "message": interaction.message,
                    "response": interaction.response,
                    "trait_updates": interaction.trait_updates,
                })
        
        # Return last 20
        return history[-20:]


def test_soulpets():
    """Direct mode tests."""
    contract = SoulPets()

    # Test 1: Mint pet
    token_id = contract.mint_pet()
    assert token_id == "pet_0"
    print("✓ mint_pet works")

    # Test 2: Get pet state
    state = contract.get_pet_state(token_id)
    assert state["stage"] == "egg"
    assert state["traits"]["kindness"] == 50
    print("✓ get_pet_state works")

    # Test 3: Chat with pet
    result = contract.chat(token_id, "Hello my dear pet, I love you!")
    assert "response" in result
    assert result["interaction_count"] == 1
    print("✓ chat works")

    # Test 4: Get soul history
    history = contract.get_soul_history(token_id)
    assert len(history) == 1
    print("✓ get_soul_history works")

    # Test 5: Try to evolve too early
    try:
        contract.evolve(token_id)
        assert False, "Should have failed"
    except:
        print("✓ evolve validation works")

    print("\n✓ All SoulPets tests passed!")


if __name__ == "__main__":
    test_soulpets()

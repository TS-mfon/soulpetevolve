import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

const AUDIO_ENABLED_KEY = "soulpets-audio-enabled";

interface SoulPetAudioContextValue {
  enabled: boolean;
  toggleEnabled: () => void;
  playChatSend: () => void;
  playChatResponse: () => void;
  playEvolution: () => void;
}

const SoulPetAudioContext = createContext<SoulPetAudioContextValue | undefined>(undefined);

type OscillatorTypeSafe = "sine" | "triangle" | "square" | "sawtooth";

export function SoulPetAudioProvider({ children }: { children: ReactNode }) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(AUDIO_ENABLED_KEY);
    if (stored !== null) setEnabled(stored === "true");
  }, []);

  const ensureContext = useCallback(async () => {
    if (typeof window === "undefined") return null;

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  const playTone = useCallback(async (frequency: number, startAt: number, duration: number, type: OscillatorTypeSafe, gainValue: number) => {
    const context = await ensureContext();
    if (!context || !enabled) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime + startAt;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }, [enabled, ensureContext]);

  const playChatSend = useCallback(() => {
    void playTone(520, 0, 0.08, "triangle", 0.03);
    void playTone(660, 0.07, 0.1, "triangle", 0.025);
  }, [playTone]);

  const playChatResponse = useCallback(() => {
    void playTone(360, 0, 0.09, "sine", 0.025);
    void playTone(480, 0.08, 0.11, "sine", 0.02);
    void playTone(620, 0.18, 0.14, "sine", 0.018);
  }, [playTone]);

  const playEvolution = useCallback(() => {
    void playTone(330, 0, 0.12, "sawtooth", 0.02);
    void playTone(495, 0.11, 0.16, "triangle", 0.025);
    void playTone(660, 0.22, 0.2, "triangle", 0.03);
    void playTone(880, 0.36, 0.28, "sine", 0.035);
  }, [playTone]);

  const toggleEnabled = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(AUDIO_ENABLED_KEY, String(next));
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ enabled, toggleEnabled, playChatSend, playChatResponse, playEvolution }), [enabled, toggleEnabled, playChatSend, playChatResponse, playEvolution]);

  return <SoulPetAudioContext.Provider value={value}>{children}</SoulPetAudioContext.Provider>;
}

export function useSoulPetAudio() {
  const context = useContext(SoulPetAudioContext);
  if (!context) throw new Error("useSoulPetAudio must be used within SoulPetAudioProvider");
  return context;
}
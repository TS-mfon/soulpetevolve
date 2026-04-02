import { useEffect, useState } from "react";

interface TraitBarProps {
  label: string;
  value: number;
  maxValue?: number;
  colorClass: string;
}

function TraitBar({ label, value, maxValue = 100, colorClass }: TraitBarProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const pct = Math.min((displayValue / maxValue) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium text-foreground">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full trait-bar-fill ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface TraitDashboardProps {
  traits: {
    kindness: number;
    aggression: number;
    intelligence: number;
    loyalty: number;
  };
}

export function TraitDashboard({ traits }: TraitDashboardProps) {
  return (
    <div className="soul-card p-5 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        🧬 Soul Map
      </h3>
      <div className="space-y-3">
        <TraitBar label="💚 Kindness" value={traits.kindness} colorClass="bg-soul-kindness" />
        <TraitBar label="🔥 Aggression" value={traits.aggression} colorClass="bg-soul-aggression" />
        <TraitBar label="🧠 Intelligence" value={traits.intelligence} colorClass="bg-soul-intelligence" />
        <TraitBar label="🛡️ Loyalty" value={traits.loyalty} colorClass="bg-soul-loyalty" />
      </div>
    </div>
  );
}

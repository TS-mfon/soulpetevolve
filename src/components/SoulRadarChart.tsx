import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface SoulRadarChartProps {
  traits: {
    kindness: number;
    aggression: number;
    intelligence: number;
    loyalty: number;
  };
}

export function SoulRadarChart({ traits }: SoulRadarChartProps) {
  const data = [
    { trait: "Kindness", value: traits.kindness },
    { trait: "Intelligence", value: traits.intelligence },
    { trait: "Loyalty", value: traits.loyalty },
    { trait: "Aggression", value: traits.aggression },
  ];

  return (
    <div className="soul-card p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        ✨ Personality Radar
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

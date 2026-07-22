import { useSimulation } from "../context/SimulationContext.jsx";

const CLASS_LABEL = { 0: "Susceptible", 1: "Intermediate", 2: "Resistant" };

function StatRow({ label, value, accent = "text-medical-white" }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-none">
      <span className="text-xs font-data text-medical-white/60">{label}</span>
      <span className={`text-sm font-data font-semibold ${accent}`}>{value}</span>
    </div>
  );
}

export default function StatPanel() {
  const { state } = useSimulation();
  const stats = state?.stats;

  if (!stats) {
    return (
      <div className="glass-panel p-5 h-full flex items-center justify-center">
        <p className="text-xs font-data text-medical-white/40 text-center">
          Start an experiment to see live statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 h-full overflow-y-auto">
      <h3 className="font-display text-gold-500 text-sm tracking-[0.2em] mb-3">
        LIVE STATISTICS
      </h3>
      <StatRow label="Generation" value={stats.generation} />
      <StatRow label="Population" value={stats.population} />
      <StatRow
        label="Avg. Resistance"
        value={`${(stats.avg_resistance * 100).toFixed(1)}%`}
        accent="text-gold-400"
      />
      <StatRow
        label="Mutation Count"
        value={stats.cumulative_mutations}
        accent="text-cyan-soft"
      />
      <StatRow label="Death Rate" value={stats.deaths} />
      <StatRow
        label="Survival Rate"
        value={`${(stats.survival_rate * 100).toFixed(1)}%`}
        accent="text-emerald-accent"
      />
      <StatRow
        label="Dominant Colony"
        value={CLASS_LABEL[stats.dominant_colony]}
      />
      <StatRow
        label="Hotspot Count"
        value={stats.hotspot_count}
        accent={stats.hotspot_count > 2 ? "text-red-400" : "text-medical-white"}
      />
    </div>
  );
}

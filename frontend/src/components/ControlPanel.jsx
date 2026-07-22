import { useSimulation } from "../context/SimulationContext.jsx";
import { reportUrl } from "../api/client.js";

const SLIDERS = [
  { key: "initial_population", label: "Initial Population", min: 20, max: 400, step: 10 },
  { key: "mutation_rate", label: "Mutation Rate", min: 0, max: 0.3, step: 0.01 },
  { key: "mutation_strength", label: "Mutation Strength", min: 0, max: 0.5, step: 0.01 },
  { key: "antibiotic_level", label: "Antibiotic Level", min: 0, max: 1, step: 0.05 },
  { key: "growth_rate", label: "Growth Rate", min: 0.05, max: 0.6, step: 0.01 },
  { key: "grid_size", label: "Grid Size", min: 20, max: 60, step: 5 },
  { key: "simulation_speed", label: "Simulation Speed", min: 0.5, max: 4, step: 0.5 },
];

const SPECIES = [
  { value: "mrsa", label: "MRSA" },
  { value: "ecoli", label: "E. coli" },
  { value: "pseudomonas", label: "Pseudomonas" },
];

export default function ControlPanel() {
  const {
    config,
    updateConfig,
    start,
    pause,
    resume,
    reset,
    isRunning,
    experimentId,
    loading,
  } = useSimulation();

  const disabled = !!experimentId;

  return (
    <div className="glass-panel p-5 flex flex-col gap-5 h-full overflow-y-auto">
      <div>
        <h3 className="font-display text-gold-500 text-sm tracking-[0.2em] mb-3">
          ORGANISM
        </h3>
        <select
          value={config.species}
          disabled={disabled}
          onChange={(e) => updateConfig({ species: e.target.value })}
          className="w-full bg-charcoal/60 border border-white/10 rounded-lg px-3 py-2 text-sm font-body text-medical-white focus:outline-none focus:ring-1 focus:ring-gold-500 disabled:opacity-50"
        >
          {SPECIES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-4">
        {SLIDERS.map((s) => (
          <div key={s.key}>
            <div className="flex justify-between text-xs font-data text-medical-white/70 mb-1">
              <span>{s.label}</span>
              <span className="text-gold-400">{config[s.key]}</span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={config[s.key]}
              disabled={disabled}
              onChange={(e) => updateConfig({ [s.key]: parseFloat(e.target.value) })}
              className="w-full accent-gold-500 disabled:opacity-50"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        {!experimentId && (
          <button
            onClick={start}
            disabled={loading}
            className="btn-gold col-span-2 text-sm py-2.5"
          >
            {loading ? "Initializing…" : "Start"}
          </button>
        )}
        {experimentId && isRunning && (
          <button onClick={pause} className="btn-outline text-sm py-2.5">
            Pause
          </button>
        )}
        {experimentId && !isRunning && (
          <button onClick={resume} className="btn-outline text-sm py-2.5">
            Resume
          </button>
        )}
        {experimentId && (
          <button onClick={reset} className="btn-outline text-sm py-2.5">
            Reset
          </button>
        )}
      </div>

      {experimentId && (
        <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
          <p className="text-xs font-data text-medical-white/50 tracking-wide">EXPORT</p>
          <div className="flex gap-2">
            <a
              href={reportUrl(experimentId, "json")}
              className="flex-1 text-center text-xs font-data py-2 rounded-lg border border-white/10 hover:border-gold-500/60 transition-colors"
            >
              JSON
            </a>
            <a
              href={reportUrl(experimentId, "csv")}
              className="flex-1 text-center text-xs font-data py-2 rounded-lg border border-white/10 hover:border-gold-500/60 transition-colors"
            >
              CSV
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

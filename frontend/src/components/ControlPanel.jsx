import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  { value: "ecoli", label: "Escherichia coli (E. coli)" },
  { value: "pseudomonas", label: "Pseudomonas aeruginosa" },
  { value: "mrsa", label: "MRSA (Methicillin-resistant Staphylococcus aureus)" },
];

const ANTIBIOTICS_BY_SPECIES = {
  ecoli: [
    { value: "nitrofurantoin", label: "Nitrofurantoin" },
    { value: "amoxicillin", label: "Amoxicillin" },
    { value: "ciprofloxacin", label: "Ciprofloxacin" },
    { value: "piperacillin-tazobactam", label: "Piperacillin–Tazobactam" },
    { value: "meropenem", label: "Meropenem" },
  ],
  pseudomonas: [
    { value: "piperacillin-tazobactam", label: "Piperacillin–Tazobactam" },
    { value: "meropenem", label: "Meropenem" },
    { value: "ciprofloxacin", label: "Ciprofloxacin" },
  ],
  mrsa: [
    { value: "vancomycin", label: "Vancomycin" },
    { value: "linezolid", label: "Linezolid" },
    { value: "daptomycin", label: "Daptomycin" },
  ],
};

const ALL_ANTIBIOTICS = Array.from(
  new Map(Object.values(ANTIBIOTICS_BY_SPECIES).flat().map((item) => [item.value, item])).values()
);

const SELECT_CLASS = "lab-select";

function isGuideCompleted() {
  return typeof window !== "undefined" && window.localStorage.getItem("mes-guide-completed") === "true";
}

function getAntibioticOptions(species) {
  return ANTIBIOTICS_BY_SPECIES[species] || ALL_ANTIBIOTICS;
}

function isReadyForSimulation(config) {
  return Boolean(config.species && config.antibiotic);
}

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
    applyTreatment,
    washPlate,
  } = useSimulation();

  const [showParameters, setShowParameters] = useState(false);
  const [guideCompleted, setGuideCompleted] = useState(false);
  const disabled = !!experimentId;
  const antibioticOptions = getAntibioticOptions(config.species);
  const readyForParameters = guideCompleted && isReadyForSimulation(config);
  const readyToStart = readyForParameters && showParameters;

  useEffect(() => {
    const syncGuideState = () => setGuideCompleted(isGuideCompleted());

    syncGuideState();
    window.addEventListener("mes-guide-completed", syncGuideState);

    return () => window.removeEventListener("mes-guide-completed", syncGuideState);
  }, []);

  useEffect(() => {
    if (!readyForParameters) {
      setShowParameters(false);
    }
  }, [readyForParameters]);

  const handleSpeciesChange = (e) => {
    const nextSpecies = e.target.value;
    setShowParameters(false);
    updateConfig({ species: nextSpecies, antibiotic: "" });
  };

  return (
    <div className="glass-panel p-5 flex flex-col gap-5 h-full overflow-y-auto">
      <div className="text-center">
        <h3 className="font-display text-gold-500 text-sm tracking-[0.2em] mb-3">
          ORGANISM
        </h3>
        <label className="mb-2 flex items-center justify-center text-xs font-data tracking-[0.28em] uppercase text-cyan-soft/80">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true">🦠</span>
            <span>Microbial Species (Bacteria)</span>
          </span>
        </label>
        <select
          value={config.species || ""}
          disabled={disabled || !guideCompleted}
          onChange={handleSpeciesChange}
          className={SELECT_CLASS}
        >
          <option value="" disabled>
            Select Bacterial Species
          </option>
          {SPECIES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <label className="mb-2 mt-4 flex items-center justify-center text-xs font-data tracking-[0.28em] uppercase text-cyan-soft/80">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true">💊</span>
            <span>Antimicrobial Agent</span>
          </span>
        </label>
        <select
          value={config.antibiotic || ""}
          disabled={disabled || !guideCompleted || !config.species}
          onChange={(e) => updateConfig({ antibiotic: e.target.value })}
          className={SELECT_CLASS}
        >
          <option value="" disabled>
            Select Antibiotic
          </option>
          {antibioticOptions.map((antibiotic) => (
            <option key={antibiotic.value} value={antibiotic.value}>
              {antibiotic.label}
            </option>
          ))}
        </select>

        {!guideCompleted && !experimentId && (
          <p className="mt-3 text-xs font-data text-medical-white/45 leading-relaxed">
            Please complete the user guide first to unlock the laboratory controls.
          </p>
        )}

        {guideCompleted && !readyForParameters && !experimentId && (
          <p className="mt-3 text-xs font-data text-medical-white/45 leading-relaxed">
            Please select both a microbial species and an antimicrobial agent to continue.
          </p>
        )}
      </div>

      <AnimatePresence initial={false}>
        {readyForParameters && !showParameters && !experimentId && (
          <motion.div
            key="continue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex justify-center"
          >
            <button onClick={() => setShowParameters(true)} className="btn-gold text-sm py-2.5 px-8">
              Continue
            </button>
          </motion.div>
        )}

        {readyToStart && !experimentId && (
          <motion.div
            key="parameters"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <h3 className="font-display text-gold-500 text-sm tracking-[0.2em] text-center">
              REQUIREMENTS
            </h3>
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

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={start}
                disabled={loading}
                className="btn-gold col-span-2 text-sm py-2.5"
              >
                {loading ? "Initializing…" : "Start Simulation"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {experimentId && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {isRunning && (
            <button onClick={pause} className="btn-outline text-sm py-2.5">
              Pause
            </button>
          )}
          {!isRunning && (
            <button onClick={resume} className="btn-outline text-sm py-2.5">
              Resume
            </button>
          )}
          <button onClick={reset} className="btn-outline text-sm py-2.5 col-span-2">
            Reset
          </button>
        </div>
      )}

      {experimentId && (
        <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
          <p className="text-xs font-data text-cyan-soft/80 tracking-wide uppercase font-bold">Lab Interventions</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => applyTreatment(0.9, null, null, config.antibiotic || "Custom Drug")}
              className="text-xs font-data py-2 rounded-lg border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors"
            >
              💊 Apply Treatment
            </button>
            <button
              onClick={washPlate}
              className="text-xs font-data py-2 rounded-lg border border-blue-400/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-colors"
            >
              🌊 Wash Plate
            </button>
          </div>
        </div>
      )}

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
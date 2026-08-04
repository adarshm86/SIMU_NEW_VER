import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";

const CONTROLS = [
  {
    name: "Mutation Rate",
    desc: "The probability that a reproducing cell's offspring acquires a random change in resistance. Higher values accelerate the emergence of new resistant variants.",
  },
  {
    name: "Antibiotic Level",
    desc: "The baseline concentration of antibiotic across the dish. Cells whose resistance falls below the local concentration are more likely to die each generation.",
  },
  {
    name: "Growth Rate",
    desc: "The probability that a surviving cell reproduces in a given generation. Higher growth rates increase population pressure on available space.",
  },
  {
    name: "Grid Size",
    desc: "The resolution of the simulated petri dish. Larger grids allow more spatial detail but take marginally longer to compute per generation.",
  },
  {
    name: "Simulation Speed",
    desc: "How quickly generations advance once the experiment is running. This only affects playback pace, not the underlying biology.",
  },
];

const GRID_LEGEND = [
  { label: "Susceptible cell", color: "bg-cyan-soft" },
  { label: "Intermediate resistance", color: "bg-gold-500" },
  { label: "Resistant cell", color: "bg-red-400" },
  { label: "High antibiotic concentration", color: "bg-gradient-to-r from-navy to-gold-500" },
];

const OUTPUTS = [
  { name: "Population", desc: "Total living cells in the current generation." },
  { name: "Resistance", desc: "Average resistance value across all living cells, from 0 (fully susceptible) to 1 (fully resistant)." },
  { name: "Mutation", desc: "Count of mutation events — offspring whose resistance diverged from their parent." },
  { name: "Prediction", desc: "A polynomial regression model fit to the resistance trend, projecting the next 20 generations." },
  { name: "Timeline", desc: "A chronological research log recording mutations, resistance increases, and hotspot detections." },
  { name: "Heatmap", desc: "The antibiotic concentration field rendered directly onto the 3D petri dish surface." },
];

export default function HowToUse() {
  const [guideCompleted, setGuideCompleted] = useState(false);
  const [guideAcknowledged, setGuideAcknowledged] = useState(false);

  useEffect(() => {
    const syncGuideState = () => {
      const completed = typeof window !== "undefined" && window.localStorage.getItem("mes-guide-completed") === "true";
      setGuideCompleted(completed);
      setGuideAcknowledged(completed);
    };

    syncGuideState();
    window.addEventListener("mes-guide-completed", syncGuideState);

    return () => window.removeEventListener("mes-guide-completed", syncGuideState);
  }, []);

  const handleGuideAcknowledgement = (event) => {
    const checked = event.target.checked;
    setGuideAcknowledged(checked);

    if (typeof window === "undefined") {
      return;
    }

    if (checked) {
      window.localStorage.setItem("mes-guide-completed", "true");
    } else {
      window.localStorage.removeItem("mes-guide-completed");
    }

    setGuideCompleted(checked);
    window.dispatchEvent(new Event("mes-guide-completed"));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-32"
    >
      <section className="max-w-4xl mx-auto px-6 text-center mb-20">
        <p className="section-eyebrow mb-4">Documentation</p>
        <h1 className="title-serif text-4xl md:text-5xl text-medical-white mb-6">
          Laboratory Guide
        </h1>
        <p className="font-body text-medical-white/65 text-lg">
          Learn how to configure and understand your experiment before
          entering the simulation dashboard.
        </p>
      </section>

      {/* Section 1: control specifications */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
        <GlassCard hover={false} className="!p-4">
          <div className="rounded-xl overflow-hidden bg-navy-deep/90 p-5 border border-cyan-400/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-data text-cyan-soft uppercase tracking-wider">🔬 Experiment Config</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">Ready</span>
            </div>
            <div className="space-y-3 font-data text-xs">
              <div>
                <label className="text-medical-white/60 block mb-1">Target Organism</label>
                <div className="bg-charcoal p-2 rounded border border-white/10 text-gold-400">Escherichia coli (E. coli)</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-medical-white/60 block mb-1">Mutation Rate</label>
                  <div className="bg-charcoal p-2 rounded border border-white/10 text-cyan-soft">5.0%</div>
                </div>
                <div>
                  <label className="text-medical-white/60 block mb-1">Antibiotic Conc.</label>
                  <div className="bg-charcoal p-2 rounded border border-white/10 text-cyan-soft">50.0%</div>
                </div>
              </div>
              <div className="pt-2">
                <div className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-center text-xs shadow-lg">
                  ▶ Start Simulation Experiment
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <div>
          <p className="section-eyebrow mb-4">Configuration</p>
          <h2 className="title-serif text-3xl text-medical-white mb-8">
            Understanding the Controls
          </h2>
          <div className="flex flex-col gap-4">
            {CONTROLS.map((c, i) => (
              <GlassCard key={c.name} delay={i * 0.05} className="!p-4">
                <p className="font-body font-semibold text-gold-400 mb-1">
                  {c.name}
                </p>
                <p className="text-sm font-body text-medical-white/65 leading-relaxed">
                  {c.desc}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: grid environment */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
        <div className="order-2 lg:order-1">
          <p className="section-eyebrow mb-4">Visualization</p>
          <h2 className="title-serif text-3xl text-medical-white mb-6">
            Reading the Grid Environment
          </h2>
          <p className="font-body text-medical-white/65 leading-relaxed mb-6">
            The 3D petri dish renders every living cell as a colored point,
            layered above an antibiotic concentration heatmap. Together they
            show not just how many bacteria survive, but where and why.
          </p>
          <div className="flex flex-col gap-3">
            {GRID_LEGEND.map((l) => (
              <div key={l.label} className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded-full ${l.color}`} />
                <span className="text-sm font-body text-medical-white/70">
                  {l.label}
                </span>
              </div>
            ))}
          </div>
          <p className="font-body text-medical-white/65 leading-relaxed mt-6">
            <span className="text-gold-400 font-semibold">Hotspots</span> are
            regions where resistant cells cluster under high antibiotic
            pressure — an early warning sign of selection pressure
            concentrating in one area of the colony.
          </p>
        </div>
        <GlassCard hover={false} className="!p-4 order-1 lg:order-2">
          <div className="rounded-xl overflow-hidden bg-navy-deep/90 p-5 border border-purple-500/20 shadow-xl flex flex-col items-center justify-center min-h-[260px] relative">
            <div className="w-40 h-40 rounded-full border-2 border-cyan-400/40 bg-radial from-purple-900/40 via-navy to-charcoal flex items-center justify-center relative shadow-[0_0_30px_rgba(56,189,248,0.25)]">
              <div className="absolute w-3 h-3 rounded-full bg-cyan-400 top-8 left-10 animate-ping" />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-gold-400 bottom-10 right-8" />
              <div className="absolute w-3 h-3 rounded-full bg-red-400 top-12 right-12" />
              <div className="absolute w-2 h-2 rounded-full bg-cyan-300 bottom-12 left-12" />
              <div className="text-[10px] font-data text-cyan-soft/80">3D Cellular Grid</div>
            </div>
            <div className="mt-4 text-xs font-data text-medical-white/60">Real-time Microbial Colony Surface</div>
          </div>
        </GlassCard>
      </section>

      {/* Section 3: output explanation */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <p className="section-eyebrow mb-4">Interpretation</p>
          <h2 className="title-serif text-3xl text-medical-white">
            Understanding Your Results
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {OUTPUTS.map((o, i) => (
            <GlassCard key={o.name} delay={(i % 3) * 0.08}>
              <p className="font-display text-gold-500 tracking-wide mb-2">
                {o.name}
              </p>
              <p className="text-sm font-body text-medical-white/65 leading-relaxed">
                {o.desc}
              </p>
            </GlassCard>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
          <p className="text-sm font-body text-medical-white/75">
            {guideCompleted
              ? "The user guide is complete. You can now launch the laboratory."
              : "Read through the guide and confirm completion to unlock the laboratory."}
          </p>
          <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-body text-medical-white/75">
            <input
              type="checkbox"
              checked={guideAcknowledged}
              onChange={handleGuideAcknowledgement}
              className="h-4 w-4 rounded border-white/20 bg-transparent text-emerald-400 focus:ring-emerald-400"
            />
            <span>I have read and understood the user guide</span>
          </label>
          <Link
            to="/dashboard"
            className={`rounded-full border px-6 py-3 text-sm font-semibold uppercase tracking-widest transition-all duration-300 ${
              guideCompleted
                ? "border-emerald-400 text-emerald-300 hover:bg-emerald-500/10"
                : "border-white/15 text-white/50 cursor-not-allowed pointer-events-none"
            }`}
          >
            Launch Laboratory
          </Link>
        </div>
      </section>
    </motion.div>
  );
}

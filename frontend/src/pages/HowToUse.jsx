import { motion } from "framer-motion";
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
        <GlassCard hover={false} className="!p-3">
          <div className="rounded-xl overflow-hidden aspect-video bg-charcoal flex items-center justify-center border border-white/5">
            <span className="font-data text-xs text-medical-white/30 tracking-widest">
              [ CONTROL PANEL SCREENSHOT PLACEHOLDER ]
            </span>
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
        <GlassCard hover={false} className="!p-3 order-1 lg:order-2">
          <div className="rounded-xl overflow-hidden aspect-video bg-charcoal flex items-center justify-center border border-white/5">
            <span className="font-data text-xs text-medical-white/30 tracking-widest">
              [ PETRI DISH SCREENSHOT PLACEHOLDER ]
            </span>
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
      </section>
    </motion.div>
  );
}

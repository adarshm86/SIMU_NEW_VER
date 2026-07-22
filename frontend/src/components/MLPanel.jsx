import { motion } from "framer-motion";
import { useSimulation } from "../context/SimulationContext.jsx";

export default function MLPanel() {
  const { prediction } = useSimulation();

  return (
    <div className="glass-panel p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-soft/10 rounded-full blur-3xl" />
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-emerald-accent animate-pulseGlow" />
        <h3 className="font-display text-gold-500 text-sm tracking-[0.2em]">
          AI ANALYSIS & PREDICTION
        </h3>
      </div>

      {!prediction?.ready ? (
        <p className="text-xs font-data text-medical-white/50">
          {prediction?.message ||
            "Run the simulation to generate machine-learning predictions on resistance trajectory."}
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"
        >
          <Metric
            label="Est. Dominant Gen."
            value={prediction.estimated_dominant_generation ?? "—"}
          />
          <Metric
            label="Antibiotic Effectiveness"
            value={`${prediction.antibiotic_effectiveness}%`}
          />
          <Metric
            label="Confidence Score"
            value={`${prediction.confidence_score}%`}
          />
          <Metric
            label="Risk Zone"
            value={prediction.high_risk_zone ? "High" : "Low"}
            accent={prediction.high_risk_zone ? "text-red-400" : "text-emerald-accent"}
          />

          <div className="col-span-2 md:col-span-4 mt-2 p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
            <p className="font-data text-xs text-gold-400 tracking-widest mb-1">
              RECOMMENDATION
            </p>
            <p className="text-sm font-body text-medical-white/80 leading-relaxed">
              {prediction.recommendation}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Metric({ label, value, accent = "text-medical-white" }) {
  return (
    <div className="glass-panel p-3 !bg-white/[0.03]">
      <p className="text-[10px] font-data text-medical-white/50 tracking-wide mb-1">
        {label}
      </p>
      <p className={`font-data font-semibold text-lg ${accent}`}>{value}</p>
    </div>
  );
}

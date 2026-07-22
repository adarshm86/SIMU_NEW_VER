import { motion } from "framer-motion";
import ControlPanel from "../components/ControlPanel.jsx";
import StatPanel from "../components/StatPanel.jsx";
import PetriDish3D from "../components/PetriDish3D.jsx";
import ChartsPanel from "../components/ChartsPanel.jsx";
import MLPanel from "../components/MLPanel.jsx";
import Timeline from "../components/Timeline.jsx";
import { useSimulation } from "../context/SimulationContext.jsx";

export default function Dashboard() {
  const { state } = useSimulation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-28 pb-16 px-4 md:px-8 max-w-[1600px] mx-auto"
    >
      <header className="mb-6">
        <p className="section-eyebrow">Simulation Dashboard</p>
        <h1 className="title-serif text-2xl md:text-3xl text-medical-white mt-1">
          Laboratory Console
        </h1>
      </header>

      {/* Main layout: controls | petri dish | stats */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-5 mb-6">
        <div className="h-[560px]">
          <ControlPanel />
        </div>

        <div className="glass-panel p-2 h-[560px] relative overflow-hidden">
          <PetriDish3D
            cells={state?.cells || []}
            antibioticField={state?.antibiotic_field || []}
            gridSize={state?.grid_size || 40}
          />
          <div className="absolute top-4 left-4 text-xs font-data text-medical-white/50 bg-navy-deep/60 px-3 py-1 rounded-full border border-white/10">
            Generation {state?.stats?.generation ?? 0}
          </div>
        </div>

        <div className="h-[560px]">
          <StatPanel />
        </div>
      </div>

      {/* Charts */}
      <div className="mb-6">
        <ChartsPanel />
      </div>

      {/* ML + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MLPanel />
        <Timeline />
      </div>
    </motion.div>
  );
}

import { useMemo } from "react";
import { useSimulation } from "../context/SimulationContext.jsx";

function buildLogEntries(history) {
  const entries = [];
  let lastDominant = 0;
  let lastHotspot = 0;

  history.forEach((h) => {
    if (h.mutations > 0 && entries.length < 40) {
      entries.push({
        gen: h.generation,
        text: `${h.mutations} mutation${h.mutations > 1 ? "s" : ""} occurred`,
      });
    }
    if (h.dominant_colony > lastDominant) {
      entries.push({
        gen: h.generation,
        text:
          h.dominant_colony === 2
            ? "Dominant resistant colony established"
            : "Resistance increased",
      });
      lastDominant = h.dominant_colony;
    }
    if (h.hotspot_count > lastHotspot + 1) {
      entries.push({ gen: h.generation, text: "New hotspot detected" });
      lastHotspot = h.hotspot_count;
    }
  });

  return entries.slice(-12).reverse();
}

export default function Timeline() {
  const { history } = useSimulation();
  const entries = useMemo(() => buildLogEntries(history), [history]);

  return (
    <div className="glass-panel p-6">
      <h3 className="font-display text-gold-500 text-sm tracking-[0.2em] mb-4">
        EXPERIMENT TIMELINE
      </h3>
      {entries.length === 0 ? (
        <p className="text-xs font-data text-medical-white/40">
          Research log entries will appear as significant events occur.
        </p>
      ) : (
        <ol className="relative border-l border-white/10 pl-5 space-y-4">
          {entries.map((e, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full bg-gold-500 shadow-gold" />
              <p className="text-xs font-data text-cyan-soft/80">Generation {e.gen}</p>
              <p className="text-sm font-body text-medical-white/80">{e.text}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

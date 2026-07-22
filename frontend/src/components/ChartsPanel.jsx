import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useSimulation } from "../context/SimulationContext.jsx";

function ChartCard({ title, children }) {
  return (
    <div className="glass-panel p-4">
      <h4 className="font-data text-xs tracking-[0.2em] text-cyan-soft/80 mb-2">
        {title}
      </h4>
      <div className="h-48">{children}</div>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: "#12182699",
    border: "1px solid rgba(212,175,55,0.3)",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "#D4AF37" },
};

export default function ChartsPanel() {
  const { history } = useSimulation();

  if (!history.length) {
    return (
      <div className="glass-panel p-6 text-center text-xs font-data text-medical-white/40">
        Charts will populate once the simulation is running.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard title="POPULATION OVER TIME">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid stroke="#ffffff10" />
            <XAxis dataKey="generation" stroke="#ffffff40" fontSize={10} />
            <YAxis stroke="#ffffff40" fontSize={10} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="population" stroke="#6FD8E8" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="AVERAGE RESISTANCE">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid stroke="#ffffff10" />
            <XAxis dataKey="generation" stroke="#ffffff40" fontSize={10} />
            <YAxis stroke="#ffffff40" fontSize={10} domain={[0, 1]} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="avg_resistance" stroke="#D4AF37" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="DEATHS PER GENERATION">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid stroke="#ffffff10" />
            <XAxis dataKey="generation" stroke="#ffffff40" fontSize={10} />
            <YAxis stroke="#ffffff40" fontSize={10} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="deaths" stroke="#E14F4F" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="MUTATION COUNT">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid stroke="#ffffff10" />
            <XAxis dataKey="generation" stroke="#ffffff40" fontSize={10} />
            <YAxis stroke="#ffffff40" fontSize={10} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="cumulative_mutations" stroke="#2ECC91" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

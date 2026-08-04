import { createContext, useContext, useRef, useState, useCallback } from "react";

import {
  startExperiment,
  stepExperiment,
  getPrediction,
  getHistory,
  resetExperiment,
  treatExperiment,
  washExperiment,
} from "../api/client.js";

const SimulationContext = createContext(null);

const DEFAULT_CONFIG = {
  species: "",
  antibiotic: "",
  grid_size: 40,
  initial_population: 120,
  mutation_rate: 0.05,
  mutation_strength: 0.1,
  antibiotic_level: 0.5,
  growth_rate: 0.3,
  simulation_speed: 1.0,
};

export function SimulationProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [experimentId, setExperimentId] = useState(null);
  const [state, setState] = useState(null); // latest engine state (cells, field, stats)
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState({ ready: false });
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const updateConfig = useCallback((patch) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const tick = useCallback(async (id) => {
    const newState = await stepExperiment(id, 1);
    setState(newState);
    setHistory((prev) => [...prev, newState.stats].slice(-200));
    if (newState.stats.generation % 3 === 0) {
      getPrediction(id).then(setPrediction).catch(() => {});
    }
  }, []);

  const start = useCallback(async () => {
    setLoading(true);
    try {
      const s = await startExperiment(config);
      setExperimentId(s.id);
      setState(s);
      setHistory([s.stats]);
      setPrediction({ ready: false });
      setIsRunning(true);

      const speedMs = Math.max(120, 700 / (config.simulation_speed || 1));
      intervalRef.current = setInterval(() => tick(s.id), speedMs);
    } finally {
      setLoading(false);
    }
  }, [config, tick]);

  const pause = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (!experimentId || isRunning) return;
    const speedMs = Math.max(120, 700 / (config.simulation_speed || 1));
    intervalRef.current = setInterval(() => tick(experimentId), speedMs);
    setIsRunning(true);
  }, [experimentId, isRunning, config.simulation_speed, tick]);

  const reset = useCallback(async () => {
    pause();
    if (experimentId) await resetExperiment(experimentId);
    setConfig(DEFAULT_CONFIG);
    setExperimentId(null);
    setState(null);
    setHistory([]);
    setPrediction({ ready: false });
  }, [experimentId, pause]);

  const refreshHistory = useCallback(async () => {
    if (!experimentId) return;
    const h = await getHistory(experimentId);
    setHistory(h);
  }, [experimentId]);

  const applyTreatment = useCallback(async (intensity = 0.8, x = null, y = null, drugName = "Secondary Antibiotic") => {
  if (!experimentId) return;
  const newState = await treatExperiment(experimentId, intensity, x, y, drugName);
  setState(newState);
}, [experimentId]);

const washPlate = useCallback(async () => {
  if (!experimentId) return;
  const newState = await washExperiment(experimentId);
  setState(newState);
}, [experimentId]);

  
  const value = {
  config,
  updateConfig,
  experimentId,
  state,
  history,
  prediction,
  isRunning,
  loading,
  start,
  pause,
  resume,
  reset,
  refreshHistory,
  applyTreatment,
  washPlate,
};

  return (
    <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}

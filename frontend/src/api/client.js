import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export const startExperiment = (config) => api.post("/start", config).then((r) => r.data);

export const stepExperiment = (experimentId, steps = 1) =>
  api.post("/step", { experiment_id: experimentId, steps }).then((r) => r.data);

export const getState = (experimentId) =>
  api.get("/state", { params: { experiment_id: experimentId } }).then((r) => r.data);

export const getPrediction = (experimentId) =>
  api.get("/prediction", { params: { experiment_id: experimentId } }).then((r) => r.data);

export const getHistory = (experimentId) =>
  api.get("/history", { params: { experiment_id: experimentId } }).then((r) => r.data);

export const resetExperiment = (experimentId) =>
  api.post("/reset", { experiment_id: experimentId }).then((r) => r.data);

export const reportUrl = (experimentId, format) =>
  `/api/report?experiment_id=${experimentId}&format=${format}`;

export default api;

// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // O ajusta si tu backend usa otro puerto
});

export default api;

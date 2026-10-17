/**
 * API & Base URL Configuration
 *
 * Local dev  (Vite :8080)  → proxy /api → XAMPP at /uma/luxe-haven
 * Production (lishansarees.com) → /api lives at the domain root
 */

const hostname = window.location.hostname;

const isLocal =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.startsWith("192.168.");

const isVite =
  isLocal &&
  ["8080", "8081", "5173"].includes(window.location.port);

// On production the app is at the domain root → BASE_PATH = ""
// On local XAMPP (no Vite) it may be under /luxe-haven
const pathname = window.location.pathname;
export const BASE_PATH =
  !isVite && isLocal && pathname.startsWith("/luxe-haven")
    ? "/luxe-haven"
    : "";

// API base URL
// - Vite dev server: use absolute origin so the proxy intercepts /api/*
// - Production: relative /api (sits beside index.html at domain root)
export const API_URL = isVite
  ? window.location.origin + "/api"
  : `${BASE_PATH}/api`;

export const BASE_URL = isVite
  ? window.location.origin
  : `${window.location.origin}${BASE_PATH}`;

export default { BASE_PATH, BASE_URL, API_URL, isLocal, isVite };

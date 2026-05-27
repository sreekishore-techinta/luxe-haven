/**
 * Configuration for the API and Base URL.
 * Detects whether the app is running on localhost (XAMPP) or production.
 */

const isLocal = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.');

// Port detection to differentiate between Vite dev server (8080) and Apache (80/443)
const isVite = isLocal && (window.location.port === '8080' || window.location.port === '5173');

// Detect base path: check if we are in /luxe-haven subdirectory
const pathname = window.location.pathname;
export const BASE_PATH = pathname.startsWith("/luxe-haven") ? "/luxe-haven" : "";

// For local Vite dev server, we use absolute origin for API
// For production or XAMPP, we use root-relative paths for maximum compatibility with subdirectories
export const API_URL = isVite 
    ? window.location.origin + "/api" 
    : `${BASE_PATH}/api`;

export const BASE_URL = isVite
    ? window.location.origin
    : `${window.location.origin}${BASE_PATH}`;

export default {
    BASE_PATH,
    BASE_URL,
    API_URL,
    isLocal,
    isVite
};

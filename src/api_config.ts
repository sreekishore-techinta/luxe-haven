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

// For XAMPP local environment, the app is usually in a subdirectory /luxe-haven
// In production, it's usually at the root level.
// BASE_PATH should include the leading slash if it exists, otherwise be an empty string for the Router's basename.
export const BASE_PATH = (isLocal && !isVite && window.location.pathname.startsWith("/luxe-haven")) ? "/luxe-haven" : "";

export const BASE_URL = isLocal 
    ? `${window.location.protocol}//${window.location.host}${BASE_PATH}`
    : window.location.origin;

// API_URL should be absolute to avoid "Invalid URL" errors in the URL constructor
export const API_URL = isVite 
    ? window.location.origin + "/api" 
    : (isLocal ? `${BASE_URL}/api` : window.location.origin + "/api");

export default {
    BASE_PATH,
    BASE_URL,
    API_URL,
    isLocal,
    isVite
};

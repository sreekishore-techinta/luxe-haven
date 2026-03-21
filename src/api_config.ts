/**
 * Configuration for the API and Base URL.
 * Detects whether the app is running on localhost (XAMPP) or production.
 */

const isLocal = window.location.hostname === 'localhost';

// For XAMPP local environment: http://localhost/luxe-haven
// For Production (Hostinger): "" (Empty string means root of current domain)
export const BASE_URL = isLocal ? "http://localhost/luxe-haven" : "";

export const API_URL = `${BASE_URL}/api`;

export default {
    BASE_URL,
    API_URL
};

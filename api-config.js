/**
 * Aegis API Configuration
 * Centralized configuration for backend API endpoints
 */

const API_CONFIG = {
  // Backend API Base URL
  BASE_URL: 'http://localhost:5000',
  
  // API Endpoints
  ENDPOINTS: {
    HEALTH: '/api/health',
    ANALYZE: '/api/analyze',
    SCRAPE: '/api/scrape',
    DETECT_BOTS: '/api/detect-bots',
    DETECT_COPYRIGHT: '/api/detect-copyright',
    INTEGRITY_CHECK: '/api/integrity-check',
    INSTAGRAM_ANALYZE: '/api/instagram-analyze'
  },
  
  // Get full endpoint URL
  getEndpoint(endpoint) {
    return `${this.BASE_URL}${this.ENDPOINTS[endpoint]}`;
  },
  
  // Get API base URL
  getApiUrl() {
    return `${this.BASE_URL}/api`;
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Default request headers
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}

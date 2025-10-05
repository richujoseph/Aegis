// Configuration file for Aegis
// ⚠️ SECURITY: API keys are now loaded from environment variables (localStorage)
// DO NOT hardcode API keys here - use Settings page instead

const AegisConfig = {
  // Groq API Configuration - loaded from environment
  groq: {
    apiKey: EnvConfig.get('GROQ_API_KEY') || '', // Set via Settings page
    model: EnvConfig.get('GROQ_MODEL') || 'mixtral-8x7b-32768',
    enabled: EnvConfig.get('GROQ_ENABLED') === 'true'
  },
  
  // Report Settings
  reports: {
    useFallback: true, // Use fallback reports if API fails or is disabled
    includeTimestamp: true,
    confidentialityLevel: 'HIGH'
  },
  
  // Scanning Settings
  scanning: {
    defaultMode: 'both', // 'harassment', 'piracy', or 'both'
    autoSave: true,
    maxResults: 50
  }
};

// Initialize Groq API with config
if (typeof GroqAPI !== 'undefined' && AegisConfig.groq.enabled) {
  GroqAPI.apiKey = AegisConfig.groq.apiKey;
  GroqAPI.model = AegisConfig.groq.model;
}

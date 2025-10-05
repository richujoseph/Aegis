
const AegisConfig = {
  groq: {
    apiKey: EnvConfig.get('GROQ_API_KEY') , 
    model: EnvConfig.get('GROQ_MODEL')  ,
    enabled: EnvConfig.get('GROQ_ENABLED') === 'true'
  },
  
  // Report Settings
  reports: {
    useFallback: true, 
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


if (typeof GroqAPI !== 'undefined' && AegisConfig.groq.enabled) {
  GroqAPI.apiKey = AegisConfig.groq.apiKey;
  GroqAPI.model = AegisConfig.groq.model;
}

// Environment Variable Loader for Browser
// Since browsers can't read .env files directly, we'll use localStorage

const EnvConfig = {
  // Load environment variables from localStorage
  load() {
    const env = {
      GROQ_API_KEY: localStorage.getItem('GROQ_API_KEY') || '',
      GROQ_MODEL: localStorage.getItem('GROQ_MODEL') || 'mixtral-8x7b-32768',
      GROQ_ENABLED: localStorage.getItem('GROQ_ENABLED') === 'true'
    };
    return env;
  },

  // Save environment variables to localStorage
  save(key, value) {
    localStorage.setItem(key, value);
  },

  // Get a specific environment variable
  get(key) {
    return localStorage.getItem(key);
  },

  // Initialize with default values if not set
  init() {
    if (!localStorage.getItem('GROQ_MODEL')) {
      localStorage.setItem('GROQ_MODEL', 'mixtral-8x7b-32768');
    }
    if (!localStorage.getItem('GROQ_ENABLED')) {
      localStorage.setItem('GROQ_ENABLED', 'false');
    }
  },

  // Clear all environment variables
  clear() {
    localStorage.removeItem('GROQ_API_KEY');
    localStorage.removeItem('GROQ_MODEL');
    localStorage.removeItem('GROQ_ENABLED');
  }
};

// Initialize on load
EnvConfig.init();

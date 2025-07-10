// Configuration utility for environment-based settings
const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  IS_PRODUCTION: import.meta.env.VITE_NODE_ENV === 'production',
  IS_DEVELOPMENT: import.meta.env.VITE_NODE_ENV === 'development',
};

// Log configuration in development (helps with debugging)
if (config.IS_DEVELOPMENT) {
  console.log('App Configuration:', config);
}

export default config;

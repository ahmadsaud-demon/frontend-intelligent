interface Config {
  api: {
    baseURL: string;
    timeout: number;
  };
}

const config: Config = {
  api: {
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },
};

export default config;
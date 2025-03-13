interface Config {
  api: {
    baseURL: string;
    timeout: number;
    useMock: boolean;
  };
}

const config: Config = {
  api: {
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    useMock: import.meta.env.VITE_USE_MOCK_API === 'true'
  },
};

export default config;
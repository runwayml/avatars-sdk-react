export interface ApiConfig {
  baseUrl: string;
}

const DEFAULT_BASE_URL = 'https://api.dev.runwayml.com';

function getBaseUrl(): string {
  try {
    const envUrl = process.env.RUNWAYML_BASE_URL;
    if (envUrl) return envUrl;
  } catch {
    // process not available in browser
  }
  return DEFAULT_BASE_URL;
}

let config: ApiConfig | null = null;

export function configure(options: Partial<ApiConfig>): void {
  config = { ...getConfig(), ...options };
}

export function getConfig(): ApiConfig {
  if (!config) {
    config = { baseUrl: getBaseUrl() };
  }
  return config;
}

export function resetConfig(): void {
  config = null;
}

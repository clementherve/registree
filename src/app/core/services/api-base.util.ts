import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    __env?: { registryUrl?: string };
  }
}

export function getApiBasePath(): string {
  const registryUrl = window.__env?.registryUrl;
  if (!registryUrl) return environment.apiBasePath;
  return `${registryUrl.replace(/\/$/, '')}/v2`;
}

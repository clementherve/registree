export interface RegistryErrorItem {
  code: string;
  message: string;
  detail?: unknown;
}

export interface RegistryErrorResponse {
  errors: RegistryErrorItem[];
}

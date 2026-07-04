export interface ImageConfig {
  architecture: string;
  os: string;
  created?: string;
  config?: {
    Env?: string[];
    Cmd?: string[];
    Entrypoint?: string[];
    ExposedPorts?: Record<string, unknown>;
    Labels?: Record<string, string>;
  };
}

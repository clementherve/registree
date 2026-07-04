export interface ManifestLayer {
  mediaType: string;
  size: number;
  digest: string;
}

export interface ManifestV2 {
  kind: 'manifest';
  schemaVersion: number;
  mediaType: string;
  config: ManifestLayer;
  layers: ManifestLayer[];
  digest: string;
}

export interface ManifestListEntry {
  mediaType: string;
  size: number;
  digest: string;
  platform: {
    architecture: string;
    os: string;
    variant?: string;
  };
}

export interface ManifestList {
  kind: 'manifestList';
  schemaVersion: number;
  mediaType: string;
  manifests: ManifestListEntry[];
  digest: string;
}

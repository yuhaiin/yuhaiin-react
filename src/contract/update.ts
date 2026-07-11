export type UpdateChannel = "stable" | "beta" | "main";

export interface UpdateCheck {
  channel: UpdateChannel;
  supported: boolean;
  currentVersion: string;
  targetVersion: string;
  targetTag: string;
  prerelease: boolean;
  releaseUrl: string;
  releaseNotes: string;
  publishedAt: string;
  assetName: string;
  assetSha256: string;
  updateAvailable: boolean;
  reason: string;
}

export interface UpdateStatus {
  running: boolean;
  stage: string;
  progress: number;
  bytesDownloaded: number;
  totalBytes: number;
  error: string;
}

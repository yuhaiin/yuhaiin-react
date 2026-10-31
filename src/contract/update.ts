export type UpdateCompatibility = import('@/api/generated-contracts').Go.update.CompatibilityStatus;

export type UpdateRecoveryReadiness = import('@/api/generated-contracts').Go.update.RecoveryReadiness;
export type UpdateOperation = import('@/api/generated-contracts').Go.update.OperationStatus;
export type UpdateConsent = Pick<import('@/api/generated-contracts').Go.update.ApplyRequest, 'confirmMaintenance' | 'confirmManualRecovery' | 'confirmNoRecoveryPoint'>;
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
  assetUrl: string;
  assetSha256: string;
  updateAvailable: boolean;
  reason: string;
  compatibility?: UpdateCompatibility;
  recovery?: UpdateRecoveryReadiness;
}

export interface UpdateStatus {
  running: boolean;
  stage: string;
  progress: number;
  bytesDownloaded: number;
  totalBytes: number;
  error: string;
  operation?: UpdateOperation;
}

export interface UpdateHistoryEntry {
  id: string;
  version: string;
  commit: string;
  size: number;
  savedAt: string;
  compatibility?: UpdateCompatibility;
}

export interface UpdateHistory {
  items: UpdateHistoryEntry[];
  recovery?: UpdateRecoveryReadiness;
}

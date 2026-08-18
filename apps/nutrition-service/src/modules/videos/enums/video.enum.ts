export enum VideoUploadStatus {
  created = "CREATED",
  uploading = "UPLOADING",
  uploaded = "UPLOADED",
  processing = "PROCESSING",
  ready = "READY",
  failed = "FAILED",
  cancelled = "CANCELLED"
}

export enum VideoUploadPartStatus {
  pending = "PENDING",
  uploading = "UPLOADING",
  uploaded = "UPLOADED",
  failed = "FAILED"
}

export enum VideoRenditionStatus {
  pending = "PENDING",
  processing = "PROCESSING",
  ready = "READY",
  failed = "FAILED"
}

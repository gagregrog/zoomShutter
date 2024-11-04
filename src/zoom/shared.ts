export type ZoomOsascriptResponse = {
  error?: { message: string; code?: number };
  video?: boolean | null;
  mic?: boolean | null;
};

export enum ZoomStatus {
  NOT_OPEN = "NOT_OPEN",
  NO_MEETING = "NO_MEETING",
  IN_MEETING = "IN_MEETING",
  UNKNOWN = "UNKNOWN",
}

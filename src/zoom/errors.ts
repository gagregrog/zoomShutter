import { ZoomStatus, type ZoomOsascriptResponse } from "./shared";

export enum ZoomError {
  NOT_OPEN = "NOT_OPEN",
  NO_MEETING = "NO_MEETING",
  NEEDS_PRIVILEGES = "NEEDS_PRIVILEGES",
  UNKNOWN = "UNKNOWN",
}

export const NEEDS_PRIVILEGES = {
  message: "osascript is not allowed assistive access.",
  code: -1719,
} as const;

export const PARSE_ERROR = {
  message: "Could not parse osascript response",
} as const;

function normalizeZoomError(
  error: NonNullable<ZoomOsascriptResponse["error"]>,
): ZoomError {
  switch (error.message) {
    case NEEDS_PRIVILEGES.message:
      return ZoomError.NEEDS_PRIVILEGES;
    case ZoomError.NOT_OPEN:
    case ZoomError.NO_MEETING:
      return error.message;
    default:
      return ZoomError.UNKNOWN;
  }
}

export function processZoomError(error: ZoomOsascriptResponse["error"]) {
  if (!error) {
    return null;
  }

  const normalizedError = normalizeZoomError(error);
  if (normalizedError === ZoomError.NEEDS_PRIVILEGES) {
    throw new Error("Terminal emulator lacks accessibility privileges");
  }

  return normalizedError;
}

export function errorToStatus(error: ZoomError | null): ZoomStatus {
  switch (error) {
    case ZoomError.NO_MEETING:
      return ZoomStatus.NO_MEETING;
    case ZoomError.NOT_OPEN:
      return ZoomStatus.NOT_OPEN;
    case ZoomError.NEEDS_PRIVILEGES:
    case ZoomError.UNKNOWN:
    default:
      return ZoomStatus.UNKNOWN;
  }
}

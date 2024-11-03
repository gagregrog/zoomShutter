import { type ZoomOsascriptResponse } from "./shared";

export const NEEDS_PRIVILEGES = {
  message: "osascript is not allowed assistive access.",
  code: -1719,
} as const;

export function handleZoomError(
  error: NonNullable<ZoomOsascriptResponse["error"]>
) {
  switch (error.message) {
    case NEEDS_PRIVILEGES.message:
      throw new Error(
        "You must enable assistive access for your terminal emulator"
      );
    default:
      throw new Error(`Unknown Error: ${error.message}`);
  }
}
